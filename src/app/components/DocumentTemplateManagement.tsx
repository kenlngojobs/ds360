import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import { TemplateTable, type TemplateDocument } from "./TemplateTable";
import { ImagesTab, initialImages, type ImageDocument } from "./ImagesTab";
import { ReportFieldsTab, initialFields, type ReportField } from "./ReportFieldsTab";
import { ReportTemplateTypesTab, initialTypes, type ReportTemplateType } from "./ReportTemplateTypesTab";
import { CreateTemplateModal, type SavedTemplateData } from "./CreateTemplateModal";

const initialTemplates: TemplateDocument[] = [
  {
    id: "1",
    name: "Assessment Docs - SAM Due Diligence",
    active: true,
    description: "Attachments for SAM Due Diligence",
    approvalRequired: false,
    readOnly: "No (Editable by partners)",
    internalUseOnly: "Yes (Internal use only)",
    templateTypeId: "4",
  },
  {
    id: "2",
    name: "Buyer Enrollment Request",
    active: true,
    description: "Completed for new buyers wishing to join SAM",
    approvalRequired: false,
    readOnly: "Yes (Partners cannot edit)",
    internalUseOnly: "Yes (Internal use only)",
    templateTypeId: "3",
  },
  {
    id: "3",
    name: "Buyer Profile Assessment Checklist 2023",
    active: true,
    description: "Buyer Profile Assessment Checklist 2023e Diligence",
    approvalRequired: true,
    readOnly: "Yes (Partners cannot edit)",
    internalUseOnly: "Yes (Internal use only)",
    templateTypeId: "3",
  },
  {
    id: "4",
    name: "Company Assessment - Follow-up",
    active: true,
    description: "Company Assessment - Follow-up",
    approvalRequired: true,
    readOnly: "No (Editable by partners)",
    internalUseOnly: "No (Available to partners)",
    templateTypeId: "3",
  },
  {
    id: "5",
    name: "DEBT BUYER ASSESSMENT SUMMARY",
    active: true,
    description: "DEBT BUYER ASSESSMENT SUMMARY",
    approvalRequired: false,
    readOnly: "No (Editable by partners)",
    internalUseOnly: "No (Available to partners)",
    templateTypeId: "3",
  },
  {
    id: "6",
    name: "Debt Buyer Profile - 2023",
    active: true,
    description: "Debt Buyer Profile (Company Overview) - Revised",
    approvalRequired: true,
    readOnly: "No (Editable by partners)",
    internalUseOnly: "Yes (Internal use only)",
    templateTypeId: "6",
  },
  {
    id: "7",
    name: "SAM Partner Onboarding Checklist",
    active: false,
    description: "Checklist for onboarding new SAM partners",
    approvalRequired: true,
    readOnly: "No (Editable by partners)",
    internalUseOnly: "Yes (Internal use only)",
    templateTypeId: "2",
  },
  {
    id: "8",
    name: "Annual Compliance Review Form",
    active: true,
    description: "Annual review form for compliance verification",
    approvalRequired: true,
    readOnly: "Yes (Partners cannot edit)",
    internalUseOnly: "No (Available to partners)",
    templateTypeId: "5",
  },
];

const tabs = ["Template", "Images", "Report Fields", "Report Template Types"];

export function DocumentTemplateManagement() {
  const [activeTab, setActiveTab] = useState("Template");
  const [selectedTemplateType, setSelectedTemplateType] = useState("all");
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<TemplateDocument[]>(initialTemplates);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  /** Full builder data store — maps template ID → SavedTemplateData for reconstruction */
  const [templateStore, setTemplateStore] = useState<Record<string, SavedTemplateData>>({});
  /** When editing/duplicating, holds the ID + data to pass to the modal */
  const [editPayload, setEditPayload] = useState<{ id: string; data: SavedTemplateData } | null>(null);

  // Shared state — lifted from tabs so data is wired into the Create Template modal
  const [images, setImages] = useState<ImageDocument[]>(initialImages);
  const [reportFields, setReportFields] = useState<ReportField[]>(initialFields);
  const [reportTemplateTypes, setReportTemplateTypes] = useState<ReportTemplateType[]>(initialTypes);

  const selectedType = reportTemplateTypes.find((t) => t.id === selectedTemplateType);

  /** Templates filtered by the selected Report Template Type */
  const filteredTemplates = useMemo(() => {
    if (selectedTemplateType === "all") return templates;
    return templates.filter((t) => t.templateTypeId === selectedTemplateType);
  }, [templates, selectedTemplateType]);

  const handleToggleStatus = useCallback((id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  }, []);

  const handleSaveTemplate = useCallback((data: SavedTemplateData) => {
    const isEditing = editPayload !== null;
    const id = isEditing ? editPayload.id : `tmpl-${Date.now()}`;

    const updatedDoc: TemplateDocument = {
      id,
      name: data.templateName,
      active: true,
      description: data.config.description || data.templateName,
      approvalRequired: data.config.requiresApproval,
      readOnly: data.config.readOnlyEdit
        ? "Yes (Partners cannot edit)"
        : "No (Editable by partners)",
      internalUseOnly: data.config.internalOnly
        ? "Yes (Internal use only)"
        : "No (Available to partners)",
      templateTypeId: data.config.reportTemplateType,
    };

    if (isEditing) {
      // Update existing template in the list
      setTemplates((prev) => prev.map((t) => (t.id === id ? updatedDoc : t)));
    } else {
      // Prepend new template
      setTemplates((prev) => [updatedDoc, ...prev]);
    }

    // Persist full builder data in the store
    setTemplateStore((prev) => ({ ...prev, [id]: data }));

    setIsCreateTemplateModalOpen(false);
    setEditPayload(null);
    toast.success(
      `Template "${data.templateName}" ${isEditing ? "updated" : "saved"} successfully`,
      {
        description: isEditing
          ? `Template updated with ${data.elements.length} element${data.elements.length !== 1 ? "s" : ""}.`
          : `Added to the Templates list with ${data.elements.length} element${data.elements.length !== 1 ? "s" : ""}.`,
      }
    );
  }, [editPayload]);

  const handleEditTemplate = useCallback((id: string) => {
    const storedData = templateStore[id];
    if (!storedData) {
      toast.error("Cannot edit this template", {
        description: "No saved builder data found. Only templates created in this session can be edited.",
      });
      return;
    }
    setEditPayload({ id, data: storedData });
    setIsCreateTemplateModalOpen(true);
  }, [templateStore]);

  const handleDuplicateTemplate = useCallback((id: string) => {
    const storedData = templateStore[id];
    if (!storedData) {
      // Duplicate without builder data — just clone the table row
      const original = templates.find((t) => t.id === id);
      if (!original) return;
      const newId = `tmpl-${Date.now()}`;
      const duplicated: TemplateDocument = {
        ...original,
        id: newId,
        name: `${original.name} (Copy)`,
        active: true,
      };
      setTemplates((prev) => [duplicated, ...prev]);
      toast.success(`Template "${duplicated.name}" duplicated`, {
        description: "Duplicated without builder data. Open it to start editing.",
      });
      return;
    }
    // Deep-clone the builder data with a new name
    const clonedData: SavedTemplateData = {
      ...storedData,
      templateName: `${storedData.templateName} (Copy)`,
      config: { ...storedData.config },
      elements: storedData.elements.map((el) => ({ ...el, id: `${el.id}-dup-${Date.now()}` })),
      canvasConfig: { ...storedData.canvasConfig },
    };
    // Open the modal in "duplicate" mode (no editPayload ID — treated as new)
    setEditPayload({ id: `tmpl-new-${Date.now()}`, data: clonedData });
    setIsCreateTemplateModalOpen(true);
  }, [templateStore, templates]);

  return (
    <div className="flex flex-col h-full bg-white p-3 sm:p-4 lg:p-5 gap-2.5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Title */}
        <div className="py-[5px]">
          <h1 className="font-['Montserrat',sans-serif] text-[20px] sm:text-[24px] lg:text-[27px] text-ds-purple-mid leading-normal" style={{ fontWeight: 700 }}>
            Document Template Management
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2.5 bg-white overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex flex-col items-center justify-center pt-[5px] px-2 sm:px-[10px] cursor-pointer gap-[5px] shrink-0"
            >
              <span
                className={`font-['Montserrat',sans-serif] text-[14px] sm:text-[16px] lg:text-[18px] text-center leading-normal whitespace-nowrap ${
                  activeTab === tab ? "text-ds-purple" : "text-ds-dark-gray"
                }`}
                style={{ fontWeight: activeTab === tab ? 700 : 500 }}
              >
                {tab}
              </span>
              {activeTab === tab && (
                <div className="w-full h-0.5 bg-ds-purple rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-h-0 border border-ds-light-gray rounded-[10px] bg-white">
        {activeTab === "Template" && (
          <div className="flex flex-col gap-2.5 p-2.5 h-full overflow-hidden">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
              <span className="font-['Montserrat',sans-serif] text-[18px] sm:text-[21px] text-ds-teal leading-normal" style={{ fontWeight: 700 }}>
                Templates
              </span>
              <div className="flex flex-wrap gap-2 sm:gap-5 items-center">
                <button
                  className="bg-ds-purple flex items-center gap-2 px-4 sm:px-[30px] py-2.5 sm:py-3 rounded-[50px] cursor-pointer hover:bg-ds-purple-hover transition-colors"
                  onClick={() => {
                    setEditPayload(null);
                    setIsCreateTemplateModalOpen(true);
                  }}
                >
                  <svg viewBox="0 0 25 25" fill="none" className="w-5 h-5 sm:w-[25px] sm:h-[25px]">
                    <g clipPath="url(#clip_create)">
                      <path d={svgPaths.p135bac80} fill="white" />
                      <path d={svgPaths.p3c0efb00} fill="white" />
                      <path d={svgPaths.p26d48140} fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clip_create">
                        <rect fill="white" height="25" width="25" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="font-['Poppins',sans-serif] text-[13px] sm:text-[16px] text-white leading-normal whitespace-nowrap" style={{ fontWeight: 500 }}>
                    Create New Template
                  </span>
                </button>
                <button className="bg-ds-purple flex items-center justify-center px-6 sm:px-[50px] py-2.5 sm:py-3 rounded-[100px] border border-ds-purple cursor-pointer hover:bg-ds-purple-hover transition-colors">
                  <span className="font-['Poppins',sans-serif] text-[13px] sm:text-[14px] text-white leading-normal whitespace-nowrap" style={{ fontWeight: 500 }}>
                    Import Template
                  </span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-ds-light-gray shrink-0" />

            {/* Template Type Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2.5 px-2 sm:px-5 shrink-0">
              <div className="flex items-center h-auto sm:h-[45px] shrink-0">
                <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                  Template Type
                </span>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-[5px] w-full sm:w-auto">
                <div className="relative w-full sm:flex-1 sm:max-w-[500px]">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-white border border-ds-dark-gray rounded-[30px] flex items-center justify-between px-4 sm:px-[30px] py-[10px] cursor-pointer"
                  >
                    <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                      {selectedTemplateType === "all" ? "All Types" : selectedType?.name ?? "All Types"}
                    </span>
                    <svg
                      viewBox="0 0 21 11.9142"
                      fill="none"
                      className={`w-[19px] h-[9.5px] transition-transform shrink-0 ml-2 ${dropdownOpen ? "rotate-180" : ""}`}
                    >
                      <path
                        d="M1 1L10.5 10.5L20 1"
                        stroke="black"
                        strokeLinecap="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#ddd] rounded-xl shadow-lg z-10 overflow-hidden max-h-[300px] overflow-y-auto">
                      {/* All Types option */}
                      <button
                        onClick={() => {
                          setSelectedTemplateType("all");
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 sm:px-[30px] py-2.5 font-['Poppins',sans-serif] text-[12px] cursor-pointer transition-colors ${
                          selectedTemplateType === "all"
                            ? "bg-ds-purple text-white"
                            : "text-ds-dark-gray hover:bg-[#f0f0f0]"
                        }`}
                      >
                        All Types
                      </button>
                      {reportTemplateTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedTemplateType(type.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 sm:px-[30px] py-2.5 font-['Poppins',sans-serif] text-[12px] cursor-pointer transition-colors ${
                            selectedTemplateType === type.id
                              ? "bg-ds-purple text-white"
                              : "text-ds-dark-gray hover:bg-[#f0f0f0]"
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-1 sm:px-2.5 py-[5px]">
                  <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray/60 sm:text-ds-dark-gray leading-normal">
                    {selectedTemplateType === "all" ? "Showing all template types" : selectedType?.description ?? ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Show Inactive Checkbox */}
            <div className="px-2 sm:px-5 py-[5px] shrink-0">
              <button
                onClick={() => setShowInactive(!showInactive)}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                {showInactive ? (
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
                <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                  Show Inactive Templates
                </span>
              </button>
            </div>

            {/* Search */}
            <div className="bg-black/5 rounded-[45px] shrink-0">
              <div className="flex items-center gap-1 px-3 sm:px-2.5 py-1 h-[41px]">
                <svg viewBox="0 0 13.0242 13.025" fill="none" className="w-4 h-4 shrink-0">
                  <path d={svgPaths.p20180f00} fill="black" fillOpacity="0.2" />
                </svg>
                <input
                  type="text"
                  placeholder="Search Documents"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray placeholder:text-black/20 tracking-[-0.12px]"
                  style={{ fontWeight: 500 }}
                />
              </div>
            </div>

            {/* Table */}
            <TemplateTable
              templates={filteredTemplates}
              searchQuery={searchQuery}
              showInactive={showInactive}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEditTemplate}
              onDuplicate={handleDuplicateTemplate}
            />
          </div>
        )}

        {activeTab === "Images" && <ImagesTab images={images} setImages={setImages} />}

        {activeTab === "Report Fields" && <ReportFieldsTab fields={reportFields} setFields={setReportFields} />}

        {activeTab === "Report Template Types" && <ReportTemplateTypesTab types={reportTemplateTypes} setTypes={setReportTemplateTypes} />}
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal
        open={isCreateTemplateModalOpen}
        onClose={() => {
          setIsCreateTemplateModalOpen(false);
          setEditPayload(null);
        }}
        images={images}
        reportTemplateTypes={reportTemplateTypes}
        reportFields={reportFields}
        onSave={handleSaveTemplate}
        editData={editPayload}
      />
    </div>
  );
}