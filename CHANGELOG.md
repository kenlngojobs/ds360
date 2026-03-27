# Changelog

## 2026-03-27 — Session 2

### `src/app/components/TemplateBuilder.tsx`

**Canvas auto-fit zoom** (Canvas component, ~lines 2928–2990)
- Canvas now calculates fit-to-width zoom on initial load instead of defaulting to 100%
- Measures viewport width, subtracts p-6 padding (48px), divides by page width
- Uses `didAutoFitRef` guard so it only runs once — manual zoom changes are preserved
- "Fit" button (`handleZoomFit`) now recalculates fit-to-width dynamically instead of resetting to 100%
- Added `canvasViewportRef` on the scrollable canvas container div

**Global Typography fix — partial** (defaultConfig, line 900)
- Removed `color` and `fontWeight` from `templateTitleWidget.defaultConfig` so they fall through to Global Typography defaults
- Remaining elements (templateDescription, header, paragraph) still need the same fix

---

## 2026-03-27 — Session 1

### Modified Files (prior to Claude Code)
- `src/styles/index.css` — 04:31
- `src/app/components/TemplateBuilder.tsx` — 04:40
- `src/app/components/CreateTemplateModal.tsx` — 04:41
- `src/app/components/LoginPage.tsx` — 04:44
