/**
 * XLSX parser — T-05 (Wave 2)
 *
 * Uses SheetJS (https://www.npmjs.com/package/xlsx) to read a workbook.
 * Each sheet is its own section. The first non-empty row is treated
 * as the header; remaining rows are data rows.
 *
 * Created by Execute (Wave 1, T-04 dispatch → Wave 2, T-05).
 */

import type { ParsedDocument, ParsedSection, ParsedField } from "./types";
import { PARSER_VERSION } from "./types";
import { inferTypeFromValue } from "./pdfParser";

/**
 * Best-effort XLSX parser. Returns a ParsedDocument.
 *
 * Limitations of this v1:
 * - Charts and pivot tables are not parsed (warning emitted)
 * - Merged cells are flattened (first cell's value applies to all)
 * - Cell type inference is shallow; all values are emitted as strings
 */
export async function parseXlsx(file: File): Promise<ParsedDocument> {
  // xlsx is SheetJS; dynamic import keeps it out of the main bundle
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: "array" });

  const warnings: string[] = [];
  if (!wb.SheetNames.length) {
    warnings.push("XLSX workbook has no sheets.");
  }

  const sections: ParsedSection[] = [];
  let id = 0;
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;
    // Convert to array-of-arrays; empty cells are undefined
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    const fields = extractFieldsFromRows(rows as (string | null)[][]);
    sections.push({
      id: `xlsx-s${id++}`,
      type: "table",
      heading: sheetName,
      content: rows.map((r) => (r ?? []).join("\t")).join("\n"),
      fields,
      sourceLocation: { rowIndex: 0 },
    });
  }

  return {
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      fileType: "xlsx",
      parseDurationMs: 0,
      parserVersion: PARSER_VERSION,
      warnings,
    },
    sections,
  };
}

function extractFieldsFromRows(rows: (string | null)[][]): ParsedField[] {
  if (rows.length === 0) return [];

  // Find the first non-empty row as the header
  let headerRowIdx = 0;
  while (headerRowIdx < rows.length && rows[headerRowIdx].every((c) => c === null || c === "")) {
    headerRowIdx++;
  }
  if (headerRowIdx >= rows.length) return [];

  const header = rows[headerRowIdx].map((c) => (c == null ? "" : String(c).trim()));
  const fields: ParsedField[] = header.map((name, idx) => ({
    name: name || `Column ${idx + 1}`,
    type: "unknown",
    confidence: 0,
    rationale: "XLSX header row; type inferred from data row samples",
    sampleValues: [],
  }));

  // Walk data rows
  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    for (let j = 0; j < row.length && j < fields.length; j++) {
      const cell = row[j];
      if (cell === null || cell === "") continue;
      const value = String(cell);
      const field = fields[j];
      if (field.type === "unknown" || field.confidence < 0.7) {
        const inferred = inferTypeFromValue(value);
        if (inferred !== "unknown") {
          field.type = inferred;
          field.confidence = 0.7;
        }
      }
      if (!field.sampleValues) field.sampleValues = [];
      if (field.sampleValues.length < 5 && !field.sampleValues.includes(value)) {
        field.sampleValues.push(value);
      }
      if (field.value === undefined) {
        field.value = value;
      }
    }
  }

  // Final pass: re-infer type from collected samples if still unknown
  for (const f of fields) {
    if (f.type === "unknown" && f.sampleValues && f.sampleValues.length > 0) {
      // Pick the most common inferred type across samples
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
        f.rationale = `XLSX column; type inferred from ${bestCount} sample value(s)`;
      }
    }
  }

  return fields;
}
