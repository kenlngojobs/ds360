import React, { useState } from "react";
import type { WidgetType, GlobalTypography, GlobalTypographyKey, GlobalTextStyle } from "./template-builder-types";
import { AlignLeftIcon, AlignCenterIcon, AlignRightIcon, AlignJustifyIcon } from "./template-builder-icons";

// =====================================================================
// Property field sub-components
// =====================================================================
export function PropInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ds-haze rounded-md px-2.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white"
      />
    </div>
  );
}

export function PropTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full border border-ds-haze rounded-md px-2.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white resize-none"
      />
    </div>
  );
}

export function PropSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ds-haze rounded-md px-2.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%233A3A3A' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          paddingRight: "28px",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PropCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer py-0.5"
      type="button"
    >
      <div className="relative shrink-0 w-3.5 h-3.5">
        {checked ? (
          <div className="contents">
            <div className="absolute bg-ds-purple border border-ds-purple inset-0 rounded-[3px]" />
            <div className="absolute inset-[25%_20%]">
              <svg viewBox="0 0 9.6 6.4" fill="none" className="w-full h-full">
                <path
                  d="M0.5 3.4L3.2 5.9L9.1 0.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div className="absolute bg-white border border-ds-gray inset-0 rounded-[3px]" />
        )}
      </div>
      <span className="font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
        {label}
      </span>
    </button>
  );
}

export function PropReadonly({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
        {label}
      </span>
      <div className="w-full bg-[#f0f0f0] border border-ds-haze rounded-md px-2.5 py-1.5">
        <span className="font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray">{value}</span>
      </div>
    </div>
  );
}

// =====================================================================
// Typography Controls (shared by text widgets)
// =====================================================================
export const FONT_WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "SemiBold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

export const TEXT_ALIGN_OPTIONS: { value: string; icon: React.ReactNode; label: string }[] = [
  { value: "left",    icon: <AlignLeftIcon />,    label: "Left" },
  { value: "center",  icon: <AlignCenterIcon />,  label: "Center" },
  { value: "right",   icon: <AlignRightIcon />,   label: "Right" },
  { value: "justify", icon: <AlignJustifyIcon />, label: "Justify" },
];

// ── Google Fonts library ──────────────────────────────────────────────
export const GOOGLE_FONTS: { value: string; label: string; category: string }[] = [
  // Sans-Serif
  { value: "Inter",            label: "Inter",             category: "Sans-Serif" },
  { value: "Roboto",           label: "Roboto",            category: "Sans-Serif" },
  { value: "Open Sans",        label: "Open Sans",         category: "Sans-Serif" },
  { value: "Montserrat",       label: "Montserrat",        category: "Sans-Serif" },
  { value: "Poppins",          label: "Poppins",           category: "Sans-Serif" },
  { value: "Lato",             label: "Lato",              category: "Sans-Serif" },
  { value: "Nunito",           label: "Nunito",            category: "Sans-Serif" },
  { value: "Raleway",          label: "Raleway",           category: "Sans-Serif" },
  { value: "Work Sans",        label: "Work Sans",         category: "Sans-Serif" },
  { value: "DM Sans",          label: "DM Sans",           category: "Sans-Serif" },
  { value: "Manrope",          label: "Manrope",           category: "Sans-Serif" },
  { value: "Plus Jakarta Sans",label: "Plus Jakarta Sans", category: "Sans-Serif" },
  { value: "Source Sans 3",    label: "Source Sans 3",     category: "Sans-Serif" },
  { value: "Mulish",           label: "Mulish",            category: "Sans-Serif" },
  { value: "Barlow",           label: "Barlow",            category: "Sans-Serif" },
  { value: "Rubik",            label: "Rubik",             category: "Sans-Serif" },
  { value: "Outfit",           label: "Outfit",            category: "Sans-Serif" },
  { value: "Figtree",          label: "Figtree",           category: "Sans-Serif" },
  { value: "Space Grotesk",    label: "Space Grotesk",     category: "Sans-Serif" },
  { value: "Albert Sans",      label: "Albert Sans",       category: "Sans-Serif" },
  // Serif
  { value: "Merriweather",     label: "Merriweather",      category: "Serif" },
  { value: "Playfair Display", label: "Playfair Display",  category: "Serif" },
  { value: "Lora",             label: "Lora",              category: "Serif" },
  { value: "PT Serif",         label: "PT Serif",          category: "Serif" },
  { value: "Noto Serif",       label: "Noto Serif",        category: "Serif" },
  { value: "Libre Baskerville",label: "Libre Baskerville", category: "Serif" },
  { value: "EB Garamond",      label: "EB Garamond",       category: "Serif" },
  { value: "Crimson Text",     label: "Crimson Text",      category: "Serif" },
  { value: "Bitter",           label: "Bitter",            category: "Serif" },
  { value: "DM Serif Display", label: "DM Serif Display",  category: "Serif" },
  { value: "Cormorant Garamond",label:"Cormorant Garamond",category: "Serif" },
  // Mono
  { value: "Fira Code",        label: "Fira Code",         category: "Monospace" },
  { value: "JetBrains Mono",   label: "JetBrains Mono",    category: "Monospace" },
  { value: "Source Code Pro",   label: "Source Code Pro",   category: "Monospace" },
  { value: "IBM Plex Mono",    label: "IBM Plex Mono",     category: "Monospace" },
  // Display
  { value: "Bebas Neue",       label: "Bebas Neue",        category: "Display" },
  { value: "Oswald",           label: "Oswald",            category: "Display" },
  { value: "Anton",            label: "Anton",             category: "Display" },
  { value: "Archivo Black",    label: "Archivo Black",     category: "Display" },
  { value: "Righteous",        label: "Righteous",         category: "Display" },
  { value: "Permanent Marker", label: "Permanent Marker",  category: "Display" },
];

const FONT_CATEGORY_FALLBACKS: Record<string, string> = {
  "Sans-Serif": ", sans-serif",
  "Serif": ", serif",
  "Monospace": ", monospace",
  "Display": ", sans-serif",
};

/** Dynamically loads a Google Font into the document */
const _loadedFonts = new Set<string>();
export function loadGoogleFont(family: string) {
  if (_loadedFonts.has(family)) return;
  _loadedFonts.add(family);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

/** Returns the full font-family CSS value with fallback */
export function fontFamilyCSS(family: string): string {
  const entry = GOOGLE_FONTS.find((f) => f.value === family);
  const fallback = entry ? (FONT_CATEGORY_FALLBACKS[entry.category] || ", sans-serif") : ", sans-serif";
  return `'${family}'${fallback}`;
}

// Pre-load the two default fonts
loadGoogleFont("Montserrat");
loadGoogleFont("Poppins");

// ── Elementor-style preset labels for the Typography dropdown ──
const TYPO_PRESET_OPTIONS: { value: string; label: string }[] = [
  { value: "custom",             label: "Custom" },
  { value: "templateTitle",      label: "Template Title" },
  { value: "templateDescription",label: "Template Description" },
  { value: "h1",                 label: "Heading 1 (H1)" },
  { value: "h2",                 label: "Heading 2 (H2)" },
  { value: "h3",                 label: "Heading 3 (H3)" },
  { value: "h4",                 label: "Heading 4 (H4)" },
  { value: "h5",                 label: "Heading 5 (H5)" },
  { value: "h6",                 label: "Heading 6 (H6)" },
  { value: "paragraph",          label: "Paragraph" },
];

const TEXT_TRANSFORM_OPTIONS: { value: string; label: string }[] = [
  { value: "none",       label: "Default" },
  { value: "uppercase",  label: "AB" },
  { value: "capitalize", label: "Ab" },
  { value: "lowercase",  label: "ab" },
];

const TEXT_DECORATION_OPTIONS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: "none",         label: "None",          icon: <svg viewBox="0 0 14 14" className="w-3 h-3"><path d="M3 11l8-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/></svg> },
  { value: "underline",    label: "Underline",     icon: <svg viewBox="0 0 14 14" className="w-3 h-3"><path d="M3.5 2v5a3.5 3.5 0 007 0V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M2 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { value: "line-through", label: "Strikethrough", icon: <svg viewBox="0 0 14 14" className="w-3 h-3"><path d="M1 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9.5 3.5C9 2.5 7.5 2 6.5 2.2c-1.5.3-2.2 1.5-1.8 2.8M4.5 10.5c.5 1 2 1.5 3 1.3 1.5-.3 2.2-1.5 1.8-2.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none"/></svg> },
  { value: "overline",     label: "Overline",      icon: <svg viewBox="0 0 14 14" className="w-3 h-3"><path d="M2 1.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M3.5 5v5a3.5 3.5 0 007 0V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
];

// ── Typography helper functions (needed by TypographyControls) ──

/** Default typography for widgets without a mapped global preset ("Custom") */
const CUSTOM_TYPOGRAPHY_DEFAULTS: GlobalTextStyle = {
  fontFamily: "Poppins",
  fontSize: 13,
  fontWeight: 400,
  color: "#3A3A3A",
  textAlign: "left",
};

/** Maps widget type + optional tag to the *auto-detected* global typography key. */
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

/** Resolve effective typography preset + defaults for any widget. */
export function getEffectiveTypography(
  widgetType: string,
  config: Record<string, string | number | boolean>,
  globalTypo: GlobalTypography,
): { presetKey: string; defaults: GlobalTextStyle } {
  const explicitPreset = config.typographyPreset ? String(config.typographyPreset) : "";
  if (explicitPreset && explicitPreset !== "custom" && globalTypo[explicitPreset as GlobalTypographyKey]) {
    return { presetKey: explicitPreset, defaults: globalTypo[explicitPreset as GlobalTypographyKey] };
  }
  const autoKey = getGlobalTypoKey(widgetType, String(config.tag || ""));
  if (autoKey && !explicitPreset) {
    return { presetKey: autoKey, defaults: globalTypo[autoKey] };
  }
  return { presetKey: explicitPreset || "custom", defaults: CUSTOM_TYPOGRAPHY_DEFAULTS };
}

/** Resolve effective text style: widget config overrides the selected preset defaults. */
export function resolveTextStyle(
  globalStyle: GlobalTextStyle,
  config: Record<string, string | number | boolean>,
): {
  fontFamily: string; fontSize: number; fontWeight: number; color: string; textAlign: string;
  lineHeight: number; letterSpacing: number; textTransform: string; textDecoration: string;
} {
  return {
    fontFamily: config.fontFamily ? String(config.fontFamily) : globalStyle.fontFamily,
    fontSize: config.fontSize ? Number(config.fontSize) : globalStyle.fontSize,
    fontWeight: config.fontWeight ? Number(config.fontWeight) : globalStyle.fontWeight,
    color: config.color ? String(config.color) : globalStyle.color,
    textAlign: config.textAlign ? String(config.textAlign) : globalStyle.textAlign,
    lineHeight: config.lineHeight ? Number(config.lineHeight) : 0,
    letterSpacing: config.letterSpacing ? Number(config.letterSpacing) : 0,
    textTransform: config.textTransform ? String(config.textTransform) : "none",
    textDecoration: config.textDecoration ? String(config.textDecoration) : "none",
  };
}

/** Build a CSS-ready style object from resolved text style */
export function textStyleToCSS(ts: ReturnType<typeof resolveTextStyle>): React.CSSProperties {
  const css: React.CSSProperties = {
    fontFamily: fontFamilyCSS(ts.fontFamily),
    fontSize: `${ts.fontSize}px`,
    fontWeight: ts.fontWeight,
    color: ts.color,
    textAlign: ts.textAlign as React.CSSProperties["textAlign"],
  };
  if (ts.lineHeight > 0) css.lineHeight = ts.lineHeight;
  if (ts.letterSpacing !== 0) css.letterSpacing = `${ts.letterSpacing}px`;
  if (ts.textTransform !== "none") css.textTransform = ts.textTransform as React.CSSProperties["textTransform"];
  if (ts.textDecoration !== "none") css.textDecoration = ts.textDecoration;
  return css;
}

export function TypographyControls({
  widgetType,
  config,
  globalTypo,
  onUpdateField,
  onBatchUpdate,
}: {
  widgetType: WidgetType;
  config: Record<string, string | number | boolean>;
  globalTypo: GlobalTypography;
  onUpdateField: (key: string, value: string | number | boolean) => void;
  onBatchUpdate: (updates: Record<string, string | number | boolean>) => void;
}) {
  const { presetKey, defaults } = getEffectiveTypography(widgetType, config, globalTypo);
  const ts = resolveTextStyle(defaults, config);

  // Whether any individual value deviates from the current preset
  const hasOverride = !!(
    (config.fontFamily && String(config.fontFamily) !== defaults.fontFamily) ||
    (config.fontSize && Number(config.fontSize) !== defaults.fontSize) ||
    (config.fontWeight && Number(config.fontWeight) !== defaults.fontWeight) ||
    (config.color && String(config.color) !== defaults.color) ||
    (config.textAlign && String(config.textAlign) !== defaults.textAlign) ||
    (config.lineHeight && Number(config.lineHeight) > 0) ||
    (config.letterSpacing && Number(config.letterSpacing) !== 0) ||
    (config.textTransform && String(config.textTransform) !== "none") ||
    (config.textDecoration && String(config.textDecoration) !== "none")
  );

  React.useEffect(() => { loadGoogleFont(ts.fontFamily); }, [ts.fontFamily]);

  const grouped = React.useMemo(() => {
    const cats: Record<string, typeof GOOGLE_FONTS> = {};
    for (const f of GOOGLE_FONTS) { (cats[f.category] ??= []).push(f); }
    return cats;
  }, []);

  // Handle preset change — clear all overrides when switching to a global preset
  const handlePresetChange = (newPreset: string) => {
    onBatchUpdate({
      ...config,
      typographyPreset: newPreset,
      fontFamily: "",
      fontSize: 0,
      fontWeight: 0,
      color: "",
      textAlign: "",
      lineHeight: 0,
      letterSpacing: 0,
      textTransform: "none",
      textDecoration: "none",
    });
  };

  const resetOverrides = () => {
    onBatchUpdate({
      ...config,
      fontFamily: "",
      fontSize: 0,
      fontWeight: 0,
      color: "",
      textAlign: "",
      lineHeight: 0,
      letterSpacing: 0,
      textTransform: "none",
      textDecoration: "none",
    });
  };

  // Collapsed state for the advanced section
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Auto-expand if user has set advanced properties
  const hasAdvancedValues = !!(
    (config.lineHeight && Number(config.lineHeight) > 0) ||
    (config.letterSpacing && Number(config.letterSpacing) !== 0) ||
    (config.textTransform && String(config.textTransform) !== "none") ||
    (config.textDecoration && String(config.textDecoration) !== "none")
  );

  return (
    <div className="flex flex-col gap-2.5 border-t border-ds-haze pt-2">
      {/* ── Section header with Reset button ── */}
      <div className="flex items-center justify-between">
        <span
          className="font-['Poppins',sans-serif] text-[10px] text-ds-gray uppercase tracking-wider"
          style={{ fontWeight: 600 }}
        >
          Typography
        </span>
        {hasOverride && (
          <button
            type="button"
            onClick={resetOverrides}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Reset all typography overrides to preset defaults"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 2v5h5M14 14v-5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.5 6A6 6 0 0 0 3.8 3.8L2 7m12 3l-1.8 3.2A6 6 0 0 1 2.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="font-['Poppins',sans-serif] text-[9px]" style={{ fontWeight: 600 }}>Reset</span>
          </button>
        )}
      </div>

      {/* ── Global Style Preset Selector (Elementor-style) ── */}
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Global Style
        </span>
        <div className="relative">
          <select
            value={presetKey}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white cursor-pointer appearance-none pr-7"
          >
            {TYPO_PRESET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {/* Globe icon for global indicator */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-ds-purple">
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.1" />
              <ellipse cx="7" cy="7" rx="2.5" ry="5.5" stroke="currentColor" strokeWidth="1" />
              <path d="M1.5 7h11M2.2 4.5h9.6M2.2 9.5h9.6" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </div>
        </div>
        {presetKey !== "custom" && (
          <span className="font-['Poppins',sans-serif] text-[9px] text-ds-purple/60 flex items-center gap-1 mt-0.5">
            <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1"/><path d="M5 3v2.5h2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"/></svg>
            Inheriting from global "{TYPO_PRESET_OPTIONS.find((o) => o.value === presetKey)?.label}"
          </span>
        )}
      </div>

      {/* ── Font Family ── */}
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Font Family
        </span>
        <select
          value={ts.fontFamily}
          onChange={(e) => {
            const fam = e.target.value;
            loadGoogleFont(fam);
            onUpdateField("fontFamily", fam);
          }}
          style={{ fontFamily: fontFamilyCSS(ts.fontFamily) }}
          className="w-full border border-ds-haze rounded-md px-1.5 py-1.5 text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white cursor-pointer"
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

      {/* ── Font Size + Weight row ── */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex flex-col gap-1">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
            Size (px)
          </span>
          <input
            type="number"
            min={6}
            max={120}
            value={ts.fontSize}
            onChange={(e) => onUpdateField("fontSize", Math.max(6, Math.min(120, Number(e.target.value) || defaults.fontSize)))}
            className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
            Weight
          </span>
          <select
            value={String(ts.fontWeight)}
            onChange={(e) => onUpdateField("fontWeight", Number(e.target.value))}
            className="w-full border border-ds-haze rounded-md px-1.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white cursor-pointer"
          >
            {FONT_WEIGHT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Text Color ── */}
      <PropColorPicker label="Text Color" value={ts.color} onChange={(v) => onUpdateField("color", v)} />

      {/* ── Text Alignment ── */}
      <div className="flex flex-col gap-1">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          Text Align
        </span>
        <div className="flex gap-1">
          {TEXT_ALIGN_OPTIONS.map(({ value, icon, label }) => {
            const active = ts.textAlign === value;
            return (
              <button
                key={value}
                type="button"
                title={label}
                onClick={() => onUpdateField("textAlign", value)}
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

      {/* ── Advanced Typography Toggle ── */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-ds-purple/70 hover:text-ds-purple transition-colors cursor-pointer self-start"
      >
        <svg
          viewBox="0 0 10 10"
          fill="none"
          className={`w-2.5 h-2.5 transition-transform ${showAdvanced || hasAdvancedValues ? "rotate-90" : ""}`}
        >
          <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-['Poppins',sans-serif] text-[10px]" style={{ fontWeight: 500 }}>
          Advanced
        </span>
      </button>

      {/* ── Advanced Controls (Elementor-style expanded) ── */}
      {(showAdvanced || hasAdvancedValues) && (
        <div className="flex flex-col gap-2.5 pl-2 border-l-2 border-ds-purple/10">
          {/* Text Transform */}
          <div className="flex flex-col gap-1">
            <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
              Transform
            </span>
            <div className="flex gap-1">
              {TEXT_TRANSFORM_OPTIONS.map((o) => {
                const active = ts.textTransform === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    title={o.label === "Default" ? "None" : o.value.charAt(0).toUpperCase() + o.value.slice(1)}
                    onClick={() => onUpdateField("textTransform", o.value)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md border transition-colors cursor-pointer font-['Poppins',sans-serif] text-[10px] ${
                      active
                        ? "bg-ds-purple border-ds-purple text-white"
                        : "bg-white border-ds-haze text-ds-gray hover:border-ds-purple/50"
                    }`}
                    style={{ fontWeight: active ? 600 : 400 }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Decoration */}
          <div className="flex flex-col gap-1">
            <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
              Decoration
            </span>
            <div className="flex gap-1">
              {TEXT_DECORATION_OPTIONS.map((o) => {
                const active = ts.textDecoration === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    title={o.label}
                    onClick={() => onUpdateField("textDecoration", o.value)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-md border transition-colors cursor-pointer ${
                      active
                        ? "bg-ds-purple border-ds-purple text-white"
                        : "bg-white border-ds-haze text-ds-gray hover:border-ds-purple/50"
                    }`}
                  >
                    {o.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Line Height + Letter Spacing */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex flex-col gap-1">
              <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
                Line Height
              </span>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={ts.lineHeight || ""}
                placeholder="Auto"
                onChange={(e) => onUpdateField("lineHeight", e.target.value === "" ? 0 : Math.max(0, Math.min(5, Number(e.target.value) || 0)))}
                className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
                Letter Sp. (px)
              </span>
              <input
                type="number"
                min={-5}
                max={20}
                step={0.5}
                value={ts.letterSpacing || ""}
                placeholder="0"
                onChange={(e) => onUpdateField("letterSpacing", e.target.value === "" ? 0 : Math.max(-5, Math.min(20, Number(e.target.value) || 0)))}
                className="w-full border border-ds-haze rounded-md px-2 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Styles panel sub-components
// =====================================================================

/** Thin uppercase section label */
export function PropSectionLabel({ label }: { label: string }) {
  return (
    <span
      className="font-['Poppins',sans-serif] text-[10px] text-ds-gray uppercase tracking-wider -mb-1"
      style={{ fontWeight: 600 }}
    >
      {label}
    </span>
  );
}

/** Colour swatch + hex text input */
export function PropColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Normalise to 6-digit hex for the native color input
  const safeHex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ffffff";

  return (
    <div className="flex flex-col gap-1">
      <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {/* Colour swatch — native picker on click */}
        <div className="relative w-8 h-8 rounded-md overflow-hidden border border-ds-haze shrink-0 cursor-pointer">
          <div className="absolute inset-0 rounded-md" style={{ backgroundColor: safeHex }} />
          <input
            type="color"
            value={safeHex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            tabIndex={-1}
          />
        </div>
        {/* Hex text input */}
        <input
          type="text"
          value={value}
          maxLength={7}
          placeholder="#ffffff"
          onChange={(e) => {
            const v = e.target.value;
            onChange(v);
          }}
          className="flex-1 border border-ds-haze rounded-md px-2.5 py-1.5 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors bg-white uppercase"
        />
      </div>
    </div>
  );
}

/** Range slider with live numeric label */
export function PropSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray" style={{ fontWeight: 500 }}>
          {label}
        </span>
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-purple" style={{ fontWeight: 600 }}>
          {value}{unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-ds-purple cursor-pointer"
          style={{ accentColor: "#46367F" }}
        />
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
          className="w-12 border border-ds-haze rounded-md px-1.5 py-1 font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none focus:border-ds-purple bg-white text-center"
          style={{ fontWeight: 500 }}
        />
      </div>
    </div>
  );
}

/** 5-preset box-shadow picker */
export const SHADOW_PRESETS = [
  { value: "none", label: "None", style: "none" },
  { value: "sm",   label: "SM",   style: "0 1px 3px rgba(0,0,0,0.15)" },
  { value: "md",   label: "MD",   style: "0 4px 8px rgba(0,0,0,0.12)" },
  { value: "lg",   label: "LG",   style: "0 10px 20px rgba(0,0,0,0.12)" },
  { value: "xl",   label: "XL",   style: "0 20px 30px rgba(0,0,0,0.10)" },
] as const;

export function PropShadowPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {SHADOW_PRESETS.map((p) => {
        const active = value === p.value;
        return (
          <button
            key={p.value}
            type="button"
            title={p.label === "None" ? "No shadow" : `Shadow ${p.label}`}
            onClick={() => onChange(p.value)}
            className={`flex flex-col items-center gap-1 py-2 rounded-md border transition-colors cursor-pointer ${
              active
                ? "border-ds-purple bg-ds-purple-light"
                : "border-ds-haze bg-white hover:border-ds-purple/40"
            }`}
          >
            {/* Mini preview box */}
            <div
              className="w-5 h-5 rounded bg-white border border-ds-haze/60"
              style={{ boxShadow: p.style }}
            />
            <span
              className={`font-['Poppins',sans-serif] text-[9px] ${active ? "text-ds-purple" : "text-ds-gray"}`}
              style={{ fontWeight: active ? 700 : 400 }}
            >
              {p.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Border Width — 4 sides with link-all toggle, reuses SpacingInput */
export function PropBorderWidthSection({
  config,
  onBatchUpdate,
}: {
  config: Record<string, string | number | boolean>;
  onBatchUpdate: (updates: Record<string, string | number | boolean>) => void;
}) {
  const [linked, setLinked] = useState(false);
  const prefix = "border";

  const getValue = (side: string) => {
    const stored = config[`${prefix}${side}Width`];
    return stored !== undefined ? Number(stored) : 1;
  };

  const handleChange = (side: string, raw: string) => {
    const num = Math.max(0, Number(raw) || 0);
    if (linked) {
      onBatchUpdate({
        borderTopWidth: num, borderRightWidth: num,
        borderBottomWidth: num, borderLeftWidth: num,
      });
    } else {
      onBatchUpdate({ [`border${side}Width`]: num });
    }
  };

  return (
    <div className="rounded-lg p-2.5 bg-[#f3f1fb]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-purple" style={{ fontWeight: 700 }}>
          Width
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-['Poppins',sans-serif] text-[9px] text-ds-light-gray">px</span>
          <button
            type="button"
            onClick={() => setLinked((l) => !l)}
            className={`w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer ${
              linked ? "bg-ds-purple text-white" : "bg-white border border-ds-haze text-ds-gray"
            }`}
          >
            <LinkIcon linked={linked} />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <SpacingInput value={getValue("Top")}    onChange={(v) => handleChange("Top", v)}    label="T" linked={linked} />
        <div className="flex items-center gap-1 justify-center">
          <SpacingInput value={getValue("Left")}   onChange={(v) => handleChange("Left", v)}   label="L" linked={linked} />
          <div className="flex items-center justify-center rounded border border-ds-purple/30 bg-ds-purple-light/40" style={{ width: 34, height: 34, flexShrink: 0 }}>
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 text-ds-purple opacity-40">
              <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <SpacingInput value={getValue("Right")}  onChange={(v) => handleChange("Right", v)}  label="R" linked={linked} />
        </div>
        <SpacingInput value={getValue("Bottom")}  onChange={(v) => handleChange("Bottom", v)}  label="B" linked={linked} />
      </div>
    </div>
  );
}

/** Border Radius — 4 corners with link-all toggle */
export function PropRadiusSection({
  config,
  onBatchUpdate,
}: {
  config: Record<string, string | number | boolean>;
  onBatchUpdate: (updates: Record<string, string | number | boolean>) => void;
}) {
  const [linked, setLinked] = useState(false);

  const getVal = (corner: string) => {
    const stored = config[`radius${corner}`];
    return stored !== undefined ? Number(stored) : 0;
  };

  const handleChange = (corner: string, raw: string) => {
    const num = Math.max(0, Number(raw) || 0);
    if (linked) {
      onBatchUpdate({ radiusTL: num, radiusTR: num, radiusBR: num, radiusBL: num });
    } else {
      onBatchUpdate({ [`radius${corner}`]: num });
    }
  };

  return (
    <div className="rounded-lg p-2.5 bg-[#f3f1fb]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-purple" style={{ fontWeight: 700 }}>
          Radius
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-['Poppins',sans-serif] text-[9px] text-ds-light-gray">px</span>
          <button
            type="button"
            onClick={() => setLinked((l) => !l)}
            className={`w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer ${
              linked ? "bg-ds-purple text-white" : "bg-white border border-ds-haze text-ds-gray"
            }`}
          >
            <LinkIcon linked={linked} />
          </button>
        </div>
      </div>
      {/* 2×2 grid of corners */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-2">
        {(
          [
            { corner: "TL", label: "TL" },
            { corner: "TR", label: "TR" },
            { corner: "BL", label: "BL" },
            { corner: "BR", label: "BR" },
          ] as { corner: string; label: string }[]
        ).map(({ corner, label }) => (
          <div key={corner} className="flex flex-col items-center gap-0.5">
            <input
              type="number"
              min={0}
              max={999}
              value={getVal(corner)}
              onChange={(e) => handleChange(corner, e.target.value)}
              className={`w-full border rounded text-center font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none bg-white transition-colors py-1 ${
                linked
                  ? "border-ds-purple/50 ring-1 ring-ds-purple/20"
                  : "border-ds-haze focus:border-ds-purple"
              }`}
              style={{ fontWeight: 500 }}
            />
            <span className="font-['Poppins',sans-serif] text-[8px] text-ds-light-gray uppercase tracking-wider">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// Spacing section — Margin / Padding
// =====================================================================
export function LinkIcon({ linked }: { linked: boolean }) {
  return linked ? (
    <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
      <path d="M5.5 8.5l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 7.5l-.8.8a2.4 2.4 0 003.4 3.4l.8-.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 6.5l.8-.8a2.4 2.4 0 00-3.4-3.4L7.6 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
      <path d="M5.5 8.5l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 1.5" />
      <path d="M3 7.5l-.8.8a2.4 2.4 0 003.4 3.4l.8-.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 6.5l.8-.8a2.4 2.4 0 00-3.4-3.4L7.6 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SpacingInput({
  value,
  onChange,
  label,
  linked,
}: {
  value: number;
  onChange: (v: string) => void;
  label: string;
  linked: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5" style={{ width: 40 }}>
      <input
        type="number"
        min={0}
        max={999}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded text-center font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray outline-none bg-white transition-colors py-1 ${
          linked
            ? "border-ds-purple/50 ring-1 ring-ds-purple/20 focus:border-ds-purple"
            : "border-ds-haze focus:border-ds-purple"
        }`}
        style={{ fontWeight: 500 }}
      />
      <span className="font-['Poppins',sans-serif] text-[8px] text-ds-light-gray uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function PropSpacingSection({
  label,
  prefix,
  config,
  defaults,
  onBatchUpdate,
}: {
  label: string;
  prefix: "margin" | "padding";
  config: Record<string, string | number | boolean>;
  defaults: { top: number; right: number; bottom: number; left: number };
  onBatchUpdate: (updates: Record<string, string | number | boolean>) => void;
}) {
  const [linked, setLinked] = useState(false);

  const getValue = (side: string) => {
    const stored = config[`${prefix}${side}`];
    if (stored !== undefined && stored !== "") return Number(stored);
    return defaults[side.toLowerCase() as keyof typeof defaults];
  };

  const handleChange = (side: string, raw: string) => {
    const num = Math.max(0, Number(raw) || 0);
    if (linked) {
      onBatchUpdate({
        [`${prefix}Top`]: num,
        [`${prefix}Right`]: num,
        [`${prefix}Bottom`]: num,
        [`${prefix}Left`]: num,
      });
    } else {
      onBatchUpdate({ [`${prefix}${side}`]: num });
    }
  };

  const isMargin = prefix === "margin";
  const accentBg   = isMargin ? "bg-[#f3f1fb]"  : "bg-[#eef7f7]";
  const accentText = isMargin ? "text-ds-purple" : "text-ds-teal";
  const linkActive = isMargin ? "bg-ds-purple text-white" : "bg-ds-teal text-white";
  const linkInactive = "bg-white border border-ds-haze text-ds-gray hover:border-ds-purple";

  return (
    <div className={`rounded-lg p-2.5 ${accentBg}`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`font-['Poppins',sans-serif] text-[10px] ${accentText}`}
          style={{ fontWeight: 700 }}
        >
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-['Poppins',sans-serif] text-[9px] text-ds-light-gray">px</span>
          <button
            type="button"
            onClick={() => setLinked((l) => !l)}
            title={linked ? "Unlink sides" : "Link all sides"}
            className={`w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer ${
              linked ? linkActive : linkInactive
            }`}
          >
            <LinkIcon linked={linked} />
          </button>
        </div>
      </div>

      {/* Cross layout: T · L·[box]·R · B */}
      <div className="flex flex-col items-center gap-1">
        <SpacingInput value={getValue("Top")}    onChange={(v) => handleChange("Top", v)}    label="T" linked={linked} />

        <div className="flex items-center gap-1 justify-center">
          <SpacingInput value={getValue("Left")}   onChange={(v) => handleChange("Left", v)}   label="L" linked={linked} />

          {/* Centre box model icon */}
          <div
            className={`flex items-center justify-center rounded border ${
              isMargin
                ? "border-ds-purple/30 bg-ds-purple-light/40"
                : "border-ds-teal/30 bg-ds-teal-light/40"
            }`}
            style={{ width: 34, height: 34, flexShrink: 0 }}
          >
            <svg viewBox="0 0 14 14" fill="none" className={`w-3.5 h-3.5 ${accentText} opacity-40`}>
              {isMargin ? (
                <g>
                  <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="4.5" y="4.5" width="5" height="5" rx="0.5" fill="currentColor" opacity="0.25" />
                </g>
              ) : (
                <g>
                  <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="4" y="4" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.2" />
                </g>
              )}
            </svg>
          </div>

          <SpacingInput value={getValue("Right")}  onChange={(v) => handleChange("Right", v)}  label="R" linked={linked} />
        </div>

        <SpacingInput value={getValue("Bottom")}  onChange={(v) => handleChange("Bottom", v)}  label="B" linked={linked} />
      </div>
    </div>
  );
}
