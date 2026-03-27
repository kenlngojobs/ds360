import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import svgPathsConfig from "../../imports/svg-pc5mcx6xze";
import type { ImageDocument } from "./ImagesTab";
import type { ReportTemplateType } from "./ReportTemplateTypesTab";
import type { ReportField } from "./ReportFieldsTab";
import { TemplateBuilder, type CanvasElement, type CanvasConfig, defaultCanvasConfig } from "./TemplateBuilder";
import { type TemplateConfig, defaultTemplateConfig } from "./TemplatePreview";

interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
  images: ImageDocument[];
  reportTemplateTypes: ReportTemplateType[];
  reportFields: ReportField[];
  onSave?: (data: SavedTemplateData) => void;
  /** When provided, the modal opens in edit mode pre-populated with this data */
  editData?: { id: string; data: SavedTemplateData } | null;
}

/** Data payload passed to the parent when the user saves a template */
export interface SavedTemplateData {
  templateName: string;
  templateType: string;
  config: TemplateConfig;
  elements: CanvasElement[];
  canvasConfig: CanvasConfig;
}

type InnerTab = "Configuration" | "Template Builder";

// Reusable checkbox component matching DS360 style
function DSCheckbox({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className="flex items-center cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      {checked ? (
        <div className="relative shrink-0 w-4 h-4">
          <div className="absolute bg-ds-purple border border-ds-purple inset-0 rounded-[5px]" />
          <div className="absolute inset-[30%_20%]">
            <svg viewBox="0 0 9.6 6.4" fill="none" className="w-full h-full">
              <path d={svgPaths.p13bf6f00} fill="white" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="relative shrink-0 w-4 h-4">
          <div className="absolute bg-white border border-ds-purple inset-0 rounded-[5px]" />
        </div>
      )}
    </button>
  );
}

// Counter input with increment/decrement arrows
function CounterInput({
  value,
  onChange,
  width,
}: {
  value: number;
  onChange: (v: number) => void;
  width?: string;
}) {
  return (
    <div className="flex items-center shrink-0">
      {/* Decrement */}
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex items-center justify-center w-[30px] h-[44px] p-2.5 cursor-pointer shrink-0"
        type="button"
      >
        <div className="w-[13px] h-[19px] rotate-180">
          <svg viewBox="0 0 13 19" fill="none" className="w-full h-full">
            <path d={svgPathsConfig.p9a3ac00} fill="var(--ds-purple)" />
          </svg>
        </div>
      </button>

      {/* Value */}
      <div
        className={`bg-white relative rounded-[30px] flex items-center justify-center px-5 py-2.5 ${width || "w-[77px]"}`}
      >
        <div className="absolute border border-ds-dark-gray inset-0 pointer-events-none rounded-[30px]" />
        <span className="font-['Poppins',sans-serif] text-[16px] text-ds-dark-gray text-center leading-normal">
          {value}
        </span>
      </div>

      {/* Increment */}
      <button
        onClick={() => onChange(value + 1)}
        className="flex items-center justify-center w-[30px] h-[44px] p-2.5 cursor-pointer shrink-0"
        type="button"
      >
        <div className="w-[13px] h-[19px]">
          <svg viewBox="0 0 13 19" fill="none" className="w-full h-full">
            <path d={svgPathsConfig.p9a3ac00} fill="var(--ds-purple)" />
          </svg>
        </div>
      </button>
    </div>
  );
}

// Dropdown select component matching the DS360 pill style
function DSSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder || "Select...";

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white relative rounded-[30px] flex items-center justify-between px-5 lg:px-[30px] py-2.5 cursor-pointer"
      >
        <div className="absolute border border-ds-dark-gray inset-0 pointer-events-none rounded-[30px]" />
        <span className="font-['Poppins',sans-serif] text-[16px] text-ds-dark-gray leading-normal truncate">
          {selectedLabel}
        </span>
        <div className="w-[25px] h-[25px] flex items-center justify-center shrink-0 ml-2">
          <div className={`w-[19px] h-[9.5px] transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <svg viewBox="0 0 21 11.9142" fill="none" className="w-full h-full">
              <path d="M1 1L10.5 10.5L20 1" stroke="black" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ddd] rounded-xl shadow-lg z-20 overflow-hidden max-h-[200px] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-5 lg:px-[30px] py-2.5 font-['Poppins',sans-serif] text-[14px] cursor-pointer transition-colors ${
                value === opt.value
                  ? "bg-ds-purple text-white"
                  : "text-ds-dark-gray hover:bg-[#f0f0f0]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SAM brand colors ────────────────────────────────────────────────
const SAM_COLORS = [
  { hex: "#46367F", label: "Purple" },
  { hex: "#352B5D", label: "Dark Purple" },
  { hex: "#5EA7A3", label: "Teal" },
  { hex: "#294745", label: "Dark Teal" },
];

const ADDITIONAL_COLORS = [
  "#000000",
  "#FFFFFF",
  "#1C1C1C",
  "#3A3A3A",
  "#6B7280",
  "#9CA3AF",
  "#D4183D",
  "#FF6B6B",
  "#FFD700",
  "#F59E0B",
  "#4A90D9",
  "#2563EB",
  "#10B981",
  "#CDF1D0",
  "#8B5CF6",
  "#EC4899",
];

// Color picker dropdown
function ColorSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectColor = (c: string) => {
    onChange(c);
    setIsOpen(false);
  };

  const isSelected = (c: string) => value.toLowerCase() === c.toLowerCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white relative rounded-[30px] flex items-center justify-between px-5 lg:px-[30px] py-2.5 cursor-pointer w-full min-w-[200px] lg:min-w-[240px]"
      >
        <div className="absolute border border-ds-dark-gray inset-0 pointer-events-none rounded-[30px]" />
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-full shrink-0"
            style={{
              backgroundColor: value,
              boxShadow: value.toUpperCase() === "#FFFFFF" || value.toUpperCase() === "#FFF" ? "inset 0 0 0 1px #d1d5db" : undefined,
            }}
          />
          <span className="font-['Poppins',sans-serif] text-[16px] text-ds-dark-gray leading-normal">
            {value.toUpperCase()}
          </span>
        </div>
        <div className="w-[25px] h-[25px] flex items-center justify-center shrink-0 ml-2">
          <div className={`w-[19px] h-[9.5px] transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <svg viewBox="0 0 21 11.9142" fill="none" className="w-full h-full">
              <path d="M1 1L10.5 10.5L20 1" stroke="black" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#ddd] rounded-xl shadow-lg z-20 p-4 w-[300px]">
          {/* ── SAM Colors ───────────────────────────── */}
          <p
            className="font-['Poppins',sans-serif] text-[11px] text-ds-purple tracking-wide mb-2"
            style={{ fontWeight: 600 }}
          >
            SAM COLORS
          </p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {SAM_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => selectColor(c.hex)}
                className="flex flex-col items-center gap-1 cursor-pointer group"
              >
                <div
                  className={`w-10 h-10 rounded-lg transition-all ${
                    isSelected(c.hex)
                      ? "ring-2 ring-ds-teal ring-offset-2"
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
                <span
                  className="font-['Poppins',sans-serif] text-[9px] text-[#6b7280] group-hover:text-ds-dark-gray transition-colors text-center leading-tight"
                  style={{ fontWeight: 500 }}
                >
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          {/* ── Divider ──────────────────────────────── */}
          <div className="border-t border-[#e5e7eb] mb-3" />

          {/* ── Additional Colors ────────────────────── */}
          <p
            className="font-['Poppins',sans-serif] text-[11px] text-[#6b7280] tracking-wide mb-2"
            style={{ fontWeight: 600 }}
          >
            ADDITIONAL COLORS
          </p>
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {ADDITIONAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => selectColor(c)}
                className={`w-7 h-7 rounded-full cursor-pointer transition-all ${
                  isSelected(c)
                    ? "ring-2 ring-ds-purple ring-offset-2"
                    : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                }`}
                style={{
                  backgroundColor: c,
                  boxShadow:
                    c === "#FFFFFF"
                      ? "inset 0 0 0 1px #d1d5db"
                      : undefined,
                }}
                title={c}
              />
            ))}
          </div>

          {/* ── Divider ──────────────────────────────── */}
          <div className="border-t border-[#e5e7eb] mb-3" />

          {/* ── Custom Color Picker ──────────────────── */}
          <p
            className="font-['Poppins',sans-serif] text-[11px] text-[#6b7280] tracking-wide mb-2"
            style={{ fontWeight: 600 }}
          >
            CUSTOM COLOR
          </p>
          <div className="flex items-center gap-2.5">
            {/* Native color picker */}
            <div className="relative w-9 h-9 shrink-0">
              <input
                ref={pickerRef}
                type="color"
                value={value.length === 7 && value.startsWith("#") ? value : "#000000"}
                onChange={(e) => {
                  onChange(e.target.value);
                  setHexInput(e.target.value);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div
                className="w-9 h-9 rounded-lg border-2 border-dashed border-[#d1d5db] hover:border-ds-purple transition-colors pointer-events-none flex items-center justify-center"
                style={{ backgroundColor: value }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <path
                    d="M12.15 1.85a2.1 2.1 0 0 0-2.97 0L3.04 7.99a.75.75 0 0 0-.19.33l-1.1 3.73a.75.75 0 0 0 .93.93l3.73-1.1a.75.75 0 0 0 .33-.19l6.14-6.14a2.1 2.1 0 0 0 0-2.97l-.73-.73Z"
                    stroke={
                      ["#000000", "#1C1C1C", "#3A3A3A", "#46367F", "#352B5D", "#294745"].some(
                        (d) => d.toLowerCase() === value.toLowerCase()
                      )
                        ? "white"
                        : "#6b7280"
                    }
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Hex input */}
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={() => {
                const v = hexInput.trim();
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
                  onChange(v);
                } else if (/^[0-9A-Fa-f]{6}$/.test(v)) {
                  onChange("#" + v);
                } else {
                  setHexInput(value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              className="min-w-0 flex-1 border border-[#ddd] rounded-lg px-3 py-1.5 font-['Poppins',sans-serif] text-[13px] outline-none focus:border-ds-purple transition-colors"
              placeholder="#000000"
            />

            <button
              type="button"
              onClick={() => {
                const v = hexInput.trim();
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
                  selectColor(v);
                } else if (/^[0-9A-Fa-f]{6}$/.test(v)) {
                  selectColor("#" + v);
                }
              }}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-ds-purple text-white font-['Poppins',sans-serif] text-[12px] cursor-pointer hover:bg-ds-purple/90 transition-colors whitespace-nowrap"
              style={{ fontWeight: 500 }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Horizontal divider matching Figma
function Divider() {
  return <div className="border-t border-ds-light-gray w-full shrink-0" />;
}

// Section heading
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-[5px]">
      <p className="font-['Montserrat',sans-serif] text-[18px] text-ds-black leading-normal" style={{ fontWeight: 700 }}>
        {children}
      </p>
    </div>
  );
}

// Form row label
function FieldLabel({ children, width }: { children: React.ReactNode; width?: string }) {
  return (
    <div className={`flex items-center shrink-0 ${width || "w-[120px] sm:w-[160px]"}`}>
      <p className="font-['Poppins',sans-serif] text-[14px] text-ds-black leading-normal" style={{ fontWeight: 500 }}>
        {children}
      </p>
    </div>
  );
}

// Text input field matching DS360 pill style
function DSInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex-1 min-w-0 bg-white relative rounded-[30px]">
      <div className="absolute border border-ds-dark-gray inset-0 pointer-events-none rounded-[30px]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-5 py-2.5 bg-transparent font-['Poppins',sans-serif] text-[16px] text-ds-dark-gray outline-none leading-normal rounded-[30px]"
      />
    </div>
  );
}

// Textarea field
function DSTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex-1 min-w-0 bg-white relative rounded-[10px]">
      <div className="absolute border border-ds-dark-gray inset-0 pointer-events-none rounded-[10px]" />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-5 py-2.5 bg-transparent font-['Poppins',sans-serif] text-[16px] text-ds-dark-gray outline-none leading-normal rounded-[10px] resize-none"
      />
    </div>
  );
}

// =====================================================================
// Configuration Tab Content
// =====================================================================
function ConfigurationTab({
  templateName,
  onTemplateNameChange,
  images,
  reportTemplateTypes,
  onConfigChange,
}: {
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  images: ImageDocument[];
  reportTemplateTypes: ReportTemplateType[];
  onConfigChange: (config: TemplateConfig) => void;
}) {
  // Form state
  const [description, setDescription] = useState("");
  const [folderPath, setFolderPath] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [internalOnly, setInternalOnly] = useState(false);
  const [readOnlyEdit, setReadOnlyEdit] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const [reportTemplateType, setReportTemplateType] = useState("certificate");
  const [layout, setLayout] = useState("fields-right");

  // Notification settings
  const [notifyChanged, setNotifyChanged] = useState(false);
  const [notifyUploaded, setNotifyUploaded] = useState(false);
  const [suppressNotification, setSuppressNotification] = useState(false);

  // Document-Specific Notification Settings
  const [deadlineCalendar, setDeadlineCalendar] = useState("2021-10-22");
  const [deadlineHours, setDeadlineHours] = useState(0);
  const [docDueEveryXDays, setDocDueEveryXDays] = useState(0);
  const [docDueMaxDays, setDocDueMaxDays] = useState(0);
  const [incompleteEveryXDays, setIncompleteEveryXDays] = useState(0);
  const [incompleteMaxDays, setIncompleteMaxDays] = useState(0);

  // Default Header Configuration
  const [headerColor, setHeaderColor] = useState("#000000");
  const [headerBold, setHeaderBold] = useState(false);
  const [headerUnderlined, setHeaderUnderlined] = useState(false);
  const [headerFontSize, setHeaderFontSize] = useState(0);

  // Default Prompt Configuration
  const [promptColor, setPromptColor] = useState("#000000");
  const [promptFontSize, setPromptFontSize] = useState(0);

  // Text Box Configuration
  const [textFgColor, setTextFgColor] = useState("#000000");
  const [textBgColor, setTextBgColor] = useState("#CDF1D0");
  const [textFontSize, setTextFontSize] = useState(0);

  // Custom Images
  const [unselectedImage, setUnselectedImage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [incompleteImage, setIncompleteImage] = useState("");
  const [reclinedImage, setReclinedImage] = useState("");

  // Page Size
  const [pageSize, setPageSize] = useState("letter");
  const [pageWidth, setPageWidth] = useState(816);
  const [pageHeight, setPageHeight] = useState(1056);
  const [pageOrientation, setPageOrientation] = useState<"portrait" | "landscape">("portrait");

  // Build dynamic dropdown options from shared state — only active images from the Images tab
  const imageOptions = useMemo(() => {
    const opts = images
      .filter((img) => img.active)
      .map((img) => ({
        value: img.id,
        label: img.name,
      }));
    opts.push({ value: "default", label: "(Default Image)" });
    return opts;
  }, [images]);

  const reportTemplateTypeOptions = useMemo(() => {
    return reportTemplateTypes.map((t) => ({
      value: t.id,
      label: t.name,
    }));
  }, [reportTemplateTypes]);

  // Default selection when options change
  useEffect(() => {
    if (reportTemplateTypeOptions.length > 0 && !reportTemplateTypeOptions.find(o => o.value === reportTemplateType)) {
      setReportTemplateType(reportTemplateTypeOptions[0].value);
    }
  }, [reportTemplateTypeOptions, reportTemplateType]);

  useEffect(() => {
    if (imageOptions.length > 0 && !unselectedImage) {
      const activeIds = imageOptions.map((o) => o.value);
      setUnselectedImage(activeIds[0]);
      setSelectedImage(activeIds.length > 1 ? activeIds[1] : activeIds[0]);
      setIncompleteImage(activeIds.length > 2 ? activeIds[2] : activeIds[0]);
      setReclinedImage("default");
    }
  }, [imageOptions, unselectedImage]);

  // If a currently-selected image becomes inactive, fall back to the first active or default
  useEffect(() => {
    const validIds = imageOptions.map((o) => o.value);
    if (unselectedImage && !validIds.includes(unselectedImage)) setUnselectedImage(validIds[0] || "default");
    if (selectedImage && !validIds.includes(selectedImage)) setSelectedImage(validIds[0] || "default");
    if (incompleteImage && !validIds.includes(incompleteImage)) setIncompleteImage(validIds[0] || "default");
    if (reclinedImage && !validIds.includes(reclinedImage)) setReclinedImage("default");
  }, [imageOptions, unselectedImage, selectedImage, incompleteImage, reclinedImage]);

  const layoutOptions = [
    { value: "fields-right", label: "Fields right of text" },
    { value: "fields-below", label: "Fields below text" },
    { value: "fields-left", label: "Fields left of text" },
    { value: "stacked", label: "Stacked layout" },
  ];

  const calendarOptions = [
    { value: "2021-10-22", label: "Friday, October 22, 2021" },
    { value: "2021-11-01", label: "Monday, November 1, 2021" },
    { value: "2021-12-15", label: "Wednesday, December 15, 2021" },
    { value: "2022-01-10", label: "Monday, January 10, 2022" },
  ];

  // Sync config state up to parent for Template Preview
  useEffect(() => {
    onConfigChange({
      description,
      folderPath,
      displayName,
      internalOnly,
      readOnlyEdit,
      requiresApproval,
      reportTemplateType,
      layout,
      notifyChanged,
      notifyUploaded,
      suppressNotification,
      deadlineCalendar,
      deadlineHours,
      docDueEveryXDays,
      docDueMaxDays,
      incompleteEveryXDays,
      incompleteMaxDays,
      headerColor,
      headerBold,
      headerUnderlined,
      headerFontSize,
      promptColor,
      promptFontSize,
      textFgColor,
      textBgColor,
      textFontSize,
      unselectedImage,
      selectedImage,
      incompleteImage,
      reclinedImage,
      pageSize,
      pageWidth,
      pageHeight,
      pageOrientation,
    });
  }, [
    description, folderPath, displayName, internalOnly, readOnlyEdit, requiresApproval,
    reportTemplateType, layout, notifyChanged, notifyUploaded, suppressNotification,
    deadlineCalendar, deadlineHours, docDueEveryXDays, docDueMaxDays,
    incompleteEveryXDays, incompleteMaxDays, headerColor, headerBold, headerUnderlined,
    headerFontSize, promptColor, promptFontSize, textFgColor, textBgColor, textFontSize,
    unselectedImage, selectedImage, incompleteImage, reclinedImage, onConfigChange,
    pageSize, pageWidth, pageHeight, pageOrientation,
  ]);

  return (
    <div className="flex flex-col gap-2.5 p-2.5 sm:p-[10px] h-full overflow-hidden">
      {/* Scrollable form content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-2.5 px-0 sm:px-2.5">
          {/* ===== INITIAL INFORMATION FIELDS ===== */}

          {/* Template Name */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-start sm:items-center py-[5px]">
            <FieldLabel>Template Name:</FieldLabel>
            <DSInput value={templateName} onChange={onTemplateNameChange} placeholder="Enter template name" />
          </div>

          {/* Description */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-start sm:items-start py-[5px]">
            <FieldLabel>Description:</FieldLabel>
            <DSTextarea value={description} onChange={setDescription} placeholder="Enter description" />
          </div>

          {/* Folder Path */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-start sm:items-center py-[5px]">
            <FieldLabel>Folder Path:</FieldLabel>
            <DSInput value={folderPath} onChange={setFolderPath} placeholder="/data/offerings/" />
          </div>

          {/* Display Name */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-start sm:items-center py-[5px]">
            <FieldLabel>Display Name:</FieldLabel>
            <DSInput value={displayName} onChange={setDisplayName} placeholder="Enter display name" />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6 sm:gap-[50px] items-center py-5">
            <div className="flex items-center gap-2.5">
              <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                Internal Only:
              </span>
              <DSCheckbox checked={internalOnly} onChange={() => setInternalOnly(!internalOnly)} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                Read Only (Edit):
              </span>
              <DSCheckbox checked={readOnlyEdit} onChange={() => setReadOnlyEdit(!readOnlyEdit)} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                Requires Approval:
              </span>
              <DSCheckbox checked={requiresApproval} onChange={() => setRequiresApproval(!requiresApproval)} />
            </div>
          </div>

          {/* Report Template Type */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-2.5">
            <FieldLabel>Report Template Type:</FieldLabel>
            <DSSelect
              value={reportTemplateType}
              onChange={setReportTemplateType}
              options={reportTemplateTypeOptions}
            />
          </div>

          {/* Layout - hidden temporarily
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-2.5">
            <FieldLabel>Layout:</FieldLabel>
            <DSSelect value={layout} onChange={setLayout} options={layoutOptions} />
          </div>
          */}

          <Divider />

          {/* ===== ADMINISTRATION NOTIFICATION SETTINGS ===== */}
          <SectionHeading>Administration Notification Settings</SectionHeading>

          <div className="flex flex-wrap gap-6 sm:gap-[50px] items-start px-0 sm:px-2.5">
            <div className="flex items-start gap-2.5">
              <div className="flex items-center py-[5px]">
                <DSCheckbox checked={notifyChanged} onChange={() => setNotifyChanged(!notifyChanged)} />
              </div>
              <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal w-[167px]" style={{ fontWeight: 500 }}>
                Notify when document changed
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex items-center py-[5px]">
                <DSCheckbox checked={notifyUploaded} onChange={() => setNotifyUploaded(!notifyUploaded)} />
              </div>
              <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal w-[177px]" style={{ fontWeight: 500 }}>
                Notify when attachment uploaded
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex items-center py-[5px]">
                <DSCheckbox
                  checked={suppressNotification}
                  onChange={() => setSuppressNotification(!suppressNotification)}
                />
              </div>
              <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal w-[274px]" style={{ fontWeight: 500 }}>
                Suppress notification when document completed, if no required fields
              </span>
            </div>
          </div>

          <Divider />

          {/* ===== DOCUMENT-SPECIFIC NOTIFICATION SETTINGS ===== */}
          <SectionHeading>Document-Specific Notification Settings (Optional)</SectionHeading>

          <div className="flex flex-col gap-2.5 px-0 sm:px-2.5">
            {/* Row 1: Calendar + Hours */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-[30px] items-start">
              {/* Calendar */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-2.5 flex-1 min-w-0">
                <FieldLabel>Deadline reminder: Calendar Item</FieldLabel>
                <DSSelect
                  value={deadlineCalendar}
                  onChange={setDeadlineCalendar}
                  options={calendarOptions}
                />
              </div>
              {/* Hours prior */}
              <div className="flex items-center gap-2 sm:gap-2.5 py-[5px] shrink-0">
                <div className="w-[140px]">
                  <p className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                    Deadline reminder:<br /># if hour prior
                  </p>
                </div>
                <CounterInput value={deadlineHours} onChange={setDeadlineHours} />
              </div>
            </div>

            {/* Row 2: Due every X days + Max days */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-[50px] items-start">
              <div className="flex items-center gap-2.5 py-[5px]">
                <div className="w-[185px]">
                  <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                    Document due reminder: Every X days
                  </span>
                </div>
                <CounterInput value={docDueEveryXDays} onChange={setDocDueEveryXDays} />
              </div>
              <div className="flex items-center gap-2.5 py-[5px]">
                <div className="w-[185px]">
                  <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                    Document due reminder: Maximum days
                  </span>
                </div>
                <CounterInput value={docDueMaxDays} onChange={setDocDueMaxDays} />
              </div>
            </div>

            {/* Row 3: Incomplete every X days + Max days */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-[50px] items-start">
              <div className="flex items-center gap-2.5 py-[5px]">
                <div className="w-[185px]">
                  <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                    Incomplete reminder: Every X days
                  </span>
                </div>
                <CounterInput value={incompleteEveryXDays} onChange={setIncompleteEveryXDays} />
              </div>
              <div className="flex items-center gap-2.5 py-[5px]">
                <div className="w-[185px]">
                  <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                    Incomplete reminder: Maximum days
                  </span>
                </div>
                <CounterInput value={incompleteMaxDays} onChange={setIncompleteMaxDays} />
              </div>
            </div>
          </div>

          <Divider />

          {/* ===== DEFAULT HEADER CONFIGURATION ===== (hidden temporarily)
          <SectionHeading>Default Header Configuration</SectionHeading>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[50px] items-start px-0 sm:px-2.5">
            <div className="flex items-center gap-5 py-2.5">
              <FieldLabel>Color:</FieldLabel>
              <ColorSelect value={headerColor} onChange={setHeaderColor} />
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-[30px] items-center">
              <div className="flex items-center gap-2.5">
                <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                  Bold
                </span>
                <DSCheckbox checked={headerBold} onChange={() => setHeaderBold(!headerBold)} />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal" style={{ fontWeight: 500 }}>
                  Underlined
                </span>
                <DSCheckbox checked={headerUnderlined} onChange={() => setHeaderUnderlined(!headerUnderlined)} />
              </div>
              <div className="flex items-center gap-2.5 py-[5px]">
                <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal w-[67px]" style={{ fontWeight: 500 }}>
                  Font Size
                </span>
                <CounterInput value={headerFontSize} onChange={setHeaderFontSize} />
              </div>
            </div>
          </div>

          <Divider />

          <SectionHeading>Default Prompt Configuration</SectionHeading>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[50px] items-start px-0 sm:px-2.5">
            <div className="flex items-center gap-5 py-2.5">
              <FieldLabel>Color:</FieldLabel>
              <ColorSelect value={promptColor} onChange={setPromptColor} />
            </div>
            <div className="flex items-center gap-2.5 py-[5px]">
              <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal w-[67px]" style={{ fontWeight: 500 }}>
                Font Size
              </span>
              <CounterInput value={promptFontSize} onChange={setPromptFontSize} />
            </div>
          </div>

          <Divider />

          <SectionHeading>Text Box Configuration</SectionHeading>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-[50px] items-start px-0 sm:px-2.5">
            <div className="flex items-center gap-5 py-2.5">
              <FieldLabel>Foreground color:</FieldLabel>
              <ColorSelect value={textFgColor} onChange={setTextFgColor} />
            </div>
            <div className="flex items-center gap-5 py-2.5">
              <FieldLabel width="w-[136px]">Background color:</FieldLabel>
              <ColorSelect value={textBgColor} onChange={setTextBgColor} />
            </div>
            <div className="flex items-center gap-2.5 py-[5px]">
              <span className="font-['Poppins',sans-serif] text-[14px] text-black leading-normal w-[67px]" style={{ fontWeight: 500 }}>
                Font Size
              </span>
              <CounterInput value={textFontSize} onChange={setTextFontSize} />
            </div>
          </div>

          <Divider />
          */}

          {/* ===== CUSTOM IMAGES ===== */}
          <SectionHeading>Custom Images</SectionHeading>

          <div className="flex flex-col gap-2.5 px-0 sm:px-2.5 pb-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-2.5">
              <FieldLabel>Unselected Image:</FieldLabel>
              <DSSelect value={unselectedImage} onChange={setUnselectedImage} options={imageOptions} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-2.5">
              <FieldLabel>Selected Image:</FieldLabel>
              <DSSelect value={selectedImage} onChange={setSelectedImage} options={imageOptions} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-2.5">
              <FieldLabel>Incomplete Image:</FieldLabel>
              <DSSelect value={incompleteImage} onChange={setIncompleteImage} options={imageOptions} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 items-start sm:items-center py-2.5">
              <FieldLabel>Reclined Image:</FieldLabel>
              <DSSelect value={reclinedImage} onChange={setReclinedImage} options={imageOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Main Modal Component
// =====================================================================
export function CreateTemplateModal({ open, onClose, images, reportTemplateTypes, reportFields, onSave, editData }: CreateTemplateModalProps) {
  const [innerTab, setInnerTab] = useState<InnerTab>("Template Builder");
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState("buyer-sam");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Track the edit ID for keying ConfigurationTab remounts
  const [configKey, setConfigKey] = useState(0);

  // Shared state for Template Builder
  const [config, setConfig] = useState<TemplateConfig>(defaultTemplateConfig);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({ ...defaultCanvasConfig });
  // Trigger in-canvas preview mode inside TemplateBuilder
  const [previewTrigger, setPreviewTrigger] = useState(0);
  // Options kebab menu visibility
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Toolbar state pushed up from TemplateBuilder (undo/redo, preview, canvas settings, etc.)
  const [toolbarState, setToolbarState] = useState<{
    canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void;
    previewMode: boolean; onTogglePreview: () => void;
    showCanvasSettings: boolean; onCanvasSettings: () => void;
    hasElements: boolean; onClearAll: () => void;
  }>({
    canUndo: false, canRedo: false, onUndo: () => {}, onRedo: () => {},
    previewMode: false, onTogglePreview: () => {},
    showCanvasSettings: false, onCanvasSettings: () => {},
    hasElements: false, onClearAll: () => {},
  });

  // Stable callback ref to avoid infinite re-render loops in ConfigurationTab sync effect
  const configRef = useRef<TemplateConfig>(defaultTemplateConfig);
  const handleConfigChange = useCallback((c: TemplateConfig) => {
    configRef.current = c;
    setConfig(c);
    // Sync report template type from ConfigurationTab → modal-level templateType
    if (c.reportTemplateType) {
      setTemplateType(c.reportTemplateType);
    }
    // Sync page size from ConfigurationTab → canvasConfig
    setCanvasConfig((prev) => {
      if (
        prev.pageSizeWidth !== c.pageWidth ||
        prev.pageSizeHeight !== c.pageHeight ||
        prev.pageOrientation !== c.pageOrientation
      ) {
        return {
          ...prev,
          pageSizePreset: (c.pageSize || "letter") as CanvasConfig["pageSizePreset"],
          pageSizeWidth: c.pageWidth,
          pageSizeHeight: c.pageHeight,
          pageOrientation: c.pageOrientation,
        };
      }
      return prev;
    });
  }, []);

  // Sync page size from canvasConfig (Template Builder dropdown) → ConfigurationTab
  const prevCanvasPageRef = useRef({ w: canvasConfig.pageSizeWidth, h: canvasConfig.pageSizeHeight, o: canvasConfig.pageOrientation, p: canvasConfig.pageSizePreset });
  useEffect(() => {
    const prev = prevCanvasPageRef.current;
    const cur = { w: canvasConfig.pageSizeWidth, h: canvasConfig.pageSizeHeight, o: canvasConfig.pageOrientation, p: canvasConfig.pageSizePreset };
    if (prev.w !== cur.w || prev.h !== cur.h || prev.o !== cur.o || prev.p !== cur.p) {
      prevCanvasPageRef.current = cur;
      setConfig((c) => ({
        ...c,
        pageSize: cur.p || "letter",
        pageWidth: cur.w,
        pageHeight: cur.h,
        pageOrientation: cur.o,
      }));
    }
  }, [canvasConfig.pageSizeWidth, canvasConfig.pageSizeHeight, canvasConfig.pageOrientation, canvasConfig.pageSizePreset]);

  const templateTypeOptions = useMemo(() => {
    return reportTemplateTypes.map((t) => ({
      value: t.id,
      label: t.name,
      description: t.description,
    }));
  }, [reportTemplateTypes]);

  const selectedType = templateTypeOptions.find((t) => t.value === templateType);

  // Default to first type when options change
  useEffect(() => {
    if (templateTypeOptions.length > 0 && !templateTypeOptions.find((o) => o.value === templateType)) {
      setTemplateType(templateTypeOptions[0].value);
    }
  }, [templateTypeOptions, templateType]);

  // Reset state when opening — populate from editData if in edit mode
  useEffect(() => {
    if (open) {
      setInnerTab("Template Builder");
      if (editData) {
        // Edit / Duplicate mode — hydrate from saved data
        setTemplateName(editData.data.templateName);
        setTemplateType(editData.data.templateType);
        setConfig({ ...editData.data.config });
        setElements(editData.data.elements.map((el) => ({ ...el })));
        setCanvasConfig({ ...editData.data.canvasConfig });
      } else {
        // Create mode — blank defaults
        setTemplateName("");
        setTemplateType(reportTemplateTypes.length > 0 ? reportTemplateTypes[0].id : "");
        setConfig(defaultTemplateConfig);
        setElements([]);
        setCanvasConfig({ ...defaultCanvasConfig });
      }
      // Bump configKey to force ConfigurationTab remount with new initial values
      setConfigKey((k) => k + 1);
    }
  }, [open, editData]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4"
      style={{ backdropFilter: "blur(2px)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[1300px] h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Create New Template"
      >
        {/* ========== MODAL HEADER ========== */}
        <div className="flex flex-col gap-2 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-0 shrink-0">
          {/* Title + Close */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2
                className="font-['Montserrat',sans-serif] text-[20px] sm:text-[24px] lg:text-[27px] text-ds-purple-mid leading-normal"
                style={{ fontWeight: 700 }}
              >
                Document Template Management
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0 mt-1"
              aria-label="Close"
            >
              <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                <path d="M1 1L13 13M13 1L1 13" stroke="var(--ds-dark-gray)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-px sm:pt-px">
              {/* Left: Builder label + undo/redo (only when on Template Builder tab) */}
              <div className="flex items-center gap-2 pb-1">
                {innerTab === "Template Builder" && (
                  <>
                    <span
                      className="font-['Montserrat',sans-serif] text-[14px] text-ds-purple-dark"
                      style={{ fontWeight: 700 }}
                    >
                      Template Builder
                    </span>
                    {!toolbarState.previewMode && (
                      <span className="font-['Poppins',sans-serif] text-[10px] text-ds-teal bg-ds-teal-light px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                        Drag & Drop
                      </span>
                    )}
                    {toolbarState.previewMode && (
                      <span className="font-['Poppins',sans-serif] text-[10px] text-white bg-ds-purple px-2.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                        PREVIEW
                      </span>
                    )}
                    {!toolbarState.previewMode && (
                      <div className="flex items-center gap-0.5 ml-1 border-l border-ds-haze pl-2.5">
                        <button
                          onClick={toolbarState.onUndo}
                          disabled={!toolbarState.canUndo}
                          title="Undo (Ctrl+Z)"
                          type="button"
                          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                            toolbarState.canUndo
                              ? "text-ds-dark-gray hover:bg-ds-purple-light hover:text-ds-purple cursor-pointer"
                              : "text-ds-light-gray cursor-default"
                          }`}
                        >
                          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                            <path d="M4 6h6a3 3 0 110 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 3L3.5 5.5 6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          onClick={toolbarState.onRedo}
                          disabled={!toolbarState.canRedo}
                          title="Redo (Ctrl+Y)"
                          type="button"
                          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                            toolbarState.canRedo
                              ? "text-ds-dark-gray hover:bg-ds-purple-light hover:text-ds-purple cursor-pointer"
                              : "text-ds-light-gray cursor-default"
                          }`}
                        >
                          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                            <path d="M12 6H6a3 3 0 100 6h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 3l2.5 2.5L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* ── Separator + Action buttons (Preview, Canvas, Clear All) ── */}
                    <div className="flex items-center gap-2 ml-1 border-l border-ds-haze pl-2.5">
                      {/* Preview toggle */}
                      <button
                        onClick={toolbarState.onTogglePreview}
                        title={toolbarState.previewMode ? "Exit Preview (Esc)" : "Preview (Ctrl+P)"}
                        type="button"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                          toolbarState.previewMode
                            ? "border-ds-purple bg-ds-purple text-white hover:bg-ds-purple-dark"
                            : "border-ds-haze text-ds-gray hover:text-ds-purple hover:border-ds-purple/50"
                        }`}
                      >
                        {toolbarState.previewMode ? (
                          <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                            <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                          </svg>
                        )}
                        <span className="font-['Poppins',sans-serif] text-[10px]" style={{ fontWeight: 500 }}>
                          {toolbarState.previewMode ? "Exit Preview" : "Preview"}
                        </span>
                      </button>
                      {/* Settings */}
                      {!toolbarState.previewMode && (
                        <button
                          onClick={() => setInnerTab("Configuration")}
                          title="Settings"
                          type="button"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ds-haze text-ds-gray hover:text-ds-purple hover:border-ds-purple/50 transition-colors cursor-pointer"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                          <span className="font-['Poppins',sans-serif] text-[10px]" style={{ fontWeight: 500 }}>
                            Settings
                          </span>
                        </button>
                      )}
                      {/* Canvas Settings */}
                      {!toolbarState.previewMode && (
                        <button
                          onClick={toolbarState.onCanvasSettings}
                          title="Canvas Settings"
                          type="button"
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                            toolbarState.showCanvasSettings
                              ? "border-ds-purple bg-ds-purple-light text-ds-purple"
                              : "border-ds-haze text-ds-gray hover:text-ds-purple hover:border-ds-purple/50"
                          }`}
                        >
                          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 5h13M5 1.5v13" stroke="currentColor" strokeWidth="1.2"/></svg>
                          <span className="font-['Poppins',sans-serif] text-[10px]" style={{ fontWeight: 500 }}>
                            Canvas
                          </span>
                        </button>
                      )}
                      {/* Clear All */}
                      {!toolbarState.previewMode && toolbarState.hasElements && (
                        <button
                          onClick={toolbarState.onClearAll}
                          type="button"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-ds-haze text-ds-gray hover:text-red-500 hover:border-red-300 transition-colors cursor-pointer"
                        >
                          <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M1.5 3.5h11M5.5 3.5V2a1 1 0 011-1h1a1 1 0 011 1v1.5m1.5 0v8a1 1 0 01-1 1h-5a1 1 0 01-1-1v-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <span className="font-['Poppins',sans-serif] text-[10px]" style={{ fontWeight: 500 }}>
                            Clear All
                          </span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              {/* Right: Options menu (3-dot kebab) */}
              <div className="relative shrink-0 pb-1">
                <button
                  onClick={() => setShowOptionsMenu((v) => !v)}
                  type="button"
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
                  title="Options"
                >
                  <svg width="4" height="18" viewBox="0 0 4 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="2" cy="2" r="2" fill="#46367F" />
                    <circle cx="2" cy="9" r="2" fill="#46367F" />
                    <circle cx="2" cy="16" r="2" fill="#46367F" />
                  </svg>
                </button>
                {showOptionsMenu && (
                  <>
                    {/* Backdrop to close menu on outside click */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowOptionsMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          const trimmedName = templateName.trim();
                          if (!trimmedName) {
                            toast.error("Template name is required", {
                              description: "Please enter a name for your template before saving.",
                            });
                            return;
                          }
                          if (onSave) {
                            onSave({
                              templateName: trimmedName,
                              templateType,
                              config,
                              elements,
                              canvasConfig,
                            });
                          }
                        }}
                        type="button"
                        className="w-full text-left px-4 py-2 text-[13px] font-['Poppins',sans-serif] text-ds-purple hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#46367F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                          <polyline points="17 21 17 13 7 13 7 21" />
                          <polyline points="7 3 7 8 15 8" />
                        </svg>
                        Save
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onClose();
                        }}
                        type="button"
                        className="w-full text-left px-4 py-2 text-[13px] font-['Poppins',sans-serif] text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Exit
                      </button>
                    </div>
                  </>
                )}
              </div>
          </div>
        </div>

        {/* ========== INNER CONTENT CONTAINER ========== */}
        <div className="flex-1 min-h-0 mx-4 sm:mx-6 lg:mx-8 mb-4 sm:mb-5 mt-2 border border-ds-light-gray rounded-[10px] bg-white overflow-hidden">
          {/* Configuration tab — always mounted to preserve form state */}
          <div className={innerTab === "Configuration" ? "h-full flex flex-col" : "hidden"}>
            {/* Back to Builder bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-ds-light-gray bg-gray-50/60">
              <button
                onClick={() => setInnerTab("Template Builder")}
                type="button"
                className="flex items-center gap-1.5 text-ds-purple hover:text-ds-purple-dark transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-['Poppins',sans-serif] text-[13px]" style={{ fontWeight: 500 }}>
                  Back to Builder
                </span>
              </button>
              <span className="font-['Montserrat',sans-serif] text-[13px] text-ds-gray ml-1">— Template Settings</span>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
            <ConfigurationTab
              key={configKey}
              templateName={templateName}
              onTemplateNameChange={setTemplateName}
              images={images}
              reportTemplateTypes={reportTemplateTypes}
              onConfigChange={handleConfigChange}
            />
            </div>
          </div>
          {innerTab === "Template Builder" && (
            <TemplateBuilder
              reportFields={reportFields}
              images={images}
              elements={elements}
              onElementsChange={setElements}
              canvasConfig={canvasConfig}
              onCanvasConfigChange={setCanvasConfig}
              pageWidth={config.pageWidth}
              pageHeight={config.pageHeight}
              pageOrientation={config.pageOrientation}
              templateName={templateName}
              templateDescription={config.description}
              externalPreviewTrigger={previewTrigger}
              onSettings={() => setInnerTab("Configuration")}
              onToolbarState={setToolbarState}
            />
          )}
        </div>
      </div>
    </div>
  );
}