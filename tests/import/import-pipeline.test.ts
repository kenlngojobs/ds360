/**
 * Import pipeline tests — T-11
 *
 * Vitest-style smoke tests that exercise the full document import flow
 * without requiring a real browser or running server.
 *
 * Run with: `npx vitest tests/import/import-pipeline.test.ts`
 *
 * Created by Execute (Wave 5, T-11) on 2026-06-08.
 */

import { describe, it, expect } from "vitest";
import { matchFieldsToWidgets } from "../../src/services/import/field-matcher";
import { inferTypeFromValue } from "../../src/services/document-parsers/pdfParser";
import { detectPII, categorizeParseError } from "../../src/services/document-parsers/errors";
import type { ParsedDocument } from "../../src/services/document-parsers/types";

describe("Import pipeline (T-11)", () => {
  it("matches a text field to a text-box widget", () => {
    const doc: ParsedDocument = {
      metadata: {
        fileName: "test.txt",
        fileSize: 100,
        fileType: "txt",
        parseDurationMs: 0,
        parserVersion: "1.0.0",
        warnings: [],
      },
      sections: [
        {
          id: "s0",
          type: "paragraph",
          content: "Name: John Doe",
          fields: [
            {
              name: "Name",
              type: "text",
              value: "John Doe",
              confidence: 0.7,
              rationale: "Label: Value pattern",
            },
          ],
          sourceLocation: {},
        },
      ],
    };
    const match = matchFieldsToWidgets(doc);
    expect(match.widgetTree.length).toBeGreaterThan(0);
    const container = match.widgetTree.find((w) => w.type === "container");
    expect(container).toBeDefined();
    expect(container!.fields![0].widgetType).toBe("text-box");
  });

  it("matches a number field to a number-input widget", () => {
    const doc: ParsedDocument = {
      metadata: {
        fileName: "test.txt", fileSize: 100, fileType: "txt",
        parseDurationMs: 0, parserVersion: "1.0.0", warnings: [],
      },
      sections: [{
        id: "s0", type: "paragraph", content: "Age: 42",
        fields: [{ name: "Age", type: "number", value: "42", confidence: 0.8, rationale: "numeric" }],
        sourceLocation: {},
      }],
    };
    const match = matchFieldsToWidgets(doc);
    const container = match.widgetTree.find((w) => w.type === "container");
    expect(container!.fields![0].widgetType).toBe("number-input");
  });

  it("matches a date field to a calendar widget", () => {
    const doc: ParsedDocument = {
      metadata: {
        fileName: "test.txt", fileSize: 100, fileType: "txt",
        parseDurationMs: 0, parserVersion: "1.0.0", warnings: [],
      },
      sections: [{
        id: "s0", type: "paragraph", content: "Date: 2026-06-08",
        fields: [{ name: "Date", type: "date", value: "2026-06-08", confidence: 0.9, rationale: "ISO 8601" }],
        sourceLocation: {},
      }],
    };
    const match = matchFieldsToWidgets(doc);
    const container = match.widgetTree.find((w) => w.type === "container");
    expect(container!.fields![0].widgetType).toBe("calendar");
  });

  it("identifies the first heading as template-title", () => {
    const doc: ParsedDocument = {
      metadata: {
        fileName: "test.txt", fileSize: 100, fileType: "txt",
        parseDurationMs: 0, parserVersion: "1.0.0", warnings: [],
      },
      sections: [
        { id: "s0", type: "heading", heading: "Q4 Report", content: "Q4 Report", fields: [], sourceLocation: {} },
        { id: "s1", type: "paragraph", content: "Body content here.", fields: [], sourceLocation: {} },
      ],
    };
    const match = matchFieldsToWidgets(doc);
    const title = match.widgetTree.find((w) => w.type === "template-title");
    expect(title).toBeDefined();
    expect(title!.label).toBe("Q4 Report");
  });

  it("infers type from value shape (numeric)", () => {
    expect(inferTypeFromValue("42")).toBe("number");
    expect(inferTypeFromValue("3.14")).toBe("number");
  });

  it("infers type from value shape (date)", () => {
    expect(inferTypeFromValue("2026-01-15")).toBe("date");
    expect(inferTypeFromValue("2026-01-15T10:30:00")).toBe("date");
  });

  it("infers type from value shape (boolean)", () => {
    expect(inferTypeFromValue("yes")).toBe("boolean");
    expect(inferTypeFromValue("true")).toBe("boolean");
    expect(inferTypeFromValue("Active")).toBe("boolean");
  });

  it("detects PII patterns", () => {
    const text = "Contact: john@example.com, SSN: 123-45-6789, Phone: (555) 123-4567";
    const pii = detectPII(text);
    expect(pii).toContain("email");
    expect(pii).toContain("US SSN");
    expect(pii).toContain("US phone");
  });

  it("does not flag non-PII text as PII", () => {
    const pii = detectPII("This is a normal document with no sensitive data.");
    expect(pii).toEqual([]);
  });

  it("categorizes errors correctly", () => {
    expect(categorizeParseError(new Error("file is too large")).category).toBe("file_too_large");
    expect(categorizeParseError(new Error("PDF has no extractable text")).category).toBe("scanned_pdf_no_text");
    expect(categorizeParseError(new Error("macro detected")).category).toBe("docx_with_macros_stripped");
    expect(categorizeParseError(new Error("unsupported file format: .xyz")).category).toBe("unsupported_format");
    expect(categorizeParseError(new Error("something weird")).category).toBe("unknown");
  });

  it("flags low-confidence fields for review", () => {
    const doc: ParsedDocument = {
      metadata: {
        fileName: "test.txt", fileSize: 100, fileType: "txt",
        parseDurationMs: 0, parserVersion: "1.0.0", warnings: [],
      },
      sections: [{
        id: "s0", type: "paragraph", content: "Field1: ???",
        fields: [{ name: "Field1", type: "unknown", confidence: 0.3, rationale: "guess" }],
        sourceLocation: {},
      }],
    };
    const match = matchFieldsToWidgets(doc);
    expect(match.lowConfidenceFlags.length).toBeGreaterThan(0);
  });

  // P7-01: 3-column form produces container with layout: "3col"
  it("detects 3-column layout and produces container widget", () => {
    const doc: ParsedDocument = {
      metadata: { fileName: "form.pdf", fileSize: 500, fileType: "pdf", parseDurationMs: 0, parserVersion: "1.0.0", warnings: [] },
      sections: [
        {
          id: "s0", type: "heading", heading: "Employee Form", content: "Employee Form", fields: [],
          sourceLocation: { page: 1 },
        },
        {
          id: "s1", type: "paragraph", content: "Name: John | DOB: 1990-01-01 | Employee ID: E001",
          fields: [
            { name: "Name", type: "text", value: "John", confidence: 0.8, rationale: "row 1 col 0", sampleValues: ["John"], sourceLocation: { rowIndex: 0, columnIndex: 0 } },
            { name: "DOB", type: "date", value: "1990-01-01", confidence: 0.9, rationale: "row 1 col 1", sampleValues: ["1990-01-01"], sourceLocation: { rowIndex: 0, columnIndex: 1 } },
            { name: "Employee ID", type: "text", value: "E001", confidence: 0.8, rationale: "row 1 col 2", sampleValues: ["E001"], sourceLocation: { rowIndex: 0, columnIndex: 2 } },
          ],
          sourceLocation: { page: 1, rowIndex: 0 },
        },
        {
          id: "s2", type: "paragraph", content: "Phone: 555-0100 | Email: j@test.com | Start Date: 2025-03-15",
          fields: [
            { name: "Phone", type: "text", value: "555-0100", confidence: 0.7, rationale: "row 2 col 0", sampleValues: ["555-0100"], sourceLocation: { rowIndex: 1, columnIndex: 0 } },
            { name: "Email", type: "text", value: "j@test.com", confidence: 0.7, rationale: "row 2 col 1", sampleValues: ["j@test.com"], sourceLocation: { rowIndex: 1, columnIndex: 1 } },
            { name: "Start Date", type: "date", value: "2025-03-15", confidence: 0.9, rationale: "row 2 col 2", sampleValues: ["2025-03-15"], sourceLocation: { rowIndex: 1, columnIndex: 2 } },
          ],
          sourceLocation: { page: 1, rowIndex: 1 },
        },
      ],
    };
    const match = matchFieldsToWidgets(doc);
    const containers = match.widgetTree.filter((w) => w.type === "container");
    expect(containers.length).toBeGreaterThanOrEqual(1);
    const multiColContainer = containers.find((c) => c.config.layout && c.config.layout !== "1col");
    expect(multiColContainer).toBeDefined();
    expect(multiColContainer!.config.layout).toBe("3col");
    expect(multiColContainer!.children).toBeDefined();
  });

  // P7-02: Layout table → container; data table → repeater
  it("distinguishes layout tables from data tables", () => {
    // Data table — no columns, should be repeater
    const dataDoc: ParsedDocument = {
      metadata: { fileName: "data.docx", fileSize: 200, fileType: "docx", parseDurationMs: 0, parserVersion: "1.0.0", warnings: [] },
      sections: [{
        id: "s0", type: "table", content: "Name    Age    City\nJohn    30     NYC",
        fields: [
          { name: "Name", type: "text", value: "John", confidence: 0.8, rationale: "table", sourceLocation: {} },
          { name: "Age", type: "number", value: "30", confidence: 0.8, rationale: "table", sourceLocation: {} },
        ],
        sourceLocation: {},
      }],
    };
    const dataMatch = matchFieldsToWidgets(dataDoc);
    const dataRepeater = dataMatch.widgetTree.find((w) => w.type === "repeater");
    expect(dataRepeater).toBeDefined();

    // Layout table — has column indices, should be container
    const layoutDoc: ParsedDocument = {
      metadata: { fileName: "layout.docx", fileSize: 200, fileType: "docx", parseDurationMs: 0, parserVersion: "1.0.0", warnings: [] },
      sections: [{
        id: "s0", type: "table", content: "Label1    Label2",
        fields: [
          { name: "Label1", type: "text", value: "", confidence: 0.8, rationale: "layout", sourceLocation: { columnIndex: 0, rowIndex: 0 } },
          { name: "Label2", type: "text", value: "", confidence: 0.8, rationale: "layout", sourceLocation: { columnIndex: 1, rowIndex: 0 } },
        ],
        sourceLocation: {},
      }],
    };
    const layoutMatch = matchFieldsToWidgets(layoutDoc);
    const layoutContainer = layoutMatch.widgetTree.find((w) => w.type === "container");
    expect(layoutContainer).toBeDefined();
  });

  // P7-03: Styled headers
  it("applies style to header widgets", () => {
    const doc: ParsedDocument = {
      metadata: { fileName: "styled.docx", fileSize: 200, fileType: "docx", parseDurationMs: 0, parserVersion: "1.0.0", warnings: [] },
      sections: [
        { id: "s0", type: "heading", heading: "Summary", content: "Summary", fields: [], sourceLocation: {} },
        { id: "s1", type: "heading", heading: "Details", content: "Details", fields: [],
          sourceLocation: {},
          style: { color: "#FF0000", fontSize: 18, fontWeight: 700, textAlign: "center" },
        },
      ],
    };
    const match = matchFieldsToWidgets(doc);
    const titleWidget = match.widgetTree.find((w) => w.type === "template-title");
    expect(titleWidget).toBeDefined();
    const headerWidget = match.widgetTree.find((w) => w.type === "header");
    expect(headerWidget).toBeDefined();
    if (headerWidget?.config) {
      expect(headerWidget.config.color).toBe("#FF0000");
      expect(headerWidget.config.fontSize).toBe(18);
      expect(headerWidget.config.fontWeight).toBe(700);
      expect(headerWidget.config.textAlign).toBe("center");
    }
  });

  // P7-04: Integration — full pipeline parse → match → style → config
  it("integration: full pipeline produces styled container with correct config", () => {
    const doc: ParsedDocument = {
      metadata: { fileName: "full.docx", fileSize: 500, fileType: "docx", parseDurationMs: 0, parserVersion: "1.0.0", warnings: [] },
      sections: [
        { id: "s0", type: "heading", heading: "Contract", content: "Contract", fields: [],
          sourceLocation: {},
          style: { color: "#46367F", fontSize: 22, fontWeight: 700, textAlign: "left" },
        },
        { id: "s1", type: "paragraph", content: "First Name: Jane | Last Name: Doe",
          fields: [
            { name: "First Name", type: "text", value: "Jane", confidence: 0.8, rationale: "form", sampleValues: ["Jane"], sourceLocation: { rowIndex: 0, columnIndex: 0 } },
            { name: "Last Name", type: "text", value: "Doe", confidence: 0.8, rationale: "form", sampleValues: ["Doe"], sourceLocation: { rowIndex: 0, columnIndex: 1 } },
          ],
          sourceLocation: {},
          style: { bgColor: "#F5F5F5" },
        },
      ],
    };
    const match = matchFieldsToWidgets(doc);

    // Template title is first heading
    const title = match.widgetTree.find((w) => w.type === "template-title")!;
    expect(title).toBeDefined();
    expect(title.label).toBe("Contract");
    expect(title.config.color).toBe("#46367F");

    // Multi-column container from form fields
    const container = match.widgetTree.find((w) => w.type === "container" && w.children && w.children.length > 0);
    expect(container).toBeDefined();
    expect(container!.config.layout).toBe("2col");
    expect(container!.config.bgColor).toBe("#F5F5F5");

    // Stats
    expect(match.stats.totalWidgets).toBeGreaterThanOrEqual(2);
    expect(match.stats.avgConfidence).toBeGreaterThan(0.5);
  });
});
