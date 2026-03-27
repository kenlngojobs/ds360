import { useState, useMemo } from "react";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import svgPathsEdit from "../../imports/svg-g98rdeeln3";
import { AddTemplateTypeModal } from "./AddTemplateTypeModal";
import { useResizableColumns, ResizeHandle, type ColumnDef } from "./useResizableColumns";

export interface ReportTemplateType {
  id: string;
  name: string;
  description: string;
}

export const initialTypes: ReportTemplateType[] = [
  {
    id: "1",
    name: "Certificate of Destruction",
    description: "Certificate of Destruction",
  },
  {
    id: "2",
    name: "NDA",
    description: "Non-disclosure agreement",
  },
  {
    id: "3",
    name: "Buyer Assessment",
    description: "Assessment report for prospective debt buyers",
  },
  {
    id: "4",
    name: "Seller Due Diligence",
    description: "Due diligence documentation for debt sellers",
  },
  {
    id: "5",
    name: "Compliance Audit",
    description: "Internal compliance audit report template",
  },
  {
    id: "6",
    name: "Portfolio Summary",
    description: "Summary of debt portfolio details and metrics",
  },
  {
    id: "7",
    name: "Transfer Agreement",
    description: "Debt portfolio transfer and assignment agreement",
  },
];

type SortField = "name" | "description";
type SortDirection = "asc" | "desc";

function SortArrow({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <div
      className={`w-[10px] h-[5px] shrink-0 transition-transform ${
        active && direction === "asc" ? "rotate-180" : ""
      }`}
    >
      <svg viewBox="0 0 12 7.41422" fill="none" className="w-full h-full">
        <path
          d="M1 1L5.96894 6L11 1"
          stroke={active ? "var(--ds-teal)" : "white"}
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 17.9996 18.0002"
      fill="none"
      className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]"
    >
      <path d={svgPathsEdit.pf446780} fill="currentColor" />
    </svg>
  );
}

/** Mobile card layout for a single template type */
function TypeMobileCard({
  templateType,
  onEdit,
}: {
  templateType: ReportTemplateType;
  onEdit: (t: ReportTemplateType) => void;
}) {
  return (
    <div className="border border-ds-haze rounded-lg p-3 flex flex-col gap-2">
      {/* Name */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray leading-normal"
          style={{ fontWeight: 500 }}
        >
          {templateType.name}
        </span>
      </div>

      {/* Description */}
      <p className="font-['Poppins',sans-serif] text-[11px] text-ds-gray leading-normal">
        {templateType.description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-ds-haze">
        <button
          onClick={() => onEdit(templateType)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-ds-dark-gray"
          title="Edit"
        >
          <EditIcon />
          <span className="font-['Poppins',sans-serif] text-[11px]">Edit</span>
        </button>
      </div>
    </div>
  );
}

interface ReportTemplateTypesTabProps {
  types: ReportTemplateType[];
  setTypes: React.Dispatch<React.SetStateAction<ReportTemplateType[]>>;
}

export function ReportTemplateTypesTab({ types, setTypes }: ReportTemplateTypesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ReportTemplateType | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleOpenAdd = () => {
    setEditingType(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (t: ReportTemplateType) => {
    setEditingType(t);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingType(null);
  };

  const handleSaveType = (savedType: ReportTemplateType) => {
    if (editingType) {
      setTypes((prev) =>
        prev.map((t) => (t.id === savedType.id ? savedType : t))
      );
    } else {
      setTypes((prev) => [savedType, ...prev]);
    }
    setModalOpen(false);
    setEditingType(null);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...types];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const valA = sortField === "name" ? a.name : a.description;
      const valB = sortField === "name" ? b.name : b.description;
      const cmp = valA.localeCompare(valB);
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [types, searchQuery, sortField, sortDirection]);

  const emptyState = (
    <div className="flex items-center justify-center py-12 text-ds-gray font-['Poppins',sans-serif] text-[13px]">
      No report template types found
    </div>
  );

  const columns: { field: SortField; label: string }[] = [
    { field: "name", label: "Name" },
    { field: "description", label: "Description" },
  ];

  const TYPE_COLS: ColumnDef[] = [
    { key: "name", initialWidth: 400, minWidth: 120 },
    { key: "description", initialWidth: 500, minWidth: 150 },
  ];

  const { gridStyle, startResize } = useResizableColumns(TYPE_COLS, 50);

  return (
    <div className="flex flex-col gap-2.5 p-2.5 h-full overflow-hidden">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
        <span
          className="font-['Montserrat',sans-serif] text-[18px] sm:text-[21px] text-ds-teal leading-normal"
          style={{ fontWeight: 700 }}
        >
          Report Template Types
        </span>
        <button
          onClick={handleOpenAdd}
          className="bg-ds-purple flex items-center justify-center px-6 sm:px-[50px] py-2.5 sm:py-3 rounded-[100px] border border-ds-purple cursor-pointer hover:bg-ds-purple-hover transition-colors"
        >
          <span
            className="font-['Poppins',sans-serif] text-[13px] sm:text-[14px] text-white leading-normal whitespace-nowrap"
            style={{ fontWeight: 500 }}
          >
            Add New Type
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-ds-light-gray shrink-0" />

      {/* Search */}
      <div className="bg-black/5 rounded-[45px] shrink-0">
        <div className="flex items-center gap-1 px-3 sm:px-2.5 py-1 h-[41px]">
          <svg
            viewBox="0 0 13.0242 13.025"
            fill="none"
            className="w-4 h-4 shrink-0"
          >
            <path d={svgPaths.p20180f00} fill="black" fillOpacity="0.2" />
          </svg>
          <input
            type="text"
            placeholder="Search Report Template Types"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray placeholder:text-black/20 tracking-[-0.12px]"
            style={{ fontWeight: 500 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* ===== Mobile card view (< 768px) ===== */}
        <div className="md:hidden flex-1 overflow-y-auto">
          {filteredAndSorted.length === 0 ? (
            emptyState
          ) : (
            <div className="flex flex-col gap-2.5 pb-2">
              {filteredAndSorted.map((t) => (
                <TypeMobileCard
                  key={t.id}
                  templateType={t}
                  onEdit={handleOpenEdit}
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
                    <SortArrow
                      active={sortField === col.field}
                      direction={sortDirection}
                    />
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
                filteredAndSorted.map((t) => (
                  <div
                    key={t.id}
                    className="items-center py-2.5 border-b border-ds-haze hover:bg-gray-50/50 transition-colors"
                    style={gridStyle()}
                  >
                    {/* Name */}
                    <div className="px-2.5 truncate">
                      <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                        {t.name}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="px-2.5 truncate">
                      <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                        {t.description}
                      </span>
                    </div>

                    {/* Edit Action */}
                    <div className="flex items-center justify-center">
                      <button
                        className="flex items-center justify-center w-[30px] h-[38px] p-2.5 rounded-[5px] cursor-pointer hover:bg-gray-100 transition-colors text-ds-black"
                        title="Edit"
                        onClick={() => handleOpenEdit(t)}
                      >
                        <EditIcon />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Template Type Modal */}
      <AddTemplateTypeModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveType}
        editType={editingType}
      />
    </div>
  );
}