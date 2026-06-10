/**
 * Document parser type definitions.
 *
 * Mirrors the shape defined in docs/import-taxonomy.md §2. Kept in
 * TypeScript so the parsers and the matcher can share types.
 *
 * Created by Execute (Wave 1, T-04) on 2026-06-08.
 */

export type ParsedDocument = {
  metadata: ParsedMetadata;
  sections: ParsedSection[];
};

export type ParsedMetadata = {
  fileName: string;
  fileSize: number;
  fileType: "pdf" | "docx" | "xlsx" | "md" | "txt";
  parseDurationMs: number;
  parserVersion: string;
  warnings: string[];
};

export type SectionType =
  | "heading"
  | "paragraph"
  | "table"
  | "list"
  | "form"
  | "image"
  | "spacer";

export type FieldType =
  | "text"
  | "longtext"
  | "number"
  | "boolean"
  | "date"
  | "enum"
  | "multi-select"
  | "file"
  | "image"
  | "signature"
  | "table"
  | "email"
  | "unknown";

export type SourceLocation = {
  page?: number;
  paragraphIndex?: number;
  rowIndex?: number;
  columnIndex?: number;
  byteOffset?: number;
};

export type ParsedField = {
  name: string;
  type: FieldType;
  value?: string;
  sampleValues?: string[];
  confidence: number;
  rationale: string;
  sourceLocation?: SourceLocation;
};

export type SectionStyle = {
  color?: string;
  bgColor?: string;
  fontSize?: number;
  fontWeight?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  fontFamily?: string;
};

export type ParsedSection = {
  id: string;
  type: SectionType;
  heading?: string;
  content: string;
  fields: ParsedField[];
  sourceLocation: SourceLocation;
  style?: SectionStyle;
};

export const PARSER_VERSION = "1.0.0";
