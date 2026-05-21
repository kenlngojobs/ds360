import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import { TemplateTable, type TemplateDocument } from "./TemplateTable";
import { ImagesTab, initialImages, type ImageDocument } from "./ImagesTab";
import { ReportFieldsTab, initialFields, type ReportField } from "./ReportFieldsTab";
import { ReportTemplateTypesTab, initialTypes, type ReportTemplateType } from "./ReportTemplateTypesTab";
import { CreateTemplateModal, type SavedTemplateData } from "./CreateTemplateModal";
import {
  templatesApi,
  imagesApi,
  reportFieldsApi,
  reportTemplateTypesApi,
  type ImageDocument as ApiImage,
  type ReportField as ApiReportField,
  type ReportTemplateType as ApiReportTemplateType,
} from "../../services/api";

export function DocumentTemplateManagement() {
  const tabs = ["Template", "Images", "Report Fields", "Report Template Types"];
  const [activeTab, setActiveTab] = useState<string>("Template");
  const [templates, setTemplates] = useState<TemplateDocument[]>([]);
  const [images, setImages] = useState<ImageDocument[]>(initialImages);
  const [reportFields, setReportFields] = useState<ReportField[]>(initialFields);
  const [reportTemplateTypes, setReportTemplateTypes] = useState<ReportTemplateType[]>(initialTypes);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  /** Full builder data store — maps template ID → SavedTemplateData for reconstruction */
  const [templateStore, setTemplateStore] = useState<Record<string, SavedTemplateData>>({});
  /** When editing/duplicating, holds the ID + data to pass to the modal */
  const [editPayload, setEditPayload] = useState<{ id: string; data: SavedTemplateData } | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // ── Load data from API on mount ─────────────────────────────────────────────
  useEffect(() => {
    // Load templates
    setLoadingTemplates(true);
    templatesApi.getAll().then(async (data) => {
      console.log('[HYDRATE] getAll result:', data);
      if (data && data.length > 0) {
        setTemplates(data);
        // Hydrate templateStore from server — fetch full builder data for each template
        for (const tmpl of data) {
          console.log('[HYDRATE] fetching template:', tmpl.id, tmpl.name);
          try {
            const full = await templatesApi.getOne(tmpl.id);
            console.log('[HYDRATE] getOne result:', full);
            if (full.configJson !== undefined || full.elementsJson !== undefined || full.typographyJson !== undefined) {
              const configParsed = JSON.parse(full.configJson ?? '{}');
              const parsed: SavedTemplateData = {
                templateName: full.name,
                templateType: full.templateTypeId || configParsed.reportTemplateType || '',
                config: configParsed,
                elements: JSON.parse(full.elementsJson ?? '[]'),
                canvasConfig: full.typographyJson ? JSON.parse(full.typographyJson) : {},
              };
              console.log('[HYDRATE] storing in templateStore:', tmpl.id, parsed);
              setTemplateStore((prev) => ({ ...prev, [tmpl.id]: parsed }));
            } else {
              console.warn('[HYDRATE] missing builder data for', tmpl.id, { configJson: full.configJson, elementsJson: full.elementsJson });
            }
          } catch (err) {
            console.error('[HYDRATE] getOne failed for', tmpl.id, err);
          }
        }
      } else {
        console.log('[HYDRATE] getAll returned empty or no data');
      }
    }).catch((err) => {
      console.error('[HYDRATE] getAll failed:', err);
      // Fall back to static initialTemplates
    }).finally(() => setLoadingTemplates(false));

    // Load images
    setLoadingImages(true);
    imagesApi.getAll().then((data) => {
      if (data && data.length > 0) setImages(data as ImageDocument[]);
    }).catch(() => {
      // Fall back to static initialImages
    }).finally(() => setLoadingImages(false));

    // Load report fields
    setLoadingFields(true);
    reportFieldsApi.getAll().then((data) => {
      if (data && data.length > 0) setReportFields(data.map((f) => ({ ...f })));
    }).catch(() => {
      // Fall back to static initialFields
    }).finally(() => setLoadingFields(false));

    // Load report template types
    setLoadingTypes(true);
    reportTemplateTypesApi.getAll().then((data) => {
      if (data && data.length > 0) setReportTemplateTypes(data.map((t) => ({ ...t })));
    }).catch(() => {
      // Fall back to static initialTypes
    }).finally(() => setLoadingTypes(false));
  }, []);

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
    // Persist status change to API (fire-and-forget)
    const template = templates.find((t) => t.id === id);
    if (template) {
      templatesApi.update(id, { ...template, active: !template.active }).catch(() => {
        // Status toggle failed silently — local state already updated
      });
    }
  }, [templates]);

  const handleSaveTemplate = useCallback((data: SavedTemplateData) => {
    const isEditing = editPayload !== null;
    const id = isEditing ? editPayload.id : `tmpl-${Date.now()}`;

    // Serialize builder data for server persistence
    const configJson = JSON.stringify(data.config ?? {});
    const elementsJson = JSON.stringify(data.elements ?? []);
    const typographyJson = data.canvasConfig ? JSON.stringify(data.canvasConfig) : undefined;

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
      configJson,
      elementsJson,
      typographyJson,
    };

    if (isEditing) {
      setTemplates((prev) => prev.map((t) => (t.id === id ? updatedDoc : t)));
    } else {
      setTemplates((prev) => [updatedDoc, ...prev]);
    }

    // Persist full builder data in the store
    setTemplateStore((prev) => ({ ...prev, [id]: data }));

    // ── Sync to API ───────────────────────────────────────────────────────────
    const persist = () =>
      isEditing
        ? templatesApi.update(id, updatedDoc)
        : templatesApi.create(updatedDoc);

    persist()
      .then(() => {
        toast.success(
          `Template "${data.templateName}" ${isEditing ? "updated" : "saved"} successfully`,
          {
            description: isEditing
              ? `Template updated with ${data.elements.length} element${data.elements.length !== 1 ? "s" : ""}.`
              : `Added to the Templates list with ${data.elements.length} element${data.elements.length !== 1 ? "s" : ""}.`,
          }
        );
      })
      .catch((err) => {
        toast.error("Failed to save template to server", {
          description: err?.message ?? "Please try again.",
        });
      });

    setIsCreateTemplateModalOpen(false);
    setEditPayload(null);
  }, [editPayload]);

  // ── Image save handler — sync to API ────────────────────────────────────────
  const handleSaveImage = useCallback((image: ImageDocument) => {
    setImages((prev) => {
      const existing = prev.find((i) => i.id === image.id);
      if (existing) {
        // Update existing
        const updated = prev.map((i) => (i.id === image.id ? image : i));
        imagesApi.update(image.id, image).catch(() => {});
        return updated;
      } else {
        // Create new
        imagesApi.create(image).catch(() => {});
        return [image, ...prev];
      }
    });
  }, []);

  // ── Field save handler — sync to API ────────────────────────────────────────
  const handleSaveField = useCallback((field: ReportField) => {
    setReportFields((prev) => {
      const existing = prev.find((f) => f.id === field.id);
      if (existing) {
        const updated = prev.map((f) => (f.id === field.id ? field : f));
        reportFieldsApi.update(field.id, field).catch(() => {});
        return updated;
      } else {
        reportFieldsApi.create(field).catch(() => {});
        return [field, ...prev];
      }
    });
  }, []);

  // ── Template type save handler — sync to API ────────────────────────────────
  const handleSaveType = useCallback((type: ReportTemplateType) => {
    setReportTemplateTypes((prev) => {
      const existing = prev.find((t) => t.id === type.id);
      if (existing) {
        const updated = prev.map((t) => (t.id === type.id ? type : t));
        reportTemplateTypesApi.update(type.id, type).catch(() => {});
        return updated;
      } else {
        reportTemplateTypesApi.create(type).catch(() => {});
        return [type, ...prev];
      }
    });
  }, []);

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