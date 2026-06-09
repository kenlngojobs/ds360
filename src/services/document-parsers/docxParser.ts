/**
 * DOCX parser — T-05 (Wave 2)
 *
 * Uses mammoth (https://www.npmjs.com/package/mammoth) to convert a
 * .docx to HTML, then parses the HTML to identify sections and fields.
 *
 * Created by Execute (Wave 1, T-04 dispatch → Wave 2, T-05).
 */

import type { ParsedDocument, ParsedSection, ParsedField, SectionStyle } from "./types";
import { PARSER_VERSION } from "./types";
import { inferTypeFromValue } from "./pdfParser";

/**
 * DOCX parser — v2.0 style-preserving.
 *
 * Uses mammoth to convert .docx to HTML, then parses the HTML
 * to identify sections, fields, tables, and style attributes.
 */
export async function parseDocx(file: File): Promise<ParsedDocument> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buf });

  const warnings: string[] = [];
  if (result.messages && result.messages.length > 0) {
    for (const m of result.messages) {
      warnings.push(`mammoth: ${m.type}: ${m.message}`);
    }
  }

  const sections = parseHtmlToSections(result.value);

  return {
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: "docx",
      parseDurationMs: 0,
      parserVersion: PARSER_VERSION,
      warnings,
    },
    sections,
  };
}

/**
 * Parse the HTML produced by mammoth into sections.
 * Uses a simple state machine over HTML tags.
 */
function parseHtmlToSections(html: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let id = 0;

  const headingRegex = /<h([1-6])>(.*?)<\/h\1>/gi;
  const parts: Array<{ heading: string | null; headingTag: number | null; content: string }> = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = headingRegex.exec(html)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ heading: null, headingTag: null, content: html.slice(lastIndex, m.index) });
    }
    parts.push({ heading: stripTags(m[2]).trim(), headingTag: parseInt(m[1]), content: m[2] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < html.length) {
    parts.push({ heading: null, headingTag: null, content: html.slice(lastIndex) });
  }

  for (const part of parts) {
    if (part.heading !== null) {
      const style = extractStyleFromHtmlTag(part.content);
      sections.push({
        id: `docx-s${id++}`, type: "heading", heading: part.heading, content: part.heading,
        fields: [], sourceLocation: { paragraphIndex: id }, style,
      });
    } else {
      const text = stripTags(part.content).trim();
      if (!text) continue;
      if (/<table/i.test(part.content)) {
        sections.push({
          id: `docx-s${id++}`, type: "table", content: text,
          fields: extractTableFieldsWithPositions(part.content),
          sourceLocation: { paragraphIndex: id },
          style: extractStyleFromHtmlTag(part.content),
        });
      } else if (/<ul|<ol/i.test(part.content)) {
        sections.push({
          id: `docx-s${id++}`, type: "list", content: text,
          fields: extractListFields(text), sourceLocation: { paragraphIndex: id },
          style: extractStyleFromHtmlTag(part.content),
        });
      } else {
        sections.push({
          id: `docx-s${id++}`, type: "paragraph", content: text,
          fields: extractInlineFields(text), sourceLocation: { paragraphIndex: id },
          style: extractStyleFromHtmlTag(part.content),
        });
      }
    }
  }
  return sections;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractStyleFromHtmlTag(html: string): import("../document-parsers/types").SectionStyle | undefined {
  const style: { color?: string; fontWeight?: number; fontSize?: number; textAlign?: "left" | "center" | "right" | "justify"; fontFamily?: string } = {};
  const colorMatch = html.match(/color:\s*([#\w]+)/i);
  if (colorMatch) style.color = colorMatch[1];
  const fwMatch = html.match(/font-weight:\s*(\d+)/i);
  if (fwMatch) style.fontWeight = parseInt(fwMatch[1]);
  const fsMatch = html.match(/font-size:\s*(\d+)/i);
  if (fsMatch) style.fontSize = parseInt(fsMatch[1]);
  const alignMatch = html.match(/text-align:\s*(\w+)/i);
  if (alignMatch) style.textAlign = alignMatch[1] as any;
  const ffMatch = html.match(/font-family:\s*([^;"]+)/i);
  if (ffMatch) style.fontFamily = ffMatch[1].trim().split(",")[0].replace(/['"]/g, "");
  if (Object.keys(style).length === 0) return undefined;
  return style;
}

function extractTableFieldsWithPositions(html: string): ParsedField[] {
  const fields: ParsedField[] = [];
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  if (rows.length < 2) return fields;

  const headerCells = rows[0].match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) ?? [];
  const headers = headerCells.map((c) => stripTags(c));

  for (let ri = 1; ri < rows.length; ri++) {
    const cells = rows[ri].match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) ?? [];
    for (let cj = 0; cj < cells.length && cj < headers.length; cj++) {
      const value = stripTags(cells[cj]);
      if (!value) continue;
      const header = headers[cj];
      const existing = fields.find((f) => f.name === header);
      if (!existing) {
        fields.push({
          name: header,
          type: inferTypeFromValue(value),
          value,
          sampleValues: [value],
          confidence: 0.75,
          rationale: `DOCX table cell at row=${ri}, col=${cj}; header "${header}"`,
          sourceLocation: { rowIndex: ri, columnIndex: cj },
        });
      } else {
        if (existing.sampleValues && existing.sampleValues.length < 5) existing.sampleValues.push(value);
        const nt = inferTypeFromValue(value);
        if (nt !== "text" && existing.type === "text") existing.type = nt;
        if (!existing.sourceLocation) existing.sourceLocation = {};
        existing.sourceLocation.rowIndex = ri;
        existing.sourceLocation.columnIndex = cj;
      }
    }
  }
  return fields;
}

export function extractInlineFields(text: string): ParsedField[] {
  const fields: ParsedField[] = [];
  // Match "Label: Value" patterns on a line
  const lines = text.split(/(?<=[.!?])\s+|\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z][A-Za-z][A-Za-z0-9\s]{1,40}):\s*(.+)$/);
    if (m) {
      const [, name, value] = m;
      const inferredType = inferTypeFromValue(value);
      fields.push({
        name: name.trim(),
        type: inferredType,
        value: value.trim(),
        sampleValues: [value.trim()],
        confidence: 0.65,
        rationale: `Inline "Label: Value" pattern in DOCX paragraph; type inferred from value shape`,
      });
    }
  }
  return fields;
}

function extractTableFields(html: string): ParsedField[] {
  const fields: ParsedField[] = [];
  // Extract <tr> rows; first <tr> is the header
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  if (rows.length < 2) return fields;

  const headerCells = rows[0].match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) ?? [];
  const headers = headerCells.map((c) => stripTags(c));

  // Each remaining row contributes a value sample
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].match(/<t[hd][^>]*>[\s\S]*?<\/t[hd]>/gi) ?? [];
    for (let j = 0; j < cells.length && j < headers.length; j++) {
      const value = stripTags(cells[j]);
      if (!value) continue;
      const header = headers[j];
      if (!fields.find((f) => f.name === header)) {
        fields.push({
          name: header,
          type: inferTypeFromValue(value),
          value,
          sampleValues: [value],
          confidence: 0.75,
          rationale: `DOCX table cell; header "${header}" + value sample`,
        });
      } else {
        const f = fields.find((f) => f.name === header)!;
        if (f.sampleValues && f.sampleValues.length < 5) {
          f.sampleValues.push(value);
        }
        // Re-infer type if a more specific type emerges
        const newType = inferTypeFromValue(value);
        if (newType !== "text" && f.type === "text") {
          f.type = newType;
        }
      }
    }
  }

  return fields;
}

function extractListFields(text: string): ParsedField[] {
  const fields: ParsedField[] = [];
  // Each list item is a potential field
  const items = text.split(/\n?\s*[-*]\s+/).map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < items.length; i++) {
    const m = items[i].match(/^([A-Z][A-Za-z][A-Za-z0-9\s]{1,40}):\s*(.+)$/);
    if (m) {
      const [, name, value] = m;
      fields.push({
        name: name.trim(),
        type: inferTypeFromValue(value),
        value: value.trim(),
        sampleValues: [value.trim()],
        confidence: 0.55,
        rationale: `List item in DOCX; positional inference (item ${i + 1})`,
      });
    }
  }
  return fields;
}
