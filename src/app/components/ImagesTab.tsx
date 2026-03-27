import { useState, useMemo } from "react";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import svgPathsImages from "../../imports/svg-rivjalpdli";
import imgDS360Logo from "figma:asset/d7d08ad4df64de0a114dcc71813a1501ad5e074e.png";
import imgBuyerProfile from "figma:asset/db4f1f82d7154bbed7465e47fc256d85b72ec78c.png";
import { useResizableColumns, ResizeHandle, type ColumnDef } from "./useResizableColumns";
import { AddImageModal } from "./AddImageModal";

export interface ImageDocument {
  id: string;
  name: string;
  active: boolean;
  previewType: "image" | "svg";
  previewSrc?: string;
  previewAspect?: string;
}

export const initialImages: ImageDocument[] = [
  {
    id: "1",
    name: "DS360 Logo with TM 1",
    active: true,
    previewType: "image",
    previewSrc: imgDS360Logo,
    previewAspect: "aspect-square",
  },
  {
    id: "2",
    name: "Buyer Profile Assessment Checklist",
    active: true,
    previewType: "image",
    previewSrc: imgBuyerProfile,
    previewAspect: "aspect-[566/91]",
  },
  {
    id: "3",
    name: "Document Folder Icon",
    active: true,
    previewType: "svg",
  },
];

type SortField = "name" | "status" | "preview";
type SortDirection = "asc" | "desc";

function CheckboxChecked() {
  return (
    <div className="relative rounded-[10px] shrink-0 w-4 h-4">
      <div className="absolute bg-ds-purple border border-ds-purple inset-0 rounded-[5px]" />
      <div className="absolute inset-[30%_20%]">
        <svg viewBox="0 0 9.6 6.4" fill="none" className="w-full h-full">
          <path d={svgPathsImages.p13bf6f00} fill="white" />
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
      <path d={svgPathsImages.pf446780} fill="currentColor" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24.5902 20" fill="none" className="h-full w-auto">
      <path clipRule="evenodd" d={svgPathsImages.p200e7500} fill="black" fillRule="evenodd" />
    </svg>
  );
}

function ImagePreview({ image }: { image: ImageDocument }) {
  if (image.previewType === "svg") {
    return (
      <div className="h-[40px] flex items-center">
        <div className="h-full py-1">
          <FolderIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[40px] flex items-center">
      <img
        src={image.previewSrc}
        alt={image.name}
        className="h-full w-auto object-contain max-w-[200px]"
      />
    </div>
  );
}

/** Mobile card layout for a single image */
function ImageMobileCard({
  image,
  onToggleStatus,
  onEdit,
}: {
  image: ImageDocument;
  onToggleStatus: (id: string) => void;
  onEdit: (image: ImageDocument) => void;
}) {
  return (
    <div className="border border-ds-haze rounded-lg p-3 flex flex-col gap-2.5">
      {/* Name & Status row */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray leading-normal" style={{ fontWeight: 500 }}>
          {image.name}
        </span>
        <button
          onClick={() => onToggleStatus(image.id)}
          className="flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          {image.active ? <CheckboxChecked /> : <CheckboxUnchecked />}
          <span className={`font-['Poppins',sans-serif] text-[11px] ${image.active ? "text-ds-teal" : "text-ds-gray"}`}>
            {image.active ? "Active" : "Inactive"}
          </span>
        </button>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-md p-2 flex items-center justify-center min-h-[50px]">
        <ImagePreview image={image} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-ds-haze">
        <button
          onClick={() => onEdit(image)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-ds-dark-gray" title="Edit">
          <EditIcon />
          <span className="font-['Poppins',sans-serif] text-[11px]">Edit</span>
        </button>
      </div>
    </div>
  );
}

interface ImagesTabProps {
  images: ImageDocument[];
  setImages: React.Dispatch<React.SetStateAction<ImageDocument[]>>;
}

export function ImagesTab({ images, setImages }: ImagesTabProps) {
  const [showInactive, setShowInactive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageDocument | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleToggleStatus = (id: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, active: !img.active } : img))
    );
  };

  const handleOpenAdd = () => {
    setEditingImage(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (image: ImageDocument) => {
    setEditingImage(image);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingImage(null);
  };

  const handleSaveImage = (savedImage: ImageDocument) => {
    if (editingImage) {
      // Update existing
      setImages((prev) =>
        prev.map((img) => (img.id === savedImage.id ? savedImage : img))
      );
    } else {
      // Add new
      setImages((prev) => [savedImage, ...prev]);
    }
    setModalOpen(false);
    setEditingImage(null);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...images];

    if (!showInactive) {
      result = result.filter((img) => img.active);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((img) => img.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      let valA: string, valB: string;
      switch (sortField) {
        case "name":
          valA = a.name;
          valB = b.name;
          break;
        case "status":
          valA = a.active ? "Active" : "Inactive";
          valB = b.active ? "Active" : "Inactive";
          break;
        default:
          valA = a.name;
          valB = b.name;
      }
      const cmp = valA.localeCompare(valB);
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [images, searchQuery, showInactive, sortField, sortDirection]);

  const emptyState = (
    <div className="flex items-center justify-center py-12 text-[#999] font-['Poppins',sans-serif] text-[13px]">
      No images found
    </div>
  );

  const columns: { field: SortField; label: string }[] = [
    { field: "name", label: "Image Name" },
    { field: "status", label: "Status" },
    { field: "preview", label: "Image Preview" },
  ];

  const IMAGE_COLS: ColumnDef[] = [
    { key: "name", initialWidth: 300, minWidth: 120 },
    { key: "status", initialWidth: 150, minWidth: 80 },
    { key: "preview", initialWidth: 400, minWidth: 150 },
  ];

  const { gridStyle, startResize } = useResizableColumns(IMAGE_COLS, 50);

  return (
    <div className="flex flex-col gap-2.5 p-2.5 h-full overflow-hidden">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
        <span className="font-['Montserrat',sans-serif] text-[18px] sm:text-[21px] text-ds-teal leading-normal" style={{ fontWeight: 700 }}>
          Images
        </span>
        <button
          onClick={handleOpenAdd}
          className="bg-ds-purple flex items-center justify-center px-6 sm:px-[50px] py-2.5 sm:py-3 rounded-[100px] border border-ds-purple cursor-pointer hover:bg-ds-purple-hover transition-colors"
        >
          <span className="font-['Poppins',sans-serif] text-[13px] sm:text-[14px] text-white leading-normal whitespace-nowrap" style={{ fontWeight: 500 }}>
            Add New Image
          </span>
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-ds-light-gray shrink-0" />

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
            Show Inactive Images
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
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* ===== Mobile card view (< 768px) ===== */}
        <div className="md:hidden flex-1 overflow-y-auto">
          {filteredAndSorted.length === 0 ? (
            emptyState
          ) : (
            <div className="flex flex-col gap-2.5 pb-2">
              {filteredAndSorted.map((image) => (
                <ImageMobileCard
                  key={image.id}
                  image={image}
                  onToggleStatus={handleToggleStatus}
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
                filteredAndSorted.map((image) => (
                  <div
                    key={image.id}
                    className="items-center py-2.5 border-b border-ds-haze hover:bg-gray-50/50 transition-colors"
                    style={gridStyle()}
                  >
                    {/* Image Name */}
                    <div className="px-2.5 truncate">
                      <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal">
                        {image.name}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-center px-2.5">
                      <button
                        onClick={() => handleToggleStatus(image.id)}
                        className="flex items-center gap-2.5 cursor-pointer"
                      >
                        {image.active ? <CheckboxChecked /> : <CheckboxUnchecked />}
                        <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal w-[50px]">
                          {image.active ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </div>

                    {/* Image Preview */}
                    <div className="px-2.5 overflow-hidden">
                      <ImagePreview image={image} />
                    </div>

                    {/* Edit Action */}
                    <div className="flex items-center justify-center">
                      <button
                        className="flex items-center justify-center w-[30px] h-[38px] p-2.5 rounded-[5px] cursor-pointer hover:bg-gray-100 transition-colors text-ds-black"
                        title="Edit"
                        onClick={() => handleOpenEdit(image)}
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

      {/* Add Image Modal */}
      <AddImageModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveImage}
        editImage={editingImage}
      />
    </div>
  );
}