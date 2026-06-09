/**
 * Document parser error handling — T-09
 *
 * Centralized error categorization and PII pattern detection for the
 * import flow. Surfaced to the user via the preview UI.
 *
 * Created by Execute (Wave 2, T-09) on 2026-06-08.
 */

export type ParserErrorCategory =
  | "unsupported_format"
  | "file_too_large"
  | "file_corrupt"
  | "empty_file"
  | "scanned_pdf_no_text"
  | "docx_with_macros_stripped"
  | "xlsx_merged_cells_flattened"
  | "parser_timeout"
  | "pii_warning"
  | "unknown";

export interface ParserError {
  category: ParserErrorCategory;
  message: string;
  recoverable: boolean;
}

/**
 * PII patterns: email, US SSN, US phone.
 * Conservative — false positives are fine (warn, don't block).
 */
const PII_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "email", regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { name: "US SSN", regex: /\b\d{3}-\d{2}-\d{4}\b/g },
  { name: "US phone", regex: /\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
];

/**
 * Scan a parsed document's text content for PII patterns. Returns
 * the list of detected PII categories.
 */
export function detectPII(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  for (const { name, regex } of PII_PATTERNS) {
    regex.lastIndex = 0;
    if (regex.test(text)) {
      found.add(name);
    }
  }
  return Array.from(found);
}

/**
 * Categorize a parse error. Best-effort: caller passes the raw error
 * message and we guess the category from the message content.
 */
export function categorizeParseError(err: unknown): ParserError {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("unsupported file format")) {
    return {
      category: "unsupported_format",
      message: msg,
      recoverable: false,
    };
  }
  if (lower.includes("too large")) {
    return {
      category: "file_too_large",
      message: msg,
      recoverable: false,
    };
  }
  if (lower.includes("no extractable text") || lower.includes("no text")) {
    return {
      category: "scanned_pdf_no_text",
      message:
        "This PDF appears to be image-only or scanned. It contains no extractable text. Try running OCR first, or use a different file.",
      recoverable: false,
    };
  }
  if (lower.includes("empty") || lower.includes("0 bytes")) {
    return {
      category: "empty_file",
      message: "The file is empty.",
      recoverable: false,
    };
  }
  if (lower.includes("macro") || lower.includes(".docm") || lower.includes(".xlsm")) {
    return {
      category: "docx_with_macros_stripped",
      message:
        "Macros were detected and removed from this file. The content is safe to import, but any automation the macros provided is lost.",
      recoverable: true,
    };
  }
  if (lower.includes("merged cell") || lower.includes("merged range")) {
    return {
      category: "xlsx_merged_cells_flattened",
      message:
        "Merged cells in this spreadsheet have been flattened (only the top-left cell's value is preserved). Some information may be lost.",
      recoverable: true,
    };
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return {
      category: "parser_timeout",
      message:
        "The parser took too long to process this file. It may be very large or complex. Try a smaller file or a different format.",
      recoverable: false,
    };
  }
  if (lower.includes("corrupt") || lower.includes("invalid") || lower.includes("malformed")) {
    return {
      category: "file_corrupt",
      message:
        "The file appears to be corrupt or in an invalid format. The parser could not read it. Try re-saving the file from the source application.",
      recoverable: false,
    };
  }
  return {
    category: "unknown",
    message: msg,
    recoverable: false,
  };
}

/**
 * Build a user-facing toast for a parse error. Different severities
 * for recoverable (warning) vs non-recoverable (error).
 */
export function formatErrorToast(error: ParserError): {
  title: string;
  description: string;
  variant: "default" | "destructive";
} {
  const titles: Record<ParserErrorCategory, string> = {
    unsupported_format: "Unsupported file format",
    file_too_large: "File too large",
    file_corrupt: "File is corrupt",
    empty_file: "Empty file",
    scanned_pdf_no_text: "No extractable text",
    docx_with_macros_stripped: "Macros removed",
    xlsx_merged_cells_flattened: "Merged cells flattened",
    parser_timeout: "Parser timeout",
    pii_warning: "PII detected",
    unknown: "Parse error",
  };
  return {
    title: titles[error.category],
    description: error.message,
    variant: error.recoverable ? "default" : "destructive",
  };
}
