// =====================================================================
// Shared utility functions for the Template Builder system (I1)
// Pure functions extracted from TemplateBuilder.tsx for reuse.
// =====================================================================
import type {
  CanvasElement,
  SpacingUnit,
  GlobalTextStyle,
  GlobalTypographyKey,
} from "./template-builder-types";
import { PX_PER_INCH, PX_PER_MM } from "./template-builder-types";

// ── Element ID generation ──────────────────────────────────────────
export function makeElementId(): string {
  return `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Deep clone ─────────────────────────────────────────────────────
export function deepCloneElement(el: CanvasElement): CanvasElement {
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

// ── Find / query helpers ───────────────────────────────────────────
export function findElementById(elements: CanvasElement[], id: string): CanvasElement | null {
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

export function isTopLevelElement(elements: CanvasElement[], id: string): boolean {
  return elements.some((el) => el.id === id);
}

export function isIdInsideElement(el: CanvasElement, targetId: string): boolean {
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

// ── Breadcrumb path builder ────────────────────────────────────────
export function getElementPath(
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
            const cellLabel = rows > 1 ? `Row ${ri + 1} \u00b7 Col ${ci + 1}` : `Column ${ci + 1}`;
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

// ── Depth helpers (C4) ─────────────────────────────────────────────
export function getContainerDepth(elements: CanvasElement[], containerId: string, depth = 0): number {
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

export function getMaxDepthOfElement(el: CanvasElement): number {
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

// ── Mutation helpers ───────────────────────────────────────────────
export function duplicateElementById(elements: CanvasElement[], id: string): CanvasElement[] {
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

export function insertAfterElement(elements: CanvasElement[], afterId: string, newEl: CanvasElement): CanvasElement[] {
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

export function updateElementById(
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

export function deleteElementById(elements: CanvasElement[], id: string): CanvasElement[] {
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

export function insertIntoCell(
  elements: CanvasElement[],
  containerId: string,
  rowIdx: number,
  colIdx: number,
  newEl: CanvasElement,
  insertIndex?: number
): CanvasElement[] {
  return elements.map((el) => {
    if (el.id === containerId) {
      const grid = el.children ?? [];
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

export function moveInCell(
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

// ── Unit conversion ────────────────────────────────────────────────
export function pxToUnit(px: number, unit: SpacingUnit, refPx?: number): number {
  switch (unit) {
    case "in": return px / PX_PER_INCH;
    case "mm": return px / PX_PER_MM;
    case "%":  return refPx && refPx > 0 ? (px / refPx) * 100 : 0;
    default:   return px;
  }
}

export function unitToPx(val: number, unit: SpacingUnit, refPx?: number): number {
  switch (unit) {
    case "in": return val * PX_PER_INCH;
    case "mm": return val * PX_PER_MM;
    case "%":  return refPx && refPx > 0 ? (val / 100) * refPx : 0;
    default:   return val;
  }
}

export function formatUnitValue(val: number, unit: SpacingUnit): string {
  if (unit === "px") return String(Math.round(val));
  if (unit === "%") return val.toFixed(1);
  return val.toFixed(2);
}

// ── Typography resolution ──────────────────────────────────────────
export function getGlobalTypoKey(widgetType: string, tag?: string): GlobalTypographyKey | null {
  if (widgetType === "template-title") return "templateTitle";
  if (widgetType === "template-description") return "templateDescription";
  if (widgetType === "paragraph") return "paragraph";
  if (widgetType === "header") {
    const t = (tag || "H2").toUpperCase();
    if (t === "H1") return "h1";
    if (t === "H2") return "h2";
    if (t === "H3") return "h3";
    if (t === "H4") return "h4";
    if (t === "H5") return "h5";
    if (t === "H6") return "h6";
    return "h2";
  }
  return null;
}

export function resolveTextStyle(
  globalStyle: GlobalTextStyle,
  config: Record<string, string | number | boolean>,
): { fontFamily: string; fontSize: number; fontWeight: number; color: string; textAlign: string } {
  return {
    fontFamily: config.fontFamily ? String(config.fontFamily) : globalStyle.fontFamily,
    fontSize: config.fontSize ? Number(config.fontSize) : globalStyle.fontSize,
    fontWeight: config.fontWeight ? Number(config.fontWeight) : globalStyle.fontWeight,
    color: config.color ? String(config.color) : globalStyle.color,
    textAlign: config.textAlign ? String(config.textAlign) : globalStyle.textAlign,
  };
}
