import React, { useState, useMemo } from "react";
import { useDrag } from "react-dnd";
import type { ReportField } from "./ReportFieldsTab";
import type { ImageDocument } from "./ImagesTab";
import type { WidgetType } from "./template-builder-types";
import {
  TemplateTitleIcon, TemplateDescriptionIcon, HeaderIcon, ParagraphIcon,
  ImageWidgetIcon, AlertIcon, RepeaterIcon, TextBoxIcon, TextAreaIcon,
  NumberInputIcon, AttachmentIcon, ButtonWidgetIcon, CheckBoxIcon,
  RadioButtonIcon, DropdownIcon, CalendarIcon, ToggleIcon, SignatureIcon,
  ContainerIcon, DividerWidgetIcon, SpacerIcon, PageBreakIcon,
  InternalFieldIcon, PartnerTagsIcon, ReportFieldIcon,
  PanelCollapseIcon, ChevronIcon,
} from "./template-builder-icons";

export interface PaletteWidget {
  type: WidgetType;
  label: string;
  icon: React.ReactNode;
  /** For report-field type, which field it represents */
  fieldId?: string;
  /** Default config when dropped */
  defaultConfig?: Record<string, string | number | boolean>;
}

export interface WidgetCategory {
  name: string;
  widgets: PaletteWidget[];
}

export const ITEM_TYPE_PALETTE = "PALETTE_WIDGET";

// =====================================================================
// Build palette categories
// =====================================================================
export function buildCategories(
  reportFields: ReportField[],
  _images: ImageDocument[]
): WidgetCategory[] {
  // ── Document Widgets ──
  const templateTitleWidget: PaletteWidget = {
    type: "template-title",
    label: "Template Title",
    icon: <TemplateTitleIcon />,
    defaultConfig: { showBorder: true, borderColor: "#46367F" },
  };
  const templateDescriptionWidget: PaletteWidget = {
    type: "template-description",
    label: "Template Description",
    icon: <TemplateDescriptionIcon />,
    defaultConfig: {},
  };

  // ── Content Widgets (display-only) ──
  const headerWidget: PaletteWidget = {
    type: "header",
    label: "Header",
    icon: <HeaderIcon />,
    defaultConfig: { text: "Section Header", tag: "H2" },
  };
  const paragraphWidget: PaletteWidget = {
    type: "paragraph",
    label: "Paragraph",
    icon: <ParagraphIcon />,
    defaultConfig: { text: "Enter your text here..." },
  };
  const imageWidget: PaletteWidget = {
    type: "image",
    label: "Image",
    icon: <ImageWidgetIcon />,
    defaultConfig: { imageId: "", imageName: "Select image..." },
  };
  const alertWidget: PaletteWidget = {
    type: "alert",
    label: "Alert",
    icon: <AlertIcon />,
    defaultConfig: { message: "This is an important notice.", variant: "info", title: "" },
  };
  const repeaterWidget: PaletteWidget = {
    type: "repeater",
    label: "Repeater",
    icon: <RepeaterIcon />,
    defaultConfig: { label: "Items", itemLabel: "Item", minItems: 1, maxItems: 10 },
  };

  // ── Form Widgets (user-input) ──
  const textBoxWidget: PaletteWidget = {
    type: "text-box",
    label: "Text Box",
    icon: <TextBoxIcon />,
    defaultConfig: { label: "Text Field", placeholder: "Enter value..." },
  };
  const textAreaWidget: PaletteWidget = {
    type: "text-area",
    label: "Text Area",
    icon: <TextAreaIcon />,
    defaultConfig: { label: "Notes", placeholder: "Enter text here...", rows: 4 },
  };
  const numberInputWidget: PaletteWidget = {
    type: "number-input",
    label: "Number Input",
    icon: <NumberInputIcon />,
    defaultConfig: { label: "Amount", placeholder: "0", min: 0, max: 9999, step: 1 },
  };
  const attachmentWidget: PaletteWidget = {
    type: "attachment",
    label: "Attachment",
    icon: <AttachmentIcon />,
    defaultConfig: { label: "Upload File", accept: "*" },
  };
  const buttonWidget: PaletteWidget = {
    type: "button",
    label: "Button",
    icon: <ButtonWidgetIcon />,
    defaultConfig: { label: "Submit", variant: "primary", size: "md" },
  };
  const checkboxWidget: PaletteWidget = {
    type: "checkbox",
    label: "Check Box",
    icon: <CheckBoxIcon />,
    defaultConfig: { label: "I agree", required: false },
  };
  const radioButtonWidget: PaletteWidget = {
    type: "radio-button",
    label: "Radio Button",
    icon: <RadioButtonIcon />,
    defaultConfig: { label: "Option", options: "Option 1,Option 2,Option 3" as unknown as string },
  };
  const dropdownWidget: PaletteWidget = {
    type: "dropdown",
    label: "Dropdown",
    icon: <DropdownIcon />,
    defaultConfig: { label: "Select", options: "Option 1,Option 2,Option 3" as unknown as string },
  };
  const calendarWidget: PaletteWidget = {
    type: "calendar",
    label: "Calendar",
    icon: <CalendarIcon />,
    defaultConfig: { label: "Date" },
  };
  const toggleWidget: PaletteWidget = {
    type: "toggle",
    label: "Toggle",
    icon: <ToggleIcon />,
    defaultConfig: { label: "Enable", defaultValue: false, onLabel: "Yes", offLabel: "No" },
  };
  const signatureWidget: PaletteWidget = {
    type: "signature",
    label: "Signature",
    icon: <SignatureIcon />,
    defaultConfig: { label: "Signature", hint: "Sign within the box", required: false },
  };

  // ── Layout Widgets ──
  const containerWidget: PaletteWidget = {
    type: "container",
    label: "Container",
    icon: <ContainerIcon />,
    defaultConfig: {
      structurePicked: false as unknown as boolean,
      layout: "1col",
      rows: "[[1]]",
      direction: "vertical",
      flexDirection: "column",
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
      containerWidth: 100,
      containerWidthUnit: "%",
      containerMinHeight: 0,
      containerMinHeightUnit: "px",
      bgColor: "transparent",
      opacity: 100,
      shadow: "none",
      alignment: "left",
      overflow: "hidden",
      zIndex: "",
      // Zero spacing by default — matches Elementor behavior
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
  };
  const dividerWidget: PaletteWidget = {
    type: "divider",
    label: "Divider",
    icon: <DividerWidgetIcon />,
    defaultConfig: { style: "solid" },
  };
  const spacerWidget: PaletteWidget = {
    type: "spacer",
    label: "Spacer",
    icon: <SpacerIcon />,
    defaultConfig: { height: 32 },
  };
  const pageBreakWidget: PaletteWidget = {
    type: "page-break",
    label: "Page Break",
    icon: <PageBreakIcon />,
    defaultConfig: {},
  };

  // ── Data Widgets ──
  const internalFieldWidget: PaletteWidget = {
    type: "internal-field",
    label: "Internal Field",
    icon: <InternalFieldIcon />,
    defaultConfig: { property: "customer.name" },
  };
  const partnerTagsWidget: PaletteWidget = {
    type: "partner-tags",
    label: "Partner Tags",
    icon: <PartnerTagsIcon />,
    defaultConfig: { source: "all" },
  };

  // ── Report Fields (from Report Fields tab) ──
  const reportFieldWidgets: PaletteWidget[] = reportFields.map((f) => ({
    type: "report-field" as WidgetType,
    label: f.name,
    icon: <ReportFieldIcon />,
    fieldId: f.id,
    defaultConfig: {
      fieldId: f.id,
      fieldName: f.name,
      fieldType: f.fieldType,
      required: false,
    },
  }));

  return [
    {
      name: "Document",
      widgets: [
        templateTitleWidget,
        templateDescriptionWidget,
      ],
    },
    {
      name: "Layout",
      widgets: [
        containerWidget,
        dividerWidget,
        spacerWidget,
        pageBreakWidget,
      ],
    },
    {
      name: "Content",
      widgets: [
        headerWidget,
        paragraphWidget,
        imageWidget,
        alertWidget,
        repeaterWidget,
      ],
    },
    {
      name: "Form Elements",
      widgets: [
        textBoxWidget,
        textAreaWidget,
        numberInputWidget,
        attachmentWidget,
        buttonWidget,
        checkboxWidget,
        radioButtonWidget,
        dropdownWidget,
        calendarWidget,
        toggleWidget,
        signatureWidget,
      ],
    },
    {
      name: "Data",
      widgets: [
        internalFieldWidget,
        partnerTagsWidget,
      ],
    },
    {
      name: "Report Fields",
      widgets: reportFieldWidgets,
    },
  ];
}

// =====================================================================
// Palette Draggable Widget
// =====================================================================
export function PaletteWidgetCard({ widget }: { widget: PaletteWidget }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ITEM_TYPE_PALETTE,
      item: { widget },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [widget]
  );

  return (
    <div
      ref={drag}
      className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all ${
        isDragging
          ? "opacity-40 border-ds-purple bg-ds-purple-light scale-95 cursor-grabbing"
          : "border-ds-haze bg-white hover:border-ds-purple hover:shadow-sm cursor-grab active:cursor-grabbing"
      }`}
      title={widget.label}
    >
      <div className="text-ds-dark-gray w-6 h-6">{widget.icon}</div>
      <span
        className="font-['Poppins',sans-serif] text-[9.5px] text-ds-dark-gray text-center leading-tight line-clamp-1"
        style={{ fontWeight: 500 }}
      >
        {widget.label}
      </span>
    </div>
  );
}

// =====================================================================
// Left Panel — Widget Palette
// =====================================================================
export function WidgetPalette({
  categories,
  searchQuery,
  onSearchChange,
  collapsed,
  onToggleCollapse,
}: {
  categories: WidgetCategory[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => Object.fromEntries(categories.map((c) => [c.name, true]))
  );

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        widgets: cat.widgets.filter((w) => w.label.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.widgets.length > 0);
  }, [categories, searchQuery]);

  if (collapsed) {
    return (
      <div className="w-10 shrink-0 bg-[#f7f6fa] border-r border-ds-haze flex flex-col items-center pt-2">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-ds-purple-light cursor-pointer transition-colors text-ds-dark-gray"
          title="Expand panel"
        >
          <PanelCollapseIcon flipped />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[210px] shrink-0 bg-[#f7f6fa] border-r border-ds-haze flex flex-col overflow-hidden h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-ds-haze shrink-0">
        <span
          className="font-['Montserrat',sans-serif] text-[13px] text-ds-purple-dark"
          style={{ fontWeight: 700 }}
        >
          Widgets
        </span>
        <button
          onClick={onToggleCollapse}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-ds-purple-light cursor-pointer transition-colors text-ds-dark-gray"
          title="Collapse panel"
        >
          <PanelCollapseIcon />
        </button>
      </div>

      {/* Search */}
      <div className="px-2.5 py-2 shrink-0">
        <div className="bg-white rounded-lg border border-ds-haze">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5">
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5 shrink-0">
              <circle cx="6" cy="6" r="4.5" stroke="#999" strokeWidth="1.5" />
              <path d="M10 10l3 3" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent outline-none font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray placeholder:text-ds-light-gray min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredCategories.length === 0 && (
          <div className="flex items-center justify-center py-8 px-3">
            <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray text-center">
              No widgets found
            </span>
          </div>
        )}

        {filteredCategories.map((cat) => (
          <div key={cat.name} className="border-b border-ds-haze last:border-b-0">
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat.name)}
              className="w-full flex items-center gap-1.5 px-3 py-2 cursor-pointer hover:bg-white/50 transition-colors"
            >
              <ChevronIcon open={openCategories[cat.name] !== false} />
              <span
                className="font-['Poppins',sans-serif] text-[11px] text-ds-purple-dark"
                style={{ fontWeight: 600 }}
              >
                {cat.name}
              </span>
            </button>

            {/* Widget grid */}
            {openCategories[cat.name] !== false && (
              <div className="px-2.5 pb-2.5 grid grid-cols-2 gap-1.5">
                {cat.widgets.map((w, idx) => (
                  <PaletteWidgetCard
                    key={`${cat.name}-${w.type}-${w.fieldId ?? idx}`}
                    widget={w}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
