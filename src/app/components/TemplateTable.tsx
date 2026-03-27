import { useState, useMemo } from "react";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import { useResizableColumns, ResizeHandle, type ColumnDef } from "./useResizableColumns";

export interface TemplateDocument {
  id: string;
  name: string;
  active: boolean;
  description: string;
  approvalRequired: boolean;
  readOnly: string;
  internalUseOnly: string;
  /** Links this template to a ReportTemplateType.id */
  templateTypeId: string;
}

interface TemplateTableProps {
  templates: TemplateDocument[];
  searchQuery: string;
  showInactive: boolean;
  onToggleStatus: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

type SortField = "name" | "status" | "description" | "approvalRequired" | "readOnly" | "internalUseOnly";
type SortDirection = "asc" | "desc";

function CheckboxChecked() {
  return (
    <div className="relative rounded-[10px] shrink-0 w-4 h-4">
      <div className="absolute bg-ds-purple border border-ds-purple inset-0 rounded-[5px]" />
      <div className="absolute inset-[30%_20%]">
        <svg viewBox="0 0 9.6 6.4" fill="none" className="w-full h-full">
          <path d={svgPaths.p13bf6f00} fill="white" />
        </svg>
      </div>
    </div>
  );
}

function CheckboxUnchecked() {
  return (
    <div className="relative shrink-0 w-4 h-4">
      <div className="absolute bg-white border border-ds-gray inset-0 rounded-[5px]" />
    </div>
  );
}

function SortArrow({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <div className={`w-[10px] h-[5px] shrink-0 transition-transform ${active && direction === "asc" ? "rotate-180" : ""}`}>
      <svg viewBox="0 0 12 7.41422" fill="none" className="w-full h-full">
        <path d="M1 1L5.96894 6L11 1" stroke={active ? "var(--ds-teal)" : "white"} strokeLinecap="round" strokeWidth="2" />
      </svg>
    </div>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 17.9996 18.0002" fill="none" className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]">
      <path d={svgPaths.p34c53df1} fill="currentColor" />
    </svg>
  );
}

function DuplicateIcon() {
  return (
    <svg viewBox="0 0 17 20" fill="none" className="w-[14px] h-[17px] sm:w-[17px] sm:h-[20px]">
      <path d={svgPaths.p2f7e1200} fill="currentColor" />
      <path d={svgPaths.p16abf800} fill="currentColor" />
      <path d={svgPaths.p196db4b0} fill="currentColor" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 18 20" fill="none" className="w-[16px] h-[18px] sm:w-[18px] sm:h-[20px]">
      <path d={svgPaths.p4baec00} fill="currentColor" />
    </svg>
  );
}

/** Mobile card layout for a single template */
function TemplateMobileCard({
  template,
  onToggleStatus,
  onEdit,
  onDuplicate,
}: {
  template: TemplateDocument;
  onToggleStatus: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}) {
  return (
    <div className="border border-ds-haze rounded-lg p-3 flex flex-col gap-2">
      {/* Name & Status row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray leading-normal" style={{ fontWeight: 500 }}>
          {template.name}
        </span>
        <button
          onClick={() => onToggleStatus(template.id)}
          className="flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          {template.active ? <CheckboxChecked /> : <CheckboxUnchecked />}
          <span className={`font-['Poppins',sans-serif] text-[11px] ${template.active ? "text-ds-teal" : "text-ds-gray"}`}>
            {template.active ? "Active" : "Inactive"}
          </span>
        </button>
      </div>

      {/* Description */}
      <p className="font-['Poppins',sans-serif] text-[11px] text-ds-gray leading-normal">
        {template.description}
      </p>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex flex-col">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray">Approval</span>
          <span className="font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray">
            {template.approvalRequired ? "Required" : "Not Required"}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray">Read Only</span>
          <span className="font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray">
            {template.readOnly}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-['Poppins',sans-serif] text-[10px] text-ds-gray">Internal</span>
          <span className="font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray">
            {template.internalUseOnly}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-ds-haze">
        <button onClick={() => onEdit && onEdit(template.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-ds-dark-gray" title="Edit">
          <EditIcon />
          <span className="font-['Poppins',sans-serif] text-[11px]">Edit</span>
        </button>
        <button onClick={() => onDuplicate && onDuplicate(template.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-ds-dark-gray" title="Duplicate">
          <DuplicateIcon />
          <span className="font-['Poppins',sans-serif] text-[11px]">Duplicate</span>
        </button>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-ds-dark-gray" title="Download">
          <DownloadIcon />
          <span className="font-['Poppins',sans-serif] text-[11px]">Download</span>
        </button>
      </div>
    </div>
  );
}

const TEMPLATE_COLS: ColumnDef[] = [
  { key: "name", initialWidth: 250, minWidth: 120 },
  { key: "status", initialWidth: 100, minWidth: 70 },
  { key: "description", initialWidth: 300, minWidth: 120 },
  { key: "approvalRequired", initialWidth: 130, minWidth: 80 },
  { key: "readOnly", initialWidth: 130, minWidth: 80 },
  { key: "internalUseOnly", initialWidth: 180, minWidth: 100 },
];

export function TemplateTable({ templates, searchQuery, showInactive, onToggleStatus, onEdit, onDuplicate }: TemplateTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const { gridStyle, startResize } = useResizableColumns(TEMPLATE_COLS, 100);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...templates];

    if (!showInactive) {
      result = result.filter((t) => t.active);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: string, valB: string;
      switch (sortField) {
        case "name": valA = a.name; valB = b.name; break;
        case "status": valA = a.active ? "Active" : "Inactive"; valB = b.active ? "Active" : "Inactive"; break;
        case "description": valA = a.description; valB = b.description; break;
        case "approvalRequired": valA = a.approvalRequired ? "Required" : "Not Required"; valB = b.approvalRequired ? "Required" : "Not Required"; break;
        case "readOnly": valA = a.readOnly; valB = b.readOnly; break;
        case "internalUseOnly": valA = a.internalUseOnly; valB = b.internalUseOnly; break;
        default: valA = a.name; valB = b.name;
      }
      const cmp = valA.localeCompare(valB);
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [templates, searchQuery, showInactive, sortField, sortDirection]);

  const columns: { field: SortField; label: string }[] = [
    { field: "name", label: "Template Name" },
    { field: "status", label: "Status" },
    { field: "description", label: "Description" },
    { field: "approvalRequired", label: "Approval Required" },
    { field: "readOnly", label: "Read only" },
    { field: "internalUseOnly", label: "Internal Use Only" },
  ];

  const emptyState = (
    <div className="flex items-center justify-center py-12 text-[#999] font-['Poppins',sans-serif] text-[13px]">
      No templates found
    </div>
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ===== Mobile card view (< 768px) ===== */}
      <div className="md:hidden flex-1 overflow-y-auto">
        {filteredAndSorted.length === 0 ? (
          emptyState
        ) : (
          <div className="flex flex-col gap-2.5 pb-2">
            {filteredAndSorted.map((template) => (
              <TemplateMobileCard
                key={template.id}
                template={template}
                onToggleStatus={onToggleStatus}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== Desktop table view (>= 768px) ===== */}
      <div className="hidden md:flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="overflow-x-auto flex-1 min-h-0 flex flex-col">
          {/* Column Headers */}
          <div className="bg-ds-purple-dark items-center py-2.5 shrink-0" style={gridStyle()}>
            {columns.map((col, idx) => (
              <div key={col.field} className="relative h-full">
                <button
                  onClick={() => handleSort(col.field)}
                  className="flex items-center justify-between px-2.5 h-full cursor-pointer w-full overflow-hidden"
                >
                  <span
                    className="font-['Poppins',sans-serif] text-[12px] text-white tracking-[-0.12px] leading-[14px] whitespace-nowrap"
                    style={{ fontWeight: 500 }}
                  >
                    {col.label}
                  </span>
                  <SortArrow active={sortField === col.field} direction={sortDirection} />
                </button>
                {idx < columns.length - 1 && (
                  <ResizeHandle onMouseDown={(e) => startResize(idx, e)} />
                )}
              </div>
            ))}
            <div />
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {filteredAndSorted.length === 0 ? (
              emptyState
            ) : (
              filteredAndSorted.map((template) => (
                <div
                  key={template.id}
                  className="items-center py-2.5 border-b border-ds-haze hover:bg-gray-50/50 transition-colors"
                  style={gridStyle()}
                >
                  {/* Template Name */}
                  <div className="px-2.5 truncate">
                    <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                      {template.name}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-center px-2.5">
                    <button
                      onClick={() => onToggleStatus(template.id)}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      {template.active ? <CheckboxChecked /> : <CheckboxUnchecked />}
                      <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal w-[50px]">
                        {template.active ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </div>

                  {/* Description */}
                  <div className="px-2.5 truncate">
                    <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                      {template.description}
                    </span>
                  </div>

                  {/* Approval Required */}
                  <div className="px-2.5 truncate">
                    <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                      {template.approvalRequired ? "Required" : "Not Required"}
                    </span>
                  </div>

                  {/* Read Only */}
                  <div className="px-2.5 truncate">
                    <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                      {template.readOnly}
                    </span>
                  </div>

                  {/* Internal Use Only */}
                  <div className="px-2.5 truncate">
                    <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                      {template.internalUseOnly}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-0">
                    <button
                      className="flex items-center justify-center w-[30px] h-[38px] p-2.5 rounded-[5px] cursor-pointer hover:bg-gray-100 transition-colors text-ds-black"
                      title="Edit"
                      onClick={() => onEdit && onEdit(template.id)}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="flex items-center justify-center w-[30px] h-[38px] p-2.5 rounded-[5px] cursor-pointer hover:bg-gray-100 transition-colors text-ds-black"
                      title="Duplicate"
                      onClick={() => onDuplicate && onDuplicate(template.id)}
                    >
                      <DuplicateIcon />
                    </button>
                    <button
                      className="flex items-center justify-center w-[30px] h-[38px] p-2.5 rounded-[5px] cursor-pointer hover:bg-gray-100 transition-colors text-ds-black"
                      title="Download"
                    >
                      <DownloadIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}