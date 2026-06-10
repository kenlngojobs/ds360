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

interface PdfImageItem {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Hash-like identifier for the image; pdfjs exposes `name` or `objid` */
  name: string;
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
  const allImages: PdfImageItem[] = [];
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
      allItems.push({
        str: item.str,
        x: transform[4],
        y: transform[5],
        width: item.width || 0,
        height: item.height || 0,
        fontName: item.fontName || "",
        fontSize: Math.abs(transform[0]) || 0,
        page: pageNum,
        fillColor: itemColors.get(item),
      });
    }

    // Extract image positions from the operator list
    try {
      const opList = await page.getOperatorList();
      const OPS: Record<string, number> = (pdfjs as any).OPS || {};
      const paintImageXObject = OPS.paintImageXObject ?? 85;
      const paintInlineImage = OPS.paintInlineImage ?? 86;
      const paintJpegXObject = OPS.paintJpegXObject ?? 88;
      for (let i = 0; i < opList.fnArray.length; i++) {
        const fnId = opList.fnArray[i];
        if (fnId === paintImageXObject || fnId === paintInlineImage || fnId === paintJpegXObject) {
          const name = (opList.argsArray[i] && opList.argsArray[i][0]) || `img-${pageNum}-${i}`;
          // Image bounding box is set on the page's current transform stack; we
          // approximate by using the page's viewBox top. Real PDF.js does not
          // expose per-image bounding boxes directly, so we tag by page only
          // and let the matcher decide placement.
          allImages.push({
            page: pageNum,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            name: String(name),
          });
        }
      }
    } catch {
      // getOperatorList may fail in some configurations; ignore.
    }
  }

  if (!allItems.length) {
    warnings.push("PDF has no extractable text (may be image-only or scanned).");
    return {
      metadata: { fileName: file.name, fileSize: file.size, fileType: "pdf", parseDurationMs: 0, parserVersion: PARSER_VERSION, warnings },
      sections: [],
    };
  }

  // Detect coordinate direction per page and normalize if bottom-up
  const pageYs = new Map<number, { items: PdfTextItem[]; pageHeight: number }>();
  for (const it of allItems) {
    if (!pageYs.has(it.page)) pageYs.set(it.page, { items: [], pageHeight: 0 });
    pageYs.get(it.page)!.items.push(it);
  }
  // Fill page heights from viewport
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    if (pageYs.has(pageNum)) pageYs.get(pageNum)!.pageHeight = viewport.height;
  }
  // Normalize: for each page, if median y is in the bottom half, flip
  for (const [, { items, pageHeight }] of pageYs) {
    if (!pageHeight || items.length < 2) continue;
    const sortedYs = items.map((it) => it.y).sort((a, b) => a - b);
    const medianY = sortedYs[Math.floor(sortedYs.length / 2)];
    const isBottomUp = medianY > pageHeight / 2;
    if (isBottomUp) {
      for (const it of items) {
        it.y = Math.max(pageHeight - it.y, 0);
      }
    }
  }

  // For each page that has images, emit an "image" section before the text sections
  // of that page so the image appears in the correct row position.
  const sectionsFromImages: ParsedSection[] = allImages.map((img, idx) => ({
    id: `pdf-img-${idx}`,
    type: "image" as const,
    content: img.name,
    fields: [],
    sourceLocation: { page: img.page, paragraphIndex: idx },
  }));

  const sections = buildSpatialSections(allItems, pageCount);
  if (sections.length > 0 || sectionsFromImages.length > 0) warnings.length = 0;

  return {
    metadata: { fileName: file.name, fileSize: file.size, fileType: "pdf", parseDurationMs: 0, parserVersion: PARSER_VERSION, warnings, },
    sections: [...sectionsFromImages, ...sections],
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
  // First pass: cluster items that are within 20px of each other
  const rawClusters: number[][] = [];
  for (let i = 0; i < xv.length; i++) {
    if (rawClusters.length === 0 || Math.abs(xv[i] - rawClusters[rawClusters.length - 1][rawClusters[rawClusters.length - 1].length - 1]) < 20) {
      if (rawClusters.length === 0) rawClusters.push([xv[i]]);
      else rawClusters[rawClusters.length - 1].push(xv[i]);
    } else {
      rawClusters.push([xv[i]]);
    }
  }
  // Second pass: merge adjacent clusters that are close (< 80px) AND the
  // later cluster has few items (likely word-wrapping of the same column).
  // This prevents "Vendor" (x=219) and "Name" (x=261, 42px gap) from
  // becoming two columns, while still separating real columns.
  const merged: number[] = [];
  for (const cluster of rawClusters) {
    const center = cluster.reduce((s, v) => s + v, 0) / cluster.length;
    if (merged.length > 0) {
      const prev = merged[merged.length - 1];
      const gap = center - prev;
      // If gap is small (< 80px), merge by averaging centers
      if (gap < 80) {
        merged[merged.length - 1] = (prev + center) / 2;
        continue;
      }
    }
    merged.push(center);
  }
  return merged.map((c) => Math.round(c));
}

function buildSpatialSections(items: PdfTextItem[], pageCount: number): ParsedSection[] {
  // 1. Group items by row (y-coordinate proximity) — tight threshold for form PDFs
  const rows: PdfTextItem[][] = [];
  let curRow: PdfTextItem[] = [];
  items.sort((a, b) => a.y - b.y || a.x - b.x);
  for (const it of items) {
    if (curRow.length === 0 || Math.abs(it.y - curRow[0].y) < 5) {
      curRow.push(it);
    } else {
      if (curRow.length) rows.push([...curRow]);
      curRow = [it];
    }
  }
  if (curRow.length) rows.push([...curRow]);

  // 2. Cluster x-coords for column detection (tighter threshold for form alignment)
  const xClusters = clusterXCoords(items);

  // 2.5. Compute median inter-row gap so we can detect unusually large
  //      gaps as divider lines (common in form templates).
  const yGaps: number[] = [];
  for (let i = 1; i < rows.length; i++) {
    const prevPage = rows[i - 1][0].page;
    const thisPage = rows[i][0].page;
    if (prevPage !== thisPage) continue;
    const gap = Math.abs(rows[i][0].y - rows[i - 1][0].y);
    if (gap > 0) yGaps.push(gap);
  }
  yGaps.sort((a, b) => a - b);
  const medianGap = yGaps.length ? yGaps[Math.floor(yGaps.length / 2)] : 18;
  // A divider is a gap significantly larger than the median line spacing
  // AND large enough in absolute terms to be a separator (>30px)
  const DIVIDER_GAP_MULTIPLIER = 1.8;
  const DIVIDER_GAP_MIN = 30;

  // 3. Process each row into a section, inserting divider sections where
  //    a large gap separates two text rows.
  const sections: ParsedSection[] = [];
  let id = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Divider detection: gap before this row exceeds threshold
    if (i > 0 && rows[i - 1][0].page === row[0].page) {
      const gap = Math.abs(row[0].y - rows[i - 1][0].y);
      if (gap > Math.max(medianGap * DIVIDER_GAP_MULTIPLIER, DIVIDER_GAP_MIN)) {
        sections.push({
          id: `pdf-divider-${id++}`,
          type: "divider",
          content: "",
          fields: [],
          sourceLocation: { page: row[0].page, paragraphIndex: i },
        });
      }
    }

    const text = row.map((r) => r.str).join(" ");
    const trimmed = text.trim();

    // Skip completely empty rows (between-row gaps that weren't large enough)
    if (!trimmed) continue;

    // Skip footer markers
    const lower = trimmed.toLowerCase();
    if (
      lower.includes("copyright") ||
      lower.includes("©") ||
      lower.includes("all rights reserved") ||
      lower.includes("proprietary") ||
      lower.includes("confidential") ||
      lower.includes("do not distribute") ||
      /^\s*\d+\s*$/.test(trimmed) // standalone page number
    ) {
      continue;
    }

    // Filter garbage: rotated text fragments (short, reverse-spelled, orphaned)
    const cleanRow = row.filter((r) => {
      const s = r.str.trim();
      if (!s) return false;
      // Single word under 8 chars that looks like reverse English (e.g., "nalp", "noitca")
      if (s.length < 12 && /^[a-z]+$/.test(s)) {
        const reversed = s.split("").reverse().join("");
        const commonWords = ["plan", "action", "corrective", "preventive", "vendor", "date", "name", "title", "email", "contact", "details", "comments", "description", "monitoring", "responsible", "member", "identified", "deficiency", "response", "completed", "validated", "deficiencies", "reoccurrence", "problem"];
        if (commonWords.includes(reversed)) return false;
      }
      return true;
    });

    if (cleanRow.length === 0) continue;

    const first = cleanRow[0];
    const cleanText = cleanRow.map((r) => r.str).join(" ");

    // Group items by column within the row
    const colMap = new Map<number, PdfTextItem[]>();
    for (const r of cleanRow) {
      const colIndex = xClusters.findIndex((cx) => Math.abs(r.x - cx) < 50);
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

    // Heading detection: only true ALL CAPS short text (not just lines starting with numbers)
    const isAllCaps = cleanText === cleanText.toUpperCase() && cleanText.length > 3 && cleanText.length < 100 && /^[A-Z\s\d]+$/.test(cleanText);
    const isHeading = isAllCaps;

    const style: SectionStyle | undefined = (first.fillColor || first.fontSize) ? {
      color: first.fillColor,
      fontSize: first.fontSize ? normalizeFontSize(first.fontSize) : undefined,
      fontFamily: first.fontName || undefined,
    } : undefined;

    const sectionId = `pdf-s${id++}`;
    sections.push({
      id: sectionId,
      type: isHeading ? "heading" : "paragraph",
      heading: isHeading ? cleanText : undefined,
      content: cleanText,
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
  // Date inferred from label keywords (e.g., "Date CAP Due", "Date Deficiency Identified", "Date SAM Validated")
  if (/\b(date|due|completed|validated|identified|created|updated|modified|effective|expires|expir|start|end|on|by|deadline)\b/i.test(v) && v.length < 60) {
    return "date";
  }
  // Email inferred from label/value (e.g., "Vendor Contact/Email", "user@example.com")
  if (/\b(email|e-mail|contact|mail)\b/i.test(v) && v.length < 60) {
    return "email";
  }
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)) {
    return "email";
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
