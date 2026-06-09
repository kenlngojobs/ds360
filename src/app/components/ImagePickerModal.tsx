import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { ImageDocument } from "./ImagesTab";

interface ImagePickerModalProps {
  open: boolean;
  images: ImageDocument[];
  onClose: () => void;
  onSelect: (image: ImageDocument) => void;
}

export function ImagePickerModal({ open, images, onClose, onSelect }: ImagePickerModalProps) {
  const [search, setSearch] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
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

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return images;
    const q = search.toLowerCase();
    return images.filter((im) => im.name.toLowerCase().includes(q));
  }, [images, search]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10"
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[720px] max-h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Select an image"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-ds-haze shrink-0">
          <span
            className="font-['Montserrat',sans-serif] text-[18px] sm:text-[20px] text-ds-purple-mid leading-normal"
            style={{ fontWeight: 700 }}
          >
            Select Image
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <path d="M1 1L13 13M13 1L1 13" stroke="#3a3a3a" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 sm:px-8 py-4 border-b border-ds-haze shrink-0">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-light-gray">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M15 15L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images by name…"
              className="w-full border border-ds-light-gray rounded-xl pl-10 pr-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray placeholder:text-ds-light-gray outline-none focus:border-ds-purple transition-colors"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ds-light-gray hover:text-ds-gray cursor-pointer"
              >
                <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                  <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-['Poppins',sans-serif] text-[11px] text-ds-gray">
              {filtered.length} image{filtered.length !== 1 ? "s" : ""} found
            </span>
            {search.trim() && (
              <span className="font-['Poppins',sans-serif] text-[11px] text-ds-purple cursor-pointer hover:underline" onClick={() => setSearch("")}>
                Clear search
              </span>
            )}
          </div>
        </div>

        {/* Image grid */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="w-12 h-12 rounded-full bg-ds-purple-light flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--ds-purple)" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="var(--ds-purple)" />
                  <path d="M3 15L8 10L12 14L16 9L21 15" stroke="var(--ds-purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-['Poppins',sans-serif] text-[13px] text-ds-gray">
                {search.trim() ? "No images match your search" : "No images in library"}
              </span>
              <span className="font-['Poppins',sans-serif] text-[11px] text-ds-light-gray text-center max-w-[280px]">
                {search.trim()
                  ? "Try a different keyword or clear the search."
                  : "Upload images in the Images tab to see them here."}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((image) => (
                <button
                  key={image.id}
                  onClick={() => onSelect(image)}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-ds-haze bg-[#fafafa] hover:border-ds-purple hover:bg-ds-purple-light transition-all cursor-pointer text-left"
                  title={image.name}
                >
                  <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-white flex items-center justify-center">
                    {image.previewSrc ? (
                      <img
                        src={image.previewSrc}
                        alt={image.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-ds-light-gray">
                          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                          <path d="M3 15L8 10L12 14L16 9L21 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-['Poppins',sans-serif] text-[10px] text-ds-light-gray">No preview</span>
                      </div>
                    )}
                  </div>
                  <span className="font-['Poppins',sans-serif] text-[11px] text-ds-dark-gray truncate w-full text-center" style={{ fontWeight: 500 }}>
                    {image.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-ds-haze shrink-0 flex items-center justify-between">
          <span className="font-['Poppins',sans-serif] text-[11px] text-ds-light-gray">
            Click an image to select it
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-ds-purple text-ds-purple font-['Poppins',sans-serif] text-[12px] hover:bg-ds-purple-light transition-colors cursor-pointer"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
