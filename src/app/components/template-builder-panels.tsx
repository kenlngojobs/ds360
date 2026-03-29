// =====================================================================
// Right Panel components — Structure, Layout, Styles views
// Extracted from TemplateBuilder.tsx for modularity.
// =====================================================================
import React, { useState, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { ImageDocument } from "./ImagesTab";
import type {
  CanvasElement,
  CanvasConfig,
  SpacingUnit,
  PageSizePreset,
  GlobalTypography,
  GlobalTextStyle,
  GlobalTypographyKey,
  WidgetType,
} from "./template-builder-types";
import {
  defaultGlobalTypography,
  PAGE_SIZE_PRESETS,
  PX_PER_INCH,
  MAX_CONTAINER_DEPTH,
} from "./template-builder-types";
import {
  findElementById,
  isTopLevelElement,
  isIdInsideElement,
  getElementPath,
  getContainerDepth,
  getMaxDepthOfElement,
  pxToUnit,
  unitToPx,
  formatUnitValue,
} from "./template-builder-utils";
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
} from "./template-builder-fields";
import {
  ContainerPreset, CONTAINER_PRESETS, makeEqualColumnsPreset, getEqualColumnCount,
  StructureThumbnail,
} from "./template-builder-containers";
import {
  GlobalTypographyContext,
  TEXT_WIDGET_TYPES,
  pxToInchesLabel,
  ITEM_TYPE_STRUCTURE,
  isSameContext,
} from "./TemplateBuilder";
import type {
  StructureNodeContext,
  StructureDragItem,
} from "./TemplateBuilder";

// =====================================================================
// Right Panel — Structure + Layout + Styles
// =====================================================================
type RightPanelView = "structure" | "properties" | "styles";

export function RightPanel({
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
export function StylesView({
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
export function PropertiesView({
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
