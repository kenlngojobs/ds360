/**
 * Text / Markdown parser — T-05 (Wave 2)
 *
 * Native parser for plain text and Markdown. No external dependency.
 *
 * Created by Execute (Wave 1, T-04 dispatch → Wave 2, T-05).
 */

import type { ParsedDocument, ParsedSection, ParsedField } from "./types";
import { PARSER_VERSION } from "./types";
import { inferTypeFromValue } from "./pdfParser";

/**
 * Text/Markdown parser.
 *
 * Detection:
 * - ATX headings (#, ##, ###...)
 * - Setext headings (===, ---)
 * - Horizontal rules (---, ***, ___)
 * - Markdown tables (pipe syntax)
 * - Lists (-, *, 1.)
 * - Inline fields (**Name**: Value)
 */
export async function parseText(
  file: File,
  format: "md" | "txt"
): Promise<ParsedDocument> {
  const text = await file.text();
  const sections = parseTextContent(text, format);

  return {
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: format,
      parseDurationMs: 0,
      parserVersion: PARSER_VERSION,
      warnings: [],
    },
    sections,
  };
}

function parseTextContent(text: string, format: "md" | "txt"): ParsedSection[] {
  const lines = text.split(/\r?\n/);
  const sections: ParsedSection[] = [];
  let id = 0;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // ATX heading: # Heading
    const atxMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (atxMatch) {
      sections.push({
        id: `text-s${id++}`,
        type: "heading",
        heading: atxMatch[2],
        content: atxMatch[2],
        fields: [],
        sourceLocation: { byteOffset: line.length },
      });
      i++;
      continue;
    }

    // Setext heading: === (h1) or --- (h2) underlines
    if (i + 1 < lines.length && /^\s*=+\s*$/.test(lines[i + 1])) {
      sections.push({
        id: `text-s${id++}`,
        type: "heading",
        heading: line.trim(),
        content: line.trim(),
        fields: [],
        sourceLocation: { byteOffset: line.length },
      });
      i += 2;
      continue;
    }
    if (i + 1 < lines.length && /^\s*-{3,}\s*$/.test(lines[i + 1]) && line.trim().length > 0) {
      // Could be a heading OR a horizontal rule; treat as heading if the
      // line above has content. (A real horizontal rule is a single
      // line of --- on its own.)
      sections.push({
        id: `text-s${id++}`,
        type: "heading",
        heading: line.trim(),
        content: line.trim(),
        fields: [],
        sourceLocation: { byteOffset: line.length },
      });
      i += 2;
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(line) || /^\s*-{3,}\s*$/.test(line) || /^\s*\*{3,}\s*$/.test(line)) {
      sections.push({
        id: `text-s${id++}`,
        type: "spacer",
        content: line,
        fields: [],
        sourceLocation: { byteOffset: line.length },
      });
      i++;
      continue;
    }

    // Markdown table: header | header, separator |--- |---, rows
    if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*[-:]+\s*\|/.test(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      sections.push({
        id: `text-s${id++}`,
        type: "table",
        content: tableLines.join("\n"),
        fields: extractMarkdownTableFields(tableLines),
        sourceLocation: { byteOffset: line.length },
      });
      continue;
    }

    // List (collect until empty line or non-list)
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const listLines: string[] = [];
      while (
        i < lines.length &&
        (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))
      ) {
        listLines.push(lines[i]);
        i++;
      }
      const content = listLines.join("\n");
      sections.push({
        id: `text-s${id++}`,
        type: "list",
        content,
        fields: extractListFields(content),
        sourceLocation: { byteOffset: line.length },
      });
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph: collect until empty line or special marker
    const paraLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*\|/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    const content = paraLines.join(" ");
    sections.push({
      id: `text-s${id++}`,
      type: "paragraph",
      content,
      fields: extractInlineFields(content),
      sourceLocation: { byteOffset: line.length },
    });
  }

  return sections;
}

function extractMarkdownTableFields(tableLines: string[]): ParsedField[] {
  if (tableLines.length < 2) return [];
  const headerCells = tableLines[0].split("|").map((c) => c.trim()).filter(Boolean);
  const fields: ParsedField[] = headerCells.map((name, idx) => ({
    name: name || `Column ${idx + 1}`,
    type: "unknown",
    confidence: 0,
    rationale: "Markdown table header; type inferred from data row samples",
    sampleValues: [],
    sourceLocation: { columnIndex: idx },
  }));

  for (let i = 2; i < tableLines.length; i++) {
    const cells = tableLines[i].split("|").map((c) => c.trim());
    for (let j = 0; j < cells.length && j < fields.length; j++) {
      const value = cells[j];
      if (!value) continue;
      const f = fields[j];
      const inferred = inferTypeFromValue(value);
      if (f.type === "unknown" || f.confidence < 0.7) {
        if (inferred !== "unknown") {
          f.type = inferred;
          f.confidence = 0.7;
        }
      }
      if (!f.sampleValues) f.sampleValues = [];
      if (f.sampleValues.length < 5 && !f.sampleValues.includes(value)) {
        f.sampleValues.push(value);
      }
      if (f.value === undefined) f.value = value;
      if (f.sourceLocation) f.sourceLocation.rowIndex = i - 1;
    }
  }

  // Re-infer from samples
  for (const f of fields) {
    if (f.type === "unknown" && f.sampleValues && f.sampleValues.length > 0) {
      const counts: Record<string, number> = {};
      for (const v of f.sampleValues) {
        const t = inferTypeFromValue(v);
        counts[t] = (counts[t] || 0) + 1;
      }
      let bestType: ParsedField["type"] = "unknown";
      let bestCount = 0;
      for (const [t, c] of Object.entries(counts)) {
        if (c > bestCount) {
          bestType = t as ParsedField["type"];
          bestCount = c;
        }
      }
      if (bestCount > 0) {
        f.type = bestType;
        f.confidence = 0.7 + Math.min(0.2, bestCount * 0.05);
      }
    }
  }

  return fields;
}

function extractListFields(content: string): ParsedField[] {
  const fields: ParsedField[] = [];
  const items = content
    .split(/\n/)
    .map((s) => s.replace(/^\s*[-*]\s+/, "").replace(/^\s*\d+\.\s+/, "").trim())
    .filter(Boolean);
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
        rationale: `List item in ${content.includes("|") ? "Markdown" : "text"} content; positional inference`,
      });
    }
  }
  return fields;
}

function extractInlineFields(content: string): ParsedField[] {
  const fields: ParsedField[] = [];
  const lines = content.split(/\n/);
  for (const line of lines) {
    // **Name**: Value
    const boldM = line.match(/^\s*\*\*([^*]+)\*\*:\s*(.+)$/);
    if (boldM) {
      const [, name, value] = boldM;
      fields.push({
        name: name.trim(),
        type: inferTypeFromValue(value),
        value: value.trim(),
        sampleValues: [value.trim()],
        confidence: 0.75,
        rationale: "Bold-name pattern in Markdown paragraph",
      });
      continue;
    }
    // Plain "Label: Value"
    const m = line.match(/^([A-Z][A-Za-z][A-Za-z0-9\s]{1,40}):\s*(.+)$/);
    if (m) {
      const [, name, value] = m;
      fields.push({
        name: name.trim(),
        type: inferTypeFromValue(value),
        value: value.trim(),
        sampleValues: [value.trim()],
        confidence: 0.65,
        rationale: "Inline Label: Value pattern in paragraph",
      });
    }
  }
  return fields;
}
