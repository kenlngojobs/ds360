import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { ReportField } from "./ReportFieldsTab";
import type { ImageDocument } from "./ImagesTab";
import {
  ContainerIcon,
  CanvasSettingsIcon, TrashIcon, StructureIcon, SettingsIcon,
  PanelCollapseIcon, StylesIcon, LayoutIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon,
  WIDGET_ICON_MAP, WIDGET_TYPE_LABELS,
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
// Widget renderers imported by template-builder-canvas.tsx
// (CheckboxWidget, RadioWidget, ToggleWidget, SignatureWidget, RepeaterWidget, getShadowValue)
import {
  ContainerPreset, CONTAINER_PRESETS, makeEqualColumnsPreset, getEqualColumnCount,
  StructureThumbnail, StructurePickerInline,
  createSingleInnerContainer, collectCellGrandchildren, redistributeChildren, createInnerContainersForPreset,
} from "./template-builder-containers";
import {
  PaletteWidget, WidgetCategory, ITEM_TYPE_PALETTE,
  buildCategories, PaletteWidgetCard, WidgetPalette,
} from "./template-builder-palette";
import { Canvas } from "./template-builder-canvas";

// ── Re-export shared types for consumers: TemplatePreview, CreateTemplateModal (I1) ──
// Canonical definitions live in template-builder-types.ts and template-builder-utils.ts.
// TemplateBuilder.tsx still uses local copies (to be migrated incrementally).
export type { CanvasElement, CanvasConfig, GlobalTypography, GlobalTextStyle, GlobalTypographyKey, SpacingUnit, WidgetType, PageSizePreset, PageOrientation } from "./template-builder-types";
export { defaultCanvasConfig, defaultGlobalTypography, PAGE_SIZE_PRESETS } from "./template-builder-types";

// =====================================================================
// Document-level context (template name & description for widget rendering)
// =====================================================================
export const DocumentContext = React.createContext<{ templateName: string; templateDescription: string }>({
  templateName: "",
  templateDescription: "",
});

// =====================================================================
// Preview Mode context — consumed by Canvas, CanvasItem, ContainerCell,
// DropIndicatorLine to hide editing chrome when preview is active
// =====================================================================
export const PreviewModeContext = React.createContext(false);

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
export const GlobalTypographyContext = React.createContext<GlobalTypography>(defaultGlobalTypography);

// ── Text-based widget types (eligible for Typography controls in Styles tab) ──
export const TEXT_WIDGET_TYPES: Set<WidgetType> = new Set([
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
export function pxToInchesLabel(px: number): string {
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

// Palette system extracted to template-builder-palette.tsx

const ITEM_TYPE_CANVAS = "CANVAS_ITEM";
const ITEM_TYPE_CANVAS_NESTED = "CANVAS_ITEM_NESTED";
export const ITEM_TYPE_STRUCTURE = "STRUCTURE_TREE_ITEM";

/** Maximum nesting depth for container widgets (C4) */
const MAX_CONTAINER_DEPTH = 3;

/** Context describing where a structure-tree node lives */
export type StructureNodeContext =
  | { type: "root" }
  | { type: "cell"; containerId: string; rowIdx: number; colIdx: number };

/** Drag item shape for structure-tree reordering */
export interface StructureDragItem {
  id: string;
  sourceIndex: number;
  sourceContext: StructureNodeContext;
  elementType: string;
}

/** Compare two StructureNodeContexts for equality */
export function isSameContext(a: StructureNodeContext, b: StructureNodeContext): boolean {
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

// Container Structure System — extracted to template-builder-containers.tsx

// Widget renderers extracted to template-builder-widgets.tsx
// (CheckboxWidget, RadioWidget, ToggleWidget, SignatureWidget, RepeaterWidget, getShadowValue)

// Canvas pipeline (CanvasItem, ContainerCell, DropIndicatorLine, DocumentSizeDropdown, Canvas)
// extracted to template-builder-canvas.tsx
import { RightPanel } from "./template-builder-panels";

// Panel components extracted to template-builder-panels.tsx

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

  // ── Autosave to localStorage ─────────────────────────────────────────
  const AUTOSAVE_KEY = "ds360_template_draft";
  const AUTOSAVE_MS = 30_000; // 30 seconds
  const DRAFT_MAX_AGE = 86_400_000; // 24 hours

  const [draftAvailable, setDraftAvailable] = useState(false);
  const draftRef = useRef<{ elements: CanvasElement[]; config: CanvasConfig } | null>(null);

  // Check for recoverable draft on mount (only if canvas is empty)
  useEffect(() => {
    if (elements.length > 0) return;
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.elements?.length > 0 && Date.now() - draft.timestamp < DRAFT_MAX_AGE) {
          draftRef.current = { elements: draft.elements, config: draft.config };
          setDraftAvailable(true);
        } else {
          localStorage.removeItem(AUTOSAVE_KEY);
        }
      }
    } catch { /* corrupt draft — ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const restoreDraft = useCallback(() => {
    if (draftRef.current) {
      onElementsChange(draftRef.current.elements);
      onCanvasConfigChange(draftRef.current.config);
    }
    setDraftAvailable(false);
    draftRef.current = null;
  }, [onElementsChange, onCanvasConfigChange]);

  const dismissDraft = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
    setDraftAvailable(false);
    draftRef.current = null;
  }, []);

  // Periodic autosave
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        if (elementsRef.current.length === 0) return;
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
          elements: elementsRef.current,
          config: canvasConfigRef.current,
          timestamp: Date.now(),
        }));
      } catch { /* storage full or unavailable */ }
    }, AUTOSAVE_MS);
    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before leaving with unsaved work
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (elementsRef.current.length > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

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
        {/* Draft recovery banner */}
        {draftAvailable && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 11.5a.75.75 0 110-1.5.75.75 0 010 1.5zm.75-3.25a.75.75 0 01-1.5 0V7a.75.75 0 011.5 0v3.25z" fill="#d97706" />
            </svg>
            <span className="font-['Poppins',sans-serif] text-[12px] text-amber-800" style={{ fontWeight: 500 }}>
              An unsaved draft was recovered. Restore it?
            </span>
            <button onClick={restoreDraft}
              className="px-3 py-1 rounded-lg bg-ds-purple text-white font-['Poppins',sans-serif] text-[11px] hover:bg-ds-purple-dark transition-colors cursor-pointer border-none"
              style={{ fontWeight: 600 }}>
              Restore
            </button>
            <button onClick={dismissDraft}
              className="px-3 py-1 rounded-lg bg-white text-ds-gray border border-ds-haze font-['Poppins',sans-serif] text-[11px] hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ fontWeight: 500 }}>
              Discard
            </button>
          </div>
        )}

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
