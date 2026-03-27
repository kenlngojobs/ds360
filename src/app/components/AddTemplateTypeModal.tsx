import { useState, useRef, useCallback, useEffect } from "react";
import type { ReportTemplateType } from "./ReportTemplateTypesTab";

interface AddTemplateTypeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (templateType: ReportTemplateType) => void;
  editType?: ReportTemplateType | null;
}

export function AddTemplateTypeModal({ open, onClose, onSave, editType }: AddTemplateTypeModalProps) {
  const isEditMode = !!editType;

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset / populate state on open
  useEffect(() => {
    if (open) {
      setNameError("");
      setDescriptionError("");
      setIsSaving(false);
      setShowSuccess(false);

      if (editType) {
        setName(editType.name);
        setDescription(editType.description);
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [open, editType]);

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
      if (e.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, isSaving]);

  const handleSave = useCallback(() => {
    let valid = true;

    if (!name.trim()) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!description.trim()) {
      setDescriptionError("Description is required.");
      valid = false;
    } else {
      setDescriptionError("");
    }

    if (!valid) return;

    setIsSaving(true);
    setTimeout(() => {
      const saved: ReportTemplateType = {
        id: isEditMode ? editType!.id : `type-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
      };
      setShowSuccess(true);
      setTimeout(() => {
        onSave(saved);
      }, 1200);
    }, 800);
  }, [name, description, onSave, isEditMode, editType]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current && !isSaving) {
        onClose();
      }
    },
    [onClose, isSaving]
  );

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      style={{ backdropFilter: "blur(2px)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label={isEditMode ? "Edit Template Type" : "Add New Type"}
      >
        {/* ========== Header ========== */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-ds-haze shrink-0">
          <span
            className="font-['Montserrat',sans-serif] text-[18px] sm:text-[20px] text-ds-purple-mid leading-normal"
            style={{ fontWeight: 700 }}
          >
            {isEditMode ? "Edit Template Type" : "Add New Type"}
          </span>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <path d="M1 1L13 13M13 1L1 13" stroke="var(--ds-dark-gray)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ========== Body ========== */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5">
          {showSuccess ? (
            <SuccessView isEditMode={isEditMode} />
          ) : (
            <div className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="type-name"
                  className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal"
                  style={{ fontWeight: 500 }}
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="type-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  disabled={isSaving}
                  placeholder="Enter template type name"
                  className={`w-full border rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray placeholder:text-ds-light-gray outline-none transition-colors disabled:opacity-60 ${
                    nameError
                      ? "border-red-400 focus:border-red-500"
                      : "border-ds-light-gray focus:border-ds-purple"
                  }`}
                />
                {nameError && (
                  <span className="font-['Poppins',sans-serif] text-[11px] text-red-500">{nameError}</span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="type-description"
                  className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal"
                  style={{ fontWeight: 500 }}
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="type-description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (descriptionError) setDescriptionError("");
                  }}
                  disabled={isSaving}
                  placeholder="Enter a description for this template type"
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray placeholder:text-ds-light-gray outline-none transition-colors disabled:opacity-60 resize-none ${
                    descriptionError
                      ? "border-red-400 focus:border-red-500"
                      : "border-ds-light-gray focus:border-ds-purple"
                  }`}
                />
                {descriptionError && (
                  <span className="font-['Poppins',sans-serif] text-[11px] text-red-500">{descriptionError}</span>
                )}
              </div>

              {/* Saving progress */}
              {isSaving && (
                <div className="flex flex-col gap-2 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-['Poppins',sans-serif] text-[11px] text-ds-purple" style={{ fontWeight: 500 }}>
                      {isEditMode ? "Saving changes..." : "Adding template type..."}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#eee] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ds-purple rounded-full"
                      style={{
                        animation: "typeProgressBar 0.7s ease-in-out forwards",
                      }}
                    />
                  </div>
                  <style>{`
                    @keyframes typeProgressBar {
                      0% { width: 0%; }
                      30% { width: 50%; }
                      60% { width: 75%; }
                      100% { width: 100%; }
                    }
                  `}</style>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========== Footer ========== */}
        {!showSuccess && (
          <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-ds-haze shrink-0">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-[100px] border border-ds-light-gray cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray leading-normal" style={{ fontWeight: 500 }}>
                Cancel
              </span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-2.5 rounded-[100px] bg-ds-purple border border-ds-purple cursor-pointer hover:bg-ds-purple-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-['Poppins',sans-serif] text-[13px] text-white leading-normal" style={{ fontWeight: 500 }}>
                {isSaving ? "Saving..." : isEditMode ? "Update Type" : "Save Type"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Animated success state shown briefly after save */
function SuccessView({ isEditMode }: { isEditMode: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="relative">
        <svg viewBox="0 0 64 64" className="w-16 h-16">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="var(--ds-teal)"
            strokeWidth="3"
            strokeDasharray="176"
            strokeDashoffset="176"
            className="animate-drawCircleType"
          />
          <path
            d="M20 33L28 41L44 25"
            fill="none"
            stroke="var(--ds-teal)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="40"
            strokeDashoffset="40"
            className="animate-drawCheckType"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span
          className="font-['Montserrat',sans-serif] text-[16px] text-ds-teal leading-normal"
          style={{ fontWeight: 700 }}
        >
          {isEditMode ? "Type Updated Successfully" : "Type Added Successfully"}
        </span>
        <span className="font-['Poppins',sans-serif] text-[12px] text-ds-gray text-center">
          {isEditMode
            ? "Your changes have been saved successfully."
            : "The new report template type has been added."}
        </span>
      </div>

      <style>{`
        @keyframes drawCircleType {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCheckType {
          to { stroke-dashoffset: 0; }
        }
        .animate-drawCircleType {
          animation: drawCircleType 0.6s ease-out 0.1s forwards;
        }
        .animate-drawCheckType {
          animation: drawCheckType 0.4s ease-out 0.5s forwards;
        }
      `}</style>
    </div>
  );
}
