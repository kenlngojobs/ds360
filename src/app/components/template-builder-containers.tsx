import React from "react";
import type { CanvasElement } from "./template-builder-types";
import { makeElementId } from "./template-builder-utils";

// =====================================================================
// Container Structure System
// =====================================================================
export interface ContainerPreset {
  id: string;
  label: string;
  rows: number[][];
}

export const CONTAINER_PRESETS: ContainerPreset[] = [
  // Structure-only presets (direction is controlled separately)
  { id: "1col",    label: "1 Column",                  rows: [[1]]           },
  { id: "2col",    label: "2 Equal Columns",            rows: [[1, 1]]        },
  { id: "2col-wl", label: "Wide Left + Narrow Right",   rows: [[2, 1]]        },
  { id: "2col-wr", label: "Narrow Left + Wide Right",   rows: [[1, 2]]        },
  { id: "3col",    label: "3 Equal Columns",            rows: [[1, 1, 1]]     },
  { id: "4col",    label: "4 Equal Columns",            rows: [[1, 1, 1, 1]]  },
];

/** Build an equal-column preset dynamically for any column count */
export function makeEqualColumnsPreset(n: number): ContainerPreset {
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
export function getEqualColumnCount(rows: number[][]): number | null {
  if (rows.length !== 1) return null;
  const cols = rows[0];
  if (cols.every((w) => w === cols[0])) return cols.length;
  return null;
}

export function StructureThumbnail({ preset, size = "md" }: { preset: ContainerPreset; size?: "sm" | "md" }) {
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
export function createSingleInnerContainer(
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
export function collectCellGrandchildren(cell: CanvasElement[]): CanvasElement[] {
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
export function redistributeChildren(
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

export function createInnerContainersForPreset(
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

export function StructurePickerInline({
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
