/**
 * Field-matching algorithm — T-06
 *
 * Reads a ParsedDocument and produces a WidgetTree compatible with
 * the existing CanvasElement[] shape (src/app/components/template-builder-types.ts:38).
 *
 * Algorithm (rule-based, per docs/widget-mapping-rules.md):
 *   1. Identify "template-title" and "template-description" from the first
 *      heading + first subheading in the document.
 *   2. For each ParsedSection, create a "container" widget if the
 *      section is a heading, or a "paragraph"/"text-box" widget if it's
 *      a body section with fields.
 *   3. For each ParsedField, map to a widget type based on field.type
 *      and the master mapping table.
 *   4. Each match produces a confidence score and rationale.
 *   5. Low-confidence matches are flagged for user review in T-07.
 *
 * Created by Execute (Wave 3, T-06) on 2026-06-08.
 */

import type { ParsedDocument, ParsedSection, ParsedField } from "../document-parsers/types";

/** A row group: fields clustered by y-coordinate proximity into a row with column slots. */
export interface RowGroup {
  y: number;
  columns: {
    columnIndex: number;
    x: number;
    fields: ParsedField[];
  }[];
}

/** Shape of a widget node in the output tree. Mirrors CanvasElement. */
export interface WidgetNode {
  id: string;
  type: WidgetType;
  label: string;
  config: Record<string, string | number | boolean>;
  /** For container widgets: rows of child widgets */
  children?: WidgetNode[][][];
  /** Confidence 0-1 for this match */
  confidence: number;
  /** Why this widget was chosen */
  rationale: string;
  /** If this widget is a table row, reference to the row's fields */
  fields?: MappedField[];
}

/** Mirrors the 27 widget types in template-builder-types.ts:7-35 */
export type WidgetType =
  | "alert" | "attachment" | "button" | "calendar" | "checkbox"
  | "container" | "divider" | "dropdown" | "header" | "image"
  | "internal-field" | "number-input" | "page-break" | "paragraph"
  | "partner-tags" | "radio-button" | "repeater" | "report-field"
  | "signature" | "spacer" | "template-title" | "template-description"
  | "text-area" | "text-box" | "toggle" | "range" | "color" | "rich-text";

export interface MappedField {
  /** Original field name from the parsed document */
  name: string;
  /** Inferred type */
  type: string;
  /** The widget this field maps to (a child of the parent section) */
  widgetType: WidgetType;
  confidence: number;
  rationale: string;
  /** Optional sample values for the preview UI */
  sampleValues?: string[];
  /** Optional source location for traceability */
  sourceLocation?: { page?: number; paragraphIndex?: number; rowIndex?: number };
}

export interface MatchResult {
  widgetTree: WidgetNode[];
  /** All matches with confidence < 0.7 are flagged for user review */
  lowConfidenceFlags: MappedField[];
  /** Aggregate metrics for the preview UI */
  stats: {
    totalWidgets: number;
    avgConfidence: number;
    lowConfidenceCount: number;
  };
}

/**
 * Confidence floor: matches below this are flagged for user review.
 * Per docs/widget-mapping-rules.md §3, the floor is 0.7 for auto-accept.
 */
const CONFIDENCE_FLOOR = 0.7;

/**
 * Stable id generator. Uses the section/field path so the same input
 * produces the same ids (idempotent).
 */
function makeId(prefix: string, path: string): string {
  // Hash the path to a short stable id
  let h = 0;
  for (let i = 0; i < path.length; i++) {
    h = ((h << 5) - h) + path.charCodeAt(i);
    h |= 0;
  }
  return `${prefix}-${(h >>> 0).toString(36)}`;
}

/**
 * Map a single field to a widget type using the master mapping table
 * (docs/widget-mapping-rules.md §2).
 */
function mapFieldToWidget(field: ParsedField, sectionPath: string): MappedField {
  const path = `${sectionPath}/${field.name}`;
  const id = makeId("f", path);

  // Rule 1: format-native types (confidence 1.0) are not available here
  //         because the parsers already infer the type.
  // Rule 2: repeater is a structural choice, not per-field.
  // Rule 3: special widgets are manual, not auto-matched.
  // Rule 4: type-driven widgets in priority order.

  const rules: Array<{ type: WidgetType; matches: (t: string) => boolean; confidence: number; rationale: string }> = [
    {
      type: "calendar",
      matches: (t) => t === "date",
      confidence: 0.95,
      rationale: "Date field → calendar widget",
    },
    {
      type: "number-input",
      matches: (t) => t === "number",
      confidence: 0.95,
      rationale: "Number field → number-input widget",
    },
    {
      type: "toggle",
      matches: (t) => t === "boolean",
      confidence: 0.85,
      rationale: "Boolean field → toggle widget",
    },
    {
      type: "signature",
      matches: (t) => t === "signature",
      confidence: 0.95,
      rationale: "Signature placeholder → signature widget",
    },
    {
      type: "image",
      matches: (t) => t === "image",
      confidence: 0.9,
      rationale: "Image field → image widget",
    },
    {
      type: "attachment",
      matches: (t) => t === "file",
      confidence: 0.9,
      rationale: "File path/URL → attachment widget",
    },
    {
      type: "checkbox",
      matches: (t) => t === "multi-select",
      confidence: 0.85,
      rationale: "Multi-select → checkbox widget",
    },
    {
      type: "dropdown",
      matches: (t) => t === "enum",
      confidence: 0.8,
      rationale: "Enum field → dropdown widget",
    },
    {
      type: "text-area",
      matches: (t) => t === "longtext",
      confidence: 0.8,
      rationale: "Long text → text-area widget",
    },
    {
      type: "text-box",
      matches: (t) => t === "text" || t === "unknown",
      confidence: 0.7,
      rationale: "Short text → text-box widget",
    },
  ];

  for (const rule of rules) {
    if (rule.matches(field.type)) {
      // For the catch-all "text-box" rule, lower the confidence when the type
      // is unknown (so it gets flagged for user review via lowConfidenceFlags).
      const isCatchAllUnknown =
        rule.type === "text-box" && field.type === "unknown";
      const ruleConfidence = isCatchAllUnknown ? 0.4 : rule.confidence;
      const ruleRationale = isCatchAllUnknown
        ? "Type unknown; defaulting to text-box. User should review."
        : rule.rationale;
      return {
        name: field.name,
        type: field.type,
        widgetType: rule.type,
        confidence: Math.min(ruleConfidence, field.confidence || ruleConfidence),
        rationale: `${ruleRationale} (parser confidence: ${field.confidence.toFixed(2)})`,
        sampleValues: field.sampleValues,
        sourceLocation: field.sourceLocation
          ? {
              page: field.sourceLocation.page,
              paragraphIndex: field.sourceLocation.paragraphIndex,
              rowIndex: field.sourceLocation.rowIndex,
            }
          : undefined,
      };
    }
  }

  // Fallback: text-box
  return {
    name: field.name,
    type: field.type,
    widgetType: "text-box",
    confidence: 0.3,
    rationale: `No matching rule for type "${field.type}"; defaulted to text-box`,
    sampleValues: field.sampleValues,
  };
}

/**
 * Convert a ParsedSection to one or more WidgetNodes.
 * v3.0: Row groups now emit one container per row (each row = one widget),
 * matching the builder architecture: container = row, columns = divisions.
 */
function mapSectionToWidgets(
  section: ParsedSection,
  isFirstHeading: boolean,
  isFirstSubheading: boolean,
  usedAsTitle: boolean,
  usedAsDescription: boolean
): WidgetNode[] {
  const sectionPath = `s${section.id}`;

  // Heading: title, description, or header
  if (section.type === "heading" && section.heading) {
    if (isFirstHeading && !usedAsTitle) {
      return [{
        id: makeId("w", sectionPath), type: "template-title", label: section.heading,
        config: { showBorder: true, borderColor: "#46367F", ...(section.style ? styleToConfig(section.style, "template-title") : {}) },
        confidence: 0.9, rationale: "First heading → template-title widget",
      }];
    }
    if (isFirstSubheading && !usedAsDescription) {
      return [{
        id: makeId("w", sectionPath), type: "template-description", label: section.heading,
        config: section.style ? styleToConfig(section.style, "template-description") : {},
        confidence: 0.85, rationale: "First subheading → template-description widget",
      }];
    }
    return [{
      id: makeId("w", sectionPath), type: "header", label: section.heading,
      config: { text: section.heading, tag: "H2", ...(section.style ? styleToConfig(section.style, "header") : {}) },
      confidence: 0.8, rationale: "Section heading → header widget",
    }];
  }

  // Table: distinguish layout tables from data tables
  if (section.type === "table") {
    if (isLayoutTable(section)) {
      return tableToContainers(section, sectionPath);
    }
    const mappedFields = section.fields.map((f) => mapFieldToWidget(f, sectionPath));
    return [{
      id: makeId("w", sectionPath), type: "repeater", label: section.heading || "Table",
      config: {}, confidence: 0.85, rationale: `Data table → repeater (${mappedFields.length} fields)`,
      fields: mappedFields,
    }];
  }

  // List
  if (section.type === "list") {
    const mappedFields = section.fields.map((f) => mapFieldToWidget(f, sectionPath));
    if (mappedFields.length === 0) return [];
    return [{
      id: makeId("w", sectionPath), type: "container", label: section.heading || "List",
      config: { structurePicked: true }, children: [], confidence: 0.7,
      rationale: `List → container (${mappedFields.length} fields)`, fields: mappedFields,
    }];
  }

  if (section.type === "image") {
    // Always wrap standalone widgets in a 1-col container so the canvas
    // treats them as a single-cell row that fills the page width.
    return [{
      id: makeId("w", sectionPath + "-wrap"),
      type: "container", label: section.heading || "Image",
      config: {
        structurePicked: true,
        layout: "1col",
        rows: JSON.stringify([[1]]),
        direction: "vertical",
        flexDirection: "column",
      },
      children: [[
        [{
          id: makeId("w", sectionPath),
          type: "image",
          label: section.heading || "Image",
          config: { src: "" },
          confidence: 0.7,
          rationale: "Image section → image widget",
        }],
      ]],
      confidence: 0.7, rationale: "Image → wrapped in 1-col container",
    }];
  }

  if (section.type === "spacer") return [];

  if (section.type === "divider") {
    return [{
      id: makeId("w", sectionPath), type: "divider", label: "Divider",
      config: { style: "solid", color: "#E5E5EA", thickness: 1, paddingTop: 0, paddingBottom: 0 },
      confidence: 0.85, rationale: "Empty row gap → divider widget",
    }];
  }

  // Paragraph with fields: detect row groups
  if (section.fields.length > 0) {
    const rowGroups = detectRowGroups(section.fields);
    if (rowGroups.length > 0 && (rowGroups.length > 1 || rowGroups[0].columns.length > 1)) {
      return buildRowContainers(rowGroups, sectionPath, section);
    }
    // Single field, single column: wrap in a 1-col container with the
    // field widget placed inside the cell.
    const mappedFields = section.fields.map((f) => ({
      field: f,
      mapped: mapFieldToWidget(f, sectionPath),
    }));
    const cellChild = mappedFields[0];
    const childWidget = cellChild
      ? {
          id: makeId("w", `${sectionPath}-c0-0-${cellChild.field.name}`),
          type: cellChild.mapped.widgetType,
          label: cellChild.field.name,
          config: {
            label: cellChild.field.name,
            placeholder: `Enter ${cellChild.field.name}...`,
          },
          confidence: 0.7, rationale: "Field placed inside 1-col container",
        }
      : null;
    return [{
      id: makeId("w", sectionPath),
      type: "container",
      label: section.heading || "Section",
      config: {
        structurePicked: true,
        layout: "1col",
        rows: JSON.stringify([[1]]),
        direction: "vertical",
        flexDirection: "column",
        ...(section.style ? styleToConfig(section.style, "container") : {}),
      },
      children: [[[childWidget].filter(Boolean) as WidgetNode[]]] as WidgetNode[][][],
      confidence: 0.7,
      rationale: `Section → 1-col container with ${mappedFields.length} field(s)`,
      fields: mappedFields.map((m) => m.mapped),
    }];
  }

  if (section.content && section.content.trim()) {
    // Wrap paragraph in a 1-col container so it fills the page width.
    return [{
      id: makeId("w", sectionPath + "-wrap"),
      type: "container", label: section.content.slice(0, 80) || "Section",
      config: {
        structurePicked: true,
        layout: "1col",
        rows: JSON.stringify([[1]]),
        direction: "vertical",
        flexDirection: "column",
        ...(section.style ? styleToConfig(section.style, "container") : {}),
      },
      children: [[
        [{
          id: makeId("w", sectionPath),
          type: "paragraph",
          label: section.content.slice(0, 80),
          config: {
            text: section.content,
            ...(section.style ? styleToConfig(section.style, "paragraph") : {}),
          },
          confidence: 0.6, rationale: "Paragraph → paragraph widget",
        }],
      ]],
      confidence: 0.6, rationale: "Paragraph → wrapped in 1-col container",
    }];
  }
  return [];
}

/** Detect row groups by clustering fields by y-coordinate proximity. */
function detectRowGroups(fields: ParsedField[]): RowGroup[] {
  const withY = fields.filter((f) => f.sourceLocation?.rowIndex != null);
  if (withY.length === 0) return [];
  // Group by rowIndex
  const rowMap = new Map<number, ParsedField[]>();
  for (const f of withY) {
    const ry = f.sourceLocation!.rowIndex!;
    if (!rowMap.has(ry)) rowMap.set(ry, []);
    rowMap.get(ry)!.push(f);
  }
  const groups: RowGroup[] = [];
  for (const [y, rowFields] of rowMap) {
    const cols: RowGroup["columns"] = [];
    // Sort by columnIndex
    rowFields.sort((a, b) => (a.sourceLocation?.columnIndex ?? 0) - (b.sourceLocation?.columnIndex ?? 0));
    for (let ci = 0; ci < rowFields.length; ci++) {
      cols.push({ columnIndex: rowFields[ci].sourceLocation?.columnIndex ?? ci, x: 0, fields: [rowFields[ci]] });
    }
    groups.push({ y, columns: cols });
  }
  groups.sort((a, b) => a.y - b.y);
  return groups;
}

/** Build one container widget per row group. Each row = one container widget. */
function buildRowContainers(groups: RowGroup[], sectionPath: string, section?: ParsedSection): WidgetNode[] {
  const layoutMap: Record<number, string> = { 1: "1col", 2: "2col", 3: "3col", 4: "4col" };
  return groups.map((g, gi) => {
    const colCount = g.columns.length;
    const layout = layoutMap[colCount] || "1col";
    const rows = [g.columns.map(() => 1)];
    const mappedFields = g.columns.flatMap((c) =>
      c.fields.map((f) => ({
        field: f,
        mapped: mapFieldToWidget(f, sectionPath),
      }))
    );
    return {
      id: makeId("w", `${sectionPath}-r${gi}`), type: "container", label: section?.heading || `Row ${gi + 1}`,
      config: {
        layout, rows: JSON.stringify(rows), direction: "horizontal", flexDirection: "row",
        structurePicked: true,
        ...(section?.style ? styleToConfig(section.style, "container") : {}),
      },
      children: [g.columns.map((c) =>
        c.fields.map((f) => {
          const m = mapFieldToWidget(f, sectionPath);
          return {
            id: makeId("w", `${sectionPath}-r${gi}-c${c.columnIndex}-${f.name}`),
            type: m.widgetType,
            label: f.name,
            config: {
              label: f.name,
              placeholder: `Enter ${f.name}...`,
              ...(f.sampleValues && f.sampleValues[0] ? { defaultValue: f.sampleValues[0] } : {}),
            },
            confidence: 0.7,
            rationale: `Field in row ${gi + 1}, col ${c.columnIndex + 1}`,
          };
        })
      )],
      fields: mappedFields.map((m) => m.mapped),
      confidence: 0.8,
      rationale: `Row ${gi + 1} → ${colCount}-column container`,
    };
  });
}

/** Distinguish layout tables (form-style) from data tables. */
function isLayoutTable(section: ParsedSection): boolean {
  if (section.fields.length === 0) return false;
  const hasColumnIndices = section.fields.some((f) => f.sourceLocation?.columnIndex != null && f.sourceLocation.columnIndex > 0);
  const hasTextContent = section.content.split(/\s+/).length > 5;
  // Layout tables have fields with column positions and minimal text per cell
  return hasColumnIndices && !hasTextContent;
}

/** Convert a layout table section to a set of row container widgets. */
function tableToContainers(section: ParsedSection, sectionPath: string): WidgetNode[] {
  const groups = detectRowGroups(section.fields);
  if (groups.length > 0) return buildRowContainers(groups, sectionPath, section);
  const mappedFields = section.fields.map((f) => mapFieldToWidget(f, sectionPath));
  return [{
    id: makeId("w", sectionPath), type: "container", label: section.heading || "Layout Table",
    config: { layout: "1col", rows: "[[1]]", direction: "vertical", flexDirection: "column", structurePicked: true },
    children: [], confidence: 0.7, fields: mappedFields,
    rationale: `Layout table → container widget (${section.fields.length} fields)`,
  }];
}

/** Map SectionStyle to widget-specific config keys. */
function styleToConfig(
  style: { color?: string; bgColor?: string; fontSize?: number; fontWeight?: number; textAlign?: string; fontFamily?: string },
  widgetType: WidgetType
): Record<string, string | number | boolean> {
  const cfg: Record<string, string | number | boolean> = {};
  if (style.color) cfg.color = style.color;
  if (style.bgColor && (widgetType === "container" || widgetType === "template-title" || widgetType === "header")) cfg.bgColor = style.bgColor;
  if (style.fontSize) cfg.fontSize = style.fontSize;
  if (style.fontWeight) cfg.fontWeight = style.fontWeight;
  if (style.textAlign && (style.textAlign === "left" || style.textAlign === "center" || style.textAlign === "right")) cfg.textAlign = style.textAlign;
  return cfg;
}

/**
 * Match a ParsedDocument to a WidgetTree. The main entry point.
 */
export function matchFieldsToWidgets(doc: ParsedDocument): MatchResult {
  const widgetTree: WidgetNode[] = [];
  const lowConfidenceFlags: MappedField[] = [];

  let usedAsTitle = false;
  let usedAsDescription = false;
  let firstHeadingSeen = false;
  let firstSubheadingSeen = false;
  let totalConfidence = 0;
  let totalWidgets = 0;

  for (const section of doc.sections) {
    const isFirstHeading =
      section.type === "heading" && !firstHeadingSeen;
    if (isFirstHeading) firstHeadingSeen = true;
    const isFirstSubheading =
      section.type === "heading" && firstHeadingSeen && !firstSubheadingSeen;
    if (isFirstSubheading) firstSubheadingSeen = true;

    const widgets = mapSectionToWidgets(
      section,
      isFirstHeading,
      isFirstSubheading,
      usedAsTitle,
      usedAsDescription
    );

    if (widgets.length === 0) continue;

    for (const widget of widgets) {
      if (widget.type === "template-title") usedAsTitle = true;
      if (widget.type === "template-description") usedAsDescription = true;

      widgetTree.push(widget);
      totalWidgets += 1;
      totalConfidence += widget.confidence;

      // Collect low-confidence field mappings
      if (widget.fields) {
        for (const f of widget.fields) {
          if (f.confidence < CONFIDENCE_FLOOR) {
            lowConfidenceFlags.push(f);
          }
        }
      }
    }
  }

  const avgConfidence = totalWidgets > 0 ? totalConfidence / totalWidgets : 0;

  return {
    widgetTree,
    lowConfidenceFlags,
    stats: {
      totalWidgets,
      avgConfidence,
      lowConfidenceCount: lowConfidenceFlags.length,
    },
  };
}
