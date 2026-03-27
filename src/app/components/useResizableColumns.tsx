import React, { useState, useCallback, useRef, useEffect } from "react";

// ── Column definition ───────────────────────────────────────────────
export interface ColumnDef {
  /** Unique key for this column */
  key: string;
  /** Starting width in pixels */
  initialWidth: number;
  /** Minimum width in pixels (default 50) */
  minWidth?: number;
}

// ── Hook ────────────────────────────────────────────────────────────
/**
 * Manages resizable column widths for any data table.
 *
 * @param columns     Array of column definitions (data columns only — don't
 *                    include the trailing "action" column here).
 * @param actionWidth Optional fixed‑width action column appended at the end.
 */
export function useResizableColumns(
  columns: ColumnDef[],
  actionWidth?: number
) {
  const [widths, setWidths] = useState<number[]>(() =>
    columns.map((c) => c.initialWidth)
  );

  // Keep a ref so mousemove always sees the latest widths without
  // re‑registering the listener.
  const widthsRef = useRef(widths);
  widthsRef.current = widths;

  const dragRef = useRef<{
    index: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Keep columns in a ref so the effect doesn't re-run on every render
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  /** Call from the resize handle's onMouseDown. */
  const startResize = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation(); // don't trigger column sort
      dragRef.current = {
        index,
        startX: e.clientX,
        startWidth: widthsRef.current[index],
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { index, startX, startWidth } = dragRef.current;
      const delta = e.clientX - startX;
      const minW = columnsRef.current[index]?.minWidth ?? 50;
      const newW = Math.max(minW, startWidth + delta);
      setWidths((prev) => {
        const next = [...prev];
        next[index] = newW;
        return next;
      });
    };

    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  /** CSS grid style to apply to both the header row and every data row. */
  const gridStyle = useCallback((): React.CSSProperties => {
    const cols = widths.map((w) => `${w}px`).join(" ");
    const action = actionWidth != null ? ` ${actionWidth}px` : "";
    return {
      display: "grid",
      gridTemplateColumns: cols + action,
    };
  }, [widths, actionWidth]);

  return { columnWidths: widths, gridStyle, startResize };
}

// ── Resize Handle ───────────────────────────────────────────────────
/**
 * A thin, invisible drag‑handle rendered on the right edge of each
 * header cell.  Shows a teal highlight on hover and switches to a
 * col‑resize cursor.
 *
 * Place it as the **last child** of a header cell that has
 * `position: relative` (i.e. the Tailwind class `relative`).
 */
export function ResizeHandle({
  onMouseDown,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute right-0 top-0 bottom-0 w-[7px] cursor-col-resize z-20 group/rh"
      style={{ transform: "translateX(50%)" }}
    >
      {/* visible bar */}
      <div className="absolute left-1/2 top-[4px] bottom-[4px] w-px -translate-x-1/2 bg-white/40 group-hover/rh:bg-[#5EA7A3] group-hover/rh:w-[2px] transition-all" />
    </div>
  );
}