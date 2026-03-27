// =====================================================================
// Shared types and constants for the Template Builder system (I1)
// Extracted from TemplateBuilder.tsx for reuse across components.
// =====================================================================

// ── Widget type union ───────────────────────────────────────────────
export type WidgetType =
  | "alert"
  | "attachment"
  | "button"
  | "calendar"
  | "checkbox"
  | "container"
  | "divider"
  | "dropdown"
  | "header"
  | "image"
  | "internal-field"
  | "number-input"
  | "page-break"
  | "paragraph"
  | "partner-tags"
  | "radio-button"
  | "repeater"
  | "report-field"
  | "signature"
  | "spacer"
  | "template-title"
  | "template-description"
  | "text-area"
  | "text-box"
  | "toggle";

// ── Canvas element (recursive for containers) ──────────────────────
export interface CanvasElement {
  id: string;
  type: WidgetType;
  label: string;
  config: Record<string, string | number | boolean>;
  /** For container widgets: children[rowIdx][colIdx] = CanvasElement[] */
  children?: CanvasElement[][][];
}

// ── Global Typography ──────────────────────────────────────────────
export interface GlobalTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: string;
}

export type GlobalTypographyKey =
  | "templateTitle"
  | "templateDescription"
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "paragraph";

export type GlobalTypography = Record<GlobalTypographyKey, GlobalTextStyle>;

export const defaultGlobalTypography: GlobalTypography = {
  templateTitle:       { fontFamily: "Montserrat", fontSize: 22, fontWeight: 700, color: "#46367F", textAlign: "left" },
  templateDescription: { fontFamily: "Poppins",    fontSize: 13, fontWeight: 400, color: "#3A3A3A", textAlign: "left" },
  h1:                  { fontFamily: "Montserrat", fontSize: 28, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
  h2:                  { fontFamily: "Montserrat", fontSize: 22, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
  h3:                  { fontFamily: "Montserrat", fontSize: 18, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
  h4:                  { fontFamily: "Montserrat", fontSize: 15, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
  h5:                  { fontFamily: "Montserrat", fontSize: 13, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
  h6:                  { fontFamily: "Montserrat", fontSize: 11, fontWeight: 700, color: "#2D2D2D", textAlign: "left" },
  paragraph:           { fontFamily: "Poppins",    fontSize: 13, fontWeight: 400, color: "#6B6B6B", textAlign: "left" },
};

// ── Canvas Config ──────────────────────────────────────────────────
export type SpacingUnit = "px" | "in" | "mm" | "%";

export type PageSizePreset = "letter" | "a4" | "legal" | "tabloid" | "a3" | "a5" | "custom";
export type PageOrientation = "portrait" | "landscape";

export interface CanvasConfig {
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  contentWidth: "full" | "boxed";
  contentMaxWidth: number;
  contentAlignment: "left" | "center" | "right";
  elementGap: number;
  bgColor: string;
  borderStyle: "none" | "solid" | "dashed" | "dotted";
  borderWidth: number;
  borderColor: string;
  spacingUnit: SpacingUnit;
  globalTypography: GlobalTypography;
  // Document size
  pageSizePreset: PageSizePreset;
  pageSizeWidth: number;   // in px (portrait base)
  pageSizeHeight: number;  // in px (portrait base)
  pageOrientation: PageOrientation;
}

export const PAGE_SIZE_PRESETS: { value: PageSizePreset; label: string; widthPx: number; heightPx: number; widthIn: number; heightIn: number }[] = [
  { value: "letter",  label: "Letter",  widthPx: 816,  heightPx: 1056, widthIn: 8.5,   heightIn: 11    },
  { value: "a4",      label: "A4",      widthPx: 794,  heightPx: 1123, widthIn: 8.27,  heightIn: 11.69 },
  { value: "legal",   label: "Legal",   widthPx: 816,  heightPx: 1344, widthIn: 8.5,   heightIn: 14    },
  { value: "tabloid", label: "Tabloid", widthPx: 1056, heightPx: 1632, widthIn: 11,    heightIn: 17    },
  { value: "a3",      label: "A3",      widthPx: 1122, heightPx: 1588, widthIn: 11.69, heightIn: 16.54 },
  { value: "a5",      label: "A5",      widthPx: 560,  heightPx: 794,  widthIn: 5.83,  heightIn: 8.27  },
];

export const defaultCanvasConfig: CanvasConfig = {
  marginTop: 24,
  marginRight: 24,
  marginBottom: 24,
  marginLeft: 24,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  contentWidth: "full",
  contentMaxWidth: 720,
  contentAlignment: "left",
  elementGap: 0,
  bgColor: "#ffffff",
  borderStyle: "none",
  borderWidth: 1,
  borderColor: "#000000",
  spacingUnit: "px",
  globalTypography: { ...defaultGlobalTypography },
  pageSizePreset: "letter",
  pageSizeWidth: 816,
  pageSizeHeight: 1056,
  pageOrientation: "portrait",
};

// ── DnD constants ──────────────────────────────────────────────────
export const ITEM_TYPE_PALETTE = "PALETTE_WIDGET";
export const ITEM_TYPE_CANVAS = "CANVAS_ITEM";
export const ITEM_TYPE_CANVAS_NESTED = "CANVAS_ITEM_NESTED";

/** Maximum nesting depth for container widgets (C4) */
export const MAX_CONTAINER_DEPTH = 3;

// ── Conversion constants ───────────────────────────────────────────
export const PX_PER_INCH = 96;
export const PX_PER_MM = 96 / 25.4;