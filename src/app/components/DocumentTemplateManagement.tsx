import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import { TemplateTable, type TemplateDocument } from "./TemplateTable";
import { ImagesTab, type ImageDocument } from "./ImagesTab";
import { ReportFieldsTab, type ReportField } from "./ReportFieldsTab";
import { ReportTemplateTypesTab, type ReportTemplateType } from "./ReportTemplateTypesTab";
import { CreateTemplateModal, type SavedTemplateData } from "./CreateTemplateModal";
import { defaultTemplateConfig } from "./TemplatePreview";
import { defaultCanvasConfig } from "./TemplateBuilder";
import { ImportTemplateModal } from "./ImportTemplateModal";
import { ImportPreviewPanel } from "./ImportPreviewPanel";
import type { ParsedDocument } from "../../services/document-parsers/types";
import type { MatchResult } from "../../services/import/field-matcher";
import type { CanvasElement } from "./template-builder-types";
import { emitImportStart, emitParseComplete, emitParseError, emitMatchComplete, emitApply } from "../../services/import/telemetry";
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
  const [images, setImages] = useState<ImageDocument[]>([]);
  const [reportFields, setReportFields] = useState<ReportField[]>([]);
  const [reportTemplateTypes, setReportTemplateTypes] = useState<ReportTemplateType[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>("all");
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  // T-07: Preview state — holds the MatchResult between parsing and the user
  // confirming the apply. The ImportPreviewPanel renders this.
  const [previewMatch, setPreviewMatch] = useState<{
    match: MatchResult;
    sourceFile: { name: string; size: number };
  } | null>(null);
  /** Full builder data store — maps template ID → SavedTemplateData for reconstruction */
  const [templateStore, setTemplateStore] = useState<Record<string, SavedTemplateData>>({});
  /** When editing/duplicating, holds the ID + data to pass to the modal */
  const [editPayload, setEditPayload] = useState<{ id: string; data: SavedTemplateData } | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Data migration for pre-fix imported templates.
   * Containers saved before the structurePicked fix are missing
   * layout/rows and show the structure picker instead of their content.
   * This patches all container elements to be renderable.
   */
  const migrateElements = useCallback((elements: CanvasElement[]): CanvasElement[] => {
    return elements.map((el) => {
      if (el.type !== "container") return el;
      const cfg = el.config || {};
      const hasLayout = !!cfg.layout && String(cfg.layout) !== "";
      const hasRows = !!cfg.rows && String(cfg.rows) !== "";
      const hasChildren = el.children && el.children.length > 0 && el.children[0].length > 0;
      // Case 1: Has children but no layout — infer from children structure
      if (hasChildren && !hasLayout) {
        const row = el.children![0];
        const colCount = row.length;
        const layoutMap: Record<number, string> = { 1: "1col", 2: "2col", 3: "3col", 4: "4col" };
        return {
          ...el,
          config: {
            ...cfg,
            layout: layoutMap[colCount] || "1col",
            rows: JSON.stringify([row.map(() => 1)]),
            direction: "horizontal",
            flexDirection: "row",
            structurePicked: true,
          },
        };
      }
      // Case 2: No layout at all — single-cell fallback
      if (!hasLayout && !hasRows) {
        return {
          ...el,
          config: {
            ...cfg,
            layout: "1col",
            rows: "[[1]]",
            direction: "vertical",
            flexDirection: "column",
            structurePicked: true,
          },
        };
      }
      // Case 3: Has layout but no structurePicked — just set the flag
      if (!cfg.structurePicked) {
        return {
          ...el,
          config: { ...cfg, structurePicked: true },
        };
      }
      return el;
    });
  }, []);

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
              const rawElements = JSON.parse(full.elementsJson ?? '[]');
              const migratedElements = migrateElements(rawElements);
              const parsed: SavedTemplateData = {
                templateName: full.name,
                templateType: full.templateTypeId || configParsed.reportTemplateType || '',
                config: configParsed,
                elements: migratedElements,
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
      // Check if this is an auth or network error
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('Authentication required') || errMsg.includes('login page') || errMsg.includes('HTML instead of JSON')) {
        setAuthError('The API server is not responding correctly. This usually means the backend server is down or requires authentication. Please contact your administrator.');
      } else if (errMsg.includes('Network error') || errMsg.includes('Failed to fetch') || errMsg.includes('Unable to reach')) {
        setAuthError('Cannot connect to the API server. The server may be down or unreachable. Please try again later or contact your administrator.');
      }
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

  // T-08: Apply an imported widget tree (from the document import flow) as a new template.
  // Takes a MatchResult (from src/services/import/field-matcher) and converts it into
  // SavedTemplateData so the existing handleSaveTemplate flow can persist it.
  const applyImportedTemplate = useCallback(
    (
      matchResult: MatchResult,
      sourceFile: { name: string; size: number },
    ) => {
      const id = `tmpl-imported-${Date.now()}`;
      // Derive name from source filename (strip extension, replace separators)
      const baseName = sourceFile.name
        .replace(/\.[^.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();
      const templateName = baseName
        ? `Imported: ${baseName}`
        : `Imported ${new Date().toISOString().slice(0, 10)}`;

      // Build elements array: top-level widgets become top-level elements.
      // For widgets with fields (containers, repeaters), the fields become child elements
      // in a single row of a child container, matching the CanvasElement.children[][][] shape.
      const elements = matchResult.widgetTree.map((w) => {
        const el: Record<string, unknown> = {
          id: w.id,
          type: w.type,
          label: w.label,
          config: {
            ...w.config,
            structurePicked: true,
          },
        };
        if (w.children && w.children.length > 0) {
          // Preserve spatial container children from the matcher (e.g., row-group layouts)
          el.children = w.children;
        } else if (w.fields && w.fields.length > 0) {
          // Flat field list: place field widgets in a single row of a child container.
          el.children = [
            [
              w.fields.map((f) => ({
                id: `${w.id}-${f.name}`,
                type: f.widgetType,
                label: f.name,
                config: {
                  label: f.name,
                  placeholder: `Enter ${f.name}...`,
                  ...(f.sampleValues && f.sampleValues[0]
                    ? { defaultValue: f.sampleValues[0] }
                    : {}),
                },
              })),
            ],
          ];
        }
        return el;
      });

      // Use the canonical defaultTemplateConfig and override only the fields
      // that come from the import. This keeps all 30+ fields of TemplateConfig
      // present so downstream consumers (the server, the template builder)
      // see a complete, well-formed config and don't fail on missing keys.
      const config = {
        ...defaultTemplateConfig,
        description: `Imported from ${sourceFile.name}`,
        // Folder path, display name, layout, deadlines, etc. all retain
        // their defaultTemplateConfig values; the imported template is
        // a fresh draft the user can edit.
        internalOnly: false,
        readOnlyEdit: false,
        requiresApproval: false,
        reportTemplateType: "",
      };

      // Use the canonical defaultCanvasConfig from the template builder so
      // the canvas typography + page settings match what the manual
      // "Create New Template" flow produces. The prior hand-rolled block
      // duplicated most of this but missed any future fields the system adds.
      const canvasConfig = defaultCanvasConfig;

      // templateType at the SavedTemplateData level is a free-form string
      // (it's the human-readable name, separate from TemplateConfig.reportTemplateType
      // which is the ID). Empty string lets the user fill it in the Configuration
      // tab after the import.
      const data: SavedTemplateData = {
        templateName,
        templateType: "",
        config,
        elements,
        canvasConfig,
      };

      // Source file metadata (T-10b): the server now accepts sourceFileName + importedAt
      // We tag the call with these so the server can record provenance.
      const stamped = {
        ...data,
        sourceFileName: sourceFile.name,
        importedAt: new Date().toISOString(),
      };

      // Reuse the existing save flow
      handleSaveTemplate(stamped);
    },
    [handleSaveTemplate]
  );


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

  const handleEditTemplate = useCallback(async (id: string) => {
    let storedData = templateStore[id];
    if (!storedData) {
      // Fallback: fetch builder data from the API on demand
      toast.loading("Loading template data...", { id: `edit-${id}` });
      try {
        const full = await templatesApi.getOne(id);
        if (full.configJson !== undefined || full.elementsJson !== undefined || full.typographyJson !== undefined) {
          const configParsed = JSON.parse(full.configJson ?? '{}');
          const rawElements = JSON.parse(full.elementsJson ?? '[]');
          const migratedElements = migrateElements(rawElements);
          storedData = {
            templateName: full.name,
            templateType: full.templateTypeId || configParsed.reportTemplateType || '',
            config: configParsed,
            elements: migratedElements,
            canvasConfig: full.typographyJson ? JSON.parse(full.typographyJson) : {},
          };
          // Store for next time
          setTemplateStore((prev) => ({ ...prev, [id]: storedData! }));
        }
      } catch (err) {
        console.error('[EDIT] on-demand fetch failed for', id, err);
      } finally {
        toast.dismiss(`edit-${id}`);
      }
    }
    if (!storedData) {
      toast.error("Cannot edit this template", {
        description: "No saved builder data found. The server may not have full template data.",
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
      {/* Auth Error Banner */}
      {authError && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3 shrink-0">
          <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-800 font-semibold text-sm">API Connection Error</p>
            <p className="text-red-700 text-sm mt-1">{authError}</p>
          </div>
          <button
            onClick={() => { setAuthError(null); window.location.reload(); }}
            className="text-red-500 hover:text-red-700 text-sm font-medium underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}
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
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="bg-ds-purple flex items-center justify-center px-6 sm:px-[50px] py-2.5 sm:py-3 rounded-[100px] border border-ds-purple cursor-pointer hover:bg-ds-purple-hover transition-colors"
                >
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

      {/* Import Template Modal — T-03, T-06, T-07, T-08, T-09, T-12 */}
      <ImportTemplateModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onFileParsed={(file, sanitizedName, parsed) => {
          // T-06: Run the field-matching algorithm on the parsed document.
          // (Dynamic-imported to keep the matcher out of the main bundle.)
          // The modal now passes the full ParsedDocument (FX-05), so we can
          // hand it directly to the matcher without fabricating metadata.
          import("../../services/import/field-matcher.ts")
            .then(({ matchFieldsToWidgets }) => {
              const match = matchFieldsToWidgets(parsed);
              // T-07: stage the match into preview state; do NOT auto-apply.
              // The ImportPreviewPanel (rendered below) lets the user review
              // and confirm before applyImportedTemplate runs.
              setPreviewMatch({ match, sourceFile: { name: sanitizedName, size: file.size } });
              // Emit telemetry synchronously (telemetry is now statically
              // imported at the top of this file).
              emitMatchComplete(
                sanitizedName,
                match.stats.totalWidgets,
                match.stats.avgConfidence,
                match.stats.lowConfidenceCount,
              );
            })
            .catch((err) => {
              toast.error("Import failed", {
                description: err instanceof Error ? err.message : String(err),
              });
            });
        }}
      />

      {/* T-07: Import Preview Panel — shown after a file is parsed and matched.
          The user reviews the proposed widget tree, then clicks "Apply" to
          convert the match into a SavedTemplateData and persist it. */}
      {previewMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-preview-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewMatch(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="import-preview-title"
                className="font-['Poppins',sans-serif] text-xl font-semibold text-ds-dark-gray"
              >
                Preview: {previewMatch.sourceFile.name}
              </h2>
              <button
                onClick={() => setPreviewMatch(null)}
                aria-label="Close preview"
                className="text-ds-gray hover:text-ds-dark-gray transition-colors p-1"
                type="button"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
            <ImportPreviewPanel
              matchResult={previewMatch.match}
              onChange={(updated) =>
                setPreviewMatch({
                  match: updated,
                  sourceFile: previewMatch.sourceFile,
                })
              }
            />
            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setPreviewMatch(null)}
                className="px-4 py-2 text-ds-dark-gray hover:bg-ds-light-gray rounded-lg text-sm font-medium transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const match = previewMatch.match;
                  const src = previewMatch.sourceFile;
                  applyImportedTemplate(match, src);
                  emitApply(src.name, match.stats.totalWidgets, `tmpl-imported-${Date.now()}`);
                  setPreviewMatch(null);
                  setIsImportModalOpen(false);
                  toast.success(`Imported: ${src.name}`, {
                    description: `${match.stats.totalWidgets} widget(s) created. ${match.stats.lowConfidenceCount} need review.`,
                  });
                }}
                className="px-4 py-2 bg-ds-purple text-white rounded-lg text-sm font-medium hover:bg-ds-purple-hover transition-colors"
                type="button"
              >
                Apply Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}