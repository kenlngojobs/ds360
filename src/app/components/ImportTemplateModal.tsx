/**
 * ImportTemplateModal — T-03
 *
 * Modal dialog for selecting a file to import into the document template.
 * Accepts PDF, Word (.docx), Excel (.xlsx/.xls), and text/markdown.
 * Enforces a 10MB size limit client-side. Performs filename sanitization
 * (strips path-traversal chars) and MIME-type sniffing via FileReader
 * (does not trust the extension).
 *
 * Created by Execute (Wave 0) on 2026-06-08.
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { parseFile, categorizeParseError, type ParserError } from "../../services/document-parsers/parseFile";
import { formatErrorToast } from "../../services/document-parsers/errors";
import type { ParsedDocument } from "../../services/document-parsers/types";
import { emitImportStart, emitParseComplete, emitParseError, emitMatchComplete, emitApply } from "../../services/import/telemetry";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_EXTENSIONS = [
  ".pdf", ".docx", ".xlsx", ".xls", ".md", ".txt",
] as const;

const ALLOWED_MIME_PREFIXES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/",
] as const;

const EXT_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".md": "text/markdown",
  ".txt": "text/plain",
};

/**
 * Sanitize a filename by stripping path-traversal characters and
 * control characters. Returns the safe basename.
 */
function sanitizeFilename(name: string): string {
  // Take only the basename (handles Windows and Unix separators)
  let base = name.split(/[\\/]/).pop() || "";
  // Strip NUL and control characters
  base = base.replace(/[\x00-\x1f]/g, "");
  // Strip path-traversal characters (defense in depth)
  base = base.replace(/\.\.+/g, ".");
  // Trim
  base = base.trim();
  return base || "unnamed";
}

/**
 * Lightweight MIME-type sniff by reading the first few bytes of the file.
 * Returns the sniffed MIME type or null if not recognized.
 */
async function sniffMimeType(file: File): Promise<string | null> {
  const head = file.slice(0, 16);
  const buf = await head.arrayBuffer();
  const bytes = new Uint8Array(buf);

  // PDF: starts with "%PDF"
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "application/pdf";
  }
  // ZIP / DOCX / XLSX: PK\x03\x04
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    // Could be DOCX or XLSX (both are ZIP-based Office formats)
    // Return a generic Office MIME; the server-side parser will dispatch on extension
    return "application/vnd.openxmlformats-officedocument";
  }
  // Text: first bytes are all printable ASCII or common UTF-8
  const isPrintable = Array.from(bytes).every(
    (b) => (b >= 0x20 && b < 0x7f) || b === 0x09 || b === 0x0a || b === 0x0d || b >= 0x80
  );
  if (isPrintable) {
    return "text/plain";
  }
  return null;
}

export interface ImportTemplateModalProps {
  open: boolean;
  onClose: () => void;
  /** Called when a file is parsed and ready to be imported.
   *  The full ParsedDocument is passed so the call site has complete
   *  metadata (fileType, parseDurationMs, parserVersion, warnings, sections). */
  onFileParsed: (
    file: File,
    sanitizedName: string,
    parsed: ParsedDocument
  ) => void;
}

interface FileValidationResult {
  ok: boolean;
  error?: string;
  sanitizedName?: string;
}

function validateFile(file: File): FileValidationResult {
  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`,
    };
  }
  // Extension check
  const lowerName = file.name.toLowerCase();
  const ext = lowerName.match(/\.[a-z0-9]+$/)?.[0] ?? "";
  if (!ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number])) {
    return {
      ok: false,
      error: `File type "${ext || "(none)"}" is not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }
  // Sanitize filename
  const safe = sanitizeFilename(file.name);
  if (safe === "unnamed") {
    return { ok: false, error: "Filename is empty after sanitization." };
  }
  return { ok: true, sanitizedName: safe };
}

export function ImportTemplateModal({
  open,
  onClose,
  onFileParsed,
}: ImportTemplateModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState<{
    stage: string;
    percent: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setValidationError(null);
      setIsDragging(false);
      setIsParsing(false);
      setParseProgress(null);
    }
  }, [open]);

  const acceptFile = useCallback(
    async (file: File) => {
      setValidationError(null);
      const result = validateFile(file);
      if (!result.ok) {
        setSelectedFile(null);
        setValidationError(result.error ?? "Invalid file");
        return;
      }
      // MIME-type sniff — does the file's magic bytes match the extension?
      const sniffed = await sniffMimeType(file);
      const expectedMime = EXT_TO_MIME[file.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? ""] ?? "";
      // Allow sniff to be missing (browsers don't always populate file.type for some formats)
      // but if sniff is present, it must be plausibly compatible with the extension
      if (sniffed && expectedMime && !sniffed.startsWith(expectedMime.split("/")[0])) {
        setSelectedFile(null);
        setValidationError(
          `File contents don't match the extension. Declared "${file.name}" but the file is actually ${sniffed}.`
        );
        return;
      }
      setSelectedFile(file);
    },
    []
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) void acceptFile(f);
    },
    [acceptFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) void acceptFile(f);
    },
    [acceptFile]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onImport = useCallback(async () => {
    if (!selectedFile || isParsing) return;
    setIsParsing(true);
    setParseProgress({ stage: "Loading parser", percent: 5 });
    const safe = sanitizeFilename(selectedFile.name);
    const t0 = performance.now();
    emitImportStart(selectedFile);
    try {
      setParseProgress({ stage: "Reading file", percent: 20 });
      setParseProgress({ stage: "Identifying format", percent: 35 });
      setParseProgress({ stage: "Extracting content", percent: 60 });
      const parsed = await parseFile(selectedFile);
      const parseDurationMs = Math.round(performance.now() - t0);
      setParseProgress({ stage: "Inferring field types", percent: 85 });
      setParseProgress({ stage: "Done", percent: 100 });
      emitParseComplete(safe, parseDurationMs, parsed.sections.length, parsed.metadata.warnings.length);

      // Surface PII warning as a toast (T-09)
      const piiWarning = parsed.metadata.warnings.find((w) => w.startsWith("PII detected"));
      if (piiWarning) {
        toast.warning(piiWarning, { description: "Review the imported content before saving." });
      }
      // Surface other warnings
      for (const w of parsed.metadata.warnings) {
        if (w.startsWith("PII detected")) continue;
        toast(w, { description: "Parser warning" });
      }

      onFileParsed(selectedFile, safe, parsed);
    } catch (err) {
      emitParseError(safe, err);
      const parserError: ParserError = categorizeParseError(err);
      const toastData = formatErrorToast(parserError);
      toast[toastData.variant === "destructive" ? "error" : "warning"](
        toastData.title,
        { description: toastData.description }
      );
      setValidationError(toastData.description);
      setIsParsing(false);
      setParseProgress(null);
    }
  }, [selectedFile, isParsing, onFileParsed]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="import-modal-title"
            className="font-['Poppins',sans-serif] text-xl font-semibold text-ds-dark-gray"
          >
            Import Template
          </h2>
          <button
            onClick={onClose}
            aria-label="Close import dialog"
            className="text-ds-gray hover:text-ds-dark-gray transition-colors p-1"
            type="button"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 transition-colors ${
            isDragging
              ? "border-ds-purple bg-purple-50"
              : "border-ds-haze bg-ds-light-gray/30"
          }`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {selectedFile ? (
            <div className="text-left">
              <p className="font-['Poppins',sans-serif] text-sm text-ds-gray mb-1">Selected file:</p>
              <p className="font-['Poppins',sans-serif] text-sm font-medium text-ds-dark-gray break-all">
                {sanitizeFilename(selectedFile.name)}
              </p>
              <p className="font-['Poppins',sans-serif] text-xs text-ds-gray mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || "unknown type"}
              </p>
            </div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-2 text-ds-gray" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.9 5 5 0 019.9-1A5 5 0 0118 16H7zm5-9a1 1 0 011 1v3.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L11 11.586V8a1 1 0 011-1z" />
              </svg>
              <p className="font-['Poppins',sans-serif] text-sm text-ds-dark-gray mb-1">
                Drop a file here, or click to browse
              </p>
              <p className="font-['Poppins',sans-serif] text-xs text-ds-gray">
                PDF, Word, Excel, or text · up to 10MB
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={onInputChange}
            className="hidden"
            aria-label="Select file to import"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 px-4 py-2 bg-ds-purple text-white rounded-lg text-sm font-medium hover:bg-ds-purple-hover transition-colors"
            type="button"
            disabled={isParsing}
          >
            Browse files
          </button>
        </div>

        {isParsing && parseProgress && (
          <div className="mb-4" role="status" aria-live="polite">
            <div className="flex items-center justify-between mb-1">
              <span className="font-['Poppins',sans-serif] text-xs text-ds-gray">
                {parseProgress.stage}...
              </span>
              <span className="font-['Poppins',sans-serif] text-xs text-ds-gray">
                {parseProgress.percent}%
              </span>
            </div>
            <div
              className="h-1.5 bg-ds-haze rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={parseProgress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-ds-purple transition-all duration-300"
                style={{ width: `${parseProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="font-['Poppins',sans-serif] text-sm text-red-700">{validationError}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-ds-dark-gray hover:bg-ds-light-gray rounded-lg text-sm font-medium transition-colors"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onImport}
            disabled={!selectedFile}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFile
                ? "bg-ds-purple text-white hover:bg-ds-purple-hover"
                : "bg-ds-haze text-ds-gray cursor-not-allowed"
            }`}
            type="button"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
