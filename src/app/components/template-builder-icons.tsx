import React from "react";
import type { WidgetType } from "./template-builder-types";

// =====================================================================
// SVG Icons — DS360 Document Template widgets
// =====================================================================

/* Attachment — paperclip */
export function AttachmentIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M20.5 13.5l-7.78 7.78a4.5 4.5 0 01-6.36-6.36l7.78-7.78a3 3 0 014.24 4.24l-7.07 7.07a1.5 1.5 0 01-2.12-2.12l6.36-6.36" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Calendar — date picker */
export function CalendarIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="5" width="22" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 11h22" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 3v4M19 3v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.35" />
      <rect x="12.5" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.35" />
      <rect x="18" y="14" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.35" />
      <rect x="7" y="19" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.2" />
      <rect x="12.5" y="19" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

/* Check Box */
export function CheckBoxIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="4" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 14l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Container — grouping box */
export function ContainerIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="5" width="22" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6" y="8" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.5" />
      <rect x="14" y="8" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.5" />
    </svg>
  );
}

/* Divider — horizontal rule */
export function DividerWidgetIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M4 14h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 8h20M4 20h20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 3" opacity="0.25" />
    </svg>
  );
}

/* Dropdown — select control */
export function DropdownIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="7" width="22" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 14h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <path d="M19 12l2.5 2.5L24 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Template Title — document title badge */
export function TemplateTitleIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="6" width="22" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 15h22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
      <path d="M7 8.5h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 19h16M3 22h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
    </svg>
  );
}

/* Template Description — document subtitle */
export function TemplateDescriptionIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M4 7h20M4 11h18M4 15h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 20h20M4 23h12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/* Header — large heading text */
export function HeaderIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M6 6v16M22 6v16M6 14h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 6h4M4 22h4M20 6h4M20 22h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* Image — picture frame */
export function ImageWidgetIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="5" width="22" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 19l6-5 4 3.5 3.5-2.5L25 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Internal Field — system/gear field */
export function InternalFieldIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 3v3M14 22v3M4.93 6.93l2.12 2.12M20.95 18.95l2.12 2.12M3 14h3M22 14h3M4.93 21.07l2.12-2.12M20.95 9.05l2.12-2.12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="18" y="18" width="8" height="8" rx="1.5" fill="white" stroke="currentColor" strokeWidth="1.2" />
      <path d="M21 22h2M21 24h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/* Paragraph — text lines */
export function ParagraphIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M4 6h20M4 11h18M4 16h20M4 21h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/* Partner Tags — tags/labels */
export function PartnerTagsIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M4 7h10.5l8.5 7-7.5 7.5L4 14V7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="9" cy="11.5" r="1.5" fill="currentColor" opacity="0.5" />
      <path d="M15 15l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/* Radio Button — circle option */
export function RadioButtonIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="14" cy="14" r="5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/* Report Field — clipboard field */
export function ReportFieldIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M11 4H8a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="10" y="2" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 13h8M10 17h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* Subgroup — nested container */
export function SubgroupIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="2" y="3" width="24" height="22" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 9h24" stroke="currentColor" strokeWidth="1.4" />
      <rect x="5" y="12" width="18" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2" opacity="0.55" />
      <path d="M8 16h12M8 19h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/* Text Box — input field */
export function TextBoxIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="7" width="22" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 11v6M8 11h1.5M8 17h1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13 14h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/* Text Area — multi-line input */
export function TextAreaIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="4" width="22" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 9h14M7 13h14M7 17h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <path d="M20 20l4-4v4h-4z" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

/* Number Input — numeric field with arrows */
export function NumberInputIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="7" width="22" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 13.5h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
      <path d="M20 11l2 2.5-2 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Toggle / Switch */
export function ToggleIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="2" y="8" width="24" height="12" rx="6" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="20" cy="14" r="4" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

/* Signature — pen on line */
export function SignatureIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M5 20c2-4 4-8 6-8s2 6 4 6 3-4 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 23h22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 8l2 2-8 8-3 1 1-3 8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/* Columns — 2-col layout */
export function ColumnsIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="2" y="4" width="11" height="20" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="15" y="4" width="11" height="20" rx="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/* Spacer — vertical gap */
export function SpacerIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M14 4v20M4 4h20M4 24h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 9l-3 3h6l-3-3zM14 19l-3-3h6l3 3z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/* Page Break — scissors cut line */
export function PageBreakIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <path d="M2 14h8M18 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
      <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 13l3 2-3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Button */
export function ButtonWidgetIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="8" width="22" height="12" rx="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 14h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/* Alert / Notice Block */
export function AlertIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="2" y="5" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 10v5M14 17.5v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7" cy="14" r="2.5" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

/* Repeater -- list with + */
export function RepeaterIcon() {
  return (
    <svg viewBox="0 0 28 28" fill="none" className="w-full h-full">
      <rect x="3" y="4" width="22" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="3" y="12" width="22" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <rect x="3" y="20" width="22" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 2" opacity="0.3" />
      <path d="M12 23h4M14 21v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

// ── Utility icons ────────────────────────────────────────────────────

export function CanvasSettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 4.5h13" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" opacity="0.5" />
      <path d="M1.5 11.5h13" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" opacity="0.5" />
      <path d="M4.5 1.5v13" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" opacity="0.5" />
      <path d="M11.5 1.5v13" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" opacity="0.5" />
      <rect x="4.5" y="4.5" width="7" height="7" rx="0.5" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
    </svg>
  );
}

export function DragHandleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <circle cx="9" cy="6" r="1.2" fill="currentColor" />
      <circle cx="15" cy="6" r="1.2" fill="currentColor" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" />
      <circle cx="9" cy="18" r="1.2" fill="currentColor" />
      <circle cx="15" cy="18" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 7.41422"
      fill="none"
      className={`w-2.5 h-2 shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
    >
      <path d="M1 1L5.96894 6L11 1" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function StructureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M4 6h16M4 12h12M8 18h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PanelCollapseIcon({ flipped }: { flipped?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`w-4 h-4 transition-transform ${flipped ? "rotate-180" : ""}`}
    >
      <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StylesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5S18.33 11 17.5 11z" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export function LayoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 9h18M9 9v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function AlignLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
      <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
export function AlignCenterIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
      <path d="M2 4h12M4 8h8M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
export function AlignRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
      <path d="M2 4h12M6 8h8M4 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
export function AlignJustifyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// =====================================================================
// Widget icon map
// =====================================================================
export const WIDGET_ICON_MAP: Record<WidgetType, React.ReactNode> = {
  alert: <AlertIcon />,
  attachment: <AttachmentIcon />,
  button: <ButtonWidgetIcon />,
  calendar: <CalendarIcon />,
  checkbox: <CheckBoxIcon />,
  container: <ContainerIcon />,
  divider: <DividerWidgetIcon />,
  dropdown: <DropdownIcon />,
  header: <HeaderIcon />,
  image: <ImageWidgetIcon />,
  "internal-field": <InternalFieldIcon />,
  "number-input": <NumberInputIcon />,
  "page-break": <PageBreakIcon />,
  paragraph: <ParagraphIcon />,
  "partner-tags": <PartnerTagsIcon />,
  "radio-button": <RadioButtonIcon />,
  repeater: <RepeaterIcon />,
  "report-field": <ReportFieldIcon />,
  signature: <SignatureIcon />,
  spacer: <SpacerIcon />,
  "template-title": <TemplateTitleIcon />,
  "template-description": <TemplateDescriptionIcon />,
  "text-area": <TextAreaIcon />,
  "text-box": <TextBoxIcon />,
  toggle: <ToggleIcon />,
};

export const WIDGET_TYPE_LABELS: Record<WidgetType, string> = {
  alert: "Alert",
  attachment: "Attachment",
  button: "Button",
  calendar: "Calendar",
  checkbox: "Check Box",
  container: "Container",
  divider: "Divider",
  dropdown: "Dropdown",
  header: "Header",
  image: "Image",
  "internal-field": "Internal Field",
  "number-input": "Number Input",
  "page-break": "Page Break",
  paragraph: "Paragraph",
  "partner-tags": "Partner Tags",
  "radio-button": "Radio Button",
  repeater: "Repeater",
  "report-field": "Report Field",
  signature: "Signature",
  spacer: "Spacer",
  "template-title": "Template Title",
  "template-description": "Template Description",
  "text-area": "Text Area",
  "text-box": "Text Box",
  toggle: "Toggle",
};
