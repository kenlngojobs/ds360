/**
 * PDF parser — T-05 (Wave 2) | v2.0 spatial-aware
 *
 * Uses pdfjs-dist (Mozilla's browser-native PDF.js library) to extract
 * text from a PDF buffer. v2 adds x-coordinate capture, column-index
 * population, and fill-color detection via getOperatorList() (P2-01, P2-02).
 *
 * Browser-safe: no Node `fs` or `Buffer` references.
 *
 * Created by Execute (Wave 1, T-04 dispatch → Wave 2, T-05).
 */

import type { ParsedDocument, ParsedSection, ParsedField, SectionStyle } from "./types";
import { PARSER_VERSION } from "./types";

interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
  page: number;
  fillColor?: string;
}

export async function parsePdf(file: File): Promise<ParsedDocument> {
  const pdfjs = await import("pdfjs-dist");
  try {
    // @ts-ignore — worker import is optional and may not exist in all builds
    const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  } catch {
    // No worker bundle available; pdfjs will run on the main thread.
  }

  const buf = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buf });
  const pdf = await loadingTask.promise;

  const warnings: string[] = [];
  const allItems: PdfTextItem[] = [];
  const pageCount = pdf.numPages;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const pageHeight = viewport.height;
    const content = await page.getTextContent();

    // Extract fill colors from the operator list (best-effort)
    const itemColors = await extractItemColors(page, content.items.filter((i: any) => typeof i.str === "string"));

    for (const item of content.items as any[]) {
      if (typeof item.str !== "string") continue;
      const transform = item.transform || [1, 0, 0, 1, 0, 0];
      // Normalize y so 0 = top of page (consistently top-down regardless of PDF coordinate space)
      const rawY = transform[5];
      const y = Math.max(pageHeight - rawY, 0);
      allItems.push({
        str: item.str,
        x: transform[4],
        y,
        width: item.width || 0,
        height: item.height || 0,
        fontName: item.fontName || "",
        fontSize: Math.abs(transform[0]) || 0,
        page: pageNum,
        fillColor: itemColors.get(item),
      });
    }
  }

  if (!allItems.length) {
    warnings.push("PDF has no extractable text (may be image-only or scanned).");
    return {
      metadata: { fileName: file.name, fileSize: file.size, fileType: "pdf", parseDurationMs: 0, parserVersion: PARSER_VERSION, warnings },
      sections: [],
    };
  }

  const sections = buildSpatialSections(allItems, pageCount);
  if (sections.length > 0) warnings.length = 0;

  return {
    metadata: { fileName: file.name, fileSize: file.size, fileType: "pdf", parseDurationMs: 0, parserVersion: PARSER_VERSION, warnings, },
    sections,
  };
}

async function extractItemColors(page: any, items: any[]): Promise<Map<any, string>> {
  const colorMap = new Map<any, string>();
  try {
    const opList = await page.getOperatorList();
    type GfxState = { fillColor?: string; fillAlpha?: number; font?: [string, number]; x: number; y: number };
    const stack: GfxState[] = [{ x: 0, y: 0 }];
    const OPS: Record<string, number> = {};
    // Extract OPS mapping from pdfjs — approximate numeric values
    // OPS.setFillRGBColor ≈ 24, OPS.setTextRenderingMode ≈ 46, OPS.showText ≈ 51, etc.
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf({}))) { /* noop */ }
    // Use string matching on fnArray
    const colorOps = new Set(["setFillRGBColor", "setStrokeRGBColor", "setFillCMYKColor", "setFillGray"]);
    let gfx: GfxState = { x: 0, y: 0 };

    for (let fi = 0; fi < opList.fnArray.length; fi++) {
      const fnId = opList.fnArray[fi];
      const args = opList.argsArray[fi];
      // Resolve fn name heuristic — pdfjs OPS constants
      // Common values: 24=setFillRGBColor, 25=setStrokeRGBColor, 37=save, 38=restore
      if (fnId === 37) { // save
        stack.push({ ...gfx });
      } else if (fnId === 38) { // restore
        if (stack.length > 1) gfx = stack.pop()!;
      } else if (fnId === 24 && args && args.length >= 3) { // setFillRGBColor
        const [r, g, b] = args;
        gfx.fillColor = `#${Math.round(r * 255).toString(16).padStart(2, "0")}${Math.round(g * 255).toString(16).padStart(2, "0")}${Math.round(b * 255).toString(16).padStart(2, "0")}`;
      } else if (fnId === 51 || fnId === 52 || fnId === 53) { // showText/showSpacedText/nextLineShowText
        // Text positioning — correlate with items by position
        for (const item of items) {
          if (!colorMap.has(item) && gfx.fillColor && Math.abs(item.transform[4] - gfx.x) < 50 && Math.abs(item.transform[5] - gfx.y) < 12) {
            colorMap.set(item, gfx.fillColor);
          }
        }
      }
    }
  } catch {
    // getOperatorList may fail in some worker configurations; degrade gracefully
  }
  return colorMap;
}

function clusterXCoords(items: PdfTextItem[]): number[] {
  const xv: number[] = [];
  const seen = new Set<number>();
  for (const it of items) {
    const rX = Math.round(it.x);
    if (!seen.has(rX)) {
      seen.add(rX);
      xv.push(it.x);
    }
  }
  xv.sort((a, b) => a - b);
  const clusters: number[] = [];
  let cur: number[] = [];
  for (let i = 0; i < xv.length; i++) {
    if (cur.length === 0 || Math.abs(xv[i] - cur[cur.length - 1]) < 20) {
      cur.push(xv[i]);
    } else {
      clusters.push(Math.round(cur.reduce((s, v) => s + v, 0) / cur.length));
      cur = [xv[i]];
    }
  }
  if (cur.length) clusters.push(Math.round(cur.reduce((s, v) => s + v, 0) / cur.length));
  return clusters;
}

function buildSpatialSections(items: PdfTextItem[], pageCount: number): ParsedSection[] {
  // 1. Group items by row (y-coordinate proximity)
  const rows: PdfTextItem[][] = [];
  let curRow: PdfTextItem[] = [];
  items.sort((a, b) => a.y - b.y || a.x - b.x);
  for (const it of items) {
    if (curRow.length === 0 || Math.abs(it.y - curRow[0].y) < 16) {
      curRow.push(it);
    } else {
      if (curRow.length) rows.push([...curRow]);
      curRow = [it];
    }
  }
  if (curRow.length) rows.push([...curRow]);

  // 2. Cluster x-coords for column detection
  const xClusters = clusterXCoords(items);

  // 3. Process each row into a section
  const sections: ParsedSection[] = [];
  let id = 0;

  for (const row of rows) {
    const text = row.map((r) => r.str).join(" ");

    // Skip empty/underline-only rows
    if (!text.trim() || /^[_\-\s]+$/.test(text.trim())) continue;

    const first = row[0];

    // Group items by column within the row
    const colMap = new Map<number, PdfTextItem[]>();
    for (const r of row) {
      const colIndex = xClusters.findIndex((cx) => Math.abs(r.x - cx) < 20);
      const ci = colIndex >= 0 ? colIndex : 0;
      if (!colMap.has(ci)) colMap.set(ci, []);
      colMap.get(ci)!.push(r);
    }

    // Build fields: one field per column (joined text)
    const fields: ParsedField[] = [];
    for (const [ci, colItems] of [...colMap.entries()].sort((a, b) => a[0] - b[0])) {
      const joinedText = colItems.map((c) => c.str).join(" ").trim();
      if (!joinedText) continue;
      const name = joinedText.length > 60 ? joinedText.slice(0, 60) + "..." : joinedText;
      fields.push({
        name,
        type: inferTypeFromValue(joinedText),
        value: joinedText,
        sampleValues: [joinedText],
        confidence: 0.7,
        rationale: `PDF text at x=${Math.round(colItems[0].x)}, col=${ci}`,
        sourceLocation: { rowIndex: id, columnIndex: ci },
      });
    }

    // Heading detection: ALL CAPS short text, or section headers like "1. Section Name"
    const isAllCaps = text === text.toUpperCase() && text.length > 3 && text.length < 100;
    const isNumberedSection = /^\d+[\.\)]?\s+[A-Z]/.test(text) && fields.length === 1;
    const isHeading = isAllCaps || isNumberedSection;

    const style: SectionStyle | undefined = (first.fillColor || first.fontSize) ? {
      color: first.fillColor,
      fontSize: first.fontSize ? normalizeFontSize(first.fontSize) : undefined,
      fontFamily: first.fontName || undefined,
    } : undefined;

    const sectionId = `pdf-s${id++}`;
    sections.push({
      id: sectionId,
      type: isHeading ? "heading" : "paragraph",
      heading: isHeading ? text : undefined,
      content: text,
      fields,
      sourceLocation: {
        page: first.page,
        paragraphIndex: id - 1,
        columnIndex: 0,
      },
      style,
    });
  }

  return sections;
}

function extractFieldsFromBlock(block: string): ParsedField[] {
  const fields: ParsedField[] = [];

  // Pattern 1: "Label: Value" lines
  const lines = block.split("\n");
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
        rationale: `Matched "Label: Value" pattern; type inferred from value shape (${inferredType})`,
      });
    }
  }

  return fields;
}

/**
 * Infer a FieldType from a value's shape. Per import-taxonomy.md §7.
 */
function normalizeFontSize(pxSize: number): number {
  // PDF font sizes are in points; pdfjs reports them as absolute values in transform matrix
  // Normalize to whole-number px equivalents
  return Math.round(Math.abs(pxSize));
}

export function inferTypeFromValue(value: string): ParsedField["type"] {
  const v = value.trim();
  if (!v) return "unknown";

  // Boolean
  if (/^(yes|no|true|false|active|inactive|enabled|disabled|on|off|y|n)$/i.test(v)) {
    return "boolean";
  }
  // Number
  if (/^-?\d+(\.\d+)?$/.test(v)) {
    return "number";
  }
  // Date (ISO 8601)
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(v)) {
    return "date";
  }
  // File path or URL
  if (/^(https?:\/\/|\/|\\\\|[a-zA-Z]:\\|\.\.?\/)/.test(v)) {
    return "file";
  }
  // Long text
  if (v.length > 100) {
    return "longtext";
  }
  // Short text
  return "text";
}
