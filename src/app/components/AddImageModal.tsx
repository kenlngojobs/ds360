import { useState, useRef, useCallback, useEffect } from "react";
import type { ImageDocument } from "./ImagesTab";

interface AddImageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (image: ImageDocument) => void;
  editImage?: ImageDocument | null;
}

type UploadStep = "form" | "uploading" | "success";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function AddImageModal({ open, onClose, onSave, editImage }: AddImageModalProps) {
  const isEditMode = !!editImage;

  const [step, setStep] = useState<UploadStep>("form");
  const [imageName, setImageName] = useState("");
  const [imageNameError, setImageNameError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isActive, setIsActive] = useState(true);
  // Track whether the user has a preview from the existing image (edit mode) vs a newly-picked file
  const [hasExistingPreview, setHasExistingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset / populate state on open/close
  useEffect(() => {
    if (open) {
      setStep("form");
      setImageNameError("");
      setFileError("");
      setIsDragOver(false);
      setFile(null);

      if (editImage) {
        setImageName(editImage.name);
        setIsActive(editImage.active);
        // Preserve existing preview if available
        if (editImage.previewSrc) {
          setPreviewUrl(editImage.previewSrc);
          setHasExistingPreview(true);
        } else {
          setPreviewUrl(null);
          setHasExistingPreview(false);
        }
      } else {
        setImageName("");
        setIsActive(true);
        setPreviewUrl(null);
        setHasExistingPreview(false);
      }
    }
  }, [open, editImage]);

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Lock body scroll when modal is open
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
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const validateFile = useCallback((f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return "Unsupported file type. Please upload PNG, JPG, GIF, SVG, or WebP.";
    }
    if (f.size > MAX_FILE_SIZE) {
      return "File size exceeds 5MB limit.";
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (f: File) => {
      const error = validateFile(f);
      if (error) {
        setFileError(error);
        return;
      }
      setFileError("");
      setFile(f);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      setHasExistingPreview(false);
    },
    [validateFile, previewUrl]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) handleFileSelect(selectedFile);
    },
    [handleFileSelect]
  );

  const clearFile = useCallback(() => {
    if (previewUrl && !hasExistingPreview) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setHasExistingPreview(false);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [previewUrl, hasExistingPreview]);

  const handleSave = useCallback(() => {
    let valid = true;

    if (!imageName.trim()) {
      setImageNameError("Image name is required.");
      valid = false;
    } else {
      setImageNameError("");
    }

    // In add mode file is required; in edit mode it's optional if there's an existing preview
    const hasImage = !!file || hasExistingPreview;
    if (!hasImage) {
      setFileError("Please select an image file.");
      valid = false;
    }

    if (!valid) return;

    // Simulate upload / save
    setStep("uploading");
    setTimeout(() => {
      const resolvedPreviewType: "image" | "svg" = file
        ? file.type === "image/svg+xml"
          ? "svg"
          : "image"
        : editImage?.previewType ?? "image";

      const savedImage: ImageDocument = {
        id: isEditMode ? editImage!.id : `img-${Date.now()}`,
        name: imageName.trim(),
        active: isActive,
        previewType: resolvedPreviewType,
        previewSrc: previewUrl || editImage?.previewSrc || undefined,
        previewAspect: isEditMode && !file ? editImage?.previewAspect : undefined,
      };
      setStep("success");
      setTimeout(() => {
        onSave(savedImage);
      }, 1200);
    }, 1500);
  }, [imageName, file, isActive, previewUrl, onSave, hasExistingPreview, isEditMode, editImage]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current && step !== "uploading") {
        onClose();
      }
    },
    [onClose, step]
  );

  if (!open) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

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
        aria-label={isEditMode ? "Edit Image" : "Add New Image"}
      >
        {/* ========== Header ========== */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-ds-haze shrink-0">
          <span
            className="font-['Montserrat',sans-serif] text-[18px] sm:text-[20px] text-ds-purple-mid leading-normal"
            style={{ fontWeight: 700 }}
          >
            {isEditMode ? "Edit Image" : "Add New Image"}
          </span>
          <button
            onClick={onClose}
            disabled={step === "uploading"}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
              <path d="M1 1L13 13M13 1L1 13" stroke="#3a3a3a" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ========== Body ========== */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-5">
          {step === "success" ? (
            <SuccessView isEditMode={isEditMode} />
          ) : (
            <div className="flex flex-col gap-5">
              {/* Image Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="image-name"
                  className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal"
                  style={{ fontWeight: 500 }}
                >
                  Image Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="image-name"
                  type="text"
                  value={imageName}
                  onChange={(e) => {
                    setImageName(e.target.value);
                    if (imageNameError) setImageNameError("");
                  }}
                  disabled={step === "uploading"}
                  placeholder="Enter a descriptive name for this image"
                  className={`w-full border rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray placeholder:text-ds-light-gray outline-none transition-colors disabled:opacity-60 ${
                    imageNameError
                      ? "border-red-400 focus:border-red-500"
                      : "border-ds-light-gray focus:border-ds-purple"
                  }`}
                />
                {imageNameError && (
                  <span className="font-['Poppins',sans-serif] text-[11px] text-red-500">{imageNameError}</span>
                )}
              </div>

              {/* Upload Area */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray leading-normal"
                  style={{ fontWeight: 500 }}
                >
                  Image File <span className="text-red-500">*</span>
                </label>

                {!file ? (
                  hasExistingPreview && previewUrl ? (
                    /* Existing image preview (edit mode) */
                    <div className="rounded-xl border border-ds-haze bg-[#fafafa] overflow-hidden">
                      <div className="flex items-center justify-center bg-[#f5f5f5] p-4 border-b border-ds-haze">
                        <img
                          src={previewUrl}
                          alt="Current image"
                          className="max-h-[160px] max-w-full object-contain rounded-md"
                        />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-ds-purple-light flex items-center justify-center shrink-0">
                            <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                              <rect x="2" y="2" width="16" height="16" rx="2" stroke="var(--ds-purple)" strokeWidth="1.5" />
                              <circle cx="7" cy="7" r="1.5" fill="var(--ds-purple)" />
                              <path d="M2 14L7 10L10 13L14 9L18 14" stroke="var(--ds-purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                            Current image
                          </span>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={step === "uploading"}
                          className="px-4 py-1.5 rounded-full border border-ds-purple cursor-pointer hover:bg-ds-purple-light transition-colors disabled:opacity-40"
                        >
                          <span className="font-['Poppins',sans-serif] text-[11px] text-ds-purple" style={{ fontWeight: 500 }}>
                            Replace Image
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Drop zone */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 sm:py-10 cursor-pointer transition-all ${
                        isDragOver
                          ? "border-ds-purple bg-ds-purple-light"
                          : fileError
                          ? "border-red-300 bg-red-50/30 hover:border-red-400"
                          : "border-[#ccc] bg-[#fafafa] hover:border-ds-purple/50 hover:bg-ds-purple-light"
                      }`}
                    >
                      {/* Upload icon */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          isDragOver ? "bg-ds-purple-light" : "bg-[#eee]"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                          <path
                            d="M12 16V4M12 4L8 8M12 4L16 8"
                            stroke={isDragOver ? "var(--ds-purple)" : "#888"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16"
                            stroke={isDragOver ? "var(--ds-purple)" : "#888"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                          {isDragOver ? "Drop your image here" : "Drag & drop your image here"}
                        </span>
                        <span className="font-['Poppins',sans-serif] text-[11px] text-[#999]">
                          or{" "}
                          <span className="text-ds-purple underline" style={{ fontWeight: 500 }}>
                            browse files
                          </span>
                        </span>
                      </div>
                      <span className="font-['Poppins',sans-serif] text-[10px] text-[#bbb]">
                        PNG, JPG, GIF, SVG, WebP — Max 5MB
                      </span>
                    </div>
                  )
                ) : (
                  /* File Preview */
                  <div className="rounded-xl border border-ds-haze bg-[#fafafa] overflow-hidden">
                    {/* Preview image */}
                    {previewUrl && file.type !== "image/svg+xml" && (
                      <div className="flex items-center justify-center bg-[#f5f5f5] p-4 border-b border-ds-haze">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-[160px] max-w-full object-contain rounded-md"
                        />
                      </div>
                    )}
                    {previewUrl && file.type === "image/svg+xml" && (
                      <div className="flex items-center justify-center bg-[#f5f5f5] p-4 border-b border-ds-haze">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-[100px] max-w-full object-contain"
                        />
                      </div>
                    )}

                    {/* File info bar */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* File icon */}
                      <div className="w-9 h-9 rounded-lg bg-ds-purple-light flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                          <rect x="2" y="2" width="16" height="16" rx="2" stroke="var(--ds-purple)" strokeWidth="1.5" />
                          <circle cx="7" cy="7" r="1.5" fill="var(--ds-purple)" />
                          <path d="M2 14L7 10L10 13L14 9L18 14" stroke="var(--ds-purple)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray truncate" style={{ fontWeight: 500 }}>
                          {file.name}
                        </p>
                        <p className="font-['Poppins',sans-serif] text-[10px] text-[#999]">
                          {formatFileSize(file.size)} &middot; {file.type.split("/")[1].toUpperCase()}
                        </p>
                      </div>
                      <button
                        onClick={clearFile}
                        disabled={step === "uploading"}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                        aria-label="Remove file"
                      >
                        <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                          <path d="M1 1L13 13M13 1L1 13" stroke="var(--ds-destructive, #d4183d)" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {fileError && (
                  <span className="font-['Poppins',sans-serif] text-[11px] text-red-500">{fileError}</span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="font-['Poppins',sans-serif] text-[12px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                  Set as Active
                </span>
                <button
                  onClick={() => step !== "uploading" && setIsActive(!isActive)}
                  disabled={step === "uploading"}
                  className="relative w-[44px] h-[24px] rounded-full cursor-pointer transition-colors shrink-0 disabled:opacity-60"
                  style={{
                    backgroundColor: isActive ? "var(--ds-purple)" : "#ccc",
                  }}
                  role="switch"
                  aria-checked={isActive}
                >
                  <div
                    className="absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow transition-all"
                    style={{
                      left: isActive ? "22px" : "2px",
                    }}
                  />
                </button>
              </div>

              {/* Uploading progress */}
              {step === "uploading" && (
                <div className="flex flex-col gap-2 py-1">
                  <div className="flex items-center justify-between">
                    <span className="font-['Poppins',sans-serif] text-[11px] text-ds-purple" style={{ fontWeight: 500 }}>
                      {isEditMode ? "Saving changes..." : "Uploading..."}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#eee] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ds-purple rounded-full"
                      style={{
                        animation: "progressBar 1.4s ease-in-out forwards",
                      }}
                    />
                  </div>
                  <style>{`
                    @keyframes progressBar {
                      0% { width: 0%; }
                      30% { width: 45%; }
                      60% { width: 70%; }
                      80% { width: 88%; }
                      100% { width: 100%; }
                    }
                  `}</style>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========== Footer ========== */}
        {step !== "success" && (
          <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-ds-haze shrink-0">
            <button
              onClick={onClose}
              disabled={step === "uploading"}
              className="px-6 py-2.5 rounded-[100px] border border-ds-light-gray cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray leading-normal" style={{ fontWeight: 500 }}>
                Cancel
              </span>
            </button>
            <button
              onClick={handleSave}
              disabled={step === "uploading"}
              className="px-8 py-2.5 rounded-[100px] bg-ds-purple border border-ds-purple cursor-pointer hover:bg-ds-purple-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-['Poppins',sans-serif] text-[13px] text-white leading-normal" style={{ fontWeight: 500 }}>
                {step === "uploading" ? "Saving..." : isEditMode ? "Update Image" : "Save Image"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Animated success state shown briefly after upload */
function SuccessView({ isEditMode }: { isEditMode: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {/* Animated checkmark circle */}
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
            className="animate-drawCircle"
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
            className="animate-drawCheck"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span
          className="font-['Montserrat',sans-serif] text-[16px] text-ds-teal leading-normal"
          style={{ fontWeight: 700 }}
        >
          {isEditMode ? "Image Updated Successfully" : "Image Added Successfully"}
        </span>
        <span className="font-['Poppins',sans-serif] text-[12px] text-ds-gray text-center">
          {isEditMode
            ? "Your changes have been saved successfully."
            : "Your image has been uploaded and added to the library."}
        </span>
      </div>

      <style>{`
        @keyframes drawCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
        .animate-drawCircle {
          animation: drawCircle 0.6s ease-out 0.1s forwards;
        }
        .animate-drawCheck {
          animation: drawCheck 0.4s ease-out 0.5s forwards;
        }
      `}</style>
    </div>
  );
}