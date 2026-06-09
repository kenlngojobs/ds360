/**
 * Import pipeline telemetry — T-13
 *
 * Lightweight console-based telemetry for the document import flow.
 * Captures: file metadata, parse duration, match confidence distribution,
 * and user actions (import, cancel, edit).
 *
 * In v1 this writes to console. A future version can ship logs to a
 * server endpoint (the existing /api/templates/import stub from T-10a
 * is a candidate).
 *
 * Created by Execute (Wave 5, T-13) on 2026-06-08.
 */

export type TelemetryEvent =
  | { kind: "import_start"; fileName: string; fileSize: number; fileType: string }
  | { kind: "import_cancel"; fileName: string }
  | { kind: "import_parse_complete"; fileName: string; durationMs: number; sectionCount: number; warningCount: number }
  | { kind: "import_parse_error"; fileName: string; errorCategory: string; errorMessage: string }
  | { kind: "import_match_complete"; fileName: string; widgetCount: number; avgConfidence: number; lowConfidenceCount: number }
  | { kind: "import_apply"; fileName: string; widgetCount: number; templateId: string }
  | { kind: "import_user_edit"; fileName: string; action: "delete" | "swap" | "edit_label" | "reorder" };

const REDACTED_FILE_NAME = /[^a-zA-Z0-9._\-]/g;

/** Replace sensitive characters in a filename before logging. */
export function redactFilename(name: string): string {
  return name.replace(REDACTED_FILE_NAME, "_");
}

/**
 * Emit a telemetry event. In v1, this is console.log with a structured
 * prefix. The shape is designed to be wire-format-compatible with a
 * future server endpoint (e.g., POST /api/telemetry/import).
 */
export function emit(event: TelemetryEvent): void {
  const ts = new Date().toISOString();
  // For file-related events, redact the filename to avoid logging PII
  const safeEvent = {
    timestamp: ts,
    ...event,
    fileName:
      "fileName" in event
        ? redactFilename(event.fileName)
        : undefined,
  };
  // eslint-disable-next-line no-console
  console.log(`[DS360-IMPORT] ${ts}`, JSON.stringify(safeEvent));
}

/** Convenience: emit a start event for an import attempt. */
export function emitImportStart(file: File): void {
  const ext = file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "unknown";
  emit({
    kind: "import_start",
    fileName: file.name,
    fileSize: file.size,
    fileType: ext,
  });
}

/** Convenience: emit a cancel event. */
export function emitImportCancel(fileName: string): void {
  emit({ kind: "import_cancel", fileName });
}

/** Convenience: emit a parse-complete event. */
export function emitParseComplete(
  fileName: string,
  durationMs: number,
  sectionCount: number,
  warningCount: number
): void {
  emit({
    kind: "import_parse_complete",
    fileName,
    durationMs,
    sectionCount,
    warningCount,
  });
}

/** Convenience: emit a parse-error event. */
export function emitParseError(fileName: string, err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  // Best-effort category extraction
  const category =
    msg.toLowerCase().includes("too large")
      ? "file_too_large"
      : msg.toLowerCase().includes("no text")
      ? "scanned_pdf_no_text"
      : msg.toLowerCase().includes("macro")
      ? "docx_with_macros_stripped"
      : msg.toLowerCase().includes("unsupported")
      ? "unsupported_format"
      : "unknown";
  emit({
    kind: "import_parse_error",
    fileName,
    errorCategory: category,
    errorMessage: msg,
  });
}

/** Convenience: emit a match-complete event. */
export function emitMatchComplete(
  fileName: string,
  widgetCount: number,
  avgConfidence: number,
  lowConfidenceCount: number
): void {
  emit({
    kind: "import_match_complete",
    fileName,
    widgetCount,
    avgConfidence,
    lowConfidenceCount,
  });
}

/** Convenience: emit an apply event. */
export function emitApply(fileName: string, widgetCount: number, templateId: string): void {
  emit({
    kind: "import_apply",
    fileName,
    widgetCount,
    templateId,
  });
}
