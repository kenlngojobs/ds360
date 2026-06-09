/**
 * Document parser dispatcher — T-04
 *
 * Routes a File to the appropriate format-specific parser via dynamic
 * import. This keeps the heavy parser libraries (pdf-parse, mammoth,
 * xlsx) out of the main bundle — they're only loaded when the user
 * actually opens the Import dialog and selects a file.
 *
 * Created by Execute (Wave 1, T-04) on 2026-06-08.
 */

import type { ParsedDocument } from "./types";
import { categorizeParseError, detectPII, type ParserError } from "./errors";

/**
 * Detect file format from extension. Returns the canonical format key
 * or null if unsupported.
 */
function detectFormat(fileName: string): "pdf" | "docx" | "xlsx" | "md" | "txt" | null {
  const ext = fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
  switch (ext) {
    case ".pdf":
      return "pdf";
    case ".docx":
      return "docx";
    case ".xlsx":
    case ".xls":
      return "xlsx";
    case ".md":
      return "md";
    case ".txt":
      return "txt";
    default:
      return null;
  }
}

/**
 * Dynamic-import dispatcher. Returns a ParsedDocument (see import-taxonomy.md).
 * Throws on unsupported format or parse error.
 */
export async function parseFile(file: File): Promise<ParsedDocument> {
  const format = detectFormat(file.name);
  if (!format) {
    throw new Error(`Unsupported file format: ${file.name}`);
  }

  const start = performance.now();
  let parsed: ParsedDocument;

  switch (format) {
    case "pdf": {
      const { parsePdf } = await import("./pdfParser.ts");
      parsed = await parsePdf(file);
      break;
    }
    case "docx": {
      const { parseDocx } = await import("./docxParser.ts");
      parsed = await parseDocx(file);
      break;
    }
    case "xlsx": {
      const { parseXlsx } = await import("./xlsxParser.ts");
      parsed = await parseXlsx(file);
      break;
    }
    case "md":
    case "txt": {
      // Text formats are native; no dynamic import needed
      const { parseText } = await import("./textParser.ts");
      parsed = await parseText(file, format);
      break;
    }
    default: {
      // Exhaustiveness check — TypeScript will error if a new format is added
      const _exhaustive: never = format;
      throw new Error(`Unsupported format: ${_exhaustive}`);
    }
  }

  parsed.metadata.parseDurationMs = Math.round(performance.now() - start);

  // T-09: PII scan
  const allText = parsed.sections.map((s) => s.content).join("\n");
  const piiHits = detectPII(allText);
  if (piiHits.length > 0) {
    parsed.metadata.warnings.push(
      `PII detected: ${piiHits.join(", ")}. Review the imported content before saving.`
    );
  }

  return parsed;
}

/**
 * Re-export error utilities for the call site.
 */
export { categorizeParseError, type ParserError };
