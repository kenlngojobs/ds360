import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AutoFitText } from "./AutoFitText";
import { Settings as LucideSettings } from "lucide-react";
import type { ReportField } from "./ReportFieldsTab";
import type { ImageDocument } from "./ImagesTab";
import {
  AttachmentIcon, CalendarIcon, CheckBoxIcon, ContainerIcon, DividerWidgetIcon,
  DropdownIcon, TemplateTitleIcon, TemplateDescriptionIcon, HeaderIcon, ImageWidgetIcon,
  InternalFieldIcon, ParagraphIcon, PartnerTagsIcon, RadioButtonIcon, ReportFieldIcon,
  SubgroupIcon, TextBoxIcon, TextAreaIcon, NumberInputIcon, ToggleIcon, SignatureIcon,
  ColumnsIcon, SpacerIcon, PageBreakIcon, ButtonWidgetIcon, AlertIcon, RepeaterIcon,
  CanvasSettingsIcon, DragHandleIcon, TrashIcon, ChevronIcon, StructureIcon, SettingsIcon,
  PanelCollapseIcon, StylesIcon, LayoutIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon,
  AlignJustifyIcon, WIDGET_ICON_MAP, WIDGET_TYPE_LABELS,
} from "./template-builder-icons";
import {
  PropInput, PropTextarea, PropSelect, PropCheckbox, PropReadonly,
  PropSectionLabel, PropColorPicker, PropSlider, PropShadowPicker,
  PropBorderWidthSection, PropRadiusSection, PropSpacingSection,
  LinkIcon, SpacingInput, TypographyControls,
  FONT_WEIGHT_OPTIONS, GOOGLE_FONTS, SHADOW_PRESETS, TEXT_ALIGN_OPTIONS,
  loadGoogleFont, fontFamilyCSS,
  getGlobalTypoKey, getEffectiveTypography, resolveTextStyle, textStyleToCSS,
} from "./template-builder-fields";

// ── Re-export shared types for consumers: TemplatePreview, CreateTemplateModal (I1) ──
// Canonical definitions live in template-builder-types.ts and template-builder-utils.ts.
// TemplateBuilder.tsx still uses local copies (to be migrated incrementally).
export type { CanvasElement, CanvasConfig, GlobalTypography, GlobalTextStyle, GlobalTypographyKey, SpacingUnit, WidgetType, PageSizePreset, PageOrientation } from "./template-builder-types";
export { defaultCanvasConfig, defaultGlobalTypography, PAGE_SIZE_PRESETS } from "./template-builder-types";

// =====================================================================
// Document-level context (template name & description for widget rendering)
// =====================================================================
const DocumentContext = React.createContext<{ templateName: string; templateDescription: string }>({
  templateName: "",
  templateDescription: "",
});

// =====================================================================
// Preview Mode context — consumed by Canvas, CanvasItem, ContainerCell,
// DropIndicatorLine to hide editing chrome when preview is active
// =====================================================================
const PreviewModeContext = React.createContext(false);

// =====================================================================
// Types
// =====================================================================
type WidgetType =
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

interface CanvasElement {
  id: string;
  type: WidgetType;
  label: string;
  config: Record<string, string | number | boolean>;
  /** For container widgets: children[rowIdx][colIdx] = CanvasElement[] */
  children?: CanvasElement[][][];
}

// =====================================================================
// Global Typography — page-level text style defaults
// =====================================================================
interface GlobalTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: string;
}

type GlobalTypographyKey =
  | "templateTitle"
  | "templateDescription"
  | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  | "paragraph";

type GlobalTypography = Record<GlobalTypographyKey, GlobalTextStyle>;

const defaultGlobalTypography: GlobalTypography = {
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

// Context for global typography (must be after defaultGlobalTypography to avoid TDZ)
const GlobalTypographyContext = React.createContext<GlobalTypography>(defaultGlobalTypography);

// ── Text-based widget types (eligible for Typography controls in Styles tab) ──
const TEXT_WIDGET_TYPES: Set<WidgetType> = new Set([
  "header", "paragraph", "template-title", "template-description",
  "text-box", "text-area", "report-field", "checkbox", "radio-button",
  "dropdown", "calendar", "number-input", "button", "alert", "toggle",
  "signature", "internal-field", "partner-tags", "attachment", "repeater",
]);

// =====================================================================
// Canvas Config — page-level properties
// =====================================================================
type PageSizePreset = "letter" | "a4" | "legal" | "tabloid" | "a3" | "a5" | "custom";
type PageOrientation = "portrait" | "landscape";

const PAGE_SIZE_PRESETS: { value: PageSizePreset; label: string; widthPx: number; heightPx: number; widthIn: number; heightIn: number }[] = [
  { value: "letter",  label: "Letter",  widthPx: 816,  heightPx: 1056, widthIn: 8.5,   heightIn: 11    },
  { value: "a4",      label: "A4",      widthPx: 794,  heightPx: 1123, widthIn: 8.27,  heightIn: 11.69 },
  { value: "legal",   label: "Legal",   widthPx: 816,  heightPx: 1344, widthIn: 8.5,   heightIn: 14    },
  { value: "tabloid", label: "Tabloid", widthPx: 1056, heightPx: 1632, widthIn: 11,    heightIn: 17    },
  { value: "a3",      label: "A3",      widthPx: 1122, heightPx: 1588, widthIn: 11.69, heightIn: 16.54 },
  { value: "a5",      label: "A5",      widthPx: 560,  heightPx: 794,  widthIn: 5.83,  heightIn: 8.27  },
];

/** Format a px dimension as inches, showing clean values for common sizes */
function pxToInchesLabel(px: number): string {
  const inches = px / PX_PER_INCH;
  // Check if it's a clean fraction
  if (Math.abs(inches - Math.round(inches * 4) / 4) < 0.01) {
    return String(Math.round(inches * 100) / 100);
  }
  return inches.toFixed(2);
}

interface CanvasConfig {
  // Page Margins (space from page edge to content area)
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  // Inner Content Padding
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  // Content sizing
  contentWidth: "full" | "boxed";
  contentMaxWidth: number;
  contentAlignment: "left" | "center" | "right";
  // Element spacing
  elementGap: number;
  // Background
  bgColor: string;
  // Page border
  borderStyle: "none" | "solid" | "dashed" | "dotted";
  borderWidth: number;
  borderColor: string;
  // Display unit for margin/padding inputs (internal values always stored in px)
  spacingUnit: SpacingUnit;
  // Global Typography
  globalTypography: GlobalTypography;
  // Document size
  pageSizePreset: PageSizePreset;
  pageSizeWidth: number;   // in px (portrait base)
  pageSizeHeight: number;  // in px (portrait base)
  pageOrientation: PageOrientation;
}

type SpacingUnit = "px" | "in" | "mm" | "%";

// Conversion constants (CSS spec: 1in = 96px, 1mm = 96/25.4 px)
const PX_PER_INCH = 96;
const PX_PER_MM = 96 / 25.4;

/** Convert px to display unit. For %, `refPx` is the reference dimension (page width or height). */
function pxToUnit(px: number, unit: SpacingUnit, refPx?: number): number {
  switch (unit) {
    case "in": return px / PX_PER_INCH;
    case "mm": return px / PX_PER_MM;
    case "%":  return refPx && refPx > 0 ? (px / refPx) * 100 : 0;
    default:   return px;
  }
}

/** Convert display unit value to px. For %, `refPx` is the reference dimension. */
function unitToPx(val: number, unit: SpacingUnit, refPx?: number): number {
  switch (unit) {
    case "in": return val * PX_PER_INCH;
    case "mm": return val * PX_PER_MM;
    case "%":  return refPx && refPx > 0 ? (val / 100) * refPx : 0;
    default:   return val;
  }
}

/** Format a display value to a sensible precision for the given unit */
function formatUnitValue(val: number, unit: SpacingUnit): string {
  if (unit === "px") return String(Math.round(val));
  if (unit === "%") return val.toFixed(1);
  return val.toFixed(2);
}

const defaultCanvasConfig: CanvasConfig = {
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

// =====================================================================
// Recursive element helpers
// =====================================================================
function makeElementId() {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Deep-clone a CanvasElement tree, assigning fresh IDs to every node */
function deepCloneElement(el: CanvasElement): CanvasElement {
  const clone: CanvasElement = {
    ...el,
    id: makeElementId(),
    config: { ...el.config },
  };
  if (el.children) {
    clone.children = el.children.map((row) =>
      row.map((cell) => cell.map((child) => deepCloneElement(child)))
    );
  }
  return clone;
}

/** Insert a cloned element right after the original (works recursively for nested elements) */
function duplicateElementById(elements: CanvasElement[], id: string): CanvasElement[] {
  const result: CanvasElement[] = [];
  for (const el of elements) {
    const updatedEl = el.children
      ? { ...el, children: el.children.map((row) => row.map((cell) => duplicateElementById(cell, id))) }
      : el;
    result.push(updatedEl);
    if (el.id === id) {
      result.push(deepCloneElement(el));
    }
  }
  return result;
}

function findElementById(elements: CanvasElement[], id: string): CanvasElement | null {
  for (const el of elements) {
    if (el.id === id) return el;
    if (el.children) {
      for (const row of el.children) {
        for (const cell of row) {
          const found = findElementById(cell, id);
          if (found) return found;
        }
      }
    }
  }
  return null;
}

/** Returns true if the given element id is a top-level element (not nested inside any container). */
function isTopLevelElement(elements: CanvasElement[], id: string): boolean {
  return elements.some((el) => el.id === id);
}

/** Check if `targetId` is the element itself or a descendant — prevents circular cross-move */
function isIdInsideElement(el: CanvasElement, targetId: string): boolean {
  if (el.id === targetId) return true;
  if (el.children) {
    for (const row of el.children) {
      for (const cell of row) {
        for (const child of cell) {
          if (isIdInsideElement(child, targetId)) return true;
        }
      }
    }
  }
  return false;
}

/** Build breadcrumb path from root to the element with the given id */
function getElementPath(
  elements: CanvasElement[],
  targetId: string,
): Array<{ id: string; label: string; type: string }> {
  for (const el of elements) {
    if (el.id === targetId) return [{ id: el.id, label: el.label, type: el.type }];
    if (el.children) {
      for (let ri = 0; ri < el.children.length; ri++) {
        for (let ci = 0; ci < el.children[ri].length; ci++) {
          const childPath = getElementPath(el.children[ri][ci], targetId);
          if (childPath.length > 0) {
            const rows = el.children.length;
            const cols = el.children[ri].length;
            const cellLabel = rows > 1 ? `Row ${ri + 1} · Col ${ci + 1}` : `Column ${ci + 1}`;
            return [
              { id: el.id, label: el.label, type: el.type },
              ...(cols > 1 || rows > 1 ? [{ id: `${el.id}-r${ri}c${ci}`, label: cellLabel, type: "cell" }] : []),
              ...childPath,
            ];
          }
        }
      }
    }
  }
  return [];
}

/** Compute the nesting depth of a container by id (0 = root level) (C4) */
function getContainerDepth(elements: CanvasElement[], containerId: string, depth = 0): number {
  for (const el of elements) {
    if (el.id === containerId) return depth;
    if (el.children) {
      for (const row of el.children) {
        for (const cell of row) {
          const found = getContainerDepth(cell, containerId, depth + 1);
          if (found >= 0) return found;
        }
      }
    }
  }
  return -1;
}

/** Get the maximum container depth of an element tree (for cross-move depth check) */
function getMaxDepthOfElement(el: CanvasElement): number {
  if (!el.children) return el.type === "container" ? 1 : 0;
  let max = 0;
  for (const row of el.children) {
    for (const cell of row) {
      for (const child of cell) {
        max = Math.max(max, getMaxDepthOfElement(child));
      }
    }
  }
  return 1 + max;
}

/** Insert an element after the element with the given id (recursive, for paste) (F3) */
function insertAfterElement(elements: CanvasElement[], afterId: string, newEl: CanvasElement): CanvasElement[] {
  const result: CanvasElement[] = [];
  for (const el of elements) {
    const updatedEl = el.children
      ? { ...el, children: el.children.map((row) => row.map((cell) => insertAfterElement(cell, afterId, newEl))) }
      : el;
    result.push(updatedEl);
    if (el.id === afterId) {
      result.push(newEl);
    }
  }
  return result;
}

function updateElementById(
  elements: CanvasElement[],
  id: string,
  updater: (el: CanvasElement) => CanvasElement
): CanvasElement[] {
  return elements.map((el) => {
    if (el.id === id) return updater(el);
    if (el.children) {
      return {
        ...el,
        children: el.children.map((row) =>
          row.map((cell) => updateElementById(cell, id, updater))
        ),
      };
    }
    return el;
  });
}

function deleteElementById(elements: CanvasElement[], id: string): CanvasElement[] {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => {
      if (el.children) {
        return {
          ...el,
          children: el.children.map((row) =>
            row.map((cell) => deleteElementById(cell, id))
          ),
        };
      }
      return el;
    });
}

function insertIntoCell(
  elements: CanvasElement[],
  containerId: string,
  rowIdx: number,
  colIdx: number,
  newEl: CanvasElement,
  insertIndex?: number
): CanvasElement[] {
  return elements.map((el) => {
    if (el.id === containerId) {
      // Ensure children grid exists even if it wasn't initialized
      const grid = el.children ?? [];
      // Deep-copy and expand grid if target row/col is out of bounds
      const safeGrid: CanvasElement[][][] = grid.map((row) => row.map((cell) => [...cell]));
      while (safeGrid.length <= rowIdx) safeGrid.push([]);
      while (safeGrid[rowIdx].length <= colIdx) safeGrid[rowIdx].push([]);
      return {
        ...el,
        children: safeGrid.map((row, ri) =>
          row.map((cell, ci) => {
            if (ri === rowIdx && ci === colIdx) {
              if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= cell.length) {
                const copy = [...cell];
                copy.splice(insertIndex, 0, newEl);
                return copy;
              }
              return [...cell, newEl];
            }
            return cell;
          })
        ),
      };
    }
    if (el.children) {
      return {
        ...el,
        children: el.children.map((row) =>
          row.map((cell) => insertIntoCell(cell, containerId, rowIdx, colIdx, newEl, insertIndex))
        ),
      };
    }
    return el;
  });
}

function moveInCell(
  elements: CanvasElement[],
  containerId: string,
  rowIdx: number,
  colIdx: number,
  dragIndex: number,
  hoverIndex: number
): CanvasElement[] {
  return elements.map((el) => {
    if (el.id === containerId && el.children) {
      return {
        ...el,
        children: el.children.map((row, ri) =>
          row.map((cell, ci) => {
            if (ri !== rowIdx || ci !== colIdx) return cell;
            if (dragIndex < 0 || dragIndex >= cell.length || hoverIndex < 0 || hoverIndex >= cell.length) return cell;
            const next = [...cell];
            const [removed] = next.splice(dragIndex, 1);
            next.splice(hoverIndex, 0, removed);
            return next;
          })
        ),
      };
    }
    if (el.children) {
      return {
        ...el,
        children: el.children.map((row) =>
          row.map((cell) => moveInCell(cell, containerId, rowIdx, colIdx, dragIndex, hoverIndex))
        ),
      };
    }
    return el;
  });
}

interface PaletteWidget {
  type: WidgetType;
  label: string;
  icon: React.ReactNode;
  /** For report-field type, which field it represents */
  fieldId?: string;
  /** Default config when dropped */
  defaultConfig?: Record<string, string | number | boolean>;
}

interface WidgetCategory {
  name: string;
  widgets: PaletteWidget[];
}

const ITEM_TYPE_PALETTE = "PALETTE_WIDGET";
const ITEM_TYPE_CANVAS = "CANVAS_ITEM";
const ITEM_TYPE_CANVAS_NESTED = "CANVAS_ITEM_NESTED";
const ITEM_TYPE_STRUCTURE = "STRUCTURE_TREE_ITEM";

/** Maximum nesting depth for container widgets (C4) */
const MAX_CONTAINER_DEPTH = 3;

/** Context describing where a structure-tree node lives */
type StructureNodeContext =
  | { type: "root" }
  | { type: "cell"; containerId: string; rowIdx: number; colIdx: number };

/** Drag item shape for structure-tree reordering */
interface StructureDragItem {
  id: string;
  sourceIndex: number;
  sourceContext: StructureNodeContext;
  elementType: string;
}

/** Compare two StructureNodeContexts for equality */
function isSameContext(a: StructureNodeContext, b: StructureNodeContext): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "root") return true;
  const ac = a as { type: "cell"; containerId: string; rowIdx: number; colIdx: number };
  const bc = b as { type: "cell"; containerId: string; rowIdx: number; colIdx: number };
  return ac.containerId === bc.containerId && ac.rowIdx === bc.rowIdx && ac.colIdx === bc.colIdx;
}

// SVG Icons, WIDGET_ICON_MAP, WIDGET_TYPE_LABELS → extracted to template-builder-icons.tsx

// ── Utility icons (extracted to template-builder-icons.tsx) ──────────

/* CanvasSettingsIcon removed — imported from template-builder-icons */

/* All utility icon functions, WIDGET_ICON_MAP, WIDGET_TYPE_LABELS imported from template-builder-icons.tsx */

// =====================================================================
// Style helpers
// =====================================================================
function getShadowValue(shadow: string | number | boolean | undefined): string {
  switch (String(shadow ?? "none")) {
    case "sm": return "0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)";
    case "md": return "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)";
    case "lg": return "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)";
    case "xl": return "0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)";
    default:   return "none";
  }
}

// =====================================================================
// Container Structure System
// =====================================================================
interface ContainerPreset {
  id: string;
  label: string;
  rows: number[][];
}

const CONTAINER_PRESETS: ContainerPreset[] = [
  // Structure-only presets (direction is controlled separately)
  { id: "1col",    label: "1 Column",                  rows: [[1]]           },
  { id: "2col",    label: "2 Equal Columns",            rows: [[1, 1]]        },
  { id: "2col-wl", label: "Wide Left + Narrow Right",   rows: [[2, 1]]        },
  { id: "2col-wr", label: "Narrow Left + Wide Right",   rows: [[1, 2]]        },
  { id: "3col",    label: "3 Equal Columns",            rows: [[1, 1, 1]]     },
  { id: "4col",    label: "4 Equal Columns",            rows: [[1, 1, 1, 1]]  },
];

/** Build an equal-column preset dynamically for any column count */
function makeEqualColumnsPreset(n: number): ContainerPreset {
  const clamped = Math.max(1, Math.min(12, Math.round(n)));
  const match = CONTAINER_PRESETS.find(
    (p) => p.rows.length === 1 && p.rows[0].length === clamped && p.rows[0].every((w) => w === 1)
  );
  if (match) return match;
  return {
    id: `${clamped}col`,
    label: `${clamped} Equal Columns`,
    rows: [Array(clamped).fill(1)],
  };
}

/** Extract current equal-column count from rows config (returns null if non-equal widths) */
function getEqualColumnCount(rows: number[][]): number | null {
  if (rows.length !== 1) return null;
  const cols = rows[0];
  if (cols.every((w) => w === cols[0])) return cols.length;
  return null;
}

function StructureThumbnail({ preset, size = "md" }: { preset: ContainerPreset; size?: "sm" | "md" }) {
  const outerGap = size === "sm" ? 1.5 : 2.5;
  const innerPad = size === "sm" ? 2 : 3;
  return (
    <div
      className="w-full h-full flex flex-col relative rounded-[3px] border border-[#8a8a9a]"
      style={{ gap: outerGap, padding: innerPad }}
    >
      {preset.rows.map((cols, rowIdx) => (
        <div key={rowIdx} className="flex flex-1 min-h-0" style={{ gap: outerGap }}>
          {cols.map((w, colIdx) => (
            <div
              key={colIdx}
              className="rounded-[2px] bg-[#a0a7b3]"
              style={{ flex: w }}
            />
          ))}
        </div>
      ))}

    </div>
  );
}

/** Create inner Container widgets for each cell in a preset grid.
 *  Direction is controlled separately and defaults to vertical (column). */
/** Create a single empty inner container for one cell */
function createSingleInnerContainer(
  direction: "vertical" | "horizontal" = "vertical",
  widthPct: number = 100
): CanvasElement {
  const innerFlexDir = direction === "horizontal" ? "row" : "column";
  return {
    id: makeElementId(),
    type: "container",
    label: `Container · 1 Column`,
    config: {
      structurePicked: true,
      layout: "1col",
      rows: JSON.stringify([[1]]),
      direction,
      flexDirection: innerFlexDir,
      justifyContent: "flex-start",
      alignItems: "stretch",
      flexWrap: "nowrap",
      gap: 0,
      gapColumn: 0,
      gapRow: 0,
      gapsLinked: true as unknown as boolean,
      title: "",
      showTitle: false as unknown as boolean,
      contentWidth: "full",
      contentMaxWidth: 800,
      contentAlignment: "center",
      containerWidth: widthPct,
      containerWidthUnit: "%",
      containerMinHeight: 0,
      containerMinHeightUnit: "px",
      bgColor: "transparent",
      opacity: 100,
      shadow: "none",
      alignment: "left",
      overflow: "hidden",
      zIndex: "",
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      borderStyle: "none",
      borderColor: "#e0dff0",
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      radiusTL: 0,
      radiusTR: 0,
      radiusBR: 0,
      radiusBL: 0,
      cssId: "",
      cssClass: "",
    },
    children: [[[]]],
  };
}

/** Collect all nested widgets from a cell's inner containers */
function collectCellGrandchildren(cell: CanvasElement[]): CanvasElement[] {
  const result: CanvasElement[] = [];
  for (const child of cell) {
    if (child.type === "container" && child.children) {
      for (const innerRow of child.children) {
        for (const innerCell of innerRow) {
          result.push(...innerCell);
        }
      }
    } else {
      result.push(child);
    }
  }
  return result;
}

/**
 * Redistribute children when structure changes.
 * - Expanding: existing cells preserved, new cells get empty inner containers.
 * - Shrinking: existing cells preserved, overflow cells' widgets merged into last cell.
 */
function redistributeChildren(
  oldChildren: CanvasElement[][][] | undefined,
  newRows: number[][],
  direction: "vertical" | "horizontal"
): CanvasElement[][][] {
  const old = oldChildren || [];
  return newRows.map((newCols, rowIdx) => {
    const oldRow = old[rowIdx] || [];
    const newColCount = newCols.length;
    const oldColCount = oldRow.length;
    const totalWeight = newCols.reduce((s, w) => s + w, 0);

    return newCols.map((weight, colIdx) => {
      const widthPct = totalWeight > 0 ? Math.round((weight / totalWeight) * 10000) / 100 : 100;

      if (newColCount >= oldColCount) {
        // ── Expanding or same size ──
        if (colIdx < oldColCount) {
          // Preserve existing cell (update containerWidth on inner containers)
          return oldRow[colIdx].map((child) =>
            child.type === "container"
              ? { ...child, config: { ...child.config, containerWidth: widthPct, containerWidthUnit: "%" } }
              : child
          );
        }
        // New cell — create fresh inner container
        return [createSingleInnerContainer(direction, widthPct)];
      }

      // ── Shrinking ──
      if (colIdx < newColCount - 1) {
        // Not the last cell — preserve as-is
        return oldRow[colIdx].map((child) =>
          child.type === "container"
            ? { ...child, config: { ...child.config, containerWidth: widthPct, containerWidthUnit: "%" } }
            : child
        );
      }

      // Last cell — merge this cell + all overflow cells
      const keptCell = oldRow[colIdx] || [];
      const overflowCells = oldRow.slice(colIdx + 1);

      // Collect widgets from overflow cells
      const overflowWidgets: CanvasElement[] = [];
      for (const cell of overflowCells) {
        overflowWidgets.push(...collectCellGrandchildren(cell));
      }

      if (overflowWidgets.length === 0) {
        // Nothing to merge, just keep the cell
        return keptCell.map((child) =>
          child.type === "container"
            ? { ...child, config: { ...child.config, containerWidth: widthPct, containerWidthUnit: "%" } }
            : child
        );
      }

      // Append overflow widgets into the kept cell's inner container
      return keptCell.map((child) => {
        if (child.type === "container" && child.children) {
          const existingWidgets = collectCellGrandchildren([child]);
          const merged = [...existingWidgets, ...overflowWidgets];
          return {
            ...child,
            config: { ...child.config, containerWidth: widthPct, containerWidthUnit: "%" },
            children: [[[...merged]]] as CanvasElement[][][],
          };
        }
        return child;
      });
    });
  });
}

function createInnerContainersForPreset(
  parsedRows: number[][],
  direction: "vertical" | "horizontal" = "vertical"
): CanvasElement[][][] {
  return parsedRows.map((cols) => {
    const totalWeight = cols.reduce((sum, w) => sum + w, 0);
    return cols.map((weight) => {
      const widthPct = totalWeight > 0 ? Math.round((weight / totalWeight) * 10000) / 100 : 100;
      return [createSingleInnerContainer(direction, widthPct)];
    });
  });
}

function StructurePickerInline({
  onPick,
  currentLayout,
  singleCellOnly = false,
}: {
  onPick: (preset: ContainerPreset) => void;
  currentLayout?: string;
  singleCellOnly?: boolean;
}) {
  const presets = singleCellOnly
    ? CONTAINER_PRESETS.filter((p) => p.rows.length === 1 && p.rows[0].length === 1)
    : CONTAINER_PRESETS;
  return (
    <div className="flex flex-col gap-5 py-6 px-5">
      <div className="text-center">
        <span
          className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray"
          style={{ fontWeight: 600 }}
        >
          Select your structure
        </span>
      </div>
      <div className="grid grid-cols-6 gap-2.5">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={(e) => { e.stopPropagation(); onPick(preset); }}
            className={`aspect-[4/3] rounded-md border-2 p-1.5 transition-all cursor-pointer ${
              currentLayout === preset.id
                ? "border-ds-purple bg-ds-purple-light/40"
                : "border-ds-haze bg-[#e8e8ee] hover:border-ds-purple hover:bg-ds-purple-light/20"
            }`}
            title={preset.label}
          >
            <StructureThumbnail preset={preset} />
          </button>
        ))}
      </div>
      {/* Custom column count — only for top-level containers */}
      {!singleCellOnly && (
        <div className="flex items-center gap-2">
          <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray" style={{ fontWeight: 500 }}>
            Custom Columns
          </span>
          <input
            type="number"
            min={1}
            max={12}
            placeholder="5–12"
            className="w-14 border border-ds-haze rounded-md px-1.5 py-1 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white text-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = Number((e.target as HTMLInputElement).value);
                if (val >= 1 && val <= 12) {
                  onPick(makeEqualColumnsPreset(val));
                }
              }
            }}
            onBlur={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= 12) {
                onPick(makeEqualColumnsPreset(val));
              }
            }}
          />
          <span className="font-['Poppins',sans-serif] text-[9px] text-ds-teal/70 italic">
            1–12, press Enter
          </span>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Build palette categories
// =====================================================================
function buildCategories(
  reportFields: ReportField[],
  _images: ImageDocument[]
): WidgetCategory[] {
  // ── Document Widgets ──
  const templateTitleWidget: PaletteWidget = {
    type: "template-title",
    label: "Template Title",
    icon: <TemplateTitleIcon />,
    defaultConfig: { showBorder: true, borderColor: "#46367F" },
  };
  const templateDescriptionWidget: PaletteWidget = {
    type: "template-description",
    label: "Template Description",
    icon: <TemplateDescriptionIcon />,
    defaultConfig: {},
  };

  // ── Content Widgets (display-only) ──
  const headerWidget: PaletteWidget = {
    type: "header",
    label: "Header",
    icon: <HeaderIcon />,
    defaultConfig: { text: "Section Header", tag: "H2" },
  };
  const paragraphWidget: PaletteWidget = {
    type: "paragraph",
    label: "Paragraph",
    icon: <ParagraphIcon />,
    defaultConfig: { text: "Enter your text here..." },
  };
  const imageWidget: PaletteWidget = {
    type: "image",
    label: "Image",
    icon: <ImageWidgetIcon />,
    defaultConfig: { imageId: "", imageName: "Select image..." },
  };
  const alertWidget: PaletteWidget = {
    type: "alert",
    label: "Alert",
    icon: <AlertIcon />,
    defaultConfig: { message: "This is an important notice.", variant: "info", title: "" },
  };
  const repeaterWidget: PaletteWidget = {
    type: "repeater",
    label: "Repeater",
    icon: <RepeaterIcon />,
    defaultConfig: { label: "Items", itemLabel: "Item", minItems: 1, maxItems: 10 },
  };

  // ── Form Widgets (user-input) ──
  const textBoxWidget: PaletteWidget = {
    type: "text-box",
    label: "Text Box",
    icon: <TextBoxIcon />,
    defaultConfig: { label: "Text Field", placeholder: "Enter value..." },
  };
  const textAreaWidget: PaletteWidget = {
    type: "text-area",
    label: "Text Area",
    icon: <TextAreaIcon />,
    defaultConfig: { label: "Notes", placeholder: "Enter text here...", rows: 4 },
  };
  const numberInputWidget: PaletteWidget = {
    type: "number-input",
    label: "Number Input",
    icon: <NumberInputIcon />,
    defaultConfig: { label: "Amount", placeholder: "0", min: 0, max: 9999, step: 1 },
  };
  const attachmentWidget: PaletteWidget = {
    type: "attachment",
    label: "Attachment",
    icon: <AttachmentIcon />,
    defaultConfig: { label: "Upload File", accept: "*" },
  };
  const buttonWidget: PaletteWidget = {
    type: "button",
    label: "Button",
    icon: <ButtonWidgetIcon />,
    defaultConfig: { label: "Submit", variant: "primary", size: "md" },
  };
  const checkboxWidget: PaletteWidget = {
    type: "checkbox",
    label: "Check Box",
    icon: <CheckBoxIcon />,
    defaultConfig: { label: "I agree", required: false },
  };
  const radioButtonWidget: PaletteWidget = {
    type: "radio-button",
    label: "Radio Button",
    icon: <RadioButtonIcon />,
    defaultConfig: { label: "Option", options: "Option 1,Option 2,Option 3" as unknown as string },
  };
  const dropdownWidget: PaletteWidget = {
    type: "dropdown",
    label: "Dropdown",
    icon: <DropdownIcon />,
    defaultConfig: { label: "Select", options: "Option 1,Option 2,Option 3" as unknown as string },
  };
  const calendarWidget: PaletteWidget = {
    type: "calendar",
    label: "Calendar",
    icon: <CalendarIcon />,
    defaultConfig: { label: "Date" },
  };
  const toggleWidget: PaletteWidget = {
    type: "toggle",
    label: "Toggle",
    icon: <ToggleIcon />,
    defaultConfig: { label: "Enable", defaultValue: false, onLabel: "Yes", offLabel: "No" },
  };
  const signatureWidget: PaletteWidget = {
    type: "signature",
    label: "Signature",
    icon: <SignatureIcon />,
    defaultConfig: { label: "Signature", hint: "Sign within the box", required: false },
  };

  // ── Layout Widgets ──
  const containerWidget: PaletteWidget = {
    type: "container",
    label: "Container",
    icon: <ContainerIcon />,
    defaultConfig: {
      structurePicked: false as unknown as boolean,
      layout: "1col",
      rows: "[[1]]",
      direction: "vertical",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
      flexWrap: "nowrap",
      gap: 0,
      gapColumn: 0,
      gapRow: 0,
      gapsLinked: true as unknown as boolean,
      title: "",
      showTitle: false as unknown as boolean,
      contentWidth: "full",
      contentMaxWidth: 800,
      contentAlignment: "center",
      containerWidth: 100,
      containerWidthUnit: "%",
      containerMinHeight: 0,
      containerMinHeightUnit: "px",
      bgColor: "transparent",
      opacity: 100,
      shadow: "none",
      alignment: "left",
      overflow: "hidden",
      zIndex: "",
      // Zero spacing by default — matches Elementor behavior
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      borderStyle: "none",
      borderColor: "#e0dff0",
      borderTopWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      radiusTL: 0,
      radiusTR: 0,
      radiusBR: 0,
      radiusBL: 0,
      cssId: "",
      cssClass: "",
    },
  };
  const dividerWidget: PaletteWidget = {
    type: "divider",
    label: "Divider",
    icon: <DividerWidgetIcon />,
    defaultConfig: { style: "solid" },
  };
  const spacerWidget: PaletteWidget = {
    type: "spacer",
    label: "Spacer",
    icon: <SpacerIcon />,
    defaultConfig: { height: 32 },
  };
  const pageBreakWidget: PaletteWidget = {
    type: "page-break",
    label: "Page Break",
    icon: <PageBreakIcon />,
    defaultConfig: {},
  };

  // ── Data Widgets ──
  const internalFieldWidget: PaletteWidget = {
    type: "internal-field",
    label: "Internal Field",
    icon: <InternalFieldIcon />,
    defaultConfig: { property: "customer.name" },
  };
  const partnerTagsWidget: PaletteWidget = {
    type: "partner-tags",
    label: "Partner Tags",
    icon: <PartnerTagsIcon />,
    defaultConfig: { source: "all" },
  };

  // ── Report Fields (from Report Fields tab) ──
  const reportFieldWidgets: PaletteWidget[] = reportFields.map((f) => ({
    type: "report-field" as WidgetType,
    label: f.name,
    icon: <ReportFieldIcon />,
    fieldId: f.id,
    defaultConfig: {
      fieldId: f.id,
      fieldName: f.name,
      fieldType: f.fieldType,
      required: false,
    },
  }));

  const now = new Date();
  const FORM_ELEMENTS_UNLOCK = new Date("2026-03-20T00:00:00");
  const DATA_REPORT_UNLOCK = new Date("2026-03-27T00:00:00");
  const CONTENT_TIER2_UNLOCK = new Date("2026-03-18T13:00:00Z"); // Mar 18 9 PM PHT (UTC+8)

  return [
    {
      name: "Document",
      widgets: [
        templateTitleWidget,
        templateDescriptionWidget,
      ],
    },
    {
      name: "Layout",
      widgets: [
        containerWidget,
        dividerWidget,
        spacerWidget,
        pageBreakWidget,
      ],
    },
    {
      name: "Content",
      widgets: [
        headerWidget,
        paragraphWidget,
        ...(now >= CONTENT_TIER2_UNLOCK
          ? [
              imageWidget,
              alertWidget,
              repeaterWidget,
            ]
          : []),
      ],
    },
    ...(now >= FORM_ELEMENTS_UNLOCK
      ? [
          {
            name: "Form Elements",
            widgets: [
              textBoxWidget,
              textAreaWidget,
              numberInputWidget,
              attachmentWidget,
              buttonWidget,
              checkboxWidget,
              radioButtonWidget,
              dropdownWidget,
              calendarWidget,
              toggleWidget,
              signatureWidget,
            ],
          },
        ]
      : []),
    ...(now >= DATA_REPORT_UNLOCK
      ? [
          {
            name: "Data",
            widgets: [
              internalFieldWidget,
              partnerTagsWidget,
            ],
          },
          {
            name: "Report Fields",
            widgets: reportFieldWidgets,
          },
        ]
      : []),
  ];
}

// =====================================================================
// Palette Draggable Widget
// =====================================================================
function PaletteWidgetCard({ widget }: { widget: PaletteWidget }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ITEM_TYPE_PALETTE,
      item: { widget },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [widget]
  );

  return (
    <div
      ref={drag}
      className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${
        isDragging
          ? "opacity-40 border-ds-purple bg-ds-purple-light scale-95 cursor-grabbing"
          : "border-ds-haze bg-white hover:border-ds-purple hover:shadow-sm cursor-grab active:cursor-grabbing"
      }`}
      title={widget.label}
    >
      <div className="text-ds-dark-gray w-6 h-6">{widget.icon}</div>
      <span
        className="font-['Poppins',sans-serif] text-[9.5px] text-ds-dark-gray text-center leading-tight line-clamp-1"
        style={{ fontWeight: 500 }}
      >
        {widget.label}
      </span>
    </div>
  );
}

// =====================================================================
// Left Panel — Widget Palette
// =====================================================================
function WidgetPalette({
  categories,
  searchQuery,
  onSearchChange,
  collapsed,
  onToggleCollapse,
}: {
  categories: WidgetCategory[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => Object.fromEntries(categories.map((c) => [c.name, true]))
  );

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        widgets: cat.widgets.filter((w) => w.label.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.widgets.length > 0);
  }, [categories, searchQuery]);

  if (collapsed) {
    return (
      <div className="w-10 shrink-0 bg-[#f7f6fa] border-r border-ds-haze flex flex-col items-center pt-2">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-ds-purple-light cursor-pointer transition-colors text-ds-dark-gray"
          title="Expand panel"
        >
          <PanelCollapseIcon flipped />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[210px] shrink-0 bg-[#f7f6fa] border-r border-ds-haze flex flex-col overflow-hidden h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-ds-haze shrink-0">
        <span
          className="font-['Montserrat',sans-serif] text-[13px] text-ds-purple-dark"
          style={{ fontWeight: 700 }}
        >
          Widgets
        </span>
        <button
          onClick={onToggleCollapse}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-ds-purple-light cursor-pointer transition-colors text-ds-dark-gray"
          title="Collapse panel"
        >
          <PanelCollapseIcon />
        </button>
      </div>

      {/* Search */}
      <div className="px-2.5 py-2 shrink-0">
        <div className="bg-white rounded-lg border border-ds-haze">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5">
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
              <circle cx="6" cy="6" r="4.5" stroke="#999" strokeWidth="1.5" />
              <path d="M10 10l3 3" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent outline-none font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray placeholder:text-ds-light-gray min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredCategories.length === 0 && (
          <div className="flex items-center justify-center py-8 px-3">
            <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray text-center">
              No widgets found
            </span>
          </div>
        )}

        {filteredCategories.map((cat) => (
          <div key={cat.name} className="border-b border-ds-haze last:border-b-0">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat.name)}
              className="w-full flex items-center gap-1.5 px-3 py-2 cursor-pointer hover:bg-white/50 transition-colors"
            >
              <ChevronIcon open={openCategories[cat.name] !== false} />
              <span
                className="font-['Poppins',sans-serif] text-[11px] text-ds-purple-dark"
                style={{ fontWeight: 600 }}
              >
                {cat.name}
              </span>
            </button>

            {/* Widget grid */}
            {openCategories[cat.name] !== false && (
              <div className="px-2.5 pb-2.5 grid grid-cols-2 gap-1.5">
                {cat.widgets.map((w, idx) => (
                  <PaletteWidgetCard
                    key={`${cat.name}-${w.type}-${w.fieldId ?? idx}`}
                    widget={w}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// Preview-mode interactive sub-components (need hooks, must live outside CanvasItem)
// =====================================================================

function CheckboxWidget({ c, textCSS }: { c: Record<string, string | number | boolean>; textCSS: React.CSSProperties }) {
  const [checked, setChecked] = React.useState(false);
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="w-4 h-4 accent-ds-purple shrink-0 cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      />
      <span style={textCSS}>{String(c.label || "I agree")}</span>
      {c.required && <span className="text-red-500 text-sm ml-0.5">*</span>}
    </label>
  );
}

function RadioWidget({ c, rbCSS, elementId }: { c: Record<string, string | number | boolean>; rbCSS: React.CSSProperties; elementId: string }) {
  const opts = String(c.options || "Option 1,Option 2,Option 3").split(",").map((s) => s.trim()).filter(Boolean);
  const [selected, setSelected] = React.useState(opts[0] ?? "");
  return (
    <div className="flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
      {c.label && <span style={{ ...rbCSS, fontWeight: 600 }}>{String(c.label)}</span>}
      {opts.map((opt, i) => (
        <label key={i} className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="radio"
            name={elementId}
            value={opt}
            checked={selected === opt}
            onChange={() => setSelected(opt)}
            className="w-4 h-4 accent-ds-purple shrink-0 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <span style={rbCSS}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function ToggleWidget({ c, tgCSS }: { c: Record<string, string | number | boolean>; tgCSS: React.CSSProperties }) {
  const [isOn, setIsOn] = React.useState(!!c.defaultValue);
  return (
    <div
      className="flex items-center justify-between gap-4 select-none cursor-pointer"
      onClick={(e) => { e.stopPropagation(); setIsOn((v) => !v); }}
    >
      <span style={{ ...tgCSS, fontWeight: 500 }}>{String(c.label || "Enable")}</span>
      <div className="flex items-center gap-2">
        {!isOn && <span style={{ ...tgCSS, fontSize: "11px", color: "#b0b0b0" }}>{String(c.offLabel || "No")}</span>}
        <div
          className="relative w-11 h-6 rounded-full transition-colors"
          style={{ backgroundColor: isOn ? "#46367F" : "#d1d5db" }}
        >
          <div
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
            style={{ left: isOn ? "calc(100% - 20px)" : "4px" }}
          />
        </div>
        {isOn && <span style={{ ...tgCSS, fontSize: "11px", color: "#46367F", fontWeight: 600 }}>{String(c.onLabel || "Yes")}</span>}
      </div>
    </div>
  );
}

function SignatureWidget({ c, sigCSS }: { c: Record<string, string | number | boolean>; sigCSS: React.CSSProperties }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawing = React.useRef(false);
  const [hasDrawing, setHasDrawing] = React.useState(false);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#46367F";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasDrawing(true);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    drawing.current = false;
  };

  const onClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label style={{ ...sigCSS, fontWeight: 600 }}>
        {String(c.label || "Signature")}
        {c.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="border border-ds-haze rounded-lg bg-white overflow-hidden" style={{ height: 100 }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={100}
          className="w-full h-full cursor-crosshair"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-light-gray">
          {String(c.hint || "Sign within the box")}
        </span>
        {hasDrawing && (
          <button
            type="button"
            onClick={onClear}
            className="font-['Poppins',sans-serif] text-[10px] text-ds-purple/60 hover:text-ds-purple transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function RepeaterWidget({ c, repCSS }: { c: Record<string, string | number | boolean>; repCSS: React.CSSProperties }) {
  const itemLabel = String(c.itemLabel || "Item");
  const [count, setCount] = React.useState(1);

  return (
    <div className="flex flex-col gap-1.5">
      {c.label && (
        <span style={{ ...repCSS, fontSize: "11px", fontWeight: 600 }}>{String(c.label)}</span>
      )}
      {Array.from({ length: count }, (_, idx) => (
        <div key={idx} className="flex items-center gap-2 border border-ds-haze rounded-md px-3 py-2 bg-white">
          <div className="w-3 h-3 text-ds-light-gray opacity-60">
            <svg viewBox="0 0 12 12" fill="none">
              <circle cx="4" cy="3" r="1" fill="currentColor" />
              <circle cx="8" cy="3" r="1" fill="currentColor" />
              <circle cx="4" cy="6" r="1" fill="currentColor" />
              <circle cx="8" cy="6" r="1" fill="currentColor" />
              <circle cx="4" cy="9" r="1" fill="currentColor" />
              <circle cx="8" cy="9" r="1" fill="currentColor" />
            </svg>
          </div>
          <span style={{ ...repCSS, fontSize: "12px" }} className="flex-1">{itemLabel} {idx + 1}</span>
          {count > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCount((n) => n - 1); }}
              className="text-ds-light-gray hover:text-red-400 transition-colors text-[16px] leading-none ml-auto"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setCount((n) => n + 1); }}
        className="flex items-center gap-1.5 border border-dashed border-ds-purple/30 rounded-md px-3 py-1.5 text-ds-purple/60 hover:border-ds-purple/60 hover:text-ds-purple transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: repCSS.fontFamily, fontSize: "11px" }}>Add {itemLabel}</span>
      </button>
    </div>
  );
}

// =====================================================================
// Canvas Item (draggable for reorder)
// =====================================================================
function CanvasItem({
  element,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
  onUpdate,
  selectedId,
  onSelectById,
  onDeleteById,
  onDuplicateById,
  onDropInCell,
  onMoveInCell,
  onUpdateConfig,
  onCrossMove,
  isNested = false,
}: {
  element: CanvasElement;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onUpdate: (config: Record<string, string | number | boolean>) => void;
  selectedId: string | null;
  onSelectById: (id: string) => void;
  onDeleteById: (id: string) => void;
  onDuplicateById: (id: string) => void;
  onDropInCell: (widget: PaletteWidget, containerId: string, rowIdx: number, colIdx: number, insertIndex?: number) => void;
  onMoveInCell: (containerId: string, rowIdx: number, colIdx: number, dragIdx: number, hoverIdx: number) => void;
  onUpdateConfig: (id: string, config: Record<string, string | number | boolean>) => void;
  onCrossMove?: (elementId: string, targetContainerId: string, targetRowIdx: number, targetColIdx: number, insertIndex?: number) => void;
  isNested?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const previewMode = React.useContext(PreviewModeContext);

  // Use different drag types for root vs nested to prevent cross-level reorder
  const dragType = isNested ? ITEM_TYPE_CANVAS_NESTED : ITEM_TYPE_CANVAS;
  const acceptTypes = isNested
    ? [ITEM_TYPE_CANVAS_NESTED, ITEM_TYPE_PALETTE]
    : [ITEM_TYPE_CANVAS, ITEM_TYPE_PALETTE];

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: dragType,
      item: { index, elementId: element.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index, dragType, element.id]
  );

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: acceptTypes,
      hover(item: { index?: number; widget?: PaletteWidget }, monitor) {
        if (!ref.current || item.index === undefined) return;
        // Only allow reorder for items of the same drag type
        const itemType = monitor.getItemType();
        if (itemType !== dragType) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;

        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        onMove(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [index, onMove, dragType, acceptTypes]
  );

  preview(drop(ref));

  const typeLabel = WIDGET_TYPE_LABELS[element.type];
  const icon = WIDGET_ICON_MAP[element.type];

  // ── Full Elementor-style widget content ──────────────────────────
  const docCtx = React.useContext(DocumentContext);
  const globalTypo = React.useContext(GlobalTypographyContext);
  const renderContent = () => {
    const c = element.config;
    switch (element.type) {

      /* ── Template Title ── */
      case "template-title": {
        const showBorder = c.showBorder !== false;
        const { defaults: gs } = getEffectiveTypography("template-title", c, globalTypo);
        const ts = resolveTextStyle(gs, c);
        loadGoogleFont(ts.fontFamily);
        return (
          <div>
            <div
              className="leading-tight"
              style={textStyleToCSS(ts)}
            >
              {docCtx.templateName || "Untitled Template"}
            </div>
            {showBorder && (
              <div
                className="mt-3"
                style={{ borderBottom: `2px solid ${String(c.borderColor || "#46367F")}` }}
              />
            )}
          </div>
        );
      }

      /* ── Template Description ── */
      case "template-description": {
        const { defaults: gs } = getEffectiveTypography("template-description", c, globalTypo);
        const ts = resolveTextStyle(gs, c);
        loadGoogleFont(ts.fontFamily);
        return (
          <p
            className="leading-relaxed"
            style={textStyleToCSS(ts)}
          >
            {docCtx.templateDescription || "No description provided."}
          </p>
        );
      }

      /* ── Header ── */
      case "header": {
        const { defaults: gs } = getEffectiveTypography("header", c, globalTypo);
        const ts = resolveTextStyle(gs, c);
        loadGoogleFont(ts.fontFamily);
        const cssStyle = textStyleToCSS(ts);
        return (
          <AutoFitText
            as="div"
            text={String(c.text || "Section Header")}
            baseFontSize={ts.fontSize}
            fontFamily={fontFamilyCSS(ts.fontFamily)}
            fontWeight={ts.fontWeight}
            mode="line"
            minFontSize={10}
            style={cssStyle}
          />
        );
      }

      /* ── Paragraph ── */
      case "paragraph": {
        const { defaults: gs } = getEffectiveTypography("paragraph", c, globalTypo);
        const ts = resolveTextStyle(gs, c);
        loadGoogleFont(ts.fontFamily);
        const cssStyle = textStyleToCSS(ts);
        return (
          <AutoFitText
            as="p"
            text={String(c.text || "Enter your text here…")}
            baseFontSize={ts.fontSize}
            fontFamily={fontFamilyCSS(ts.fontFamily)}
            fontWeight={ts.fontWeight}
            mode="word"
            minFontSize={8}
            className="leading-relaxed whitespace-pre-wrap"
            style={cssStyle}
          />
        );
      }

      /* ── Text Box ── */
      case "text-box": {
        const { defaults: _tbGs } = getEffectiveTypography("text-box", c, globalTypo);
        const _tbTs = resolveTextStyle(_tbGs, c);
        loadGoogleFont(_tbTs.fontFamily);
        const _tbLabelCSS = textStyleToCSS(_tbTs);
        return (
          <div className="flex flex-col gap-1.5">
            <label style={{ ..._tbLabelCSS, fontWeight: _tbTs.fontWeight || 600 }}>
              {String(c.label || "Text Field")}
            </label>
            {previewMode ? (
              <input
                type="text"
                placeholder={String(c.placeholder || "Enter value…")}
                className="border border-ds-haze rounded-md px-3 py-2 bg-white text-[12px] outline-none focus:border-ds-purple focus:ring-1 focus:ring-ds-purple/30 transition-colors"
                style={{ fontFamily: _tbLabelCSS.fontFamily }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="border border-ds-haze rounded-md px-3 py-2 bg-gray-50 text-[12px] text-ds-light-gray italic select-none" style={{ fontFamily: _tbLabelCSS.fontFamily }}>
                {String(c.placeholder || "Enter value…")}
              </div>
            )}
          </div>
        );
      }

      /* ── Image ── */
      case "image":
        return (
          <div className="flex flex-col items-center justify-center gap-2.5 bg-gray-50 border-2 border-dashed border-ds-haze rounded-lg py-8">
            <div className="w-10 h-10 text-ds-light-gray">{icon}</div>
            <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray">
              {String(c.imageName) && String(c.imageName) !== "Select image..."
                ? String(c.imageName)
                : "Click to select image…"}
            </span>
          </div>
        );

      /* ── Attachment ── */
      case "attachment": {
        const { defaults: _attGs } = getEffectiveTypography("attachment", c, globalTypo);
        const _attTs = resolveTextStyle(_attGs, c);
        loadGoogleFont(_attTs.fontFamily);
        const _attCSS = textStyleToCSS(_attTs);
        if (previewMode) {
          const _attInputRef = React.createRef<HTMLInputElement>();
          return (
            <div
              className="flex flex-col items-center gap-2 border-2 border-dashed border-ds-haze rounded-lg py-6 bg-gray-50 cursor-pointer hover:border-ds-teal/50 transition-colors"
              onClick={(e) => { e.stopPropagation(); _attInputRef.current?.click(); }}
            >
              <input
                ref={_attInputRef}
                type="file"
                className="hidden"
                accept={c.accept ? String(c.accept) : undefined}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="w-8 h-8 text-ds-teal">{icon}</div>
              <div className="flex flex-col items-center gap-0.5">
                <span style={{ ..._attCSS, fontSize: `${Math.min(_attTs.fontSize, 12)}px`, fontWeight: _attTs.fontWeight || 500 }}>
                  {String(c.label || "Upload File")}
                </span>
                <span style={{ ..._attCSS, fontSize: "10px", color: "#b0b0b0" }}>
                  Click or drag a file to upload
                </span>
              </div>
            </div>
          );
        }
        return (
          <div className="flex flex-col items-center gap-2 border-2 border-dashed border-ds-haze rounded-lg py-6 bg-gray-50">
            <div className="w-8 h-8 text-ds-teal">{icon}</div>
            <div className="flex flex-col items-center gap-0.5">
              <span style={{ ..._attCSS, fontSize: `${Math.min(_attTs.fontSize, 12)}px`, fontWeight: _attTs.fontWeight || 500 }}>
                {String(c.label || "Upload File")}
              </span>
              <span style={{ ..._attCSS, fontSize: "10px", color: "#b0b0b0" }}>
                Click or drag a file to upload
              </span>
            </div>
          </div>
        );
      }



      /* ── Checkbox ── */
      case "checkbox": {
        const { defaults: _cbGs } = getEffectiveTypography("checkbox", c, globalTypo);
        const _cbTs = resolveTextStyle(_cbGs, c);
        loadGoogleFont(_cbTs.fontFamily);
        if (previewMode) {
          return <CheckboxWidget c={c} textCSS={textStyleToCSS(_cbTs)} />;
        }
        return (
          <label className="flex items-center gap-2.5 cursor-default select-none">
            <div className="w-4 h-4 border-2 border-ds-purple rounded-sm shrink-0 bg-white" />
            <span style={textStyleToCSS(_cbTs)}>
              {String(c.label || "I agree")}
            </span>
            {c.required && <span className="text-red-500 text-sm ml-0.5">*</span>}
          </label>
        );
      }

      /* ── Radio Button ── */
      case "radio-button": {
        const opts = String(c.options || "Option 1,Option 2,Option 3")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const { defaults: _rbGs } = getEffectiveTypography("radio-button", c, globalTypo);
        const _rbTs = resolveTextStyle(_rbGs, c);
        loadGoogleFont(_rbTs.fontFamily);
        const _rbCSS = textStyleToCSS(_rbTs);
        if (previewMode) {
          return <RadioWidget c={c} rbCSS={_rbCSS} elementId={element.id} />;
        }
        return (
          <div className="flex flex-col gap-2.5">
            {c.label && (
              <span style={{ ..._rbCSS, fontWeight: _rbTs.fontWeight || 600 }}>
                {String(c.label)}
              </span>
            )}
            {opts.map((opt, i) => (
              <label key={i} className="flex items-center gap-2.5 cursor-default select-none">
                <div className="w-4 h-4 border-2 border-ds-purple rounded-full shrink-0 flex items-center justify-center bg-white">
                  {i === 0 && <div className="w-2 h-2 bg-ds-purple rounded-full" />}
                </div>
                <span style={_rbCSS}>{opt}</span>
              </label>
            ))}
          </div>
        );
      }

      /* ── Dropdown ── */
      case "dropdown": {
        const opts = String(c.options || "Option 1,Option 2,Option 3")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const { defaults: _ddGs } = getEffectiveTypography("dropdown", c, globalTypo);
        const _ddTs = resolveTextStyle(_ddGs, c);
        loadGoogleFont(_ddTs.fontFamily);
        const _ddCSS = textStyleToCSS(_ddTs);
        return (
          <div className="flex flex-col gap-1.5">
            {c.label && (
              <label style={{ ..._ddCSS, fontWeight: _ddTs.fontWeight || 600 }}>
                {String(c.label)}
              </label>
            )}
            {previewMode ? (
              <select
                className="border border-ds-haze rounded-md px-3 py-2 bg-white outline-none focus:border-ds-purple focus:ring-1 focus:ring-ds-purple/30 transition-colors appearance-none cursor-pointer"
                style={{ ...(_ddCSS), fontSize: `${Math.min(_ddTs.fontSize, 12)}px` }}
                onClick={(e) => e.stopPropagation()}
              >
                {opts.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <div className="border border-ds-haze rounded-md px-3 py-2 bg-white flex items-center justify-between select-none cursor-default">
                <span style={{ ..._ddCSS, color: "#b0b0b0", fontSize: `${Math.min(_ddTs.fontSize, 12)}px` }}>
                  {opts[0] ?? "Select…"}
                </span>
                <svg viewBox="0 0 10 6" fill="none" className="w-3 h-2 shrink-0 text-ds-gray">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        );
      }

      /* ── Calendar ── */
      case "calendar": {
        const { defaults: _calGs } = getEffectiveTypography("calendar", c, globalTypo);
        const _calTs = resolveTextStyle(_calGs, c);
        loadGoogleFont(_calTs.fontFamily);
        const _calCSS = textStyleToCSS(_calTs);
        return (
          <div className="flex flex-col gap-1.5">
            <label style={{ ..._calCSS, fontWeight: _calTs.fontWeight || 600 }}>
              {String(c.label || "Date")}
            </label>
            {previewMode ? (
              <input
                type="date"
                className="border border-ds-haze rounded-md px-3 py-2 bg-white outline-none focus:border-ds-purple focus:ring-1 focus:ring-ds-purple/30 transition-colors cursor-pointer"
                style={{ fontFamily: _calCSS.fontFamily, fontSize: `${Math.min(_calTs.fontSize, 12)}px` }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="border border-ds-haze rounded-md px-3 py-2 bg-white flex items-center justify-between select-none cursor-default">
                <span style={{ ..._calCSS, color: "#b0b0b0", fontSize: `${Math.min(_calTs.fontSize, 12)}px` }}>
                  MM / DD / YYYY
                </span>
                <div className="w-4 h-4 text-ds-teal shrink-0">{icon}</div>
              </div>
            )}
          </div>
        );
      }

      /* ── Container (unified: nestable columns/subgroup/vertical/horizontal) ── */
      case "container": {
        // Not yet configured — show the structure picker overlay (hidden in preview)
        if (!c.structurePicked) {
          if (previewMode) return null;
          return (
            <StructurePickerInline
              currentLayout={String(c.layout || "")}
              singleCellOnly={isNested}
              onPick={(preset) => {
                const isSingleCell = preset.rows.length === 1 && preset.rows[0].length === 1;
                // Single-cell defaults to vertical; multi-cell always uses horizontal (row) for cell layout
                const dir = isSingleCell ? "vertical" : "horizontal";
                onUpdate({
                  ...element.config,
                  structurePicked: true,
                  layout: preset.id,
                  rows: JSON.stringify(preset.rows),
                  direction: dir,
                  flexDirection: dir === "horizontal" ? "row" : "column",
                });
              }}
            />
          );
        }

        // Render the selected structure with live droppable cells
        let parsedRows: number[][] = [[1]];
        try { parsedRows = JSON.parse(String(c.rows || "[[1]]")); } catch { /* fallback */ }
        const cGapCol = Number(c.gapColumn ?? c.gap ?? 12);
        const cGapRow = Number(c.gapRow ?? c.gap ?? 12);
        const showTitle = !!c.showTitle;
        const titleText = String(c.title || "Section Title");
        const currentPreset = CONTAINER_PRESETS.find((p) => p.id === String(c.layout))
          || makeEqualColumnsPreset(parsedRows[0]?.length ?? 1);
        const cellChildren: CanvasElement[][][] = element.children ?? parsedRows.map((cols) => cols.map(() => []));
        const cFlexDir = String(c.flexDirection || "column") as React.CSSProperties["flexDirection"];
        const cJustify = String(c.justifyContent || "flex-start");
        const cAlign = String(c.alignItems || "stretch");
        const cWrap = String(c.flexWrap || "nowrap") as React.CSSProperties["flexWrap"];
        const cMinHeight = Number(c.containerMinHeight ?? 0);
        const cMinHeightUnit = String(c.containerMinHeightUnit || "px");
        const cContentWidth = String(c.contentWidth || "full");
        const cContentMaxWidth = Number(c.contentMaxWidth ?? 800);
        const cContentAlignment = String(c.contentAlignment || "center");
        const isBoxed = cContentWidth === "boxed";

        return (
          <div className="flex flex-col">
            {/* Optional title bar — editing chrome, hidden in preview */}
            {showTitle && !previewMode && (
              <div className="bg-ds-purple-light border-b border-ds-purple/10 px-3 py-2 flex items-center justify-between">
                <span
                  className="font-['Montserrat',sans-serif] text-[13px] text-ds-purple-dark"
                  style={{ fontWeight: 700 }}
                >
                  {titleText}
                </span>
                <span
                  className="font-['Poppins',sans-serif] text-[9px] text-ds-purple/50 bg-white px-1.5 py-0.5 rounded border border-ds-purple/15"
                  style={{ fontWeight: 500 }}
                >
                  {currentPreset.label}
                </span>
              </div>
            )}

            {/* Structure rows — each cell is a live drop zone */}
            <div
              className="flex flex-col"
              style={{
                overflow: String(c.overflow || "hidden") as React.CSSProperties["overflow"],
                paddingTop:    Number(c.paddingTop    ?? 0),
                paddingRight:  Number(c.paddingRight  ?? 0),
                paddingBottom: Number(c.paddingBottom ?? 0),
                paddingLeft:   Number(c.paddingLeft   ?? 0),
                minHeight: cMinHeight > 0 ? `${cMinHeight}${cMinHeightUnit}` : undefined,
                backgroundColor: c.bgColor && String(c.bgColor) !== "transparent" ? String(c.bgColor) : undefined,
              }}
            >
             <div
              className="flex flex-col"
              style={{
                ...(isBoxed ? {
                  maxWidth: cContentMaxWidth,
                  width: "100%",
                  marginLeft:  cContentAlignment === "center" || cContentAlignment === "right" ? "auto" : undefined,
                  marginRight: cContentAlignment === "center" || cContentAlignment === "left"  ? "auto" : undefined,
                } : {}),
                rowGap: cGapRow,
                columnGap: cGapCol,
              }}
             >
              {parsedRows.map((cols, rowIdx) => {
                // Multi-cell rows always arrange cells horizontally; single-cell rows
                // inherit the container's flex direction for the row wrapper.
                // All cells receive cFlexDir for their internal item layout.
                const isSingleCellPreset = parsedRows.length === 1 && cols.length === 1;
                const rowFlexDir = isSingleCellPreset ? cFlexDir : ("row" as const);
                const rowGap = isSingleCellPreset
                  ? (cFlexDir === "column" || cFlexDir === "column-reverse" ? cGapRow : cGapCol)
                  : cGapCol;
                return (
                <div key={rowIdx} className="flex w-full" style={{
                  flexDirection: rowFlexDir,
                  gap: rowGap,
                  flexGrow: 1,
                  alignItems: "stretch",
                }}>
                  {cols.map((w, colIdx) => {
                    const totalFlex = cols.reduce((s, v) => s + v, 0);
                    return (
                    <ContainerCell
                      key={colIdx}
                      containerId={element.id}
                      rowIdx={rowIdx}
                      colIdx={colIdx}
                      flex={w}
                      totalFlex={totalFlex}
                      numCols={cols.length}
                      gap={rowGap}
                      cellFlexDirection={cFlexDir}
                      cellJustifyContent={cJustify}
                      cellAlignItems={cAlign}
                      cellFlexWrap={cWrap}
                      contentWidth={cContentWidth}
                      cellGapRow={cGapRow}
                      cellGapCol={cGapCol}
                      cellElements={(cellChildren[rowIdx] ?? [])[colIdx] ?? []}
                      selectedId={selectedId}
                      onSelect={onSelectById}
                      onDelete={onDeleteById}
                      onDuplicate={onDuplicateById}
                      onUpdateConfig={onUpdateConfig}
                      onDropInCell={onDropInCell}
                      onMoveInCell={onMoveInCell}
                      onCrossMove={onCrossMove}
                    />
                    );
                  })}
                </div>
                );
              })}
             </div>
            </div>

          </div>
        );
      }

      /* ── Divider ── */
      case "divider":
        return (
          <div className="py-2">
            <div
              className="w-full"
              style={{
                borderTopWidth: `${Number(c.weight || 2)}px`,
                borderTopStyle: (String(c.style) || "solid") as "solid" | "dashed" | "dotted",
                borderTopColor: String(c.color || "#AFAEAE"),
              }}
            />
          </div>
        );

      /* ── Internal Field ── */
      case "internal-field": {
        const { defaults: _ifGs } = getEffectiveTypography("internal-field", c, globalTypo);
        const _ifTs = resolveTextStyle(_ifGs, c);
        loadGoogleFont(_ifTs.fontFamily);
        const _ifCSS = textStyleToCSS(_ifTs);
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ ..._ifCSS, fontSize: "11px" }}>Internal Field:</span>
            <code className="font-mono text-[11px] text-ds-purple bg-ds-purple-light px-2 py-1 rounded border border-ds-purple/10">
              {String(c.property || "customer.name")}
            </code>
          </div>
        );
      }

      /* ── Partner Tags ── */
      case "partner-tags": {
        const allTags = ["Debt Portfolio", "Active", "Premium", "Priority", "Verified", "High Risk"];
        const src = String(c.source || "all");
        const tags = src === "active" ? allTags.slice(0, 3) : allTags;
        const { defaults: _ptGs } = getEffectiveTypography("partner-tags", c, globalTypo);
        const _ptTs = resolveTextStyle(_ptGs, c);
        loadGoogleFont(_ptTs.fontFamily);
        const _ptCSS = textStyleToCSS(_ptTs);
        return (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-ds-teal-light px-2.5 py-1 rounded-full border border-ds-teal/20"
                style={{ ..._ptCSS, fontSize: `${Math.min(_ptTs.fontSize, 10)}px`, color: c.color ? String(c.color) : "#0d9488" }}
              >
                {tag}
              </span>
            ))}
          </div>
        );
      }

      /* ── Report Field ── */
      case "report-field": {
        const { defaults: _rfGs } = getEffectiveTypography("report-field", c, globalTypo);
        const _rfTs = resolveTextStyle(_rfGs, c);
        loadGoogleFont(_rfTs.fontFamily);
        const _rfCSS = textStyleToCSS(_rfTs);
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <label style={{ ..._rfCSS, fontWeight: _rfTs.fontWeight || 600 }}>
                {String(c.fieldName || element.label)}
              </label>
              <span className="font-['Poppins',sans-serif] text-[9px] text-ds-purple bg-ds-purple-light px-1.5 py-0.5 rounded">
                {String(c.fieldType || "Text")}
              </span>
              {c.required && <span className="text-red-500 text-xs">*</span>}
            </div>
            {previewMode ? (
              <input
                type="text"
                placeholder={`Enter ${String(c.fieldName || "value")}…`}
                className="border border-ds-haze rounded-md px-3 py-2 bg-white outline-none focus:border-ds-purple focus:ring-1 focus:ring-ds-purple/30 transition-colors"
                style={{ fontFamily: _rfCSS.fontFamily, fontSize: `${Math.min(_rfTs.fontSize, 12)}px` }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="border border-ds-haze rounded-md px-3 py-2 bg-gray-50 italic select-none" style={{ fontFamily: _rfCSS.fontFamily, fontSize: `${Math.min(_rfTs.fontSize, 12)}px`, color: "#b0b0b0" }}>
                Enter {String(c.fieldName || "value")}…
              </div>
            )}
          </div>
        );
      }

      /* ── Text Area ── */
      case "text-area": {
        const { defaults: _taGs } = getEffectiveTypography("text-area", c, globalTypo);
        const _taTs = resolveTextStyle(_taGs, c);
        loadGoogleFont(_taTs.fontFamily);
        const _taCSS = textStyleToCSS(_taTs);
        return (
          <div className="flex flex-col gap-1.5">
            <label style={{ ..._taCSS, fontWeight: _taTs.fontWeight || 600 }}>
              {String(c.label || "Notes")}
            </label>
            {previewMode ? (
              <textarea
                placeholder={String(c.placeholder || "Enter text here…")}
                rows={Math.max(2, Number(c.rows || 4))}
                className="border border-ds-haze rounded-md px-3 py-2 bg-white outline-none focus:border-ds-purple focus:ring-1 focus:ring-ds-purple/30 transition-colors resize-y"
                style={{ fontFamily: _taCSS.fontFamily, fontSize: `${Math.min(_taTs.fontSize, 12)}px` }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div
                className="border border-ds-haze rounded-md px-3 py-2 bg-gray-50 italic select-none"
                style={{ minHeight: `${Math.max(2, Number(c.rows || 4)) * 22}px`, fontFamily: _taCSS.fontFamily, fontSize: `${Math.min(_taTs.fontSize, 12)}px`, color: "#b0b0b0" }}
              >
                {String(c.placeholder || "Enter text here…")}
              </div>
            )}
          </div>
        );
      }

      /* ── Number Input ── */
      case "number-input": {
        const { defaults: _niGs } = getEffectiveTypography("number-input", c, globalTypo);
        const _niTs = resolveTextStyle(_niGs, c);
        loadGoogleFont(_niTs.fontFamily);
        const _niCSS = textStyleToCSS(_niTs);
        return (
          <div className="flex flex-col gap-1.5">
            <label style={{ ..._niCSS, fontWeight: _niTs.fontWeight || 600 }}>
              {String(c.label || "Amount")}
            </label>
            {previewMode ? (
              <input
                type="number"
                placeholder={String(c.placeholder || "0")}
                min={c.min !== undefined ? Number(c.min) : undefined}
                max={c.max !== undefined ? Number(c.max) : undefined}
                className="border border-ds-haze rounded-md px-3 py-2 bg-white outline-none focus:border-ds-purple focus:ring-1 focus:ring-ds-purple/30 transition-colors"
                style={{ fontFamily: _niCSS.fontFamily, fontSize: `${Math.min(_niTs.fontSize, 12)}px` }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="border border-ds-haze rounded-md px-3 py-2 bg-white flex items-center justify-between select-none">
                <span style={{ ..._niCSS, color: "#b0b0b0", fontStyle: "italic", fontSize: `${Math.min(_niTs.fontSize, 12)}px` }}>
                  {String(c.placeholder || "0")}
                </span>
                <div className="flex flex-col gap-0.5 ml-2 shrink-0">
                  <svg viewBox="0 0 10 6" fill="none" className="w-2.5 h-1.5 text-ds-gray">
                    <path d="M1 5l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <svg viewBox="0 0 10 6" fill="none" className="w-2.5 h-1.5 text-ds-gray">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            )}
            {(c.min !== undefined || c.max !== undefined) && (
              <span style={{ ..._niCSS, fontSize: "10px", color: "#b0b0b0" }}>
                Range: {String(c.min ?? 0)} – {String(c.max ?? 9999)}
              </span>
            )}
          </div>
        );
      }

      /* ── Button ── */
      case "button": {
        const variant = String(c.variant || "primary");
        const btnSize = String(c.size || "md");
        const sizeClass = btnSize === "sm" ? "px-4 py-1.5 text-[11px]" : btnSize === "lg" ? "px-8 py-3 text-[14px]" : "px-6 py-2 text-[13px]";
        const variantClass =
          variant === "primary"   ? "bg-ds-purple text-white border border-ds-purple" :
          variant === "secondary" ? "bg-white text-ds-purple border border-ds-purple" :
          variant === "teal"      ? "bg-ds-teal text-white border border-ds-teal" :
                                    "bg-transparent text-ds-purple border border-transparent underline";
        const { defaults: _btnGs } = getEffectiveTypography("button", c, globalTypo);
        const _btnTs = resolveTextStyle(_btnGs, c);
        loadGoogleFont(_btnTs.fontFamily);
        const _btnCSS = textStyleToCSS(_btnTs);
        // For buttons, we apply font-family, weight, transform, decoration, letter-spacing from typography.
        // Typography color overrides variant color when the user has explicitly set config.color.
        return (
          <div className="flex justify-center">
            <div
              className={`rounded-lg select-none text-center ${sizeClass} ${variantClass} ${previewMode ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}`}
              style={{
                fontFamily: _btnCSS.fontFamily,
                fontWeight: _btnTs.fontWeight || 600,
                textTransform: _btnCSS.textTransform,
                textDecoration: _btnCSS.textDecoration,
                letterSpacing: _btnCSS.letterSpacing,
                lineHeight: _btnCSS.lineHeight,
                ...(c.color ? { color: String(c.color) } : {}),
              }}
              onClick={previewMode ? (e) => e.stopPropagation() : undefined}
            >
              {String(c.label || "Submit")}
            </div>
          </div>
        );
      }

      /* ── Alert ── */
      case "alert": {
        const alertVariant = String(c.variant || "info");
        const alertColors: Record<string, { bg: string; border: string; icon: string; text: string }> = {
          info:    { bg: "#eff6ff", border: "#bfdbfe", icon: "#3b82f6", text: "#1e40af" },
          success: { bg: "#f0fdf4", border: "#bbf7d0", icon: "#22c55e", text: "#15803d" },
          warning: { bg: "#fffbeb", border: "#fde68a", icon: "#f59e0b", text: "#92400e" },
          error:   { bg: "#fef2f2", border: "#fecaca", icon: "#ef4444", text: "#991b1b" },
        };
        const ac = alertColors[alertVariant] ?? alertColors.info;
        const { defaults: _alGs } = getEffectiveTypography("alert", c, globalTypo);
        const _alTs = resolveTextStyle(_alGs, c);
        loadGoogleFont(_alTs.fontFamily);
        const _alCSS = textStyleToCSS(_alTs);
        return (
          <div
            className="rounded-lg px-4 py-3 flex gap-3 items-start"
            style={{ backgroundColor: ac.bg, borderWidth: 1, borderStyle: "solid", borderColor: ac.border }}
          >
            <svg viewBox="0 0 20 20" className="w-5 h-5 mt-0.5 shrink-0" fill={ac.icon}>
              <circle cx="10" cy="10" r="9" opacity="0.15" />
              <path d="M10 6v5M10 13.5v1" stroke={ac.icon} strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              {String(c.title || "") && (
                <span style={{ ..._alCSS, fontWeight: 700, color: c.color ? String(c.color) : ac.text }}>
                  {String(c.title)}
                </span>
              )}
              <span style={{ ..._alCSS, color: c.color ? String(c.color) : ac.text }}>
                {String(c.message || "This is an important notice.")}
              </span>
            </div>
          </div>
        );
      }

      /* ── Toggle ── */
      case "toggle": {
        const isOn = !!c.defaultValue;
        const { defaults: _tgGs } = getEffectiveTypography("toggle", c, globalTypo);
        const _tgTs = resolveTextStyle(_tgGs, c);
        loadGoogleFont(_tgTs.fontFamily);
        const _tgCSS = textStyleToCSS(_tgTs);
        if (previewMode) {
          return <ToggleWidget c={c} tgCSS={_tgCSS} />;
        }
        return (
          <div className="flex items-center justify-between gap-4 select-none">
            <span style={{ ..._tgCSS, fontWeight: _tgTs.fontWeight || 500 }}>
              {String(c.label || "Enable")}
            </span>
            <div className="flex items-center gap-2">
              {!isOn && <span style={{ ..._tgCSS, fontSize: "11px", color: "#b0b0b0" }}>{String(c.offLabel || "No")}</span>}
              <div
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ backgroundColor: isOn ? "#46367F" : "#d1d5db" }}
              >
                <div
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                  style={{ left: isOn ? "calc(100% - 20px)" : "4px" }}
                />
              </div>
              {isOn && <span style={{ ..._tgCSS, fontSize: "11px", color: "#46367F", fontWeight: 600 }}>{String(c.onLabel || "Yes")}</span>}
            </div>
          </div>
        );
      }

      /* ── Signature ── */
      case "signature": {
        const { defaults: _sigGs } = getEffectiveTypography("signature", c, globalTypo);
        const _sigTs = resolveTextStyle(_sigGs, c);
        loadGoogleFont(_sigTs.fontFamily);
        const _sigCSS = textStyleToCSS(_sigTs);
        if (previewMode) {
          return <SignatureWidget c={c} sigCSS={_sigCSS} />;
        }
        return (
          <div className="flex flex-col gap-2">
            <label style={{ ..._sigCSS, fontWeight: _sigTs.fontWeight || 600 }}>
              {String(c.label || "Signature")}
              {c.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="border border-ds-haze rounded-lg bg-gray-50 flex flex-col items-center justify-end" style={{ height: 100 }}>
              {/* faint pen-stroke lines to imply a signature pad */}
              <svg viewBox="0 0 200 60" className="w-full opacity-10" preserveAspectRatio="none">
                <path d="M20 45 C40 20, 60 55, 80 30 S120 50, 140 35 S175 50, 190 40" stroke="#46367F" strokeWidth="2" fill="none" />
              </svg>
              <div className="w-full border-t-2 border-dashed border-ds-purple/20 mt-auto" />
              <span className="font-['Poppins',sans-serif] text-[10px] text-ds-light-gray py-1.5">
                {String(c.hint || "Sign within the box")}
              </span>
            </div>
          </div>
        );
      }



      /* ── Spacer ── */
      case "spacer": {
        const spacerH = Math.max(8, Number(c.height || 32));
        return previewMode ? (
          <div style={{ height: spacerH }} />
        ) : (
          <div className="flex flex-col items-center justify-center w-full select-none" style={{ height: spacerH }}>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 border-t border-dashed border-ds-haze" />
              <span className="font-['Poppins',sans-serif] text-[9px] text-ds-light-gray whitespace-nowrap">
                Spacer • {spacerH}px
              </span>
              <div className="flex-1 border-t border-dashed border-ds-haze" />
            </div>
          </div>
        );
      }

      /* ── Page Break ── */
      case "page-break":
        return previewMode ? (
          <div style={{ breakAfter: "page" }} />
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-2 select-none">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t-2 border-dashed border-ds-purple/30" />
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-4 h-4 text-ds-purple/40">{icon}</div>
                <span className="font-['Poppins',sans-serif] text-[10px] text-ds-purple/50 uppercase tracking-widest" style={{ fontWeight: 600 }}>
                  Page Break
                </span>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-ds-purple/30" />
            </div>
          </div>
        );

      /* ── Repeater ── */
      case "repeater": {
        const itemLabel = String(c.itemLabel || "Item");
        const { defaults: _repGs } = getEffectiveTypography("repeater", c, globalTypo);
        const _repTs = resolveTextStyle(_repGs, c);
        loadGoogleFont(_repTs.fontFamily);
        const _repCSS = textStyleToCSS(_repTs);
        if (previewMode) {
          return <RepeaterWidget c={c} repCSS={_repCSS} />;
        }
        return (
          <div className="flex flex-col gap-1.5">
            {c.label && (
              <span style={{ ..._repCSS, fontSize: `${Math.min(_repTs.fontSize, 11)}px`, fontWeight: _repTs.fontWeight || 600 }}>
                {String(c.label)}
              </span>
            )}
            {[1, 2].map((n) => (
              <div
                key={n}
                className="flex items-center gap-2 border border-ds-haze rounded-md px-3 py-2 bg-white"
              >
                <div className="w-3 h-3 text-ds-light-gray opacity-60">
                  <svg viewBox="0 0 12 12" fill="none">
                    <circle cx="4" cy="3" r="1" fill="currentColor" />
                    <circle cx="8" cy="3" r="1" fill="currentColor" />
                    <circle cx="4" cy="6" r="1" fill="currentColor" />
                    <circle cx="8" cy="6" r="1" fill="currentColor" />
                    <circle cx="4" cy="9" r="1" fill="currentColor" />
                    <circle cx="8" cy="9" r="1" fill="currentColor" />
                  </svg>
                </div>
                <span style={{ ..._repCSS, fontSize: "12px" }}>
                  {itemLabel} {n}
                </span>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-1.5 border border-dashed border-ds-purple/30 rounded-md px-3 py-1.5 text-ds-purple/60 hover:border-ds-purple/60 transition-colors cursor-default"
            >
              <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: _repCSS.fontFamily, fontSize: "11px" }}>Add {itemLabel}</span>
            </button>
          </div>
        );
      }

      default:
        return (
          <span className="font-['Poppins',sans-serif] text-[13px] text-ds-gray">{element.label}</span>
        );
    }
  };

  const c = element.config;

  // ── Width & alignment (Properties tab) ──────────────────────────────
  const isContainerWidget = element.type === "container";
  const widthUnit  = String(c.widthUnit || "auto");
  // Nested containers always render at 100% — the parent cell's flex-basis
  // is driven by containerWidth so siblings shift naturally.
  // Root-level containers use their containerWidth directly.
  let widthValue: string;
  if (isContainerWidget) {
    if (isNested) {
      widthValue = "100%";
    } else {
      const containerWidthVal = Number(c.containerWidth ?? 100);
      const containerWidthUnitVal = String(c.containerWidthUnit || "%");
      widthValue = `${containerWidthVal}${containerWidthUnitVal}`;
    }
  } else {
    widthValue = widthUnit === "auto" ? "100%" : `${Number(c.widthValue ?? 100)}${widthUnit}`;
  }
  const alignment  = String(c.alignment || "left");
  const alignJustify =
    alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start";

  // ── Spacing ──────────────────────────────────────────────────────────
  const marginStyle: React.CSSProperties = {
    marginTop:    `${Number(c.marginTop    ?? 0)}px`,
    marginRight:  `${Number(c.marginRight  ?? 0)}px`,
    marginBottom: `${Number(c.marginBottom ?? 0)}px`,
    marginLeft:   `${Number(c.marginLeft   ?? 0)}px`,
  };
  const paddingStyle: React.CSSProperties = {
    paddingTop:    `${Number(c.paddingTop    ?? 16)}px`,
    paddingRight:  `${Number(c.paddingRight  ?? 16)}px`,
    paddingBottom: `${Number(c.paddingBottom ?? 16)}px`,
    paddingLeft:   `${Number(c.paddingLeft   ?? 16)}px`,
  };

  // ── Styles tab: border, radius, shadow, opacity, bg ─────────────────
  const borderStyleStr = String(c.borderStyle || "solid");
  const isBorderNone   = borderStyleStr === "none";
  // In preview mode, suppress the default editing border (the subtle 1px
  // #e0dff0 frame non-container widgets show in edit mode).  However, if
  // the user has explicitly customised ANY border property — style, color,
  // or individual widths — honour those in preview so colours carry over.
  const hasUserCustomBorder =
    !!c.borderStyle ||
    (c.borderColor !== undefined && String(c.borderColor) !== "#e0dff0") ||
    [c.borderTopWidth, c.borderRightWidth, c.borderBottomWidth, c.borderLeftWidth]
      .some((w) => w !== undefined && Number(w) !== 1);
  const isDefaultEditingBorder = isBorderNone
    ? true
    : (previewMode && !hasUserCustomBorder);
  const userShadow     = getShadowValue(c.shadow);
  // Selection indicator is an inset box-shadow so it respects border-radius (I3: refined)
  // Suppressed in preview mode
  const selectionGlow  = previewMode ? "" : isSelected
    ? isNested
      ? "inset 0 0 0 2px #5EA7A3, 0 0 0 3px rgba(94,167,163,0.2)"
      : "inset 0 0 0 2px #46367F, 0 0 0 3px rgba(70,54,127,0.15)"
    : "";
  const dropGlow       = previewMode ? "" : (isOver && canDrop) ? "inset 0 0 0 2px #5EA7A3, 0 0 6px rgba(94,167,163,0.25)" : "";
  const combinedShadow = [selectionGlow || dropGlow, userShadow !== "none" ? userShadow : ""].filter(Boolean).join(", ") || "none";

  const outerStyle: React.CSSProperties = {
    ...marginStyle,
    width:    widthValue,
    minWidth: !isContainerWidget && c.minWidth  ? `${Number(c.minWidth)}${c.minWidthUnit  || "px"}` : undefined,
    maxWidth: !isContainerWidget && c.maxWidth  ? `${Number(c.maxWidth)}${c.maxWidthUnit  || "px"}` : undefined,
    height:   isContainerWidget
      ? "auto" // Containers always use auto-height — expand/shrink with content
      : c.heightUnit === "px" ? `${Number(c.heightValue ?? 200)}px` : "auto",
    minHeight: isContainerWidget
      ? (element.children && element.children.every((row) => row.every((cell) => cell.length === 0)) ? (previewMode ? undefined : 40) : undefined)
      : undefined,
    borderStyle:       isDefaultEditingBorder ? "none" : borderStyleStr,
    borderTopWidth:    isDefaultEditingBorder ? 0 : `${Number(c.borderTopWidth    ?? 1)}px`,
    borderRightWidth:  isDefaultEditingBorder ? 0 : `${Number(c.borderRightWidth  ?? 1)}px`,
    borderBottomWidth: isDefaultEditingBorder ? 0 : `${Number(c.borderBottomWidth ?? 1)}px`,
    borderLeftWidth:   isDefaultEditingBorder ? 0 : `${Number(c.borderLeftWidth   ?? 1)}px`,
    borderColor:       isDefaultEditingBorder ? "transparent" : String(c.borderColor || "#e0dff0"),
    borderTopLeftRadius:     `${Number(c.radiusTL ?? 0)}px`,
    borderTopRightRadius:    `${Number(c.radiusTR ?? 0)}px`,
    borderBottomRightRadius: `${Number(c.radiusBR ?? 0)}px`,
    borderBottomLeftRadius:  `${Number(c.radiusBL ?? 0)}px`,
    boxShadow: combinedShadow,
    opacity:   Number(c.opacity ?? 100) / 100,
    zIndex:    isContainerWidget && c.zIndex !== undefined && c.zIndex !== "" ? Number(c.zIndex) : undefined,
    position:  isContainerWidget && c.zIndex !== undefined && c.zIndex !== "" ? "relative" : undefined,
  };

  const contentStyle: React.CSSProperties = isContainerWidget
    ? {} // Container widgets handle their own internal padding & background
    : {
        ...paddingStyle,
        backgroundColor: c.bgColor ? String(c.bgColor) : "transparent",
      };

  return (
    <div style={{ display: "flex", justifyContent: alignJustify }}>
    <div
      ref={ref}
      id={isContainerWidget && c.cssId ? String(c.cssId) : undefined}
      onClick={(e) => { e.stopPropagation(); if (!previewMode) onSelect(); }}
      style={outerStyle}
      className={[
        `relative transition-all ${previewMode ? "cursor-default" : "cursor-pointer"}`,
        isContainerWidget
          ? "overflow-visible"
          : "overflow-hidden",
        isDragging ? "opacity-20 scale-[0.99]" : "",
        isContainerWidget && c.cssClass ? String(c.cssClass) : "",
      ].filter(Boolean).join(" ")}
    >
      {/* ── Elementor-style toolbar bar — visible when selected, hidden in preview (C3/I3) ── */}
      {!previewMode && (
      <div
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-2.5 py-1.5 transition-all ${
          isSelected
            ? isNested ? "bg-ds-teal opacity-100" : "bg-ds-purple opacity-100"
            : "bg-[#f0eef8] opacity-0 pointer-events-none"
        }`}
      >
        <div className={`flex items-center gap-2 ${isSelected ? "pointer-events-auto" : "pointer-events-none"}`}>
          {/* Drag handle */}
          <div
            ref={drag}
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center cursor-grab active:cursor-grabbing transition-colors ${
              isSelected ? "text-white/70 hover:text-white" : "text-ds-gray"
            }`}
            title="Drag to reorder"
          >
            <DragHandleIcon />
          </div>
          {/* Widget type icon */}
          <div
            className={`w-3.5 h-3.5 [&_svg]:w-3.5 [&_svg]:h-3.5 transition-colors ${
              isSelected ? "text-white/80" : "text-ds-purple"
            }`}
          >
            {icon}
          </div>
          {/* Widget type label */}
          <span
            className={`font-['Poppins',sans-serif] text-[10px] transition-colors ${
              isSelected ? "text-white" : "text-ds-purple"
            }`}
            style={{ fontWeight: 600 }}
          >
            {typeLabel}
          </span>
        </div>

        <div className={`flex items-center gap-1 ${isSelected ? "pointer-events-auto" : "pointer-events-none"}`}>
        {/* Duplicate button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className={`p-0.5 rounded transition-colors cursor-pointer ${
            isSelected
              ? "text-white/60 hover:text-white hover:bg-white/10"
              : "text-ds-purple/40"
          }`}
          title="Duplicate element"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
            <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`p-0.5 rounded transition-colors cursor-pointer ${
            isSelected
              ? "text-white/60 hover:text-red-300 hover:bg-white/10"
              : "text-ds-purple/40"
          }`}
          title="Remove element"
        >
          <TrashIcon />
        </button>
        </div>
      </div>
      )}

      {/* ── Widget content body ── */}
      <div style={contentStyle}>
        {renderContent()}
      </div>
    </div>
    </div>
  );
}

// =====================================================================
// Container Cell — droppable zone inside a Container widget
// =====================================================================
function ContainerCell({
  containerId,
  rowIdx,
  colIdx,
  flex,
  gap,
  totalFlex = 1,
  numCols = 1,
  cellFlexDirection = "column",
  cellJustifyContent = "flex-start",
  cellAlignItems = "stretch",
  cellFlexWrap = "nowrap",
  contentWidth = "full",
  cellGapRow = 0,
  cellGapCol = 0,
  cellElements,
  selectedId,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdateConfig,
  onDropInCell,
  onMoveInCell,
  onCrossMove,
}: {
  containerId: string;
  rowIdx: number;
  colIdx: number;
  flex: number;
  totalFlex?: number;
  numCols?: number;
  gap: number;
  cellFlexDirection?: React.CSSProperties["flexDirection"];
  cellJustifyContent?: string;
  cellAlignItems?: string;
  cellFlexWrap?: React.CSSProperties["flexWrap"];
  contentWidth?: string;
  cellGapRow?: number;
  cellGapCol?: number;
  cellElements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdateConfig: (id: string, config: Record<string, string | number | boolean>) => void;
  onDropInCell: (widget: PaletteWidget, containerId: string, rowIdx: number, colIdx: number, insertIndex?: number) => void;
  onMoveInCell: (containerId: string, rowIdx: number, colIdx: number, dragIdx: number, hoverIdx: number) => void;
  onCrossMove?: (elementId: string, targetContainerId: string, targetRowIdx: number, targetColIdx: number, insertIndex?: number) => void;
}) {
  const previewMode = React.useContext(PreviewModeContext);
  const [{ isOver, canDrop }, drop] = useDrop<
    { widget?: PaletteWidget; index?: number; elementId?: string },
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: [ITEM_TYPE_PALETTE, ITEM_TYPE_CANVAS, ITEM_TYPE_CANVAS_NESTED],
      drop: (item, monitor) => {
        if (monitor.didDrop()) return;
        if (item.widget) {
          onDropInCell(item.widget, containerId, rowIdx, colIdx);
        } else if (item.elementId && onCrossMove) {
          onCrossMove(item.elementId, containerId, rowIdx, colIdx);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [containerId, rowIdx, colIdx, onDropInCell, onCrossMove]
  );

  const isEmpty = cellElements.length === 0;
  const dropping = isOver && canDrop;

  // Compute dynamic flex: if the cell contains a single container child,
  // use its containerWidth to drive the cell's flex-basis (so siblings shift naturally).
  // Otherwise fall back to the preset flex weight.
  const singleContainerChild =
    cellElements.length === 1 && cellElements[0].type === "container"
      ? cellElements[0]
      : null;

  let cellFlex: React.CSSProperties["flex"] = flex;
  if (singleContainerChild) {
    const cw = Number(singleContainerChild.config.containerWidth ?? 100);
    const cwUnit = String(singleContainerChild.config.containerWidthUnit || "%");
    const gapShare = numCols > 1 ? ((numCols - 1) * gap) / numCols : 0;
    if (cwUnit === "%") {
      cellFlex = `0 0 calc(${cw}% - ${gapShare}px)`;
    } else {
      // px unit
      cellFlex = `0 0 ${cw - gapShare}px`;
    }
  }

  const handleIndicatorDrop = useCallback(
    (widget: PaletteWidget, idx: number) => {
      onDropInCell(widget, containerId, rowIdx, colIdx, idx);
    },
    [onDropInCell, containerId, rowIdx, colIdx]
  );

  const handleIndicatorMoveDrop = useCallback(
    (elementId: string, idx: number) => {
      if (onCrossMove) onCrossMove(elementId, containerId, rowIdx, colIdx, idx);
    },
    [onCrossMove, containerId, rowIdx, colIdx]
  );

  return (
    <div
      ref={previewMode ? undefined : drop}
      onClick={(e) => { e.stopPropagation(); if (!previewMode) onSelect(containerId); }}
      className={`flex flex-col transition-all ${
        previewMode ? "" :
        dropping
          ? "outline-2 outline-dashed outline-offset-[-2px] outline-ds-teal bg-ds-teal-light/15"
          : isEmpty
          ? "outline-2 outline-dashed outline-offset-[-2px] outline-ds-purple/20 hover:outline-ds-purple/40"
          : ""
      }`}
      style={{ flex: cellFlex, minHeight: isEmpty && !previewMode ? 40 : undefined }}
    >
      {isEmpty ? (
        previewMode ? null : (
        <div className="flex-1 flex items-center justify-center min-h-[40px]">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-purple/35 select-none pointer-events-none">
            {dropping ? "Drop here" : "+"}
          </span>
        </div>
        )
      ) : (
        <div className="flex flex-1" style={{
          flexDirection: cellFlexDirection,
          justifyContent: cellJustifyContent,
          alignItems: cellAlignItems,
          flexWrap: cellFlexWrap,
          rowGap: cellGapRow,
          columnGap: cellGapCol,
        }}>
          {/* Top insertion indicator */}
          <DropIndicatorLine
            insertIndex={0}
            onDrop={handleIndicatorDrop}
            onMoveDrop={handleIndicatorMoveDrop}
            acceptTypes={[ITEM_TYPE_PALETTE, ITEM_TYPE_CANVAS, ITEM_TYPE_CANVAS_NESTED]}
            isNested
          />

          {cellElements.map((child, idx) => {
            const isRow = cellFlexDirection === "row" || cellFlexDirection === "row-reverse";
            const isFullWidth = contentWidth === "full";
            return (
            <div key={child.id} style={{
              width: isFullWidth && !isRow ? "100%" : undefined,
              flex: isFullWidth && isRow ? "1 1 0%" : undefined,
              minWidth: isRow ? 0 : undefined,
            }}>
              <CanvasItem
                element={child}
                index={idx}
                isSelected={selectedId === child.id}
                onSelect={() => onSelect(child.id)}
                onDelete={() => onDelete(child.id)}
                onDuplicate={() => onDuplicate(child.id)}
                onMove={(di, hi) => onMoveInCell(containerId, rowIdx, colIdx, di, hi)}
                onUpdate={(cfg) => onUpdateConfig(child.id, cfg)}
                selectedId={selectedId}
                onSelectById={onSelect}
                onDeleteById={onDelete}
                onDuplicateById={onDuplicate}
                onDropInCell={onDropInCell}
                onMoveInCell={onMoveInCell}
                onUpdateConfig={onUpdateConfig}
                onCrossMove={onCrossMove}
                isNested
              />
              {/* Insertion indicator after each element */}
              <DropIndicatorLine
                insertIndex={idx + 1}
                onDrop={handleIndicatorDrop}
                onMoveDrop={handleIndicatorMoveDrop}
                acceptTypes={[ITEM_TYPE_PALETTE, ITEM_TYPE_CANVAS, ITEM_TYPE_CANVAS_NESTED]}
                isNested
              />
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Drop Indicator Line — positional insertion marker (I5: React.memo)
// =====================================================================
const DropIndicatorLine = React.memo(function DropIndicatorLine({
  insertIndex,
  onDrop,
  onMoveDrop,
  acceptTypes,
  isNested = false,
}: {
  insertIndex: number;
  onDrop: (widget: PaletteWidget, index: number) => void;
  onMoveDrop?: (elementId: string, insertIndex: number) => void;
  acceptTypes: string | string[];
  isNested?: boolean;
}) {
  const previewMode = React.useContext(PreviewModeContext);
  const [{ isOver, canDrop }, drop] = useDrop<
    { widget?: PaletteWidget; elementId?: string },
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: acceptTypes,
      drop: (item, monitor) => {
        if (monitor.didDrop()) return;
        if (item.widget) {
          onDrop(item.widget, insertIndex);
        } else if (item.elementId && onMoveDrop) {
          onMoveDrop(item.elementId, insertIndex);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [insertIndex, onDrop, onMoveDrop, acceptTypes]
  );

  const active = isOver && canDrop;

  // Completely hidden in preview mode
  if (previewMode) return null;

  return (
    <div
      ref={drop}
      className="relative transition-all"
      style={{
        height: active ? 6 : 8,
        marginTop: active ? -1 : -4,
        marginBottom: active ? -1 : -4,
        zIndex: active ? 50 : 1,
      }}
    >
      {/* Invisible wider hit area */}
      <div className="absolute inset-x-0 -top-2 -bottom-2" />
      {/* Visible indicator line */}
      {active && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
          {/* Left dot */}
          <div
            className="shrink-0 rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: isNested ? "#5EA7A3" : "#46367F",
              boxShadow: `0 0 6px ${isNested ? "rgba(94,167,163,0.5)" : "rgba(70,54,127,0.5)"}`,
            }}
          />
          {/* Line */}
          <div
            className="flex-1"
            style={{
              height: 2,
              backgroundColor: isNested ? "#5EA7A3" : "#46367F",
              boxShadow: `0 0 4px ${isNested ? "rgba(94,167,163,0.4)" : "rgba(70,54,127,0.4)"}`,
            }}
          />
          {/* Right dot */}
          <div
            className="shrink-0 rounded-full"
            style={{
              width: 8,
              height: 8,
              backgroundColor: isNested ? "#5EA7A3" : "#46367F",
              boxShadow: `0 0 6px ${isNested ? "rgba(94,167,163,0.5)" : "rgba(70,54,127,0.5)"}`,
            }}
          />
        </div>
      )}
    </div>
  );
});

// =====================================================================
// Document Size Dropdown (inline indicator + picker, synced with config)
// =====================================================================
function DocumentSizeDropdown({
  canvasConfig,
  onCanvasConfigChange,
  effectivePageWidth,
  effectivePageHeight,
}: {
  canvasConfig: CanvasConfig;
  onCanvasConfigChange: React.Dispatch<React.SetStateAction<CanvasConfig>>;
  effectivePageWidth: number;
  effectivePageHeight: number;
}) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const orientation = canvasConfig.pageOrientation || "portrait";
  const currentPreset = PAGE_SIZE_PRESETS.find((p) => p.value === canvasConfig.pageSizePreset);

  // Display label: inches with orientation
  const wIn = pxToInchesLabel(effectivePageWidth);
  const hIn = pxToInchesLabel(effectivePageHeight);
  const presetLabel = currentPreset?.label ?? "Custom";

  const handleSelect = (preset: typeof PAGE_SIZE_PRESETS[number]) => {
    onCanvasConfigChange((prev) => ({
      ...prev,
      pageSizePreset: preset.value,
      pageSizeWidth: preset.widthPx,
      pageSizeHeight: preset.heightPx,
    }));
    setOpen(false);
  };

  const handleOrientationToggle = (newOrientation: PageOrientation) => {
    onCanvasConfigChange((prev) => ({ ...prev, pageOrientation: newOrientation }));
  };

  return (
    <div className="relative" ref={dropRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer select-none"
      >
        <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#888]">
          <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 4h6M5 6.5h6M5 9h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <span className="font-['Poppins',sans-serif] text-[10px] text-[#888]" style={{ fontWeight: 500 }}>
          {wIn} × {hIn}in
          <span className="ml-1.5 text-[#aaa]">({orientation})</span>
        </span>
        <svg viewBox="0 0 10 6" fill="none" className="w-2.5 h-1.5 text-[#aaa] ml-0.5">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-ds-haze z-50 min-w-[220px] py-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Preset label */}
          <div className="px-3 pt-1.5 pb-1">
            <span className="font-['Poppins',sans-serif] text-[9px] text-[#aaa] uppercase tracking-wider" style={{ fontWeight: 600 }}>
              Document Size
            </span>
          </div>

          {/* Page size presets */}
          {PAGE_SIZE_PRESETS.map((preset) => {
            const isActive = canvasConfig.pageSizePreset === preset.value;
            const pW = orientation === "landscape" ? preset.heightIn : preset.widthIn;
            const pH = orientation === "landscape" ? preset.widthIn : preset.heightIn;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleSelect(preset)}
                className={`w-full flex items-center justify-between px-3 py-1.5 transition-colors cursor-pointer ${
                  isActive ? "bg-ds-purple-light text-ds-purple" : "text-ds-dark-gray hover:bg-gray-50"
                }`}
              >
                <span className="font-['Poppins',sans-serif] text-[11px]" style={{ fontWeight: isActive ? 600 : 400 }}>
                  {preset.label}
                </span>
                <span className="font-['Poppins',sans-serif] text-[10px] text-[#999]">
                  {pW} × {pH} in
                </span>
              </button>
            );
          })}

          {/* Custom size entry */}
          <button
            type="button"
            onClick={() => {
              onCanvasConfigChange((prev) => ({ ...prev, pageSizePreset: "custom" as PageSizePreset }));
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 transition-colors cursor-pointer ${
              canvasConfig.pageSizePreset === "custom" ? "bg-ds-purple-light text-ds-purple" : "text-ds-dark-gray hover:bg-gray-50"
            }`}
          >
            <span className="font-['Poppins',sans-serif] text-[11px]" style={{ fontWeight: canvasConfig.pageSizePreset === "custom" ? 600 : 400 }}>
              Custom
            </span>
            <span className="font-['Poppins',sans-serif] text-[10px] text-[#999]">
              {pxToInchesLabel(effectivePageWidth)} × {pxToInchesLabel(effectivePageHeight)} in
            </span>
          </button>

          {/* Custom dimension inputs */}
          {canvasConfig.pageSizePreset === "custom" && (
            <div className="px-3 pb-1.5 pt-1 flex gap-2">
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="font-['Poppins',sans-serif] text-[9px] text-[#999]">W (in)</span>
                <input
                  type="number"
                  step="0.25"
                  min="2"
                  max="30"
                  value={Math.round((canvasConfig.pageSizeWidth / PX_PER_INCH) * 100) / 100}
                  onChange={(e) => {
                    const inches = Math.max(2, Math.min(30, Number(e.target.value) || 2));
                    onCanvasConfigChange((prev) => ({ ...prev, pageSizeWidth: Math.round(inches * PX_PER_INCH) }));
                  }}
                  className="w-full px-2 py-1 border border-ds-haze rounded text-[11px] font-['Poppins',sans-serif] text-ds-dark-gray outline-none focus:border-ds-purple"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <span className="font-['Poppins',sans-serif] text-[9px] text-[#999]">H (in)</span>
                <input
                  type="number"
                  step="0.25"
                  min="2"
                  max="50"
                  value={Math.round((canvasConfig.pageSizeHeight / PX_PER_INCH) * 100) / 100}
                  onChange={(e) => {
                    const inches = Math.max(2, Math.min(50, Number(e.target.value) || 2));
                    onCanvasConfigChange((prev) => ({ ...prev, pageSizeHeight: Math.round(inches * PX_PER_INCH) }));
                  }}
                  className="w-full px-2 py-1 border border-ds-haze rounded text-[11px] font-['Poppins',sans-serif] text-ds-dark-gray outline-none focus:border-ds-purple"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Orientation toggle */}
          <div className="border-t border-ds-haze mt-1 pt-1.5 px-3 pb-2">
            <span className="font-['Poppins',sans-serif] text-[9px] text-[#aaa] uppercase tracking-wider" style={{ fontWeight: 600 }}>
              Orientation
            </span>
            <div className="flex gap-1 mt-1.5">
              {(["portrait", "landscape"] as const).map((ori) => (
                <button
                  key={ori}
                  type="button"
                  onClick={() => handleOrientationToggle(ori)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors cursor-pointer font-['Poppins',sans-serif] text-[10px] ${
                    orientation === ori
                      ? "bg-ds-purple text-white"
                      : "bg-white border border-ds-haze text-ds-dark-gray hover:border-ds-purple"
                  }`}
                  style={{ fontWeight: orientation === ori ? 600 : 400 }}
                >
                  {/* Orientation icon */}
                  <svg viewBox="0 0 12 14" fill="none" className={`w-2.5 h-3 ${ori === "landscape" ? "rotate-90" : ""}`}>
                    <rect x="1" y="1" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  {ori.charAt(0).toUpperCase() + ori.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Canvas Drop Zone
// =====================================================================
function Canvas({
  elements,
  selectedId,
  onSelect,
  onDeselect,
  onDelete,
  onDuplicate,
  onDrop,
  onMove,
  onUpdateConfig,
  onDropInCell,
  onMoveInCell,
  onCrossMove,
  onCrossMoveToRoot,
  canvasConfig,
  onCanvasConfigChange,
  pageWidth: propPageWidth = 816,
  pageHeight: propPageHeight = 1056,
  pageOrientation: propPageOrientation = "portrait",
}: {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDrop: (widget: PaletteWidget, index?: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onUpdateConfig: (id: string, config: Record<string, string | number | boolean>) => void;
  onDropInCell: (widget: PaletteWidget, containerId: string, rowIdx: number, colIdx: number, insertIndex?: number) => void;
  onMoveInCell: (containerId: string, rowIdx: number, colIdx: number, dragIdx: number, hoverIdx: number) => void;
  onCrossMove?: (elementId: string, targetContainerId: string, targetRowIdx: number, targetColIdx: number, insertIndex?: number) => void;
  onCrossMoveToRoot?: (elementId: string, insertIndex: number) => void;
  canvasConfig: CanvasConfig;
  onCanvasConfigChange: React.Dispatch<React.SetStateAction<CanvasConfig>>;
  pageWidth?: number;
  pageHeight?: number;
  pageOrientation?: "portrait" | "landscape";
}) {
  const previewMode = React.useContext(PreviewModeContext);

  // Derive page dimensions from canvasConfig (preferred) or fall back to props
  const pageWidth = canvasConfig.pageSizeWidth ?? propPageWidth;
  const pageHeight = canvasConfig.pageSizeHeight ?? propPageHeight;
  const pageOrientation = canvasConfig.pageOrientation ?? propPageOrientation;

  // ── Effective page dimensions (swap for landscape) ──
  const effectivePageWidth  = pageOrientation === "landscape" ? pageHeight : pageWidth;
  const effectivePageHeight = pageOrientation === "landscape" ? pageWidth  : pageHeight;

  // ── Zoom state ──
  const ZOOM_MIN = 25;
  const ZOOM_MAX = 200;
  const ZOOM_STEP = 10;
  const [zoomPct, setZoomPct] = useState(100);
  const zoomScale = zoomPct / 100;

  // Ref for the scrollable canvas viewport (used for fit-to-width)
  const canvasViewportRef = React.useRef<HTMLDivElement>(null);
  const didAutoFitRef = React.useRef(false);

  // Auto-fit zoom to fill viewport width on first render
  React.useEffect(() => {
    if (didAutoFitRef.current) return;
    const vp = canvasViewportRef.current;
    if (!vp || !effectivePageWidth) return;
    // p-6 = 24px padding on each side
    const availableWidth = vp.clientWidth - 48;
    if (availableWidth > 0 && effectivePageWidth > 0) {
      const fitPct = Math.floor((availableWidth / effectivePageWidth) * 100);
      const clamped = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitPct));
      setZoomPct(clamped);
      didAutoFitRef.current = true;
    }
  }, [effectivePageWidth]);

  const handleZoomIn  = () => setZoomPct((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  const handleZoomOut = () => setZoomPct((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  const handleZoomFit = () => {
    const vp = canvasViewportRef.current;
    if (vp && effectivePageWidth > 0) {
      const availableWidth = vp.clientWidth - 48;
      const fitPct = Math.floor((availableWidth / effectivePageWidth) * 100);
      setZoomPct(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, fitPct)));
    } else {
      setZoomPct(100);
    }
  };

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: [ITEM_TYPE_PALETTE, ITEM_TYPE_CANVAS, ITEM_TYPE_CANVAS_NESTED],
      drop: (item: { widget?: PaletteWidget; elementId?: string }, monitor) => {
        if (monitor.didDrop()) return;
        if (item.widget) {
          onDrop(item.widget);
        } else if (item.elementId && onCrossMoveToRoot) {
          // Drop on canvas background = append to end
          onCrossMoveToRoot(item.elementId, elements.length);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDrop, onCrossMoveToRoot, elements.length]
  );

  return (
    <div
      ref={previewMode ? undefined : drop}
      className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-colors relative ${
        previewMode ? "bg-[#e8e8e8]" :
        isOver && canDrop ? "bg-[#d9f0ee]" : "bg-[#ecedf0]"
      }`}
    >
      {/* Canvas header — editing mode */}
      {!previewMode && (
      <div className="flex items-center justify-between px-4 py-2 border-b border-ds-haze bg-white shrink-0">
        <span
          className="font-['Montserrat',sans-serif] text-[13px] text-ds-teal"
          style={{ fontWeight: 700 }}
        >
          Template Canvas
        </span>
        <div className="flex items-center gap-1">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray mr-1">
            {elements.length} element{elements.length !== 1 ? "s" : ""}
          </span>
          <div className="w-px h-4 bg-ds-haze" />
          <DocumentSizeDropdown
            canvasConfig={canvasConfig}
            onCanvasConfigChange={onCanvasConfigChange}
            effectivePageWidth={effectivePageWidth}
            effectivePageHeight={effectivePageHeight}
          />
        </div>
      </div>
      )}

      {/* Preview mode header */}
      {previewMode && (
        <div className="flex items-center justify-center gap-2 py-1.5 bg-[#e8e8e8] shrink-0 border-b border-black/5">
          <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray">Preview Mode</span>
        </div>
      )}

      {/* Canvas content — click background to deselect (C1) */}
      <div
        ref={canvasViewportRef}
        className="flex-1 overflow-auto p-6 relative"
        onClick={previewMode ? undefined : onDeselect}
        style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}
      >
        {/* Zoom wrapper — scales from top-center */}
        <div style={{ transform: `scale(${zoomScale})`, transformOrigin: "top center", flexShrink: 0 }}>
        {/* Canvas surface with applied page-level formatting — fixed page dimensions in both modes */}
        <div
          className="transition-colors"
          style={{
            width: effectivePageWidth,
            minHeight: effectivePageHeight,
            flexShrink: 0,
            boxShadow: previewMode
              ? "0 2px 12px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)"
              : "0 1px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
            borderRadius: 2,
            // Margins = page edge → content area; combined with padding as internal spacing
            paddingTop:    canvasConfig.marginTop    + canvasConfig.paddingTop,
            paddingRight:  canvasConfig.marginRight  + canvasConfig.paddingRight,
            paddingBottom: canvasConfig.marginBottom  + canvasConfig.paddingBottom,
            paddingLeft:   canvasConfig.marginLeft   + canvasConfig.paddingLeft,
            backgroundColor: canvasConfig.bgColor || "#ffffff",
            ...(canvasConfig.borderStyle !== "none" ? {
              borderStyle: canvasConfig.borderStyle,
              borderWidth: canvasConfig.borderWidth,
              borderColor: canvasConfig.borderColor,
            } : {}),
          }}
        >
          {/* Content alignment wrapper */}
          <div
            style={{
              maxWidth: canvasConfig.contentWidth === "boxed" ? canvasConfig.contentMaxWidth : undefined,
              marginLeft: canvasConfig.contentAlignment === "center" || canvasConfig.contentAlignment === "right" ? "auto" : undefined,
              marginRight: canvasConfig.contentAlignment === "center" || canvasConfig.contentAlignment === "left" ? "auto" : undefined,
            }}
          >
        {elements.length === 0 ? (
          previewMode ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <span className="font-['Poppins',sans-serif] text-[13px] text-ds-gray">No content to preview</span>
            </div>
          ) : (
          <div
            className={`flex flex-col items-center justify-center gap-3 h-full min-h-[300px] border-2 border-dashed rounded-xl transition-colors ${
              isOver && canDrop
                ? "border-ds-teal bg-ds-teal-light/20"
                : "border-ds-haze"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-ds-purple-light flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <path d="M12 5v14M5 12h14" stroke="var(--ds-purple)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span
                className="font-['Montserrat',sans-serif] text-[14px] text-ds-dark-gray"
                style={{ fontWeight: 600 }}
              >
                Drag widgets here
              </span>
              <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray text-center max-w-[280px]">
                Drag widgets from the left panel and drop them here to build your document template
              </span>
            </div>
          </div>
          )
        ) : (
          <div className="flex flex-col" style={{ gap: canvasConfig.elementGap }}>
            {/* Top insertion indicator */}
            <DropIndicatorLine
              insertIndex={0}
              onDrop={(w, idx) => onDrop(w, idx)}
              onMoveDrop={onCrossMoveToRoot}
              acceptTypes={[ITEM_TYPE_PALETTE, ITEM_TYPE_CANVAS, ITEM_TYPE_CANVAS_NESTED]}
            />

            {elements.map((el, idx) => (
              <div key={el.id}>
                <CanvasItem
                  element={el}
                  index={idx}
                  isSelected={selectedId === el.id}
                  onSelect={() => onSelect(el.id)}
                  onDelete={() => onDelete(el.id)}
                  onDuplicate={() => onDuplicate(el.id)}
                  onMove={onMove}
                  onUpdate={(config) => onUpdateConfig(el.id, config)}
                  selectedId={selectedId}
                  onSelectById={onSelect}
                  onDeleteById={onDelete}
                  onDuplicateById={onDuplicate}
                  onDropInCell={onDropInCell}
                  onMoveInCell={onMoveInCell}
                  onUpdateConfig={onUpdateConfig}
                  onCrossMove={onCrossMove}
                />
                {/* Insertion indicator after each element */}
                <DropIndicatorLine
                  insertIndex={idx + 1}
                  onDrop={(w, i) => onDrop(w, i)}
                  onMoveDrop={onCrossMoveToRoot}
                  acceptTypes={[ITEM_TYPE_PALETTE, ITEM_TYPE_CANVAS, ITEM_TYPE_CANVAS_NESTED]}
                />
              </div>
            ))}

            {/* Bottom drop zone hint — hidden in preview */}
            {!previewMode && (
            <div
              className={`flex items-center justify-center py-4 border-2 border-dashed rounded-lg transition-colors ${
                isOver && canDrop
                  ? "border-ds-teal bg-ds-teal-light/20"
                  : "border-transparent hover:border-ds-haze"
              }`}
            >
              <span className="font-['Poppins',sans-serif] text-[10px] text-ds-light-gray">
                {isOver && canDrop ? "Drop here to add" : ""}
              </span>
            </div>
            )}
          </div>
        )}
          </div>
        </div>
        </div>{/* close zoom wrapper */}
      </div>

      {/* Floating zoom toolbar — bottom-left corner, editing mode only */}
      {!previewMode && (
        <div
          className="absolute bottom-3 left-3 z-40 flex items-center gap-0.5 bg-white rounded-lg shadow-md border border-ds-haze px-1 py-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomPct <= ZOOM_MIN}
            className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom out"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-ds-dark-gray">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleZoomFit}
            className="px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors cursor-pointer min-w-[40px] text-center"
            title="Reset to 100%"
          >
            <span className="font-['Poppins',sans-serif] text-[10px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
              {zoomPct}%
            </span>
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomPct >= ZOOM_MAX}
            className="p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Zoom in"
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-ds-dark-gray">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Right Panel — Structure + Layout + Styles
// =====================================================================
type RightPanelView = "structure" | "properties" | "styles";

function RightPanel({
  elements,
  selectedId,
  onSelect,
  onDelete,
  selectedElement,
  onUpdateConfig,
  collapsed,
  onToggleCollapse,
  images,
  showCanvasSettings,
  canvasConfig,
  onCanvasConfigChange,
  pageWidth,
  pageHeight,
  pageOrientation,
  forceViewTrigger,
  onStructureMove,
}: {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedElement: CanvasElement | null;
  onUpdateConfig: (id: string, config: Record<string, string | number | boolean>) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  images: ImageDocument[];
  showCanvasSettings: boolean;
  canvasConfig: CanvasConfig;
  onCanvasConfigChange: React.Dispatch<React.SetStateAction<CanvasConfig>>;
  pageWidth: number;
  pageHeight: number;
  pageOrientation: "portrait" | "landscape";
  forceViewTrigger?: number;
  onStructureMove: (item: StructureDragItem, targetCtx: StructureNodeContext, insertIdx: number) => void;
}) {
  const [view, setView] = useState<RightPanelView>("structure");

  // When forceViewTrigger bumps, switch to "properties" tab (Canvas settings)
  useEffect(() => {
    if (forceViewTrigger && forceViewTrigger > 0) {
      setView("properties");
    }
  }, [forceViewTrigger]);

  if (collapsed) {
    return (
      <div className="w-10 shrink-0 bg-[#f7f6fa] border-l border-ds-haze flex flex-col items-center pt-2">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-ds-purple-light cursor-pointer transition-colors text-ds-dark-gray"
          title="Expand panel"
        >
          <PanelCollapseIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[260px] shrink-0 bg-[#f7f6fa] border-l border-ds-haze flex flex-col overflow-hidden h-full">
      {/* Panel header — 3 tabs + collapse button */}
      <div className="flex items-center justify-between px-1.5 py-1.5 border-b border-ds-haze shrink-0 gap-0.5">
        <div className="flex gap-0.5 flex-1 min-w-0">
          {(
            [
              { id: "structure",  icon: <StructureIcon />,  label: "Structure" },
              { id: "properties", icon: <LayoutIcon />,     label: "Layout" },
              { id: "styles",     icon: <StylesIcon />,     label: "Style"  },
            ] as { id: RightPanelView; icon: React.ReactNode; label: string }[]
          ).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              title={id.charAt(0).toUpperCase() + id.slice(1)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors cursor-pointer flex-1 justify-center ${
                view === id
                  ? "bg-ds-purple text-white"
                  : "text-ds-dark-gray hover:bg-white"
              }`}
            >
              {icon}
              <span className="font-['Poppins',sans-serif] text-[10px]" style={{ fontWeight: 500 }}>
                {label}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-ds-purple-light cursor-pointer transition-colors text-ds-dark-gray shrink-0"
          title="Collapse"
        >
          <PanelCollapseIcon flipped />
        </button>
      </div>

      {/* Breadcrumb navigation (F6) */}
      {selectedId && (() => {
        const path = getElementPath(elements, selectedId);
        if (path.length <= 1) return null;
        return (
          <div className="flex items-center gap-0.5 px-2.5 py-1.5 border-b border-ds-haze bg-[#f0edf6] flex-wrap shrink-0">
            {path.map((node, i) => (
              <div className="contents" key={node.id}>
                {i > 0 && (
                  <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3 text-ds-gray/50 shrink-0">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {node.type === "cell" ? (
                  <span className="font-['Poppins',sans-serif] text-[9px] text-ds-gray/60 px-1 py-0.5">{node.label}</span>
                ) : (
                  <button
                    onClick={() => onSelect(node.id)}
                    className={`font-['Poppins',sans-serif] text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      node.id === selectedId
                        ? "text-ds-purple bg-ds-purple-light"
                        : "text-ds-dark-gray hover:text-ds-purple hover:bg-ds-purple-light/50"
                    }`}
                    style={{ fontWeight: node.id === selectedId ? 600 : 500 }}
                  >
                    {node.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Panel content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {view === "structure" && (
          <StructureView
            elements={elements}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            onStructureMove={onStructureMove}
          />
        )}
        {view === "properties" && (
          showCanvasSettings && !selectedElement ? (
            <CanvasPropertiesPanel
              config={canvasConfig}
              onChange={onCanvasConfigChange}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              pageOrientation={pageOrientation}
              onSwitchToStyles={() => setView("styles")}
            />
          ) : (
            <PropertiesView
              selectedElement={selectedElement}
              onUpdateConfig={onUpdateConfig}
              images={images}
              onSwitchToStyles={() => setView("styles")}
              elements={elements}
            />
          )
        )}
        {view === "styles" && (
          showCanvasSettings && !selectedElement ? (
            <CanvasStylesPanel
              config={canvasConfig}
              onChange={onCanvasConfigChange}
            />
          ) : (
            <StylesView
              selectedElement={selectedElement}
              onUpdateConfig={onUpdateConfig}
            />
          )
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Canvas Properties Panel (Layout tab when canvas is selected)
// =====================================================================
function CanvasPropertiesPanel({
  config,
  onChange,
  pageWidth: _propPW,
  pageHeight: _propPH,
  pageOrientation: _propPO,
  onSwitchToStyles,
}: {
  config: CanvasConfig;
  onChange: React.Dispatch<React.SetStateAction<CanvasConfig>>;
  pageWidth: number;
  pageHeight: number;
  pageOrientation: "portrait" | "landscape";
  onSwitchToStyles?: () => void;
}) {
  const updateField = <K extends keyof CanvasConfig>(key: K, value: CanvasConfig[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const batchUpdate = (updates: Partial<CanvasConfig>) => {
    onChange((prev) => ({ ...prev, ...updates }));
  };

  // Derive from config (preferred) or props (backward compat)
  const pageWidth = config.pageSizeWidth ?? _propPW;
  const pageHeight = config.pageSizeHeight ?? _propPH;
  const pageOrientation = config.pageOrientation ?? _propPO;

  const unit = config.spacingUnit;
  const effW = pageOrientation === "landscape" ? pageHeight : pageWidth;
  const effH = pageOrientation === "landscape" ? pageWidth : pageHeight;

  // Ref dimensions for % mode: horizontal sides use page width, vertical sides use page height
  const refHorizontal = effW;
  const refVertical = effH;

  /** Convert stored px → display value */
  const toDisplay = (pxVal: number, axis: "h" | "v") =>
    formatUnitValue(pxToUnit(pxVal, unit, axis === "h" ? refHorizontal : refVertical), unit);

  const [marginLinked, setMarginLinked] = useState(false);
  const [paddingLinked, setPaddingLinked] = useState(false);

  const handleMarginChange = (side: "Top" | "Right" | "Bottom" | "Left", raw: string) => {
    const displayNum = Math.max(0, Number(raw) || 0);
    const axis = side === "Left" || side === "Right" ? "h" : "v";
    const pxVal = unitToPx(displayNum, unit, axis === "h" ? refHorizontal : refVertical);
    const rounded = Math.round(pxVal * 100) / 100;
    if (marginLinked) {
      batchUpdate({ marginTop: rounded, marginRight: rounded, marginBottom: rounded, marginLeft: rounded });
    } else {
      updateField(`margin${side}` as keyof CanvasConfig, rounded as never);
    }
  };

  const handlePaddingChange = (side: "Top" | "Right" | "Bottom" | "Left", raw: string) => {
    const displayNum = Math.max(0, Number(raw) || 0);
    const axis = side === "Left" || side === "Right" ? "h" : "v";
    const pxVal = unitToPx(displayNum, unit, axis === "h" ? refHorizontal : refVertical);
    const rounded = Math.round(pxVal * 100) / 100;
    if (paddingLinked) {
      batchUpdate({ paddingTop: rounded, paddingRight: rounded, paddingBottom: rounded, paddingLeft: rounded });
    } else {
      updateField(`padding${side}` as keyof CanvasConfig, rounded as never);
    }
  };

  const UNIT_OPTIONS: { value: SpacingUnit; label: string }[] = [
    { value: "px", label: "px" },
    { value: "in", label: "in" },
    { value: "mm", label: "mm" },
    { value: "%", label: "%" },
  ];

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      {/* Canvas header badge */}
      <div className="flex items-center gap-2 pb-1 border-b border-ds-haze">
        <div className="w-5 h-5 rounded bg-ds-purple-light flex items-center justify-center text-ds-purple">
          <CanvasSettingsIcon />
        </div>
        <span
          className="font-['Montserrat',sans-serif] text-[12px] text-ds-purple"
          style={{ fontWeight: 700 }}
        >
          Canvas Properties
        </span>
      </div>

      {/* ── Document Size ── */}
      <PropSectionLabel label="Document Size" />
      <PropSelect
        label="Page Size"
        value={config.pageSizePreset || "letter"}
        onChange={(v) => {
          if (v === "custom") {
            updateField("pageSizePreset", "custom" as PageSizePreset);
          } else {
            const preset = PAGE_SIZE_PRESETS.find((p) => p.value === v);
            if (preset) {
              batchUpdate({
                pageSizePreset: preset.value as PageSizePreset,
                pageSizeWidth: preset.widthPx,
                pageSizeHeight: preset.heightPx,
              });
            }
          }
        }}
        options={[
          ...PAGE_SIZE_PRESETS.map((p) => {
            const wIn = pageOrientation === "landscape" ? p.heightIn : p.widthIn;
            const hIn = pageOrientation === "landscape" ? p.widthIn : p.heightIn;
            return { value: p.value, label: `${p.label}  (${wIn} × ${hIn} in)` };
          }),
          { value: "custom", label: "Custom..." },
        ]}
      />
      {/* Custom dimension inputs — visible when preset is "custom" */}
      {config.pageSizePreset === "custom" && (
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-['Poppins',sans-serif] text-[9px] text-[#999]">Width (in)</span>
            <input
              type="number"
              step="0.25"
              min="2"
              max="30"
              value={Math.round((pageWidth / PX_PER_INCH) * 100) / 100}
              onChange={(e) => {
                const inches = Math.max(2, Math.min(30, Number(e.target.value) || 2));
                updateField("pageSizeWidth", Math.round(inches * PX_PER_INCH));
              }}
              className="w-full px-2 py-1 border border-ds-haze rounded text-[11px] font-['Poppins',sans-serif] text-ds-dark-gray outline-none focus:border-ds-purple"
            />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-['Poppins',sans-serif] text-[9px] text-[#999]">Height (in)</span>
            <input
              type="number"
              step="0.25"
              min="2"
              max="50"
              value={Math.round((pageHeight / PX_PER_INCH) * 100) / 100}
              onChange={(e) => {
                const inches = Math.max(2, Math.min(50, Number(e.target.value) || 2));
                updateField("pageSizeHeight", Math.round(inches * PX_PER_INCH));
              }}
              className="w-full px-2 py-1 border border-ds-haze rounded text-[11px] font-['Poppins',sans-serif] text-ds-dark-gray outline-none focus:border-ds-purple"
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-dark-gray uppercase tracking-wider" style={{ fontWeight: 600 }}>
          Orientation
        </span>
        <div className="flex-1 flex gap-0.5 bg-[#f3f1f8] rounded-md p-0.5">
          {(["portrait", "landscape"] as const).map((ori) => (
            <button
              key={ori}
              type="button"
              onClick={() => updateField("pageOrientation", ori)}
              className={`flex-1 py-1 rounded text-center font-['Poppins',sans-serif] text-[10px] transition-colors cursor-pointer ${
                pageOrientation === ori
                  ? "bg-ds-purple text-white shadow-sm"
                  : "text-ds-dark-gray hover:bg-white/60"
              }`}
              style={{ fontWeight: pageOrientation === ori ? 600 : 500 }}
            >
              {ori.charAt(0).toUpperCase() + ori.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Effective dimensions display */}
      <div className="flex items-center justify-between px-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-[#999]">
          Effective size
        </span>
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
          {pxToInchesLabel(effW)} × {pxToInchesLabel(effH)} in
        </span>
      </div>

      {/* ── Spacing Unit selector ── */}
      <div className="flex items-center gap-2">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-dark-gray uppercase tracking-wider" style={{ fontWeight: 600 }}>
          Unit
        </span>
        <div className="flex-1 flex gap-0.5 bg-[#f3f1f8] rounded-md p-0.5">
          {UNIT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField("spacingUnit", opt.value)}
              className={`flex-1 py-1 rounded text-center font-['Poppins',sans-serif] text-[10px] transition-colors cursor-pointer ${
                unit === opt.value
                  ? "bg-ds-purple text-white shadow-sm"
                  : "text-ds-dark-gray hover:bg-white/60"
              }`}
              style={{ fontWeight: unit === opt.value ? 600 : 500 }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Page Margins ── */}
      <PropSectionLabel label="Page Margins" />
      <div className="flex flex-col items-center gap-1">
        {/* Top */}
        <CanvasSpacingInput value={toDisplay(config.marginTop, "v")} onChange={(v) => handleMarginChange("Top", v)} label="top" linked={marginLinked} unit={unit} />
        <div className="flex items-center gap-1">
          {/* Left */}
          <CanvasSpacingInput value={toDisplay(config.marginLeft, "h")} onChange={(v) => handleMarginChange("Left", v)} label="left" linked={marginLinked} unit={unit} />
          {/* Link button */}
          <button
            type="button"
            onClick={() => setMarginLinked(!marginLinked)}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer shrink-0 ${
              marginLinked ? "bg-ds-purple text-white" : "bg-white border border-ds-haze text-ds-gray hover:border-ds-purple"
            }`}
            title={marginLinked ? "Unlink sides" : "Link all sides"}
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
              <path d="M7 2v4M7 8v4M2 7h4M8 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {/* Right */}
          <CanvasSpacingInput value={toDisplay(config.marginRight, "h")} onChange={(v) => handleMarginChange("Right", v)} label="right" linked={marginLinked} unit={unit} />
        </div>
        {/* Bottom */}
        <CanvasSpacingInput value={toDisplay(config.marginBottom, "v")} onChange={(v) => handleMarginChange("Bottom", v)} label="bottom" linked={marginLinked} unit={unit} />
      </div>

      {/* ── Content Padding ── */}
      <PropSectionLabel label="Content Padding" />
      <div className="flex flex-col items-center gap-1">
        <CanvasSpacingInput value={toDisplay(config.paddingTop, "v")} onChange={(v) => handlePaddingChange("Top", v)} label="top" linked={paddingLinked} unit={unit} />
        <div className="flex items-center gap-1">
          <CanvasSpacingInput value={toDisplay(config.paddingLeft, "h")} onChange={(v) => handlePaddingChange("Left", v)} label="left" linked={paddingLinked} unit={unit} />
          <button
            type="button"
            onClick={() => setPaddingLinked(!paddingLinked)}
            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer shrink-0 ${
              paddingLinked ? "bg-ds-purple text-white" : "bg-white border border-ds-haze text-ds-gray hover:border-ds-purple"
            }`}
            title={paddingLinked ? "Unlink sides" : "Link all sides"}
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
              <path d="M7 2v4M7 8v4M2 7h4M8 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <CanvasSpacingInput value={toDisplay(config.paddingRight, "h")} onChange={(v) => handlePaddingChange("Right", v)} label="right" linked={paddingLinked} unit={unit} />
        </div>
        <CanvasSpacingInput value={toDisplay(config.paddingBottom, "v")} onChange={(v) => handlePaddingChange("Bottom", v)} label="bottom" linked={paddingLinked} unit={unit} />
      </div>

      {/* ── Content Width ── */}
      <PropSectionLabel label="Content Width" />
      <PropSelect
        label="Mode"
        value={config.contentWidth}
        onChange={(v) => updateField("contentWidth", v as "full" | "boxed")}
        options={[
          { value: "full", label: "Full Width" },
          { value: "boxed", label: "Boxed" },
        ]}
      />
      {config.contentWidth === "boxed" && (
        <PropSlider
          label="Max Width"
          value={config.contentMaxWidth}
          min={300}
          max={1200}
          unit="px"
          onChange={(v) => updateField("contentMaxWidth", v)}
        />
      )}

      {/* ── Content Alignment (only functional in boxed mode) ── */}
      <PropSectionLabel label="Content Alignment" />
      {config.contentWidth === "full" && (
        <p className="font-['Poppins',sans-serif] text-[10px] text-[#aaa] -mt-1">
          Switch to Boxed mode to use alignment.
        </p>
      )}
      <div className="flex gap-1">
        {(["left", "center", "right"] as const).map((align) => {
          const isFull = config.contentWidth === "full";
          return (
            <button
              key={align}
              type="button"
              disabled={isFull}
              onClick={() => updateField("contentAlignment", align)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md transition-colors font-['Poppins',sans-serif] text-[10px] ${
                isFull
                  ? "bg-gray-50 border border-ds-haze text-[#c0c0c0] cursor-not-allowed"
                  : config.contentAlignment === align
                    ? "bg-ds-purple text-white cursor-pointer"
                    : "bg-white border border-ds-haze text-ds-dark-gray hover:border-ds-purple cursor-pointer"
              }`}
              style={{ fontWeight: 500 }}
            >
              {align === "left" && (
                <svg viewBox="0 0 14 10" fill="none" className="w-3 h-2.5">
                  <path d="M1 1h12M1 5h8M1 9h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
              {align === "center" && (
                <svg viewBox="0 0 14 10" fill="none" className="w-3 h-2.5">
                  <path d="M1 1h12M3 5h8M2 9h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
              {align === "right" && (
                <svg viewBox="0 0 14 10" fill="none" className="w-3 h-2.5">
                  <path d="M1 1h12M5 5h8M3 9h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ── Element Gap ── */}
      <PropSectionLabel label="Element Gap" />
      <PropSlider
        label="Gap"
        value={config.elementGap}
        min={0}
        max={60}
        unit="px"
        onChange={(v) => updateField("elementGap", v)}
      />

      {/* ── Global Typography hint ── */}
      {onSwitchToStyles && (
        <button
          type="button"
          onClick={onSwitchToStyles}
          className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-ds-purple-light/50 border border-ds-purple/10 cursor-pointer hover:bg-ds-purple-light transition-colors group mt-1"
        >
          <div className="text-ds-purple w-3.5 h-3.5 [&_svg]:w-3.5 [&_svg]:h-3.5 shrink-0">
            <StylesIcon />
          </div>
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-purple group-hover:text-ds-purple-dark transition-colors" style={{ fontWeight: 500 }}>
            Global font &amp; text styling options are in the <span style={{ fontWeight: 700 }}>Style</span> tab
          </span>
        </button>
      )}
    </div>
  );
}

// Small spacing input reused by the canvas margin/padding sections
function CanvasSpacingInput({
  value,
  onChange,
  label,
  linked,
  unit = "px",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  linked: boolean;
  unit?: SpacingUnit;
}) {
  // Allow the user to freely edit while focused, commit on blur
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const handleFocus = () => {
    setDraft(value);
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    onChange(draft);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Step size varies by unit
  const step = unit === "px" ? 1 : unit === "in" ? 0.05 : unit === "mm" ? 1 : 0.5;
  const inputWidth = unit === "px" ? 48 : 56;

  return (
    <div className="flex flex-col items-center gap-0.5" style={{ width: inputWidth }}>
      <div className="relative w-full">
        <input
          type="number"
          min={0}
          step={step}
          value={editing ? draft : value}
          onChange={(e) => {
            if (editing) {
              setDraft(e.target.value);
            } else {
              onChange(e.target.value);
            }
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full border rounded text-center font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none bg-white transition-colors py-1 pr-0.5 ${
            linked
              ? "border-ds-purple/50 ring-1 ring-ds-purple/20 focus:border-ds-purple"
              : "border-ds-haze focus:border-ds-purple"
          }`}
          style={{ fontWeight: 500 }}
        />
      </div>
      <span className="font-['Poppins',sans-serif] text-[8px] text-ds-light-gray uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// =====================================================================
// Canvas Styles Panel (Styles tab when canvas is selected)
// =====================================================================
function CanvasStylesPanel({
  config,
  onChange,
}: {
  config: CanvasConfig;
  onChange: React.Dispatch<React.SetStateAction<CanvasConfig>>;
}) {
  const updateField = <K extends keyof CanvasConfig>(key: K, value: CanvasConfig[K]) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      {/* Canvas header badge */}
      <div className="flex items-center gap-2 pb-1 border-b border-ds-haze">
        <div className="w-5 h-5 rounded bg-ds-purple-light flex items-center justify-center text-ds-purple">
          <CanvasSettingsIcon />
        </div>
        <span
          className="font-['Montserrat',sans-serif] text-[12px] text-ds-purple"
          style={{ fontWeight: 700 }}
        >
          Canvas Styles
        </span>
      </div>

      {/* ── Background Color ── */}
      <PropSectionLabel label="Background" />
      <PropColorPicker
        label="Color"
        value={config.bgColor}
        onChange={(v) => updateField("bgColor", v)}
      />

      {/* ── Page Border ── */}
      <PropSectionLabel label="Page Border" />
      <PropSelect
        label="Style"
        value={config.borderStyle}
        onChange={(v) => updateField("borderStyle", v as CanvasConfig["borderStyle"])}
        options={[
          { value: "none", label: "None" },
          { value: "solid", label: "Solid" },
          { value: "dashed", label: "Dashed" },
          { value: "dotted", label: "Dotted" },
        ]}
      />
      {config.borderStyle !== "none" && (
        <div className="contents">
          <PropSlider
            label="Width"
            value={config.borderWidth}
            min={1}
            max={8}
            unit="px"
            onChange={(v) => updateField("borderWidth", v)}
          />
          <PropColorPicker
            label="Color"
            value={config.borderColor}
            onChange={(v) => updateField("borderColor", v)}
          />
        </div>
      )}

      {/* ── Global Typography ── */}
      <GlobalTypographyEditor
        typography={config.globalTypography ?? defaultGlobalTypography}
        onChange={(gt) => updateField("globalTypography", gt)}
      />
    </div>
  );
}

// =====================================================================
// Global Typography Editor (inside CanvasStylesPanel)
// =====================================================================

const GLOBAL_TYPO_SECTIONS: { key: GlobalTypographyKey; label: string }[] = [
  { key: "templateTitle", label: "Template Title" },
  { key: "templateDescription", label: "Template Description" },
  { key: "h1", label: "Heading 1 (H1)" },
  { key: "h2", label: "Heading 2 (H2)" },
  { key: "h3", label: "Heading 3 (H3)" },
  { key: "h4", label: "Heading 4 (H4)" },
  { key: "h5", label: "Heading 5 (H5)" },
  { key: "h6", label: "Heading 6 (H6)" },
  { key: "paragraph", label: "Paragraph" },
];

function GlobalTypographyEditor({
  typography,
  onChange,
}: {
  typography: GlobalTypography;
  onChange: (gt: GlobalTypography) => void;
}) {
  const [expanded, setExpanded] = React.useState<GlobalTypographyKey | null>(null);

  const updateStyle = (key: GlobalTypographyKey, field: keyof GlobalTextStyle, value: string | number) => {
    onChange({
      ...typography,
      [key]: { ...typography[key], [field]: value },
    });
  };

  const resetSection = (key: GlobalTypographyKey) => {
    onChange({
      ...typography,
      [key]: { ...defaultGlobalTypography[key] },
    });
  };

  const resetAll = () => {
    onChange({ ...defaultGlobalTypography });
  };

  const hasAnyChanges = GLOBAL_TYPO_SECTIONS.some((s) => {
    const cur = typography[s.key];
    const def = defaultGlobalTypography[s.key];
    return (
      cur.fontFamily !== def.fontFamily ||
      cur.fontSize !== def.fontSize ||
      cur.fontWeight !== def.fontWeight ||
      cur.color !== def.color ||
      cur.textAlign !== def.textAlign
    );
  });

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex items-center justify-between">
        <PropSectionLabel label="Global Typography" />
        {hasAnyChanges && (
          <button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Reset all global typography to defaults"
          >
            <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M2 2v5h5M14 14v-5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.5 6A6 6 0 0 0 3.8 3.8L2 7m12 3l-1.8 3.2A6 6 0 0 1 2.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-['Poppins',sans-serif] text-[8px]" style={{ fontWeight: 600 }}>Reset All</span>
          </button>
        )}
      </div>
      <p className="font-['Poppins',sans-serif] text-[10px] text-ds-light-gray -mt-1">
        Set default styles for all text elements. Widgets can override these individually.
      </p>

      {GLOBAL_TYPO_SECTIONS.map(({ key, label }) => {
        const isOpen = expanded === key;
        const style = typography[key];
        const def = defaultGlobalTypography[key];
        const sectionChanged =
          style.fontFamily !== def.fontFamily ||
          style.fontSize !== def.fontSize ||
          style.fontWeight !== def.fontWeight ||
          style.color !== def.color ||
          style.textAlign !== def.textAlign;

        return (
          <GlobalTypoSection
            key={key}
            typoKey={key}
            label={label}
            style={style}
            isOpen={isOpen}
            sectionChanged={sectionChanged}
            onToggle={() => setExpanded(isOpen ? null : key)}
            onUpdate={(field, value) => updateStyle(key, field, value)}
            onReset={() => resetSection(key)}
          />
        );
      })}
    </div>
  );
}

function GlobalTypoSection({
  typoKey,
  label,
  style,
  isOpen,
  sectionChanged,
  onToggle,
  onUpdate,
  onReset,
}: {
  typoKey: GlobalTypographyKey;
  label: string;
  style: GlobalTextStyle;
  isOpen: boolean;
  sectionChanged: boolean;
  onToggle: () => void;
  onUpdate: (field: keyof GlobalTextStyle, value: string | number) => void;
  onReset: () => void;
}) {
  React.useEffect(() => { loadGoogleFont(style.fontFamily); }, [style.fontFamily]);

  const grouped = React.useMemo(() => {
    const cats: Record<string, typeof GOOGLE_FONTS> = {};
    for (const f of GOOGLE_FONTS) {
      (cats[f.category] ??= []).push(f);
    }
    return cats;
  }, []);

  return (
    <div className="border border-ds-haze rounded-md overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 bg-[#fafafa] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            className={`text-ds-gray transition-transform ${isOpen ? "rotate-90" : ""}`}
          >
            <path d="M2 1l4 3-4 3z" fill="currentColor" />
          </svg>
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-dark-gray" style={{ fontWeight: 600 }}>
            {label}
          </span>
          {sectionChanged && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Modified from default" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded-sm border border-ds-haze"
            style={{ backgroundColor: style.color }}
            title={style.color}
          />
          <span className="font-['Poppins',sans-serif] text-[9px] text-ds-light-gray">
            {style.fontSize}px
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2 px-2 py-2 border-t border-ds-haze bg-white">
          <div className="flex flex-col gap-1">
            <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
              Font Family
            </span>
            <select
              value={style.fontFamily}
              onChange={(e) => {
                loadGoogleFont(e.target.value);
                onUpdate("fontFamily", e.target.value);
              }}
              style={{ fontFamily: fontFamilyCSS(style.fontFamily) }}
              className="w-full border border-ds-haze rounded-md px-1.5 py-1 text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white cursor-pointer"
            >
              {Object.entries(grouped).map(([cat, fonts]) => (
                <optgroup key={cat} label={cat}>
                  {fonts.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex flex-col gap-1">
              <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
                Size (px)
              </span>
              <input
                type="number"
                min={6}
                max={120}
                value={style.fontSize}
                onChange={(e) => onUpdate("fontSize", Math.max(6, Math.min(120, Number(e.target.value) || 13)))}
                className="w-full border border-ds-haze rounded-md px-2 py-1 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
                Weight
              </span>
              <select
                value={String(style.fontWeight)}
                onChange={(e) => onUpdate("fontWeight", Number(e.target.value))}
                className="w-full border border-ds-haze rounded-md px-1.5 py-1 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white cursor-pointer"
              >
                {FONT_WEIGHT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <PropColorPicker label="Text Color" value={style.color} onChange={(v) => onUpdate("color", v)} />

          <div className="flex flex-col gap-1">
            <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
              Text Align
            </span>
            <div className="flex gap-1">
              {TEXT_ALIGN_OPTIONS.map(({ value, icon, label: alignLabel }) => {
                const active = style.textAlign === value;
                return (
                  <button
                    key={value}
                    type="button"
                    title={alignLabel}
                    onClick={() => onUpdate("textAlign", value)}
                    className={`flex-1 flex items-center justify-center py-1 rounded-md border transition-colors cursor-pointer ${
                      active
                        ? "bg-ds-purple border-ds-purple text-white"
                        : "bg-white border-ds-haze text-ds-gray hover:border-ds-purple/50"
                    }`}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>

          {sectionChanged && (
            <button
              type="button"
              onClick={onReset}
              className="self-end flex items-center gap-1 px-2 py-1 rounded bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer mt-0.5"
              title={`Reset ${label} to built-in defaults`}
            >
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 2v5h5M14 14v-5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.5 6A6 6 0 0 0 3.8 3.8L2 7m12 3l-1.8 3.2A6 6 0 0 1 2.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="font-['Poppins',sans-serif] text-[9px]" style={{ fontWeight: 500 }}>Reset</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Structure Tree View — Elementor-style with full DnD reordering
// =====================================================================

/** Drag-handle grip icon (6-dot pattern) */
function GripIcon() {
  return (
    <svg viewBox="0 0 10 16" fill="none" className="w-2.5 h-3.5">
      <circle cx="3" cy="2.5" r="1" fill="currentColor" />
      <circle cx="7" cy="2.5" r="1" fill="currentColor" />
      <circle cx="3" cy="8" r="1" fill="currentColor" />
      <circle cx="7" cy="8" r="1" fill="currentColor" />
      <circle cx="3" cy="13.5" r="1" fill="currentColor" />
      <circle cx="7" cy="13.5" r="1" fill="currentColor" />
    </svg>
  );
}

/**
 * Thin drop-indicator zone placed between tree nodes.
 * Shows a horizontal line when a valid drag hovers, and fires `onDrop`
 * with the target context and insertion index.
 */
function StructureDropZone({
  targetContext,
  insertIndex,
  depth,
  onDrop,
  elements,
}: {
  targetContext: StructureNodeContext;
  insertIndex: number;
  depth: number;
  onDrop: (item: StructureDragItem, targetCtx: StructureNodeContext, insertIdx: number) => void;
  elements: CanvasElement[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop: ok }, drop] = useDrop<StructureDragItem, void, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: ITEM_TYPE_STRUCTURE,
    canDrop: (item) => {
      // Dropping at original position is a no-op
      if (isSameContext(item.sourceContext, targetContext)) {
        if (item.sourceIndex === insertIndex || item.sourceIndex === insertIndex - 1) return false;
      }
      // Don't allow dropping a container into itself or a descendant
      if (targetContext.type === "cell") {
        const el = findElementById(elements, item.id);
        if (el && isIdInsideElement(el, targetContext.containerId)) return false;
        if (el && el.type === "container") {
          const targetDepth = getContainerDepth(elements, targetContext.containerId);
          const elDepth = getMaxDepthOfElement(el);
          if (targetDepth + elDepth >= MAX_CONTAINER_DEPTH) return false;
        }
      }
      return true;
    },
    drop: (item) => {
      onDrop(item, targetContext, insertIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [targetContext, insertIndex, onDrop, elements]);

  drop(ref);

  const active = isOver && ok;

  return (
    <div
      ref={ref}
      className="relative transition-all"
      style={{
        height: active ? 3 : 2,
        marginLeft: `${8 + depth * 14}px`,
        marginRight: 8,
      }}
    >
      {active && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-ds-purple rounded-full">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-ds-purple -translate-x-1/2" />
        </div>
      )}
    </div>
  );
}

/**
 * A single row in the structure tree — drag source only (via grip handle).
 * Renders its children recursively with drop zones between them.
 */
function StructureTreeNode({
  el,
  depth,
  selectedId,
  onSelect,
  onDelete,
  index,
  context,
  onStructureMove,
  elements,
}: {
  el: CanvasElement;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
  context: StructureNodeContext;
  onStructureMove: (item: StructureDragItem, targetCtx: StructureNodeContext, insertIdx: number) => void;
  elements: CanvasElement[];
}) {
  const [expanded, setExpanded] = useState(true);
  const icon = WIDGET_ICON_MAP[el.type];
  const isSelected = selectedId === el.id;
  const isContainer = el.type === "container";

  const hasAnyChildren = isContainer && el.children && el.children.some((row) => row.some((cell) => cell.length > 0));
  const totalCells = isContainer && el.children
    ? el.children.reduce((sum, row) => sum + row.length, 0)
    : 0;
  const isMultiCell = totalCells > 1;
  const isExpandable = isContainer && !!el.children;

  // ── Drag source (grip handle only) — auto-selects on drag start ──
  const [{ isDragging }, drag, dragPreview] = useDrag<StructureDragItem, void, { isDragging: boolean }>(() => ({
    type: ITEM_TYPE_STRUCTURE,
    item: () => {
      onSelect(el.id);
      return { id: el.id, sourceIndex: index, sourceContext: context, elementType: el.type };
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [el.id, index, context, onSelect]);

  const previewRef = useRef<HTMLDivElement>(null);
  dragPreview(previewRef);

  /** Render a single cell's children with drop zones interleaved */
  const renderCellChildren = (
    cell: CanvasElement[],
    rowIdx: number,
    colIdx: number,
    childDepth: number,
  ) => {
    const cellCtx: StructureNodeContext = { type: "cell", containerId: el.id, rowIdx, colIdx };
    return (
      <div key={`cell-${rowIdx}-${colIdx}`}>
        {/* Drop zone at top of cell */}
        <StructureDropZone
          targetContext={cellCtx}
          insertIndex={0}
          depth={childDepth}
          onDrop={onStructureMove}
          elements={elements}
        />
        {cell.map((child, childIdx) => (
          <div key={child.id} className="contents">
            <StructureTreeNode
              el={child}
              depth={childDepth}
              selectedId={selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
              index={childIdx}
              context={cellCtx}
              onStructureMove={onStructureMove}
              elements={elements}
            />
            {/* Drop zone after each child */}
            <StructureDropZone
              targetContext={cellCtx}
              insertIndex={childIdx + 1}
              depth={childDepth}
              onDrop={onStructureMove}
              elements={elements}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderChildren = () => {
    if (!isExpandable || !expanded || !el.children) return null;
    return (
      <div>
        {isMultiCell ? (
          // ── Multi-cell: show Column N headers with per-cell drop zones ──
          el.children.map((row, rowIdx) => {
            let colCounter = 0;
            return (
              <div key={`row-${rowIdx}`}>
                {row.map((cell, colIdx) => {
                  colCounter++;
                  const colLabel = `Column ${colCounter}`;
                  const cellCtx: StructureNodeContext = { type: "cell", containerId: el.id, rowIdx, colIdx };
                  return (
                    <div key={`cell-${rowIdx}-${colIdx}`}>
                      {/* Column header (non-draggable) */}
                      <div
                        className="flex items-center gap-1.5 py-1 select-none"
                        style={{ paddingLeft: `${8 + (depth + 1) * 14}px`, paddingRight: 8 }}
                      >
                        <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5 text-ds-teal/50">
                          <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-teal/70" style={{ fontWeight: 500 }}>
                          {colLabel}
                        </span>
                        <span className="font-['Poppins',sans-serif] text-[8px] text-ds-gray/40">
                          {cell.length}
                        </span>
                      </div>
                      {/* Cell children with drop zones, or empty-cell drop zone */}
                      {cell.length > 0 ? (
                        renderCellChildren(cell, rowIdx, colIdx, depth + 2)
                      ) : (
                        <div className="contents">
                          <StructureDropZone
                            targetContext={cellCtx}
                            insertIndex={0}
                            depth={depth + 2}
                            onDrop={onStructureMove}
                            elements={elements}
                          />
                          <div
                            className="flex items-center gap-1.5 py-0.5"
                            style={{ paddingLeft: `${8 + (depth + 2) * 14}px` }}
                          >
                            <span className="font-['Poppins',sans-serif] text-[9px] text-ds-light-gray italic">
                              Empty
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          // ── Single-cell: children directly under container with drop zones ──
          el.children.map((row, rowIdx) =>
            row.map((cell, colIdx) =>
              renderCellChildren(cell, rowIdx, colIdx, depth + 1)
            )
          )
        )}
        {/* Empty single-cell container hint + drop zone */}
        {!isMultiCell && !hasAnyChildren && (
          <div className="contents">
            <StructureDropZone
              targetContext={{ type: "cell", containerId: el.id, rowIdx: 0, colIdx: 0 }}
              insertIndex={0}
              depth={depth + 1}
              onDrop={onStructureMove}
              elements={elements}
            />
            <div
              className="flex items-center gap-1.5 py-1"
              style={{ paddingLeft: `${10 + (depth + 1) * 14}px` }}
            >
              <span className="font-['Poppins',sans-serif] text-[9px] text-ds-light-gray italic">
                Empty — drag widgets here
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ opacity: isDragging ? 0.4 : 1 }}>
      <div
        ref={previewRef}
        onClick={() => onSelect(el.id)}
        className={`group w-full flex items-center gap-1 py-1.5 text-left cursor-pointer transition-colors ${
          isSelected
            ? "bg-ds-purple-light border-l-2 border-ds-purple"
            : "hover:bg-white/60 border-l-2 border-transparent"
        }`}
        style={{ paddingLeft: `${4 + depth * 14}px`, paddingRight: 8 }}
      >
        {/* Drag handle — always subtly visible, full color on hover */}
        <div
          ref={drag}
          className="shrink-0 w-5 h-5 flex items-center justify-center text-ds-haze hover:text-ds-purple cursor-grab active:cursor-grabbing transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <GripIcon />
        </div>

        {/* Expand/collapse chevron for containers */}
        {isExpandable ? (
          <div
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="shrink-0 w-4 h-4 flex items-center justify-center text-ds-purple/50 hover:text-ds-purple transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); setExpanded((v) => !v); } }}
          >
            <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
              <path
                d={expanded ? "M2 4l4 4 4-4" : "M4 2l4 4-4 4"}
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <span className="shrink-0 w-4" />
        )}

        {/* Widget icon */}
        <div className={`shrink-0 w-3.5 h-3.5 [&_svg]:w-3.5 [&_svg]:h-3.5 ${isSelected ? "text-ds-purple" : "text-ds-gray"}`}>
          {icon}
        </div>

        {/* Label */}
        <span
          className={`font-['Poppins',sans-serif] text-[11px] truncate flex-1 ${isSelected ? "text-ds-purple" : "text-ds-dark-gray"}`}
          style={{ fontWeight: isSelected ? 600 : 400 }}
        >
          {el.label}
        </span>

        {/* Child count badge for containers */}
        {isContainer && hasAnyChildren && (
          <span className="font-['Poppins',sans-serif] text-[9px] text-ds-purple/50 bg-ds-purple-light/60 px-1.5 py-0.5 rounded-full shrink-0">
            {el.children!.reduce((sum, row) => sum + row.reduce((s, cell) => s + cell.length, 0), 0)}
          </span>
        )}

        {/* Delete */}
        <div
          onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-ds-light-gray hover:text-red-500 shrink-0 cursor-pointer"
        >
          <TrashIcon />
        </div>
      </div>

      {renderChildren()}
    </div>
  );
}

function StructureView({
  elements,
  selectedId,
  onSelect,
  onDelete,
  onStructureMove,
}: {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onStructureMove: (item: StructureDragItem, targetCtx: StructureNodeContext, insertIdx: number) => void;
}) {
  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-3">
        <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray text-center">
          No elements added yet
        </span>
      </div>
    );
  }

  const rootCtx: StructureNodeContext = { type: "root" };

  return (
    <div className="flex flex-col py-1">
      {/* Drop zone before first element */}
      <StructureDropZone
        targetContext={rootCtx}
        insertIndex={0}
        depth={0}
        onDrop={onStructureMove}
        elements={elements}
      />
      {elements.map((el, idx) => (
        <div key={el.id} className="contents">
          <StructureTreeNode
            el={el}
            depth={0}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            index={idx}
            context={rootCtx}
            onStructureMove={onStructureMove}
            elements={elements}
          />
          {/* Drop zone after each element */}
          <StructureDropZone
            targetContext={rootCtx}
            insertIndex={idx + 1}
            depth={0}
            onDrop={onStructureMove}
            elements={elements}
          />
        </div>
      ))}
    </div>
  );
}

// =====================================================================
// Styles View — universal: bg, opacity, border, radius, shadow
// =====================================================================
function StylesView({
  selectedElement,
  onUpdateConfig,
}: {
  selectedElement: CanvasElement | null;
  onUpdateConfig: (id: string, config: Record<string, string | number | boolean>) => void;
}) {
  if (!selectedElement) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-3 gap-2">
        <div className="w-10 h-10 rounded-full bg-ds-purple-light flex items-center justify-center text-ds-purple">
          <StylesIcon />
        </div>
        <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray text-center">
          Select an element to edit its styles
        </span>
      </div>
    );
  }

  const globalTypo = React.useContext(GlobalTypographyContext);
  const config = selectedElement.config;
  const batchUpdate = (updates: Record<string, string | number | boolean>) => {
    onUpdateConfig(selectedElement.id, { ...config, ...updates });
  };
  const updateField = (key: string, value: string | number | boolean) => {
    onUpdateConfig(selectedElement.id, { ...config, [key]: value });
  };
  const isTextWidget = TEXT_WIDGET_TYPES.has(selectedElement.type);

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* ── Element badge ── */}
      <div className="flex items-center gap-2 pb-2 border-b border-ds-haze">
        <div className="text-ds-purple w-5 h-5 [&_svg]:w-5 [&_svg]:h-5">
          {WIDGET_ICON_MAP[selectedElement.type]}
        </div>
        <span
          className="font-['Montserrat',sans-serif] text-[12px] text-ds-purple-dark"
          style={{ fontWeight: 700 }}
        >
          {WIDGET_TYPE_LABELS[selectedElement.type]}
        </span>
      </div>

      {/* ── Typography (all text-based widgets, Elementor-style with global preset selector) ── */}
      {isTextWidget && (
        <TypographyControls
          widgetType={selectedElement.type}
          config={config}
          globalTypo={globalTypo}
          onUpdateField={updateField}
          onBatchUpdate={batchUpdate}
        />
      )}

      {/* ── Background Color ── */}
      <PropSectionLabel label="Background" />
      <PropColorPicker
        label="Color"
        value={String(config.bgColor || "#ffffff")}
        onChange={(v) => updateField("bgColor", v)}
      />

      {/* ── Opacity ── */}
      <PropSectionLabel label="Opacity" />
      <PropSlider
        label="Opacity"
        value={Number(config.opacity ?? 100)}
        min={0}
        max={100}
        unit="%"
        onChange={(v) => updateField("opacity", v)}
      />

      {/* ── Border ── */}
      <PropSectionLabel label="Border" />
      <PropSelect
        label="Style"
        value={String(config.borderStyle || "solid")}
        onChange={(v) => updateField("borderStyle", v)}
        options={[
          { value: "none",   label: "None"   },
          { value: "solid",  label: "Solid"  },
          { value: "dashed", label: "Dashed" },
          { value: "dotted", label: "Dotted" },
        ]}
      />
      {String(config.borderStyle || "solid") !== "none" && (
        <div className="contents">
          <PropColorPicker
            label="Color"
            value={String(config.borderColor || "#e0dff0")}
            onChange={(v) => {
              // Auto-commit borderStyle so the border persists in preview
              if (!config.borderStyle) {
                batchUpdate({ borderColor: v, borderStyle: "solid" });
              } else {
                updateField("borderColor", v);
              }
            }}
          />
          <PropBorderWidthSection
            config={config}
            onBatchUpdate={(updates) => {
              // Auto-commit borderStyle so the border persists in preview
              if (!config.borderStyle) {
                batchUpdate({ ...updates, borderStyle: "solid" });
              } else {
                batchUpdate(updates);
              }
            }}
          />
        </div>
      )}

      {/* ── Border Radius ── */}
      <PropSectionLabel label="Border Radius" />
      <PropRadiusSection
        config={config}
        onBatchUpdate={batchUpdate}
      />

      {/* ── Box Shadow ── */}
      <PropSectionLabel label="Box Shadow" />
      <PropShadowPicker
        value={String(config.shadow || "none")}
        onChange={(v) => updateField("shadow", v)}
      />
    </div>
  );
}

// =====================================================================
// Container Layout Panel — Elementor-style flexbox controls
// =====================================================================
function ContainerIconBtn({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`flex items-center justify-center w-8 h-8 rounded-md border transition-colors cursor-pointer ${
        active
          ? "bg-ds-purple border-ds-purple text-white"
          : "bg-white border-ds-haze text-ds-gray hover:border-ds-purple/50 hover:text-ds-purple"
      }`}
    >
      {children}
    </button>
  );
}

function ContainerLayoutPanel({
  config,
  elementId,
  onUpdateConfig,
  elements,
}: {
  config: Record<string, string | number | boolean>;
  elementId: string;
  onUpdateConfig: (id: string, config: Record<string, string | number | boolean>) => void;
  elements: CanvasElement[];
}) {
  const updateField = (key: string, value: string | number | boolean) => {
    onUpdateConfig(elementId, { ...config, [key]: value });
  };
  const batchUpdate = (updates: Record<string, string | number | boolean>) => {
    onUpdateConfig(elementId, { ...config, ...updates });
  };

  const flexDir = String(config.flexDirection || "column");
  const justifyContent = String(config.justifyContent || "flex-start");
  const alignItems = String(config.alignItems || "stretch");
  const flexWrap = String(config.flexWrap || "nowrap");
  const gapColumn = Number(config.gapColumn ?? config.gap ?? 12);
  const gapRow = Number(config.gapRow ?? config.gap ?? 12);
  const gapsLinked = config.gapsLinked !== false;
  const containerWidth = Number(config.containerWidth ?? 100);
  const containerWidthUnit = String(config.containerWidthUnit || "%");
  const containerMinHeight = Number(config.containerMinHeight ?? 0);
  const containerMinHeightUnit = String(config.containerMinHeightUnit || "px");
  const contentWidth = String(config.contentWidth || "full");
  const contentMaxWidth = Number(config.contentMaxWidth ?? 800);
  const contentAlignment = String(config.contentAlignment || "center");

  // Determine if current preset is single-cell (direction only applies to single-cell presets)
  let parsedRowsPanel: number[][] = [[1]];
  try { parsedRowsPanel = JSON.parse(String(config.rows || "[[1]]")); } catch { /* fallback */ }
  const isSingleCellPreset = parsedRowsPanel.length === 1 && parsedRowsPanel[0].length === 1;
  const currentEqualCols = getEqualColumnCount(parsedRowsPanel);

  // Nested containers are forced to 100% width by the builder (cell flex handles sizing),
  // so hide the Width control for nested containers to avoid misleading the user.
  const isNested = !elements.some((el) => el.id === elementId);

  // Only top-level containers can pick multi-cell presets
  const isTopLevel = isTopLevelElement(elements, elementId);
  const availablePresets = isTopLevel
    ? CONTAINER_PRESETS
    : CONTAINER_PRESETS.filter((p) => p.rows.length === 1 && p.rows[0].length === 1);

  /** Apply a structure preset (handles direction logic) */
  const applyPreset = (preset: ContainerPreset) => {
    const isSingleCell = preset.rows.length === 1 && preset.rows[0].length === 1;
    const currentDir = String(config.direction || "vertical");
    const dir = isSingleCell ? currentDir : "horizontal";
    onUpdateConfig(elementId, {
      ...config,
      structurePicked: true,
      layout: preset.id,
      rows: JSON.stringify(preset.rows),
      direction: dir,
      flexDirection: dir === "horizontal" ? "row" : "column",
    });
  };

  return (
    <div className="contents">
      {/* ═══ Container Section ═══ */}
      <PropSectionLabel label="Container" />

      <div className="flex flex-col gap-1.5">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Structure
        </span>
        <div className="grid grid-cols-6 gap-1.5">
          {availablePresets.map((preset) => (
            <button
              key={preset.id}
              title={preset.label}
              onClick={() => applyPreset(preset)}
              className={`aspect-[4/3] rounded border-2 p-1 transition-all cursor-pointer ${
                String(config.layout) === preset.id
                  ? "border-ds-purple bg-ds-purple-light/40"
                  : "border-ds-haze bg-white hover:border-ds-purple/50 hover:bg-ds-purple-light/10"
              }`}
            >
              <StructureThumbnail preset={preset} size="sm" />
            </button>
          ))}
        </div>
        {/* Custom equal-columns stepper — only for top-level containers */}
        {isTopLevel && (
          <div className="flex items-center gap-2 mt-1">
            <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
              Columns
            </span>
            <div className="flex items-center border border-ds-haze rounded-md overflow-hidden">
              <button
                className="px-1.5 py-0.5 text-[11px] text-ds-dark-gray hover:bg-ds-purple-light/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!currentEqualCols || currentEqualCols <= 1}
                onClick={() => currentEqualCols && applyPreset(makeEqualColumnsPreset(currentEqualCols - 1))}
              >
                {"\u2212"}
              </button>
              <input
                type="number"
                min={1}
                max={12}
                value={currentEqualCols ?? ""}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= 12) {
                    applyPreset(makeEqualColumnsPreset(val));
                  }
                }}
                className="w-8 py-0.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none bg-white text-center border-x border-ds-haze"
              />
              <button
                className="px-1.5 py-0.5 text-[11px] text-ds-dark-gray hover:bg-ds-purple-light/20 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={!currentEqualCols || currentEqualCols >= 12}
                onClick={() => currentEqualCols && applyPreset(makeEqualColumnsPreset(currentEqualCols + 1))}
              >
                +
              </button>
            </div>
            <span className="font-['Poppins',sans-serif] text-[9px] text-ds-teal/70 italic">
              {`1\u201312`}
            </span>
          </div>
        )}
      </div>

      {/* Content Width */}
      <PropSelect
        label="Content Width"
        value={contentWidth}
        onChange={(v) => updateField("contentWidth", v)}
        options={[
          { value: "full", label: "Full Width" },
          { value: "boxed", label: "Boxed" },
        ]}
      />
      {contentWidth === "boxed" && (
        <div className="contents">
          <div className="flex flex-col gap-1">
            <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
              Max Width (px)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={100}
                max={1920}
                value={contentMaxWidth}
                onChange={(e) => updateField("contentMaxWidth", Number(e.target.value))}
                className="flex-1 accent-ds-purple cursor-pointer"
                style={{ accentColor: "#46367F" }}
              />
              <input
                type="number"
                min={100}
                max={9999}
                value={contentMaxWidth}
                onChange={(e) => updateField("contentMaxWidth", Number(e.target.value) || 100)}
                className="w-14 border border-ds-haze rounded-md px-1.5 py-1 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white text-center"
              />
            </div>
          </div>
          <PropSelect
            label="Content Alignment"
            value={contentAlignment}
            onChange={(v) => updateField("contentAlignment", v)}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
          />
        </div>
      )}

      {/* Width — hidden for nested containers (builder forces 100%, cell flex handles sizing) */}
      {!isNested && (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
            Width
          </span>
          <select
            value={containerWidthUnit}
            onChange={(e) => updateField("containerWidthUnit", e.target.value)}
            className="w-10 border border-ds-haze rounded px-0.5 py-0.5 font-['Poppins',sans-serif] text-[9px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white cursor-pointer appearance-none text-center"
          >
            <option value="%">%</option>
            <option value="px">px</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={containerWidthUnit === "%" ? 100 : 1920}
            value={containerWidth}
            onChange={(e) => updateField("containerWidth", Number(e.target.value))}
            className="flex-1 accent-ds-purple cursor-pointer"
            style={{ accentColor: "#46367F" }}
          />
          <input
            type="number"
            min={0}
            max={containerWidthUnit === "%" ? 100 : 9999}
            value={containerWidth}
            onChange={(e) => updateField("containerWidth", Number(e.target.value) || 0)}
            className="w-14 border border-ds-haze rounded-md px-1.5 py-1 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white text-center"
          />
        </div>
      </div>
      )}

      {/* Min Height */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
            Min Height
          </span>
          <select
            value={containerMinHeightUnit}
            onChange={(e) => updateField("containerMinHeightUnit", e.target.value)}
            className="w-10 border border-ds-haze rounded px-0.5 py-0.5 font-['Poppins',sans-serif] text-[9px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white cursor-pointer appearance-none text-center"
          >
            <option value="px">px</option>
            <option value="vh">vh</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={containerMinHeightUnit === "vh" ? 100 : 800}
            value={containerMinHeight}
            onChange={(e) => updateField("containerMinHeight", Number(e.target.value))}
            className="flex-1 accent-ds-purple cursor-pointer"
            style={{ accentColor: "#46367F" }}
          />
          <input
            type="number"
            min={0}
            value={containerMinHeight}
            onChange={(e) => updateField("containerMinHeight", Number(e.target.value) || 0)}
            className="w-14 border border-ds-haze rounded-md px-1.5 py-1 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white text-center"
          />
        </div>
        <span className="font-['Poppins',sans-serif] text-[9px] text-ds-teal/70 italic">
          To achieve full height Container use 100vh.
        </span>
      </div>

      {/* Overflow */}
      <PropSelect
        label="Overflow"
        value={String(config.overflow || "hidden")}
        onChange={(v) => updateField("overflow", v)}
        options={[
          { value: "visible", label: "Visible" },
          { value: "hidden", label: "Hidden" },
          { value: "scroll", label: "Scroll" },
          { value: "auto", label: "Auto" },
        ]}
      />

      {/* Z-Index */}
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Z-Index
        </span>
        <input
          type="number"
          min={-9999}
          max={9999}
          value={String(config.zIndex ?? "")}
          placeholder="Auto"
          onChange={(e) => updateField("zIndex", e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white"
        />
      </div>

      {/* CSS Class & ID */}
      <PropSectionLabel label="Advanced" />
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          CSS ID
        </span>
        <input
          type="text"
          value={String(config.cssId || "")}
          placeholder="e.g. my-section"
          onChange={(e) => updateField("cssId", e.target.value)}
          className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          CSS Classes
        </span>
        <input
          type="text"
          value={String(config.cssClass || "")}
          placeholder="e.g. highlight-section accent"
          onChange={(e) => updateField("cssClass", e.target.value)}
          className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white"
        />
      </div>

      {/* ═══ Items Section ═══ */}
      <PropSectionLabel label="Items" />

      {/* Direction — only for single-cell presets; multi-cell presets always use row for cells */}
      {isSingleCellPreset && (
      <div className="flex flex-col gap-1.5">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Direction
        </span>
        <div className="flex gap-1">
          {([
            { value: "row", label: "Row", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )},
            { value: "column", label: "Column", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M4 9l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )},
            { value: "row-reverse", label: "Row Reverse", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7H2M5 4L2 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )},
            { value: "column-reverse", label: "Column Reverse", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 12V2M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )},
          ] as { value: string; label: string; icon: React.ReactNode }[]).map(({ value, label, icon }) => (
            <ContainerIconBtn
              key={value}
              active={flexDir === value}
              onClick={() => batchUpdate({
                flexDirection: value,
                direction: (value === "row" || value === "row-reverse") ? "horizontal" : "vertical",
              })}
              title={label}
            >
              {icon}
            </ContainerIconBtn>
          ))}
        </div>
      </div>
      )}

      {/* Justify Content */}
      <div className="flex flex-col gap-1.5">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Justify Content
        </span>
        <div className="flex gap-1 flex-wrap">
          {([
            { value: "flex-start", label: "Start", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="1.5" height="8" rx="0.5" fill="currentColor"/><rect x="4" y="4" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="8" y="4" width="3" height="6" rx="0.5" fill="currentColor"/></svg>
            )},
            { value: "center", label: "Center", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="4" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="8.5" y="4" width="3" height="6" rx="0.5" fill="currentColor"/></svg>
            )},
            { value: "flex-end", label: "End", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="11.5" y="3" width="1.5" height="8" rx="0.5" fill="currentColor"/><rect x="3" y="4" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="7" y="4" width="3" height="6" rx="0.5" fill="currentColor"/></svg>
            )},
            { value: "space-between", label: "Space Between", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="1.5" height="8" rx="0.5" fill="currentColor"/><rect x="11.5" y="3" width="1.5" height="8" rx="0.5" fill="currentColor"/><rect x="2.5" y="4" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="8.5" y="4" width="3" height="6" rx="0.5" fill="currentColor"/></svg>
            )},
            { value: "space-around", label: "Space Around", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="4" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="8" y="4" width="3" height="6" rx="0.5" fill="currentColor"/></svg>
            )},
            { value: "space-evenly", label: "Space Evenly", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3.5" y="4" width="2.5" height="6" rx="0.5" fill="currentColor"/><rect x="8" y="4" width="2.5" height="6" rx="0.5" fill="currentColor"/></svg>
            )},
          ] as { value: string; label: string; icon: React.ReactNode }[]).map(({ value, label, icon }) => (
            <ContainerIconBtn
              key={value}
              active={justifyContent === value}
              onClick={() => updateField("justifyContent", value)}
              title={label}
            >
              {icon}
            </ContainerIconBtn>
          ))}
        </div>
      </div>

      {/* Align Items */}
      <div className="flex flex-col gap-1.5">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Align Items
        </span>
        <div className="flex gap-1">
          {([
            { value: "flex-start", label: "Start", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="1" width="8" height="1.5" rx="0.5" fill="currentColor"/><rect x="4" y="3" width="2.5" height="5" rx="0.5" fill="currentColor"/><rect x="7.5" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/></svg>
            )},
            { value: "center", label: "Center", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="7.5" y="2" width="2.5" height="10" rx="0.5" fill="currentColor"/></svg>
            )},
            { value: "flex-end", label: "End", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="11.5" width="8" height="1.5" rx="0.5" fill="currentColor"/><rect x="4" y="6.5" width="2.5" height="5" rx="0.5" fill="currentColor"/><rect x="7.5" y="3" width="2.5" height="8.5" rx="0.5" fill="currentColor"/></svg>
            )},
            { value: "stretch", label: "Stretch", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="1" width="8" height="1.5" rx="0.5" fill="currentColor"/><rect x="3" y="11.5" width="8" height="1.5" rx="0.5" fill="currentColor"/><rect x="4" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/><rect x="7.5" y="3" width="2.5" height="8" rx="0.5" fill="currentColor"/></svg>
            )},
          ] as { value: string; label: string; icon: React.ReactNode }[]).map(({ value, label, icon }) => (
            <ContainerIconBtn
              key={value}
              active={alignItems === value}
              onClick={() => updateField("alignItems", value)}
              title={label}
            >
              {icon}
            </ContainerIconBtn>
          ))}
        </div>
      </div>

      {/* Gaps */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
            Gaps
          </span>
          <span className="font-['Poppins',sans-serif] text-[9px] text-ds-gray/60">px</span>
        </div>
        <div className="flex gap-1.5 items-center">
          <div className="flex flex-col gap-0.5 flex-1">
            <input
              type="number"
              min={0}
              value={gapColumn}
              onChange={(e) => {
                const v = Math.max(0, Number(e.target.value) || 0);
                if (gapsLinked) {
                  batchUpdate({ gapColumn: v, gapRow: v });
                } else {
                  updateField("gapColumn", v);
                }
              }}
              className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white text-center"
            />
            <span className="font-['Poppins',sans-serif] text-[8px] text-ds-gray/60 text-center">Column</span>
          </div>
          <div className="flex flex-col gap-0.5 flex-1">
            <input
              type="number"
              min={0}
              value={gapRow}
              onChange={(e) => {
                const v = Math.max(0, Number(e.target.value) || 0);
                if (gapsLinked) {
                  batchUpdate({ gapColumn: v, gapRow: v });
                } else {
                  updateField("gapRow", v);
                }
              }}
              className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white text-center"
            />
            <span className="font-['Poppins',sans-serif] text-[8px] text-ds-gray/60 text-center">Row</span>
          </div>
          <button
            type="button"
            title={gapsLinked ? "Unlink gaps" : "Link gaps"}
            onClick={() => updateField("gapsLinked", !gapsLinked)}
            className={`w-7 h-7 flex items-center justify-center rounded-md border transition-colors cursor-pointer shrink-0 ${
              gapsLinked
                ? "bg-ds-purple border-ds-purple text-white"
                : "bg-white border-ds-haze text-ds-gray hover:border-ds-purple/50"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 3.5L7.5 3.5C8.6 3.5 9.5 4.4 9.5 5.5V6.5C9.5 7.6 8.6 8.5 7.5 8.5H4.5C3.4 8.5 2.5 7.6 2.5 6.5V5.5C2.5 4.4 3.4 3.5 4.5 3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Wrap */}
      <div className="flex flex-col gap-1.5">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Wrap
        </span>
        <div className="flex gap-1">
          {([
            { value: "nowrap", label: "No Wrap", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )},
            { value: "wrap", label: "Wrap", icon: (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h6M8 7c2 0 2 0 2 2v1M10 10l-1.5-1.5M10 10l1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )},
          ] as { value: string; label: string; icon: React.ReactNode }[]).map(({ value, label, icon }) => (
            <ContainerIconBtn
              key={value}
              active={flexWrap === value}
              onClick={() => updateField("flexWrap", value)}
              title={label}
            >
              {icon}
            </ContainerIconBtn>
          ))}
        </div>
        <span className="font-['Poppins',sans-serif] text-[9px] text-ds-gray/50 italic">
          Items within the container can stay in a single line (No wrap), or break into multiple lines (Wrap).
        </span>
      </div>

      {/* ═══ Section Title ═══ */}
      <PropSectionLabel label="Section Title" />
      <PropCheckbox
        label="Show Section Title"
        checked={!!config.showTitle}
        onChange={(v) => updateField("showTitle", v)}
      />
      {!!config.showTitle && (
        <PropInput
          label="Title"
          value={String(config.title || "")}
          onChange={(v) => updateField("title", v)}
        />
      )}
    </div>
  );
}

// =====================================================================
// Properties View
// =====================================================================
function PropertiesView({
  selectedElement,
  onUpdateConfig,
  images,
  onSwitchToStyles,
  elements,
}: {
  selectedElement: CanvasElement | null;
  onUpdateConfig: (id: string, config: Record<string, string | number | boolean>) => void;
  images: ImageDocument[];
  onSwitchToStyles?: () => void;
  elements: CanvasElement[];
}) {
  if (!selectedElement) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-3 gap-2">
        <div className="w-10 h-10 rounded-full bg-ds-purple-light flex items-center justify-center text-ds-purple">
          <SettingsIcon />
        </div>
        <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray text-center">
          Select an element to view its properties
        </span>
      </div>
    );
  }

  const config = selectedElement.config;
  const updateField = (key: string, value: string | number | boolean) => {
    onUpdateConfig(selectedElement.id, { ...config, [key]: value });
  };
  const batchUpdate = (updates: Record<string, string | number | boolean>) => {
    onUpdateConfig(selectedElement.id, { ...config, ...updates });
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* ── Element type badge ── */}
      <div className="flex items-center gap-2 pb-2 border-b border-ds-haze">
        <div className="text-ds-purple w-5 h-5 [&_svg]:w-5 [&_svg]:h-5">
          {WIDGET_ICON_MAP[selectedElement.type]}
        </div>
        <span
          className="font-['Montserrat',sans-serif] text-[12px] text-ds-purple-dark"
          style={{ fontWeight: 700 }}
        >
          {WIDGET_TYPE_LABELS[selectedElement.type]}
        </span>
      </div>

      {/* ══════════════════════════════════════════
          UNIVERSAL LAYOUT (applies to every widget)
          ══════════════════════════════════════════ */}

      {/* Width — hidden for containers (containerWidth supersedes) */}
      {selectedElement.type !== "container" && (
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 600 }}>
          Width
        </span>
        <div className="flex gap-1.5 items-center">
          <input
            type="number"
            min={1}
            max={9999}
            value={String(config.widthValue ?? 100)}
            disabled={String(config.widthUnit || "auto") === "auto"}
            onChange={(e) => updateField("widthValue", Number(e.target.value) || 1)}
            className="flex-1 border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white disabled:bg-[#f5f5f5] disabled:text-ds-light-gray"
          />
          <select
            value={String(config.widthUnit || "auto")}
            onChange={(e) => updateField("widthUnit", e.target.value)}
            className="w-14 border border-ds-haze rounded-md px-1.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white cursor-pointer appearance-none text-center"
          >
            <option value="auto">Auto</option>
            <option value="%">%</option>
            <option value="px">px</option>
          </select>
        </div>
      </div>
      )}

      {/* Min / Max Width — hidden for containers */}
      {selectedElement.type !== "container" && (
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex flex-col gap-1">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>Min W</span>
          <div className="flex gap-1">
            <input
              type="number"
              min={0}
              value={String(config.minWidth ?? "")}
              placeholder="—"
              onChange={(e) => updateField("minWidth", e.target.value)}
              className="flex-1 min-w-0 border border-ds-haze rounded-md px-1.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white"
            />
            <select
              value={String(config.minWidthUnit || "px")}
              onChange={(e) => updateField("minWidthUnit", e.target.value)}
              className="w-10 border border-ds-haze rounded-md px-0.5 py-1.5 font-['Poppins',sans-serif] text-[10px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white cursor-pointer appearance-none text-center"
            >
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>Max W</span>
          <div className="flex gap-1">
            <input
              type="number"
              min={0}
              value={String(config.maxWidth ?? "")}
              placeholder="—"
              onChange={(e) => updateField("maxWidth", e.target.value)}
              className="flex-1 min-w-0 border border-ds-haze rounded-md px-1.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white"
            />
            <select
              value={String(config.maxWidthUnit || "px")}
              onChange={(e) => updateField("maxWidthUnit", e.target.value)}
              className="w-10 border border-ds-haze rounded-md px-0.5 py-1.5 font-['Poppins',sans-serif] text-[10px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white cursor-pointer appearance-none text-center"
            >
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
      </div>
      )}

      {/* Height — hidden for containers (always auto) */}
      {selectedElement.type !== "container" && (
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 600 }}>
          Height
        </span>
        <div className="flex gap-1.5 items-center">
          <input
            type="number"
            min={1}
            max={9999}
            value={String(config.heightValue ?? 200)}
            disabled={String(config.heightUnit || "auto") === "auto"}
            onChange={(e) => updateField("heightValue", Number(e.target.value) || 1)}
            className="flex-1 border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white disabled:bg-[#f5f5f5] disabled:text-ds-light-gray"
          />
          <select
            value={String(config.heightUnit || "auto")}
            onChange={(e) => updateField("heightUnit", e.target.value)}
            className="w-14 border border-ds-haze rounded-md px-1.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white cursor-pointer appearance-none text-center"
          >
            <option value="auto">Auto</option>
            <option value="px">px</option>
          </select>
        </div>
      </div>
      )}

      {/* Horizontal Alignment */}
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 600 }}>
          Alignment
        </span>
        <div className="flex gap-1">
          {(
            [
              { value: "left",   icon: <AlignLeftIcon />,   label: "Left"   },
              { value: "center", icon: <AlignCenterIcon />, label: "Center" },
              { value: "right",  icon: <AlignRightIcon />,  label: "Right"  },
            ] as { value: string; icon: React.ReactNode; label: string }[]
          ).map(({ value, icon, label }) => {
            const active = String(config.alignment || "left") === value;
            return (
              <button
                key={value}
                type="button"
                title={label}
                onClick={() => updateField("alignment", value)}
                className={`flex-1 flex items-center justify-center py-1.5 rounded-md border transition-colors cursor-pointer ${
                  active
                    ? "bg-ds-purple border-ds-purple text-white"
                    : "bg-white border-ds-haze text-ds-gray hover:border-ds-purple/50"
                }`}
              >
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── divider between universal and widget-specific ─── */}
      <div className="border-t border-ds-haze pt-1">
        <span
          className="font-['Poppins',sans-serif] text-[10px] text-ds-gray uppercase tracking-wider"
          style={{ fontWeight: 600 }}
        >
          Widget Settings
        </span>
      </div>

      {/* ── Template Title ── */}
      {selectedElement.type === "template-title" && (
        <div className="contents">
          <PropCheckbox label="Show Border" checked={config.showBorder !== false} onChange={(v) => updateField("showBorder", v)} />
          {config.showBorder !== false && (
            <PropColorPicker label="Border Color" value={String(config.borderColor || "#46367F")} onChange={(v) => updateField("borderColor", v)} />
          )}
        </div>
      )}

      {/* ── Header ── */}
      {selectedElement.type === "header" && (
        <div className="contents">
          <PropInput label="Text" value={String(config.text || "")} onChange={(v) => updateField("text", v)} />
          <PropSelect
            label="Tag"
            value={String(config.tag || "H2")}
            onChange={(v) => updateField("tag", v)}
            options={[
              { value: "H1", label: "H1" },
              { value: "H2", label: "H2" },
              { value: "H3", label: "H3" },
              { value: "H4", label: "H4" },
              { value: "H5", label: "H5" },
              { value: "H6", label: "H6" },
            ]}
          />
        </div>
      )}

      {/* ── Paragraph ── */}
      {selectedElement.type === "paragraph" && (
        <PropTextarea label="Content" value={String(config.text || "")} onChange={(v) => updateField("text", v)} />
      )}

      {/* ── Typography hint for text widgets ── */}
      {["template-title", "template-description", "header", "paragraph"].includes(selectedElement.type) && onSwitchToStyles && (
        <button
          type="button"
          onClick={onSwitchToStyles}
          className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-ds-purple-light/50 border border-ds-purple/10 cursor-pointer hover:bg-ds-purple-light transition-colors group"
        >
          <div className="text-ds-purple w-3.5 h-3.5 [&_svg]:w-3.5 [&_svg]:h-3.5 shrink-0">
            <StylesIcon />
          </div>
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-purple group-hover:text-ds-purple-dark transition-colors" style={{ fontWeight: 500 }}>
            Font &amp; text styling options are in the <span style={{ fontWeight: 700 }}>Style</span> tab
          </span>
        </button>
      )}

      {/* ── Text Box ── */}
      {selectedElement.type === "text-box" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropInput label="Placeholder" value={String(config.placeholder || "")} onChange={(v) => updateField("placeholder", v)} />
        </div>
      )}

      {/* ── Image ── */}
      {selectedElement.type === "image" && (
        <PropSelect
          label="Image"
          value={String(config.imageId || "")}
          onChange={(v) => {
            const img = images.find((i) => i.id === v);
            updateField("imageId", v);
            if (img) updateField("imageName", img.name);
          }}
          options={[
            { value: "", label: "Select image..." },
            ...images.map((i) => ({ value: i.id, label: i.name })),
          ]}
        />
      )}

      {/* ── Attachment ── */}
      {selectedElement.type === "attachment" && (
        <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
      )}



      {/* ── Check Box ── */}
      {selectedElement.type === "checkbox" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropCheckbox label="Required" checked={!!config.required} onChange={(v) => updateField("required", v)} />
        </div>
      )}

      {/* ── Radio Button ── */}
      {selectedElement.type === "radio-button" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropInput label="Options (comma-separated)" value={String(config.options || "")} onChange={(v) => updateField("options", v)} />
        </div>
      )}

      {/* ── Dropdown ── */}
      {selectedElement.type === "dropdown" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropInput label="Options (comma-separated)" value={String(config.options || "")} onChange={(v) => updateField("options", v)} />
        </div>
      )}

      {/* ── Calendar ── */}
      {selectedElement.type === "calendar" && (
        <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
      )}

      {/* ── Container (unified) ── */}
      {selectedElement.type === "container" && (
        <ContainerLayoutPanel
          config={config}
          elementId={selectedElement.id}
          onUpdateConfig={onUpdateConfig}
          elements={elements}
        />
      )}

      {/* ── Divider ── */}
      {selectedElement.type === "divider" && (
        <div className="contents">
          <PropSelect
            label="Style"
            value={String(config.style || "solid")}
            onChange={(v) => updateField("style", v)}
            options={[
              { value: "solid", label: "Solid" },
              { value: "dashed", label: "Dashed" },
              { value: "dotted", label: "Dotted" },
            ]}
          />
          <PropColorPicker label="Color" value={String(config.color || "#AFAEAE")} onChange={(v) => updateField("color", v)} />
          <PropSlider label="Weight" value={Number(config.weight || 2)} min={1} max={10} unit="px" onChange={(v) => updateField("weight", v)} />
        </div>
      )}

      {/* ── Internal Field ── */}
      {selectedElement.type === "internal-field" && (
        <PropInput label="Property" value={String(config.property || "")} onChange={(v) => updateField("property", v)} />
      )}

      {/* ── Partner Tags ── */}
      {selectedElement.type === "partner-tags" && (
        <PropSelect
          label="Source"
          value={String(config.source || "all")}
          onChange={(v) => updateField("source", v)}
          options={[
            { value: "all", label: "All Tags" },
            { value: "active", label: "Active Only" },
            { value: "custom", label: "Custom Selection" },
          ]}
        />
      )}

      {/* ── Report Field ── */}
      {selectedElement.type === "report-field" && (
        <div className="contents">
          <PropReadonly label="Field Name" value={String(config.fieldName || "")} />
          <PropReadonly label="Field Type" value={String(config.fieldType || "")} />
          <PropCheckbox label="Required" checked={!!config.required} onChange={(v) => updateField("required", v)} />
        </div>
      )}

      {/* ── Text Area ── */}
      {selectedElement.type === "text-area" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropInput label="Placeholder" value={String(config.placeholder || "")} onChange={(v) => updateField("placeholder", v)} />
          <PropInput label="Rows" value={String(config.rows || "4")} onChange={(v) => updateField("rows", Math.max(2, Number(v) || 4))} />
          <PropCheckbox label="Required" checked={!!config.required} onChange={(v) => updateField("required", v)} />
        </div>
      )}

      {/* ── Number Input ── */}
      {selectedElement.type === "number-input" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropInput label="Placeholder" value={String(config.placeholder || "")} onChange={(v) => updateField("placeholder", v)} />
          <PropInput label="Min" value={String(config.min ?? "0")} onChange={(v) => updateField("min", Number(v) || 0)} />
          <PropInput label="Max" value={String(config.max ?? "9999")} onChange={(v) => updateField("max", Number(v) || 9999)} />
          <PropInput label="Step" value={String(config.step ?? "1")} onChange={(v) => updateField("step", Number(v) || 1)} />
          <PropCheckbox label="Required" checked={!!config.required} onChange={(v) => updateField("required", v)} />
        </div>
      )}

      {/* ── Button ── */}
      {selectedElement.type === "button" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropSelect
            label="Variant"
            value={String(config.variant || "primary")}
            onChange={(v) => updateField("variant", v)}
            options={[
              { value: "primary",   label: "Primary (Purple)" },
              { value: "secondary", label: "Secondary (Outline)" },
              { value: "teal",      label: "Teal" },
              { value: "link",      label: "Link" },
            ]}
          />
          <PropSelect
            label="Size"
            value={String(config.size || "md")}
            onChange={(v) => updateField("size", v)}
            options={[
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
            ]}
          />
        </div>
      )}

      {/* ── Alert ── */}
      {selectedElement.type === "alert" && (
        <div className="contents">
          <PropInput label="Title (optional)" value={String(config.title || "")} onChange={(v) => updateField("title", v)} />
          <PropTextarea label="Message" value={String(config.message || "")} onChange={(v) => updateField("message", v)} />
          <PropSelect
            label="Variant"
            value={String(config.variant || "info")}
            onChange={(v) => updateField("variant", v)}
            options={[
              { value: "info",    label: "Info (Blue)" },
              { value: "success", label: "Success (Green)" },
              { value: "warning", label: "Warning (Yellow)" },
              { value: "error",   label: "Error (Red)" },
            ]}
          />
        </div>
      )}

      {/* ── Toggle ── */}
      {selectedElement.type === "toggle" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropInput label="On Label" value={String(config.onLabel || "Yes")} onChange={(v) => updateField("onLabel", v)} />
          <PropInput label="Off Label" value={String(config.offLabel || "No")} onChange={(v) => updateField("offLabel", v)} />
          <PropCheckbox label="Default On" checked={!!config.defaultValue} onChange={(v) => updateField("defaultValue", v)} />
          <PropCheckbox label="Required" checked={!!config.required} onChange={(v) => updateField("required", v)} />
        </div>
      )}

      {/* ── Signature ── */}
      {selectedElement.type === "signature" && (
        <div className="contents">
          <PropInput label="Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropInput label="Hint text" value={String(config.hint || "")} onChange={(v) => updateField("hint", v)} />
          <PropCheckbox label="Required" checked={!!config.required} onChange={(v) => updateField("required", v)} />
        </div>
      )}

      {/* ── Spacer ── */}
      {selectedElement.type === "spacer" && (
        <PropInput label="Height (px)" value={String(config.height ?? "32")} onChange={(v) => updateField("height", Math.max(4, Number(v) || 32))} />
      )}

      {/* ── Page Break ── (no extra settings) */}
      {selectedElement.type === "page-break" && (
        <div className="px-2 py-3 rounded-lg bg-ds-purple-light/30 text-center">
          <span className="font-['Poppins',sans-serif] text-[11px] text-ds-purple/70">
            Forces a new page when printed or exported.
          </span>
        </div>
      )}

      {/* ── Repeater ── */}
      {selectedElement.type === "repeater" && (
        <div className="contents">
          <PropInput label="Section Label" value={String(config.label || "")} onChange={(v) => updateField("label", v)} />
          <PropInput label="Item Label" value={String(config.itemLabel || "Item")} onChange={(v) => updateField("itemLabel", v)} />
          <PropInput label="Min Items" value={String(config.minItems ?? "1")} onChange={(v) => updateField("minItems", Math.max(0, Number(v) || 1))} />
          <PropInput label="Max Items" value={String(config.maxItems ?? "10")} onChange={(v) => updateField("maxItems", Math.max(1, Number(v) || 10))} />
        </div>
      )}

      {/* ── Spacing (universal for all widgets) ── */}
      <div className="pt-1 border-t border-ds-haze flex flex-col gap-2">
        <span
          className="font-['Poppins',sans-serif] text-[10px] text-ds-gray uppercase tracking-wider"
          style={{ fontWeight: 600 }}
        >
          Spacing
        </span>
        <PropSpacingSection
          label="Margin"
          prefix="margin"
          config={config}
          defaults={{ top: 0, right: 0, bottom: 0, left: 0 }}
          onBatchUpdate={batchUpdate}
        />
        <PropSpacingSection
          label="Padding"
          prefix="padding"
          config={config}
          defaults={selectedElement.type === "container"
            ? { top: 0, right: 0, bottom: 0, left: 0 }
            : { top: 16, right: 16, bottom: 16, left: 16 }}
          onBatchUpdate={batchUpdate}
        />
      </div>
    </div>
  );
}

// Property field sub-components, Typography Controls, Styles panel sub-components,
// Spacing section → extracted to template-builder-fields.tsx

// =====================================================================
// Typography Controls (shared by text widgets) — extracted to template-builder-fields.tsx
// =====================================================================
/* Typography constants (FONT_WEIGHT_OPTIONS, GOOGLE_FONTS, etc.) extracted to template-builder-fields.tsx */

/* TypographyControls JSX removed — part 1 */

/* TypographyControls JSX removed — part 2 */

/* TypographyControls Advanced toggle removed */

// =====================================================================
// Styles panel sub-components — extracted to template-builder-fields.tsx
// =====================================================================

/* PropSectionLabel, PropColorPicker, PropSlider, SHADOW_PRESETS, PropShadowPicker → imported from template-builder-fields.tsx */

/* PropBorderWidthSection → imported from template-builder-fields.tsx */

/* PropRadiusSection → imported from template-builder-fields.tsx */

/* LinkIcon → imported from template-builder-fields.tsx */

/* SpacingInput → imported from template-builder-fields.tsx */

/* PropSpacingSection → imported from template-builder-fields.tsx */

// =====================================================================
// Main Builder Component
// =====================================================================
interface TemplateBuilderProps {
  reportFields: ReportField[];
  images: ImageDocument[];
  elements: CanvasElement[];
  onElementsChange: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  canvasConfig: CanvasConfig;
  onCanvasConfigChange: React.Dispatch<React.SetStateAction<CanvasConfig>>;
  pageWidth?: number;
  pageHeight?: number;
  pageOrientation?: "portrait" | "landscape";
  templateName?: string;
  templateDescription?: string;
  /** External trigger to enter preview mode (from CreateTemplateModal) */
  externalPreviewTrigger?: number;
  /** Callback to switch to Settings / Configuration view */
  onSettings?: () => void;
  /** Push toolbar state up to the parent so it can render external controls */
  onToolbarState?: (state: {
    canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void;
    previewMode: boolean; onTogglePreview: () => void;
    showCanvasSettings: boolean; onCanvasSettings: () => void;
    hasElements: boolean; onClearAll: () => void;
  }) => void;
}

export function TemplateBuilder({ reportFields, images, elements, onElementsChange, canvasConfig, onCanvasConfigChange, pageWidth = 816, pageHeight = 1056, pageOrientation = "portrait", templateName = "", templateDescription = "", externalPreviewTrigger, onSettings, onToolbarState }: TemplateBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [showCanvasSettings, setShowCanvasSettings] = useState(false);
  const [forceViewTrigger, setForceViewTrigger] = useState(0);

  // ── Seed canvasConfig page fields from props on mount ──
  // Uses onCanvasConfigChange directly to bypass undo history for initial seed
  const seededRef = useRef(false);
  useEffect(() => {
    if (!seededRef.current) {
      seededRef.current = true;
      onCanvasConfigChange((prev) => {
        // Only seed if canvasConfig still has defaults and props differ
        if (prev.pageSizeWidth === 816 && prev.pageSizeHeight === 1056 && prev.pageOrientation === "portrait") {
          if (pageWidth !== 816 || pageHeight !== 1056 || pageOrientation !== "portrait") {
            return { ...prev, pageSizeWidth: pageWidth, pageSizeHeight: pageHeight, pageOrientation: pageOrientation };
          }
        }
        return prev;
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Preview Mode (in-canvas preview toggle) ─────────────────────────
  const [previewMode, setPreviewMode] = useState(false);
  const previewModeRef = useRef(false);
  previewModeRef.current = previewMode;

  const togglePreviewMode = useCallback(() => {
    setPreviewMode((prev) => {
      const next = !prev;
      if (next) {
        // Entering preview: deselect everything, hide canvas settings
        setSelectedId(null);
        setShowCanvasSettings(false);
      }
      return next;
    });
  }, []);

  // External preview trigger from parent (e.g. CreateTemplateModal "Preview" button)
  useEffect(() => {
    if (externalPreviewTrigger && externalPreviewTrigger > 0) {
      setPreviewMode(true);
      setSelectedId(null);
      setShowCanvasSettings(false);
    }
  }, [externalPreviewTrigger]);

  // ── Undo / Redo history ───────────────────────────────────────────
  const MAX_HISTORY = 99;
  const elementsRef = useRef(elements);
  elementsRef.current = elements;
  const canvasConfigRef = useRef(canvasConfig);
  canvasConfigRef.current = canvasConfig;

  type HistorySnapshot = { elements: CanvasElement[]; config: CanvasConfig };
  const undoRef = useRef<HistorySnapshot[]>([]);
  const redoRef = useRef<HistorySnapshot[]>([]);
  const [, _forceHistoryRender] = useState(0);
  const bumpHistory = useCallback(() => _forceHistoryRender((t) => t + 1), []);

  /** Push current state onto undo stack */
  const pushSnapshot = useCallback(() => {
    undoRef.current = [
      ...undoRef.current.slice(-(MAX_HISTORY - 1)),
      { elements: elementsRef.current, config: canvasConfigRef.current },
    ];
    redoRef.current = [];
    bumpHistory();
  }, [bumpHistory]);

  /** History-aware wrapper around onElementsChange — all mutations flow through here */
  const setElements = useCallback(
    (updater: React.SetStateAction<CanvasElement[]>) => {
      pushSnapshot();
      onElementsChange(updater);
    },
    [onElementsChange, pushSnapshot],
  );

  /** History-aware wrapper for canvas config changes — debounced snapshot
   *  so rapid slider drags coalesce into a single undo entry. */
  const configSnapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configSnapshotPendingRef = useRef(false);
  const setCanvasConfig = useCallback(
    (updater: React.SetStateAction<CanvasConfig>) => {
      // Capture snapshot on the FIRST call of a rapid burst, then skip further pushes
      if (!configSnapshotPendingRef.current) {
        pushSnapshot();
        configSnapshotPendingRef.current = true;
      }
      onCanvasConfigChange(updater);
      // Reset the pending flag after 400ms of inactivity
      if (configSnapshotTimerRef.current) clearTimeout(configSnapshotTimerRef.current);
      configSnapshotTimerRef.current = setTimeout(() => {
        configSnapshotPendingRef.current = false;
      }, 400);
    },
    [onCanvasConfigChange, pushSnapshot],
  );

  const handleUndo = useCallback(() => {
    if (undoRef.current.length === 0) return;
    const prev = undoRef.current[undoRef.current.length - 1];
    undoRef.current = undoRef.current.slice(0, -1);
    redoRef.current = [...redoRef.current, { elements: elementsRef.current, config: canvasConfigRef.current }];
    bumpHistory();
    onElementsChange(prev.elements);
    onCanvasConfigChange(prev.config);
  }, [onElementsChange, onCanvasConfigChange, bumpHistory]);

  const handleRedo = useCallback(() => {
    if (redoRef.current.length === 0) return;
    const next = redoRef.current[redoRef.current.length - 1];
    redoRef.current = redoRef.current.slice(0, -1);
    undoRef.current = [...undoRef.current, { elements: elementsRef.current, config: canvasConfigRef.current }];
    bumpHistory();
    onElementsChange(next.elements);
    onCanvasConfigChange(next.config);
  }, [onElementsChange, onCanvasConfigChange, bumpHistory]);

  const canUndo = undoRef.current.length > 0;
  const canRedo = redoRef.current.length > 0;

  // ── Click-to-deselect (C1) ───────────────────────────────────────
  const handleDeselect = useCallback(() => {
    setSelectedId(null);
    setShowCanvasSettings(false);
  }, []);

  // When user clicks canvas settings icon, deselect elements and show canvas panel
  // Toggle behavior: clicking again when already active deselects canvas settings
  // Auto-expands right panel and switches to Layout tab (industry-standard UX)
  const handleCanvasSettingsClick = useCallback(() => {
    if (showCanvasSettings) {
      setShowCanvasSettings(false);
      return;
    }
    setSelectedId(null);
    setShowCanvasSettings(true);
    // Auto-expand the right panel if collapsed
    if (rightCollapsed) setRightCollapsed(false);
    // Bump forceView counter to tell RightPanel to switch to "properties" tab
    setForceViewTrigger(prev => prev + 1);
  }, [showCanvasSettings, rightCollapsed]);

  // When user selects an element, exit canvas settings mode
  const handleSelectElement = useCallback((id: string) => {
    setSelectedId(id);
    setShowCanvasSettings(false);
  }, []);

  const categories = useMemo(
    () => buildCategories(reportFields, images),
    [reportFields, images]
  );

  const selectedElement = useMemo(
    () => (selectedId ? findElementById(elements, selectedId) : null),
    [elements, selectedId]
  );

  const computeLabel = (el: CanvasElement, config: Record<string, string | number | boolean>): string => {
    let label = el.label;
    if (el.type === "header" && typeof config.text === "string") label = config.text || "Header";
    if (el.type === "paragraph" && typeof config.text === "string")
      label = (config.text || "Paragraph").slice(0, 50) + (String(config.text).length > 50 ? "..." : "");
    if (el.type === "text-box" && typeof config.label === "string") label = config.label || "Text Box";
    if (el.type === "image" && typeof config.imageName === "string") label = config.imageName || "Image";
    if (el.type === "attachment" && typeof config.label === "string") label = config.label || "Attachment";
    if (el.type === "checkbox" && typeof config.label === "string") label = config.label || "Check Box";
    if (el.type === "radio-button" && typeof config.label === "string") label = config.label || "Radio Button";
    if (el.type === "dropdown" && typeof config.label === "string") label = config.label || "Dropdown";
    if (el.type === "calendar" && typeof config.label === "string") label = config.label || "Calendar";
    if (el.type === "container") {
      const t = typeof config.title === "string" && config.title ? config.title : "";
      const layoutId = String(config.layout || "");
      const preset = CONTAINER_PRESETS.find((p) => p.id === layoutId);
      const colMatch = layoutId.match(/^(\d+)col$/);
      const presetLabel = preset ? preset.label : colMatch ? `${colMatch[1]} Equal Columns` : null;
      label = t || (presetLabel ? `Container · ${presetLabel}` : "Container");
    }
    if (el.type === "internal-field" && typeof config.property === "string") label = config.property || "Internal Field";
    if (el.type === "partner-tags") label = "Partner Tags";
    if (el.type === "template-title") label = "Template Title";
    if (el.type === "template-description") label = "Template Description";
    return label;
  };

  const handleDrop = useCallback((widget: PaletteWidget, insertIndex?: number) => {
    const cfg = widget.defaultConfig || {};
    const newElement: CanvasElement = {
      id: makeElementId(),
      type: widget.type,
      label: widget.label,
      config: cfg,
    };
    // Pre-initialize children grid for containers
    if (widget.type === "container") {
      let parsedRows: number[][] = [[1]];
      try { parsedRows = JSON.parse(String(cfg.rows || "[[1]]")); } catch { /* fallback */ }
      newElement.children = parsedRows.map((cols) => cols.map(() => []));
    }
    setElements((prev) => {
      if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= prev.length) {
        const copy = [...prev];
        copy.splice(insertIndex, 0, newElement);
        return copy;
      }
      return [...prev, newElement];
    });
    setSelectedId(newElement.id);
  }, []);

  const handleDropInCell = useCallback(
    (widget: PaletteWidget, containerId: string, rowIdx: number, colIdx: number, insertIndex?: number) => {
      const cfg = { ...(widget.defaultConfig || {}) };

      // For container widgets, compute the proportional width based on the parent cell's weight
      if (widget.type === "container") {
        setElements((prev) => {
          // C4: enforce maximum nesting depth
          const depth = getContainerDepth(prev, containerId);
          if (depth >= MAX_CONTAINER_DEPTH - 1) return prev; // block: too deep

          const parentContainer = findElementById(prev, containerId);
          if (parentContainer) {
            let parentRows: number[][] = [[1]];
            try { parentRows = JSON.parse(String(parentContainer.config.rows || "[[1]]")); } catch { /* fallback */ }
            const cols = parentRows[rowIdx] || [1];
            const totalWeight = cols.reduce((s, w) => s + w, 0);
            const weight = cols[colIdx] ?? 1;
            const widthPct = totalWeight > 0 ? Math.round((weight / totalWeight) * 10000) / 100 : 100;
            cfg.containerWidth = widthPct;
            cfg.containerWidthUnit = "%";
          }

          const newEl: CanvasElement = {
            id: makeElementId(),
            type: widget.type,
            label: widget.label,
            config: cfg,
          };
          let parsedRows: number[][] = [[1]];
          try { parsedRows = JSON.parse(String(cfg.rows || "[[1]]")); } catch { /* fallback */ }
          newEl.children = parsedRows.map((cols) => cols.map(() => []));

          setSelectedId(newEl.id);
          return insertIntoCell(prev, containerId, rowIdx, colIdx, newEl, insertIndex);
        });
      } else {
        const newEl: CanvasElement = {
          id: makeElementId(),
          type: widget.type,
          label: widget.label,
          config: cfg,
        };
        setElements((prev) => insertIntoCell(prev, containerId, rowIdx, colIdx, newEl, insertIndex));
        setSelectedId(newEl.id);
      }
    },
    []
  );

  const handleMoveInCell = useCallback(
    (containerId: string, rowIdx: number, colIdx: number, dragIdx: number, hoverIdx: number) => {
      setElements((prev) => moveInCell(prev, containerId, rowIdx, colIdx, dragIdx, hoverIdx));
    },
    []
  );

  const handleDelete = useCallback(
    (id: string) => {
      setElements((prev) => deleteElementById(prev, id));
      setSelectedId((prev) => (prev === id ? null : prev));
    },
    []
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      setElements((prev) => duplicateElementById(prev, id));
    },
    []
  );

  const handleMove = useCallback((dragIndex: number, hoverIndex: number) => {
    setElements((prev) => {
      const next = [...prev];
      const [removed] = next.splice(dragIndex, 1);
      next.splice(hoverIndex, 0, removed);
      return next;
    });
  }, []);

  const handleUpdateConfig = useCallback(
    (id: string, config: Record<string, string | number | boolean>) => {
      setElements((prev) =>
        updateElementById(prev, id, (el) => {
          const label = computeLabel(el, config);
          let children = el.children;
          if (el.type === "container") {
            const rowsChanged = config.rows && config.rows !== el.config.rows;
            const isFirstStructurePick = config.structurePicked && !el.config.structurePicked;

            if (isFirstStructurePick) {
              // First-time structure pick: auto-create inner Container widgets
              let parsedRows: number[][] = [[1]];
              try { parsedRows = JSON.parse(String(config.rows || "[[1]]")); } catch { /* fallback */ }
              const presetDir = (String(config.direction || "vertical")) as "vertical" | "horizontal";
              children = createInnerContainersForPreset(parsedRows, presetDir);
            } else if (rowsChanged || !children) {
              // Parse the new grid dimensions
              let parsedRows: number[][] = [[1]];
              try { parsedRows = JSON.parse(String(config.rows || "[[1]]")); } catch { /* fallback */ }
              const presetDir = (String(config.direction || "vertical")) as "vertical" | "horizontal";

              // Smart redistribution: preserve existing cells, merge overflow into last cell
              children = redistributeChildren(children, parsedRows, presetDir);
            } else {
              // No rows change but update containerWidth on inner containers
              let updatedRows: number[][] = [[1]];
              try { updatedRows = JSON.parse(String(config.rows || el.config.rows || "[[1]]")); } catch { /* fallback */ }
              children = children.map((row, ri) => {
                const cols = updatedRows[ri] || [1];
                const totalWeight = cols.reduce((s, w) => s + w, 0);
                return row.map((cell, ci) => {
                  const weight = cols[ci] ?? 1;
                  const widthPct = totalWeight > 0 ? Math.round((weight / totalWeight) * 10000) / 100 : 100;
                  return cell.map((child) => {
                    if (child.type === "container") {
                      return {
                        ...child,
                        config: {
                          ...child.config,
                          containerWidth: widthPct,
                          containerWidthUnit: "%",
                        },
                      };
                    }
                    return child;
                  });
                });
              });
            }
          }
          return { ...el, config, label, children };
        })
      );
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Cross-container move (C2) ─────────────────────────────────────
  const handleCrossMove = useCallback(
    (elementId: string, targetContainerId: string, targetRowIdx: number, targetColIdx: number, insertIndex?: number) => {
      setElements((prev) => {
        const el = findElementById(prev, elementId);
        if (!el) return prev;
        // Prevent circular: don't drop into self or descendant
        if (isIdInsideElement(el, targetContainerId)) return prev;
        // C4: enforce maximum nesting depth for containers
        if (el.type === "container") {
          const targetDepth = getContainerDepth(prev, targetContainerId);
          const elDepth = getMaxDepthOfElement(el);
          if (targetDepth + elDepth >= MAX_CONTAINER_DEPTH) return prev;
        }
        let next = deleteElementById(prev, elementId);
        next = insertIntoCell(next, targetContainerId, targetRowIdx, targetColIdx, el, insertIndex);
        return next;
      });
    },
    [],
  );

  const handleCrossMoveToRoot = useCallback(
    (elementId: string, insertIndex: number) => {
      setElements((prev) => {
        const el = findElementById(prev, elementId);
        if (!el) return prev;
        // Already at root at this index? Skip
        const rootIdx = prev.findIndex((e) => e.id === elementId);
        if (rootIdx === insertIndex || rootIdx === insertIndex - 1) return prev;
        let next = deleteElementById(prev, elementId);
        // Adjust index if element was before the insertion point at root level
        const adjustedIdx = rootIdx >= 0 && rootIdx < insertIndex ? insertIndex - 1 : insertIndex;
        const idx = Math.min(adjustedIdx, next.length);
        next = [...next.slice(0, idx), el, ...next.slice(idx)];
        return next;
      });
    },
    [],
  );

  // ── Unified Structure-tree move (supports same-level, cross-cell, cross-container, to/from root) ──
  const handleStructureMove = useCallback(
    (item: StructureDragItem, targetCtx: StructureNodeContext, targetInsertIndex: number) => {
      setElements((prev) => {
        const el = findElementById(prev, item.id);
        if (!el) return prev;

        const sameList = isSameContext(item.sourceContext, targetCtx);

        // ── Prevent circular drops: container into itself or a descendant ──
        if (targetCtx.type === "cell") {
          if (isIdInsideElement(el, targetCtx.containerId)) return prev;
          if (el.type === "container") {
            const targetDepth = getContainerDepth(prev, targetCtx.containerId);
            const elDepth = getMaxDepthOfElement(el);
            if (targetDepth + elDepth >= MAX_CONTAINER_DEPTH) return prev;
          }
        }

        // Remove element from its current position
        const afterRemove = deleteElementById(prev, item.id);

        // Adjust insert index when moving within the same list
        let insertIdx = targetInsertIndex;
        if (sameList && item.sourceIndex < targetInsertIndex) {
          insertIdx = targetInsertIndex - 1;
        }

        // Insert at target
        if (targetCtx.type === "root") {
          const clamped = Math.min(insertIdx, afterRemove.length);
          return [...afterRemove.slice(0, clamped), el, ...afterRemove.slice(clamped)];
        } else {
          return insertIntoCell(afterRemove, targetCtx.containerId, targetCtx.rowIdx, targetCtx.colIdx, el, insertIdx);
        }
      });
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    setElements([]);
    setSelectedId(null);
  }, []);

  // Push toolbar state to parent (for external toolbar rendering)
  useEffect(() => {
    if (onToolbarState) {
      onToolbarState({
        canUndo, canRedo, onUndo: handleUndo, onRedo: handleRedo,
        previewMode, onTogglePreview: togglePreviewMode,
        showCanvasSettings, onCanvasSettings: handleCanvasSettingsClick,
        hasElements: elements.length > 0, onClearAll: handleClearAll,
      });
    }
  }, [canUndo, canRedo, handleUndo, handleRedo, previewMode, togglePreviewMode, showCanvasSettings, handleCanvasSettingsClick, elements.length, handleClearAll, onToolbarState]);

  // ── Keyboard shortcuts (F2) + Copy/Paste (F3) ──────────────────────
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const clipboardRef = useRef<CanvasElement | null>(null);
  const handleDeleteRef = useRef(handleDelete);
  handleDeleteRef.current = handleDelete;
  const handleDuplicateRef = useRef(handleDuplicate);
  handleDuplicateRef.current = handleDuplicate;
  const handleUndoRef = useRef(handleUndo);
  handleUndoRef.current = handleUndo;
  const handleRedoRef = useRef(handleRedo);
  handleRedoRef.current = handleRedo;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isEditable = (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;

      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Escape → deselect or exit preview mode
      if (e.key === "Escape") {
        if (previewModeRef.current) {
          // Stop propagation so the parent modal's Escape-to-close handler doesn't fire
          e.stopImmediatePropagation();
          e.preventDefault();
          setPreviewMode(false);
        } else {
          setSelectedId(null);
          setShowCanvasSettings(false);
        }
        return;
      }

      // Ctrl+P / Cmd+P → toggle preview mode
      if (mod && e.key === "p") {
        e.preventDefault();
        togglePreviewMode();
        return;
      }

      // In preview mode, block all other editing shortcuts
      if (previewModeRef.current) return;

      // Delete / Backspace → delete selected element
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIdRef.current) {
        e.preventDefault();
        handleDeleteRef.current(selectedIdRef.current);
        return;
      }

      // Ctrl+D / Cmd+D → duplicate selected element
      if (mod && e.key === "d" && selectedIdRef.current) {
        e.preventDefault();
        handleDuplicateRef.current(selectedIdRef.current);
        return;
      }

      // Ctrl+C / Cmd+C → copy selected element (F3)
      if (mod && e.key === "c" && selectedIdRef.current) {
        const el = findElementById(elementsRef.current, selectedIdRef.current);
        if (el) clipboardRef.current = el;
        return;
      }

      // Ctrl+V / Cmd+V → paste copied element (F3)
      if (mod && e.key === "v" && clipboardRef.current) {
        e.preventDefault();
        const cloned = deepCloneElement(clipboardRef.current);
        if (selectedIdRef.current) {
          setElements((prev) => insertAfterElement(prev, selectedIdRef.current!, cloned));
        } else {
          setElements((prev) => [...prev, cloned]);
        }
        setSelectedId(cloned.id);
        return;
      }

      // Ctrl+X / Cmd+X → cut selected element (F3)
      if (mod && e.key === "x" && selectedIdRef.current) {
        e.preventDefault();
        const el = findElementById(elementsRef.current, selectedIdRef.current);
        if (el) {
          clipboardRef.current = el;
          handleDeleteRef.current(selectedIdRef.current);
        }
        return;
      }

      // Ctrl+Z / Cmd+Z → undo
      if (mod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndoRef.current();
        return;
      }

      // Ctrl+Y / Cmd+Shift+Z → redo
      if ((mod && e.key === "y") || (mod && e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        handleRedoRef.current();
        return;
      }
    };

    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, []);

  const docContextValue = useMemo(() => ({ templateName, templateDescription }), [templateName, templateDescription]);
  const globalTypo = canvasConfig.globalTypography ?? defaultGlobalTypography;

  return (
    <DocumentContext.Provider value={docContextValue}>
    <GlobalTypographyContext.Provider value={globalTypo}>
    <PreviewModeContext.Provider value={previewMode}>
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Toolbar removed — controls now rendered in parent modal header */}

        {/* Three-panel layout */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {/* Left: Widget Palette — slides out in preview */}
          <div
            className="shrink-0 h-full overflow-hidden transition-[width,opacity] duration-300 ease-in-out"
            style={{
              width: previewMode ? 0 : leftCollapsed ? 40 : 210,
              opacity: previewMode ? 0 : 1,
              pointerEvents: previewMode ? "none" : undefined,
            }}
          >
            <WidgetPalette
              categories={categories}
              searchQuery={paletteSearch}
              onSearchChange={setPaletteSearch}
              collapsed={leftCollapsed}
              onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
            />
          </div>

          {/* Center: Canvas */}
          <Canvas
            elements={elements}
            selectedId={selectedId}
            onSelect={handleSelectElement}
            onDeselect={handleDeselect}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onDrop={handleDrop}
            onMove={handleMove}
            onUpdateConfig={handleUpdateConfig}
            onDropInCell={handleDropInCell}
            onMoveInCell={handleMoveInCell}
            onCrossMove={handleCrossMove}
            onCrossMoveToRoot={handleCrossMoveToRoot}
            canvasConfig={canvasConfig}
            onCanvasConfigChange={setCanvasConfig}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            pageOrientation={pageOrientation}
          />

          {/* Right: Structure / Properties — slides out in preview */}
          <div
            className="shrink-0 h-full overflow-hidden transition-[width,opacity] duration-300 ease-in-out"
            style={{
              width: previewMode ? 0 : rightCollapsed ? 40 : 260,
              opacity: previewMode ? 0 : 1,
              pointerEvents: previewMode ? "none" : undefined,
            }}
          >
            <RightPanel
              elements={elements}
              selectedId={selectedId}
              onSelect={handleSelectElement}
              onDelete={handleDelete}
              selectedElement={selectedElement}
              onUpdateConfig={handleUpdateConfig}
              collapsed={rightCollapsed}
              onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
              images={images}
              showCanvasSettings={showCanvasSettings}
              canvasConfig={canvasConfig}
              onCanvasConfigChange={setCanvasConfig}
              pageWidth={pageWidth}
              pageHeight={pageHeight}
              pageOrientation={pageOrientation}
              forceViewTrigger={forceViewTrigger}
              onStructureMove={handleStructureMove}
            />
          </div>

          {/* Floating exit bar — visible only in preview mode */}
          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white rounded-xl shadow-lg border border-ds-haze px-4 py-2.5 transition-all duration-300 ${
              previewMode
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray" style={{ fontWeight: 500 }}>
              You are in preview mode
            </span>
            <button
              onClick={togglePreviewMode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-ds-purple text-white hover:bg-ds-purple-dark transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="font-['Poppins',sans-serif] text-[11px]" style={{ fontWeight: 600 }}>
                Exit Preview
              </span>
            </button>
            <span className="font-['Poppins',sans-serif] text-[9px] text-ds-light-gray" style={{ fontWeight: 400 }}>
              Esc
            </span>
          </div>
        </div>
      </div>
    </DndProvider>
    </PreviewModeContext.Provider>
    </GlobalTypographyContext.Provider>
    </DocumentContext.Provider>
  );
}
