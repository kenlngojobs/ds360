import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { AutoFitText } from "./AutoFitText";
import type { ReportField } from "./ReportFieldsTab";
import type { ImageDocument } from "./ImagesTab";
import {
  ContainerIcon,
  CanvasSettingsIcon, DragHandleIcon, TrashIcon, StructureIcon, SettingsIcon,
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
import {
  getShadowValue,
  CheckboxWidget, RadioWidget, ToggleWidget, SignatureWidget, RepeaterWidget,
} from "./template-builder-widgets";
import {
  ContainerPreset, CONTAINER_PRESETS, makeEqualColumnsPreset, getEqualColumnCount,
  StructureThumbnail, StructurePickerInline,
  createSingleInnerContainer, collectCellGrandchildren, redistributeChildren, createInnerContainersForPreset,
} from "./template-builder-containers";
import {
  PaletteWidget, WidgetCategory, ITEM_TYPE_PALETTE,
  buildCategories, PaletteWidgetCard, WidgetPalette,
} from "./template-builder-palette";
import type {
  CanvasElement, CanvasConfig, GlobalTypography, GlobalTextStyle, GlobalTypographyKey,
  SpacingUnit, WidgetType, PageSizePreset, PageOrientation,
} from "./template-builder-types";
import {
  PAGE_SIZE_PRESETS, PX_PER_INCH,
  ITEM_TYPE_CANVAS, ITEM_TYPE_CANVAS_NESTED, MAX_CONTAINER_DEPTH,
} from "./template-builder-types";
import {
  DocumentContext, PreviewModeContext, GlobalTypographyContext,
} from "./TemplateBuilder";

/** Format a px dimension as inches, showing clean values for common sizes */
function pxToInchesLabel(px: number): string {
  const inches = px / PX_PER_INCH;
  // Check if it's a clean fraction
  if (Math.abs(inches - Math.round(inches * 4) / 4) < 0.01) {
    return String(Math.round(inches * 100) / 100);
  }
  return inches.toFixed(2);
}

// =====================================================================
// Canvas Item (draggable for reorder)
// =====================================================================
export function CanvasItem({
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
export function ContainerCell({
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
export const DropIndicatorLine = React.memo(function DropIndicatorLine({
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
export function DocumentSizeDropdown({
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
export function Canvas({
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
