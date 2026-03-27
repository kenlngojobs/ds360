import { useState } from "react";
import type { CanvasElement, CanvasConfig, GlobalTypography } from "./TemplateBuilder";
import { defaultCanvasConfig, defaultGlobalTypography } from "./TemplateBuilder";
import { AutoFitText } from "./AutoFitText";
import type { ImageDocument } from "./ImagesTab";

// ── Google Font loader (shared logic with TemplateBuilder) ────────────
const _loadedFontsPreview = new Set<string>();
function loadGoogleFont(family: string) {
  if (_loadedFontsPreview.has(family)) return;
  _loadedFontsPreview.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}
const FONT_CAT: Record<string, string> = {
  "Montserrat": "sans-serif", "Poppins": "sans-serif", "Inter": "sans-serif",
  "Roboto": "sans-serif", "Open Sans": "sans-serif", "Lato": "sans-serif",
  "Playfair Display": "serif", "Merriweather": "serif", "Lora": "serif",
  "Fira Code": "monospace", "JetBrains Mono": "monospace",
};
function fontFamilyCSS(family: string): string {
  const fb = FONT_CAT[family] || "sans-serif";
  return `'${family}', ${fb}`;
}

/** Maps widget type + optional tag to the global typography key */
function getGlobalTypoKeyPreview(widgetType: string, tag?: string): keyof GlobalTypography | null {
  if (widgetType === "template-title") return "templateTitle";
  if (widgetType === "template-description") return "templateDescription";
  if (widgetType === "paragraph") return "paragraph";
  if (widgetType === "header") {
    const t = (tag || "H2").toUpperCase();
    const map: Record<string, keyof GlobalTypography> = { H1: "h1", H2: "h2", H3: "h3", H4: "h4", H5: "h5", H6: "h6" };
    return map[t] || "h2";
  }
  return null;
}

/** Resolve effective text style: widget config overrides global defaults */
function resolvePreviewTextStyle(
  globalStyle: { fontFamily: string; fontSize: number; fontWeight: number; color: string; textAlign: string },
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

function getShadowValue(shadow: string | number | boolean | undefined): string {
  switch (String(shadow ?? "none")) {
    case "sm": return "0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)";
    case "md": return "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)";
    case "lg": return "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)";
    case "xl": return "0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)";
    default:   return "none";
  }
}

/**
 * Compute the universal outer + content styles for non-container widgets in the
 * preview, exactly mirroring what DraggableElement applies in the builder.
 * Container widgets render their own style block, so this is skipped for them.
 */
function getNonContainerOuterStyle(ec: Record<string, any>): React.CSSProperties {
  const borderStyleStr = String(ec.borderStyle || "none");
  const isBorderNone = borderStyleStr === "none";
  const shadow = getShadowValue(ec.shadow);
  const opacity = Number(ec.opacity ?? 100) / 100;

  return {
    // Margin
    marginTop:    Number(ec.marginTop    ?? 0) || undefined,
    marginRight:  Number(ec.marginRight  ?? 0) || undefined,
    marginBottom: Number(ec.marginBottom ?? 0) || undefined,
    marginLeft:   Number(ec.marginLeft   ?? 0) || undefined,
    // Border
    ...(isBorderNone ? {} : {
      borderStyle:       borderStyleStr,
      borderTopWidth:    Number(ec.borderTopWidth    ?? 1),
      borderRightWidth:  Number(ec.borderRightWidth  ?? 1),
      borderBottomWidth: Number(ec.borderBottomWidth ?? 1),
      borderLeftWidth:   Number(ec.borderLeftWidth   ?? 1),
      borderColor:       String(ec.borderColor || "#e0dff0"),
    }),
    // Border radius
    borderTopLeftRadius:     `${Number(ec.radiusTL ?? 0)}px`,
    borderTopRightRadius:    `${Number(ec.radiusTR ?? 0)}px`,
    borderBottomRightRadius: `${Number(ec.radiusBR ?? 0)}px`,
    borderBottomLeftRadius:  `${Number(ec.radiusBL ?? 0)}px`,
    // Box shadow
    boxShadow: shadow !== "none" ? shadow : undefined,
    // Opacity
    opacity: opacity < 1 ? opacity : undefined,
    // Overflow — matches builder's overflow-hidden on non-container outer div
    overflow: "hidden",
  };
}

function getNonContainerContentStyle(ec: Record<string, any>): React.CSSProperties {
  return {
    paddingTop:    Number(ec.paddingTop    ?? 16),
    paddingRight:  Number(ec.paddingRight  ?? 16),
    paddingBottom: Number(ec.paddingBottom ?? 16),
    paddingLeft:   Number(ec.paddingLeft   ?? 16),
    backgroundColor: ec.bgColor ? String(ec.bgColor) : "transparent",
  };
}

// =====================================================================
// Types
// =====================================================================
export interface TemplateConfig {
  description: string;
  folderPath: string;
  displayName: string;
  internalOnly: boolean;
  readOnlyEdit: boolean;
  requiresApproval: boolean;
  reportTemplateType: string;
  layout: string;
  notifyChanged: boolean;
  notifyUploaded: boolean;
  suppressNotification: boolean;
  deadlineCalendar: string;
  deadlineHours: number;
  docDueEveryXDays: number;
  docDueMaxDays: number;
  incompleteEveryXDays: number;
  incompleteMaxDays: number;
  headerColor: string;
  headerBold: boolean;
  headerUnderlined: boolean;
  headerFontSize: number;
  promptColor: string;
  promptFontSize: number;
  textFgColor: string;
  textBgColor: string;
  textFontSize: number;
  unselectedImage: string;
  selectedImage: string;
  incompleteImage: string;
  reclinedImage: string;
  pageSize: string;
  pageWidth: number;
  pageHeight: number;
  pageOrientation: "portrait" | "landscape";
}

export const defaultTemplateConfig: TemplateConfig = {
  description: "",
  folderPath: "",
  displayName: "",
  internalOnly: false,
  readOnlyEdit: false,
  requiresApproval: false,
  reportTemplateType: "",
  layout: "fields-right",
  notifyChanged: false,
  notifyUploaded: false,
  suppressNotification: false,
  deadlineCalendar: "2021-10-22",
  deadlineHours: 0,
  docDueEveryXDays: 0,
  docDueMaxDays: 0,
  incompleteEveryXDays: 0,
  incompleteMaxDays: 0,
  headerColor: "#000000",
  headerBold: false,
  headerUnderlined: false,
  headerFontSize: 0,
  promptColor: "#000000",
  promptFontSize: 0,
  textFgColor: "#000000",
  textBgColor: "#CDF1D0",
  textFontSize: 0,
  unselectedImage: "",
  selectedImage: "",
  incompleteImage: "",
  reclinedImage: "",
  pageSize: "letter",
  pageWidth: 816,
  pageHeight: 1056,
  pageOrientation: "portrait",
};

// =====================================================================
// Props
// =====================================================================
interface TemplatePreviewProps {
  templateName: string;
  config: TemplateConfig;
  elements: CanvasElement[];
  images: ImageDocument[];
  canvasConfig?: CanvasConfig;
}

// =====================================================================
// Zoom level presets
// =====================================================================
const ZOOM_LEVELS = [50, 75, 100, 125, 150];

// =====================================================================
// Element Renderers
// =====================================================================
function PreviewHeader({
  text,
  tag,
  color,
  fontSize,
  fontWeight,
  fontFamily,
  textAlign,
}: {
  text: string;
  tag: string;
  color: string;
  fontSize: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: string;
}) {
  const sizes: Record<string, number> = { H1: 24, H2: 20, H3: 17, H4: 15 };
  const size = fontSize > 0 ? fontSize : sizes[tag] || 20;
  const weight = fontWeight || 600;
  const family = fontFamily || "Montserrat";
  loadGoogleFont(family);
  return (
    <AutoFitText
      as="div"
      text={text || "Section Header"}
      baseFontSize={size}
      fontFamily={fontFamilyCSS(family)}
      fontWeight={weight}
      mode="line"
      minFontSize={10}
      style={{
        color,
        fontWeight: weight,
        fontFamily: fontFamilyCSS(family),
        textAlign: (textAlign || "left") as React.CSSProperties["textAlign"],
      }}
    />
  );
}

function PreviewParagraph({
  text,
  color,
  fontSize,
  fontWeight,
  fontFamily,
  textAlign,
}: {
  text: string;
  color: string;
  fontSize: number;
  fontWeight?: number;
  fontFamily?: string;
  textAlign?: string;
}) {
  const size = fontSize > 0 ? fontSize : 13;
  const family = fontFamily || "Poppins";
  loadGoogleFont(family);
  return (
    <AutoFitText
      as="p"
      text={text || "Enter your text here..."}
      baseFontSize={size}
      fontFamily={fontFamilyCSS(family)}
      fontWeight={fontWeight || 400}
      mode="word"
      minFontSize={8}
      className="leading-relaxed whitespace-pre-wrap"
      style={{
        color,
        fontWeight: fontWeight || 400,
        fontFamily: fontFamilyCSS(family),
        textAlign: (textAlign || "left") as React.CSSProperties["textAlign"],
      }}
    />
  );
}

function PreviewTextBox({
  label,
  placeholder,
  fgColor,
  bgColor,
  fontSize,
}: {
  label: string;
  placeholder: string;
  fgColor: string;
  bgColor: string;
  fontSize: number;
}) {
  const size = fontSize > 0 ? fontSize : 13;
  return (
    <div className="flex flex-col gap-1 py-1.5">
      <span
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: `${size}px`,
          fontWeight: 500,
          color: fgColor,
        }}
      >
        {label || "Text Field"}
      </span>
      <div
        className="rounded-md border border-[#d1d5db] px-3 py-2"
        style={{
          backgroundColor: bgColor,
          color: fgColor,
          fontSize: `${size}px`,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <span className="opacity-50">{placeholder || "Enter value..."}</span>
      </div>
    </div>
  );
}

function PreviewCheckbox({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div className="w-4 h-4 rounded border-2 border-[#46367F] shrink-0" />
      <span className="font-['Poppins',sans-serif] text-[13px] text-[#3A3A3A]">
        {label || "Check Box"}
      </span>
    </div>
  );
}

function PreviewRadioButton({ label, options }: { label: string; options: string }) {
  const opts = (options || "Option 1,Option 2,Option 3").split(",").map((s) => s.trim());
  return (
    <div className="flex flex-col gap-1 py-1.5">
      <span className="font-['Poppins',sans-serif] text-[13px] text-[#3A3A3A]" style={{ fontWeight: 500 }}>
        {label || "Radio Button"}
      </span>
      <div className="flex flex-col gap-1.5 pl-1">
        {opts.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#46367F] shrink-0 flex items-center justify-center">
              {i === 0 && <div className="w-2 h-2 rounded-full bg-[#46367F]" />}
            </div>
            <span className="font-['Poppins',sans-serif] text-[12px] text-[#3A3A3A]">{opt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewDropdown({ label, options }: { label: string; options: string }) {
  const opts = (options || "Option 1,Option 2,Option 3").split(",").map((s) => s.trim());
  return (
    <div className="flex flex-col gap-1 py-1.5">
      <span className="font-['Poppins',sans-serif] text-[13px] text-[#3A3A3A]" style={{ fontWeight: 500 }}>
        {label || "Select"}
      </span>
      <div className="flex items-center justify-between rounded-md border border-[#d1d5db] bg-white px-3 py-2">
        <span className="font-['Poppins',sans-serif] text-[12px] text-[#737373]">{opts[0]}</span>
        <svg viewBox="0 0 12 8" fill="none" className="w-3 h-2 shrink-0">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="#3A3A3A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function PreviewCalendar({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1 py-1.5">
      <span className="font-['Poppins',sans-serif] text-[13px] text-[#3A3A3A]" style={{ fontWeight: 500 }}>
        {label || "Date"}
      </span>
      <div className="flex items-center justify-between rounded-md border border-[#d1d5db] bg-white px-3 py-2 gap-2">
        <span className="font-['Poppins',sans-serif] text-[12px] text-[#737373]">mm/dd/yyyy</span>
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 shrink-0 text-[#5EA7A3]">
          <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2 8h16" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 1v4M13 1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function PreviewImage({ imageName, imageSrc }: { imageName: string; imageSrc?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2 px-2 rounded-lg border border-dashed border-[#d1d5db] bg-[#fafafa]">
      {imageSrc ? (
        <img src={imageSrc} alt={imageName} className="max-h-[80px] object-contain rounded" />
      ) : (
        <div className="w-16 h-16 rounded bg-[#f0f0f0] flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-[#AFAEAE]">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="8" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3 16l5-4 3.5 3 3-2L21 17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <span className="font-['Poppins',sans-serif] text-[10px] text-[#737373] text-center">
        {imageName || "Select image..."}
      </span>
    </div>
  );
}

function PreviewAttachment({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-md border border-dashed border-[#5EA7A3] bg-[#5EA7A3]/5">
      <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-[#5EA7A3] shrink-0">
        <path d="M15 10.5l-6 6a3 3 0 01-4.24-4.24l6-6a2 2 0 012.83 2.83l-5.3 5.3a1 1 0 01-1.42-1.42L12 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <span className="font-['Poppins',sans-serif] text-[12px] text-[#5EA7A3]" style={{ fontWeight: 500 }}>
        {label || "Upload File"}
      </span>
      <span className="font-['Poppins',sans-serif] text-[10px] text-[#AFAEAE] ml-auto">Click or drag to attach</span>
    </div>
  );
}

function PreviewDivider({ style }: { style: string }) {
  return (
    <div className="py-3">
      <div
        style={{
          borderTopWidth: "1px",
          borderTopStyle: (style || "solid") as "solid" | "dashed" | "dotted",
          borderTopColor: "#AFAEAE",
        }}
      />
    </div>
  );
}

function PreviewContainer({
  element,
  renderElement,
  isNested = false,
}: {
  element: CanvasElement;
  renderElement: (el: CanvasElement, nested?: boolean) => React.ReactNode;
  isNested?: boolean;
}) {
  const c = element.config;
  let parsedRows: number[][] = [[1]];
  try { parsedRows = JSON.parse(String(c.rows || "[[1]]")); } catch { /* fallback */ }

  const cellChildren: CanvasElement[][][] =
    element.children ?? parsedRows.map((cols) => cols.map(() => []));

  const cGapCol = Number(c.gapColumn ?? c.gap ?? 12);
  const cGapRow = Number(c.gapRow ?? c.gap ?? 12);
  const cFlexDir = String(c.flexDirection || "column");
  const cJustify = String(c.justifyContent || "flex-start");
  const cAlign = String(c.alignItems || "stretch");
  const cWrap = String(c.flexWrap || "nowrap");
  const cMinHeight = Number(c.containerMinHeight ?? 0);
  const cMinHeightUnit = String(c.containerMinHeightUnit || "px");
  const cContentWidth = String(c.contentWidth || "full");
  const cContentMaxWidth = Number(c.contentMaxWidth ?? 800);
  const cContentAlignment = String(c.contentAlignment || "center");
  const isBoxed = cContentWidth === "boxed";
  const showTitle = !!c.showTitle;
  const titleText = String(c.title || "Section Title");
  const bgColor = String(c.bgColor || "transparent");

  // Tier 2: opacity, box shadow, alignment, min/max width
  const containerWidth = Number(c.containerWidth ?? 100);
  const containerWidthUnit = String(c.containerWidthUnit || "%");
  const containerOpacity = Number(c.opacity ?? 100) / 100;
  const containerShadow = getShadowValue(c.shadow);
  const alignment = String(c.alignment || "left");
  const alignJustify =
    alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start";
  // Note: containers do not expose min/max width controls (dead code path removed in B4 fix)

  // Check if all cells are empty — used for minHeight guard matching the builder
  const allCellsEmpty = cellChildren.every((row) =>
    row.every((col) => col.length === 0)
  );

  return (
    <div style={{ display: "flex", justifyContent: alignJustify }}>
    <div
      id={c.cssId ? String(c.cssId) : undefined}
      className={c.cssClass ? String(c.cssClass) : undefined}
      style={{
        width: isNested ? "100%" : `${containerWidth}${containerWidthUnit}`,
        minHeight: allCellsEmpty ? 40 : undefined,
        opacity: containerOpacity,
        boxShadow: containerShadow !== "none" ? containerShadow : undefined,
        marginTop:    Number(c.marginTop    ?? 0) || undefined,
        marginRight:  Number(c.marginRight  ?? 0) || undefined,
        marginBottom: Number(c.marginBottom ?? 0) || undefined,
        marginLeft:   Number(c.marginLeft   ?? 0) || undefined,
        borderTopLeftRadius:     `${Number(c.radiusTL ?? 0)}px`,
        borderTopRightRadius:    `${Number(c.radiusTR ?? 0)}px`,
        borderBottomRightRadius: `${Number(c.radiusBR ?? 0)}px`,
        borderBottomLeftRadius:  `${Number(c.radiusBL ?? 0)}px`,
        zIndex: c.zIndex !== undefined && c.zIndex !== "" ? Number(c.zIndex) : undefined,
        position: c.zIndex !== undefined && c.zIndex !== "" ? "relative" : undefined,
        ...(String(c.borderStyle || "none") !== "none" ? {
          borderStyle: String(c.borderStyle),
          borderTopWidth:    Number(c.borderTopWidth    ?? 1),
          borderRightWidth:  Number(c.borderRightWidth  ?? 1),
          borderBottomWidth: Number(c.borderBottomWidth ?? 1),
          borderLeftWidth:   Number(c.borderLeftWidth   ?? 1),
          borderColor: String(c.borderColor || "#e0dff0"),
        } : {}),
      }}
    >
      {/* Optional title */}
      {showTitle && (
        <div
          className="px-4 py-2 border-b border-[#E0DFDF]"
          style={{ backgroundColor: "rgba(70,54,127,0.06)" }}
        >
          <span
            className="font-['Montserrat',sans-serif] text-[13px] text-[#46367F]"
            style={{ fontWeight: 700 }}
          >
            {titleText}
          </span>
        </div>
      )}

      {/* Content area with flexbox layout — overflow clips children per user config */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: String(c.overflow || "hidden") as React.CSSProperties["overflow"],
          paddingTop:    Number(c.paddingTop    ?? 0),
          paddingRight:  Number(c.paddingRight  ?? 0),
          paddingBottom: Number(c.paddingBottom ?? 0),
          paddingLeft:   Number(c.paddingLeft   ?? 0),
          minHeight: cMinHeight > 0 ? `${cMinHeight}${cMinHeightUnit}` : undefined,
          backgroundColor: bgColor !== "transparent" ? bgColor : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            ...(isBoxed ? {
              maxWidth: cContentMaxWidth,
              width: "100%",
              marginLeft:  cContentAlignment === "center" || cContentAlignment === "right" ? "auto" : undefined,
              marginRight: cContentAlignment === "center" || cContentAlignment === "left"  ? "auto" : undefined,
            } : {}),
            rowGap: `${cGapRow}px`,
            columnGap: `${cGapCol}px`,
          }}
        >
        {parsedRows.map((cols, rowIdx) => {
          // Each row always arranges its cells horizontally;
          // vertical stacking of rows is handled by the parent flex-col wrapper.
          const isSingleCellPreset = parsedRows.length === 1 && cols.length === 1;
          const rowFlexDir = isSingleCellPreset ? cFlexDir : "row";
          const rowGap = isSingleCellPreset
            ? (cFlexDir === "column" || cFlexDir === "column-reverse" ? `${cGapRow}px` : `${cGapCol}px`)
            : `${cGapCol}px`;
          const cellDir = cFlexDir;
          return (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              width: "100%",
              flexDirection: rowFlexDir as React.CSSProperties["flexDirection"],
              gap: rowGap,
              flexGrow: 1,
              alignItems: "stretch",
            }}
          >
            {cols.map((w, colIdx) => {
              const items = (cellChildren[rowIdx] ?? [])[colIdx] ?? [];
              const numCols = cols.length;
              const gapPx = parseFloat(rowGap) || 0;
              // Dynamic flex: if a single container child exists, its containerWidth drives sizing
              const singleContainer =
                items.length === 1 && items[0].type === "container" ? items[0] : null;
              let cellFlex: React.CSSProperties["flex"] = w;
              if (singleContainer) {
                const cw = Number(singleContainer.config.containerWidth ?? 100);
                const cwUnit = String(singleContainer.config.containerWidthUnit || "%");
                const gapShare = numCols > 1 ? ((numCols - 1) * gapPx) / numCols : 0;
                if (cwUnit === "%") {
                  cellFlex = `0 0 calc(${cw}% - ${gapShare}px)`;
                } else {
                  cellFlex = `0 0 ${cw - gapShare}px`;
                }
              }
              return (
                <div
                  key={colIdx}
                  style={{
                    flex: cellFlex,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: cellDir as React.CSSProperties["flexDirection"],
                    justifyContent: cJustify,
                    alignItems: cAlign,
                    flexWrap: cWrap as React.CSSProperties["flexWrap"],
                    rowGap: cGapRow,
                    columnGap: cGapCol,
                  }}
                >
                  {items.length > 0 ? (
                    items.map((child) => {
                      const childIsContainer = child.type === "container";
                      return (
                        <div key={child.id} style={{
                          width: cContentWidth === "full" && cFlexDir !== "row" && cFlexDir !== "row-reverse" ? "100%" : undefined,
                          flex: cContentWidth === "full" && (cFlexDir === "row" || cFlexDir === "row-reverse") ? "1 1 0%" : undefined,
                          minWidth: (cFlexDir === "row" || cFlexDir === "row-reverse") ? 0 : undefined,
                          ...(childIsContainer ? {} : getNonContainerOuterStyle(child.config)),
                        }}>
                          {childIsContainer ? renderElement(child, true) : (
                            <div style={getNonContainerContentStyle(child.config)}>
                              {renderElement(child, true)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    /* Empty cell — invisible in preview */
                    <div style={{ minHeight: "4px" }} />
                  )}
                </div>
              );
            })}
          </div>
          );
        })}
        </div>
      </div>
    </div>
    </div>
  );
}

function PreviewSubgroup({ title }: { title: string }) {
  return (
    <div className="border border-[#E0DFDF] rounded-lg overflow-hidden">
      <div className="bg-[#f7f6fa] px-3 py-2 border-b border-[#E0DFDF]">
        <span className="font-['Montserrat',sans-serif] text-[13px] text-[#46367F]" style={{ fontWeight: 700 }}>
          {title || "Subgroup"}
        </span>
      </div>
      <div className="p-3 min-h-[40px]">
        <span className="font-['Poppins',sans-serif] text-[10px] text-[#AFAEAE]">Subgroup content area</span>
      </div>
    </div>
  );
}

function PreviewInternalField({ property }: { property: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-[#5EA7A3] shrink-0">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 2v1.5M8 12.5V14M3 5l1.3.75M11.7 10.25L13 11M2 8h1.5M12.5 8H14M3 11l1.3-.75M11.7 5.75L13 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <code className="font-mono text-[11px] text-[#46367F] bg-[#46367F]/8 px-2 py-0.5 rounded">
        {property || "customer.name"}
      </code>
      <span className="font-['Poppins',sans-serif] text-[10px] text-[#AFAEAE]">System field</span>
    </div>
  );
}

function PreviewPartnerTags({ source }: { source: string }) {
  const tags = source === "active" ? ["Active", "Verified"] : ["Tag 1", "Tag 2", "Tag 3"];
  return (
    <div className="flex items-center gap-1.5 py-1.5 flex-wrap">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="font-['Poppins',sans-serif] text-[10px] text-[#5EA7A3] bg-[#5EA7A3]/10 px-2 py-0.5 rounded-full"
          style={{ fontWeight: 500 }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function PreviewReportField({
  fieldName,
  fieldType,
  required,
}: {
  fieldName: string;
  fieldType: string;
  required: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 py-1.5">
      <div className="flex items-center gap-2">
        <span
          className="font-['Poppins',sans-serif] text-[10px] text-[#46367F] bg-[#46367F]/8 px-2 py-0.5 rounded"
          style={{ fontWeight: 500 }}
        >
          {fieldType || "Field"}
        </span>
        <span className="font-['Poppins',sans-serif] text-[12px] text-[#3A3A3A]" style={{ fontWeight: 500 }}>
          {fieldName || "Report Field"}
        </span>
        {required && <span className="text-red-500 text-[11px]">*</span>}
      </div>
      <div className="rounded-md border border-[#d1d5db] bg-white px-3 py-2">
        <span className="font-['Poppins',sans-serif] text-[11px] text-[#AFAEAE]">Enter {fieldName || "value"}...</span>
      </div>
    </div>
  );
}

// =====================================================================
// Main Preview Component
// =====================================================================
export function TemplatePreview({
  templateName,
  config,
  elements,
  images,
  canvasConfig: canvasConfigProp,
}: TemplatePreviewProps) {
  const cc = canvasConfigProp ?? defaultCanvasConfig;
  const gt = cc.globalTypography ?? defaultGlobalTypography;
  const [zoom, setZoom] = useState(100);

  // Resolve effective page dimensions from config (respecting orientation)
  const effectiveWidth = config.pageOrientation === "landscape" ? config.pageHeight : config.pageWidth;
  const effectiveHeight = config.pageOrientation === "landscape" ? config.pageWidth : config.pageHeight;

  // Render a single canvas element in document form
  const renderElement = (el: CanvasElement, nested?: boolean) => {
    const c = el.config;
    switch (el.type) {
      case "template-title": {
        const showBorder = c.showBorder !== false;
        const gts = gt.templateTitle;
        const ts = resolvePreviewTextStyle(gts, c);
        loadGoogleFont(ts.fontFamily);
        return (
          <div>
            <h1
              className="leading-tight"
              style={{
                fontFamily: fontFamilyCSS(ts.fontFamily),
                fontSize: `${ts.fontSize}px`,
                fontWeight: ts.fontWeight,
                color: ts.color,
                textAlign: ts.textAlign as React.CSSProperties["textAlign"],
              }}
            >
              {templateName || "Untitled Template"}
            </h1>
            {showBorder && (
              <div
                className="mt-3"
                style={{ borderBottom: `2px solid ${String(c.borderColor || "#46367F")}` }}
              />
            )}
          </div>
        );
      }
      case "template-description": {
        const gts = gt.templateDescription;
        const ts = resolvePreviewTextStyle(gts, c);
        loadGoogleFont(ts.fontFamily);
        return config.description ? (
          <p
            className="leading-relaxed"
            style={{
              fontFamily: fontFamilyCSS(ts.fontFamily),
              fontSize: `${ts.fontSize}px`,
              fontWeight: ts.fontWeight,
              color: ts.color,
              textAlign: ts.textAlign as React.CSSProperties["textAlign"],
            }}
          >
            {config.description}
          </p>
        ) : null;
      }
      case "header": {
        const tag = String(c.tag || "H2");
        const typoKey = getGlobalTypoKeyPreview("header", tag) || "h2";
        const gts = gt[typoKey];
        const ts = resolvePreviewTextStyle(gts, c);
        loadGoogleFont(ts.fontFamily);
        return (
          <PreviewHeader
            text={String(c.text || "")}
            tag={tag}
            color={ts.color}
            fontSize={ts.fontSize}
            fontWeight={ts.fontWeight}
            fontFamily={ts.fontFamily}
            textAlign={ts.textAlign}
          />
        );
      }
      case "paragraph": {
        const gts = gt.paragraph;
        const ts = resolvePreviewTextStyle(gts, c);
        loadGoogleFont(ts.fontFamily);
        return (
          <PreviewParagraph
            text={String(c.text || "")}
            color={ts.color}
            fontSize={ts.fontSize}
            fontWeight={ts.fontWeight}
            fontFamily={ts.fontFamily}
            textAlign={ts.textAlign}
          />
        );
      }
      case "text-box":
        return (
          <PreviewTextBox
            label={String(c.label || "")}
            placeholder={String(c.placeholder || "")}
            fgColor={config.textFgColor}
            bgColor={config.textBgColor}
            fontSize={config.textFontSize}
          />
        );
      case "checkbox":
        return <PreviewCheckbox label={String(c.label || "")} />;
      case "radio-button":
        return <PreviewRadioButton label={String(c.label || "")} options={String(c.options || "")} />;
      case "dropdown":
        return <PreviewDropdown label={String(c.label || "")} options={String(c.options || "")} />;
      case "calendar":
        return <PreviewCalendar label={String(c.label || "")} />;
      case "image": {
        const imgDoc = images.find((i) => i.id === String(c.imageId));
        return <PreviewImage imageName={String(c.imageName || "")} imageSrc={imgDoc?.previewSrc} />;
      }
      case "attachment":
        return <PreviewAttachment label={String(c.label || "")} />;
      case "divider":
        return <PreviewDivider style={String(c.style || "solid")} />;
      case "container":
        return <PreviewContainer element={el} renderElement={renderElement} isNested={nested} />;
      case "subgroup":
        return <PreviewSubgroup title={String(c.title || "")} />;
      case "internal-field":
        return <PreviewInternalField property={String(c.property || "")} />;
      case "partner-tags":
        return <PreviewPartnerTags source={String(c.source || "all")} />;
      case "report-field":
        return (
          <PreviewReportField
            fieldName={String(c.fieldName || "")}
            fieldType={String(c.fieldType || "")}
            required={!!c.required}
          />
        );
      default:
        return (
          <div className="py-1 font-['Poppins',sans-serif] text-[12px] text-[#737373]">
            {el.label}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-ds-haze shrink-0">
        <div className="flex items-center gap-3">
          <span
            className="font-['Montserrat',sans-serif] text-[14px] text-ds-purple-dark"
            style={{ fontWeight: 700 }}
          >
            Template Preview
          </span>
          <span
            className="font-['Poppins',sans-serif] text-[10px] text-white bg-ds-teal px-2.5 py-0.5 rounded-full"
            style={{ fontWeight: 500 }}
          >
            Live Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-[#f7f6fa] rounded-lg px-1.5 py-1">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-colors cursor-pointer text-ds-dark-gray"
              title="Zoom out"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="bg-transparent font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray text-center w-[52px] outline-none cursor-pointer appearance-none"
              style={{ fontWeight: 500 }}
            >
              {ZOOM_LEVELS.map((z) => (
                <option key={z} value={z}>
                  {z}%
                </option>
              ))}
            </select>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 25))}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-colors cursor-pointer text-ds-dark-gray"
              title="Zoom in"
            >
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Element count */}
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray">
            {elements.length} element{elements.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-[#e8e8ec] p-4 sm:p-6 lg:p-8">
        <div
          className="mx-auto transition-transform origin-top"
          style={{
            transform: `scale(${zoom / 100})`,
            width: `${100 / (zoom / 100)}%`,
            maxWidth: `${effectiveWidth / (zoom / 100)}px`,
          }}
        >
          {/* Paper — the canvas IS the page */}
          <div
            className="rounded-lg shadow-lg mx-auto"
            style={{
              maxWidth: `${effectiveWidth}px`,
              minHeight: `${effectiveHeight}px`,
              backgroundColor: cc.bgColor || "#ffffff",
              paddingTop: cc.marginTop,
              paddingRight: cc.marginRight,
              paddingBottom: cc.marginBottom,
              paddingLeft: cc.marginLeft,
              ...(cc.borderStyle !== "none" ? {
                borderStyle: cc.borderStyle,
                borderWidth: cc.borderWidth,
                borderColor: cc.borderColor,
              } : {}),
            }}
          >
            {/* Inner content area with canvas padding */}
            <div
              style={{
                paddingTop: cc.paddingTop,
                paddingRight: cc.paddingRight,
                paddingBottom: cc.paddingBottom,
                paddingLeft: cc.paddingLeft,
              }}
            >
              {/* Content width wrapper */}
              <div
                style={{
                  maxWidth: cc.contentWidth === "boxed" ? cc.contentMaxWidth : undefined,
                  marginLeft: cc.contentAlignment === "center" || cc.contentAlignment === "right" ? "auto" : undefined,
                  marginRight: cc.contentAlignment === "center" || cc.contentAlignment === "left" ? "auto" : undefined,
                }}
              >
                {/* ====== DOCUMENT BODY ====== */}
                <div>
                  {elements.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#46367F]/5 flex items-center justify-center">
                        <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                          <rect x="4" y="4" width="24" height="24" rx="3" stroke="#AFAEAE" strokeWidth="1.5" strokeDasharray="3 3" />
                          <path d="M16 11v10M11 16h10" stroke="#AFAEAE" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className="font-['Montserrat',sans-serif] text-[15px] text-[#AFAEAE]"
                          style={{ fontWeight: 600 }}
                        >
                          No elements added yet
                        </span>
                        <span className="font-['Poppins',sans-serif] text-[12px] text-[#AFAEAE] text-center max-w-[300px]">
                          Switch to the Template Builder tab to drag &amp; drop widgets onto the canvas, then return here to preview.
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Rendered elements */
                    <div
                      className="flex flex-col"
                      style={{ gap: cc.elementGap }}
                    >
                      {elements.map((el) => {
                        const ec = el.config;
                        const isContainer = el.type === "container";
                        // Universal sizing — containers handle their own
                        const elWidthUnit = String(ec.widthUnit || "auto");
                        const elWidth = isContainer ? undefined : (elWidthUnit === "auto" ? "100%" : `${Number(ec.widthValue ?? 100)}${elWidthUnit}`);
                        const elMinW = !isContainer && ec.minWidth ? `${Number(ec.minWidth)}${ec.minWidthUnit || "px"}` : undefined;
                        const elMaxW = !isContainer && ec.maxWidth ? `${Number(ec.maxWidth)}${ec.maxWidthUnit || "px"}` : undefined;
                        const elHeight = !isContainer && ec.heightUnit === "px" ? `${Number(ec.heightValue ?? 200)}px` : undefined;
                        const elAlign = String(ec.alignment || "left");
                        const elJustify = elAlign === "center" ? "center" : elAlign === "right" ? "flex-end" : "flex-start";
                        return (
                          <div key={el.id} style={{ display: "flex", justifyContent: isContainer ? undefined : elJustify }}>
                            <div className="relative" style={{
                              width: elWidth,
                              minWidth: elMinW,
                              maxWidth: elMaxW,
                              height: elHeight,
                              ...(isContainer ? {} : getNonContainerOuterStyle(ec)),
                            }}>
                              {isContainer ? renderElement(el) : (
                                <div style={getNonContainerContentStyle(ec)}>
                                  {renderElement(el)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ====== NOTIFICATION SETTINGS FOOTER ====== */}
            {(config.notifyChanged || config.notifyUploaded || config.suppressNotification || config.docDueEveryXDays > 0 || config.incompleteEveryXDays > 0) && (
              <div className="contents">
                <div className="border-t border-[#E0DFDF]" />
                <div style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 20, paddingBottom: 0 }}>
                  <span
                    className="font-['Montserrat',sans-serif] text-[13px] text-[#737373]"
                    style={{ fontWeight: 700 }}
                  >
                    Notification Settings
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {config.notifyChanged && (
                      <span className="font-['Poppins',sans-serif] text-[10px] text-[#3A3A3A] bg-[#f0f0f0] px-2.5 py-1 rounded">
                        Notify on change
                      </span>
                    )}
                    {config.notifyUploaded && (
                      <span className="font-['Poppins',sans-serif] text-[10px] text-[#3A3A3A] bg-[#f0f0f0] px-2.5 py-1 rounded">
                        Notify on upload
                      </span>
                    )}
                    {config.suppressNotification && (
                      <span className="font-['Poppins',sans-serif] text-[10px] text-[#3A3A3A] bg-[#f0f0f0] px-2.5 py-1 rounded">
                        Suppress if no required fields
                      </span>
                    )}
                    {config.docDueEveryXDays > 0 && (
                      <span className="font-['Poppins',sans-serif] text-[10px] text-[#3A3A3A] bg-[#f0f0f0] px-2.5 py-1 rounded">
                        Due reminder: every {config.docDueEveryXDays}d (max {config.docDueMaxDays}d)
                      </span>
                    )}
                    {config.incompleteEveryXDays > 0 && (
                      <span className="font-['Poppins',sans-serif] text-[10px] text-[#3A3A3A] bg-[#f0f0f0] px-2.5 py-1 rounded">
                        Incomplete reminder: every {config.incompleteEveryXDays}d (max {config.incompleteMaxDays}d)
                      </span>
                    )}
                    {config.deadlineHours > 0 && (
                      <span className="font-['Poppins',sans-serif] text-[10px] text-[#3A3A3A] bg-[#f0f0f0] px-2.5 py-1 rounded">
                        Deadline: {config.deadlineHours}h prior
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}