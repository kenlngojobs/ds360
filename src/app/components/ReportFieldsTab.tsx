import { useState, useMemo } from "react";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import svgPathsReport from "../../imports/svg-g98rdeeln3";
import { useResizableColumns, ResizeHandle, type ColumnDef } from "./useResizableColumns";
import { AddFieldModal } from "./AddFieldModal";

export interface ReportField {
  id: string;
  name: string;
  fieldType: string;
  description: string;
}

export const initialFields: ReportField[] = [
  {
    id: "1",
    name: "Address City",
    fieldType: "Partner Documents",
    description: "City name",
  },
  {
    id: "2",
    name: "Address Line 1",
    fieldType: "Partner Documents",
    description: "First line of address",
  },
  {
    id: "3",
    name: "Assessment FollowUp Notes",
    fieldType: "Offering Documents",
    description:
      "Notes regarding SAMs attempts to follow up with Buyer/Seller Assessment Docs",
  },
  {
    id: "4",
    name: "Company Affiliations",
    fieldType: "Offering Documents",
    description: "Company affiliations",
  },
  {
    id: "5",
    name: "Inventory-Active Accounts",
    fieldType: "Partner Documents",
    description: "# of active accounts",
  },
  {
    id: "6",
    name: "Buyer Contact Email",
    fieldType: "Partner Documents",
    description: "Primary email address of the buyer contact",
  },
  {
    id: "7",
    name: "Compliance Status",
    fieldType: "Compliance Documents",
    description: "Current compliance verification status",
  },
  {
    id: "8",
    name: "Due Diligence Score",
    fieldType: "Assessment Documents",
    description: "Calculated due diligence assessment score",
  },
];

type SortField = "name" | "fieldType" | "description";
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
      <path d={svgPathsReport.pf446780} fill="currentColor" />
    </svg>
  );
}

/** Mobile card layout for a single report field */
function FieldMobileCard({
  field,
  onEdit,
}: {
  field: ReportField;
  onEdit: (field: ReportField) => void;
}) {
  return (
    <div className="border border-ds-haze rounded-lg p-3 flex flex-col gap-2">
      {/* Name */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray leading-normal"
          style={{ fontWeight: 500 }}
        >
          {field.name}
        </span>
      </div>

      {/* Field Type badge */}
      <div className="flex items-center">
        <span className="font-['Poppins',sans-serif] text-[11px] text-ds-purple bg-ds-purple-light px-2.5 py-0.5 rounded-full">
          {field.fieldType}
        </span>
      </div>

      {/* Description */}
      <p className="font-['Poppins',sans-serif] text-[11px] text-ds-gray leading-normal">
        {field.description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-ds-haze">
        <button
          onClick={() => onEdit(field)}
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

interface ReportFieldsTabProps {
  fields: ReportField[];
  setFields: React.Dispatch<React.SetStateAction<ReportField[]>>;
}

export function ReportFieldsTab({ fields, setFields }: ReportFieldsTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ReportField | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleOpenAdd = () => {
    setEditingField(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (field: ReportField) => {
    setEditingField(field);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingField(null);
  };

  const handleSaveField = (savedField: ReportField) => {
    if (editingField) {
      setFields((prev) =>
        prev.map((f) => (f.id === savedField.id ? savedField : f))
      );
    } else {
      setFields((prev) => [savedField, ...prev]);
    }
    setModalOpen(false);
    setEditingField(null);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...fields];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.fieldType.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: string, valB: string;
      switch (sortField) {
        case "name":
          valA = a.name;
          valB = b.name;
          break;
        case "fieldType":
          valA = a.fieldType;
          valB = b.fieldType;
          break;
        case "description":
          valA = a.description;
          valB = b.description;
          break;
        default:
          valA = a.name;
          valB = b.name;
      }
      const cmp = valA.localeCompare(valB);
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [fields, searchQuery, sortField, sortDirection]);

  const emptyState = (
    <div className="flex items-center justify-center py-12 text-ds-gray font-['Poppins',sans-serif] text-[13px]">
      No report fields found
    </div>
  );

  const columns: { field: SortField; label: string }[] = [
    { field: "name", label: "Field Name" },
    { field: "fieldType", label: "Field Type" },
    { field: "description", label: "Description" },
  ];

  const FIELD_COLS: ColumnDef[] = [
    { key: "name", initialWidth: 400, minWidth: 120 },
    { key: "fieldType", initialWidth: 200, minWidth: 100 },
    { key: "description", initialWidth: 350, minWidth: 150 },
  ];

  const { gridStyle, startResize } = useResizableColumns(FIELD_COLS, 50);

  return (
    <div className="flex flex-col gap-2.5 p-2.5 h-full overflow-hidden">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
        <span
          className="font-['Montserrat',sans-serif] text-[18px] sm:text-[21px] text-ds-teal leading-normal"
          style={{ fontWeight: 700 }}
        >
          Report Fields
        </span>
        <button
          onClick={handleOpenAdd}
          className="bg-ds-purple flex items-center justify-center px-6 sm:px-[50px] py-2.5 sm:py-3 rounded-[100px] border border-ds-purple cursor-pointer hover:bg-ds-purple-hover transition-colors"
        >
          <span
            className="font-['Poppins',sans-serif] text-[13px] sm:text-[14px] text-white leading-normal whitespace-nowrap"
            style={{ fontWeight: 500 }}
          >
            Add New Field
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
            placeholder="Search Report Fields"
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
              {filteredAndSorted.map((field) => (
                <FieldMobileCard
                  key={field.id}
                  field={field}
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
                filteredAndSorted.map((field) => (
                  <div
                    key={field.id}
                    className="items-center py-2.5 border-b border-ds-haze hover:bg-gray-50/50 transition-colors"
                    style={gridStyle()}
                  >
                    {/* Field Name */}
                    <div className="px-2.5 truncate">
                      <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                        {field.name}
                      </span>
                    </div>

                    {/* Field Type */}
                    <div className="px-2.5 truncate">
                      <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                        {field.fieldType}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="px-2.5 truncate">
                      <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                        {field.description}
                      </span>
                    </div>

                    {/* Edit Action */}
                    <div className="flex items-center justify-center">
                      <button
                        className="flex items-center justify-center w-[30px] h-[38px] p-2.5 rounded-[5px] cursor-pointer hover:bg-gray-100 transition-colors text-ds-black"
                        title="Edit"
                        onClick={() => handleOpenEdit(field)}
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

      {/* Add / Edit Field Modal */}
      <AddFieldModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveField}
        editField={editingField}
      />
    </div>
  );
}