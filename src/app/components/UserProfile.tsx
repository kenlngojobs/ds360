import { useState, useMemo, useRef, useCallback } from "react";
import { Breadcrumb } from "./Breadcrumb";
import type { User } from "./UserManagement";
import { OFFERINGS_DATA } from "./offeringsData";
import { useResizableColumns, ResizeHandle, type ColumnDef } from "./useResizableColumns";

// ── Edit icon SVG path (from Figma) ─────────────────────────────────
const EDIT_ICON = "M5.6246 7.5C7.69273 7.5 9.3746 5.81813 9.3746 3.75C9.3746 1.68187 7.69273 0 5.6246 0C3.55648 0 1.8746 1.68187 1.8746 3.75C1.8746 5.81813 3.55648 7.5 5.6246 7.5ZM5.6246 1.875C6.65835 1.875 7.4996 2.71625 7.4996 3.75C7.4996 4.78375 6.65835 5.625 5.6246 5.625C4.59085 5.625 3.7496 4.78375 3.7496 3.75C3.7496 2.71625 4.59085 1.875 5.6246 1.875ZM6.8746 10.8381C6.4746 10.6969 6.05398 10.625 5.6246 10.625C3.6496 10.625 2.0021 12.1619 1.87273 14.1244C1.84023 14.62 1.42835 15 0.938352 15C0.917727 15 0.897102 15 0.875852 14.9981C0.358977 14.9644 -0.0322726 14.5175 0.00210238 14.0013C0.195852 11.0569 2.66585 8.75063 5.62523 8.75063C6.26835 8.75063 6.89898 8.85812 7.50023 9.07125C7.98835 9.24375 8.24398 9.77937 8.07148 10.2675C7.89898 10.7556 7.36398 11.0112 6.87523 10.8387L6.8746 10.8381ZM14.5371 10.01L10.3402 14.2069C9.8321 14.715 9.14335 15 8.42523 15H7.82835C7.65585 15 7.51585 14.86 7.51585 14.6875V14.0906C7.51585 13.3725 7.80148 12.6831 8.30898 12.1756L12.564 7.92063C13.1596 7.325 14.1477 7.36187 14.6946 8.03062C15.1702 8.61187 15.0684 9.47875 14.5371 10.01Z";

// ── Activity mock data ──────────────────────────────────────────────
interface Activity {
  id: string;
  date: string;
  time: string;
  activity: string;
  category: string;
}

function generateActivities(user: User): Activity[] {
  return [
    { id: "1", date: "Jun. 10, 2023", time: "03:30 PM EST", activity: "Logged in", category: "Users" },
    { id: "2", date: "Jun. 10, 2023", time: "03:30 PM EST", activity: "Revised the Document Template Seller Survey 2023", category: "SAM Documents" },
    { id: "3", date: "Jun. 10, 2023", time: "03:30 PM EST", activity: "Logged in", category: "Users" },
    { id: "4", date: "Jun. 10, 2023", time: "03:30 PM EST", activity: "Logged in", category: "Users" },
    { id: "5", date: "Jun. 12, 2023", time: "03:30 PM EST", activity: "Logged in", category: "Users" },
    { id: "6", date: "Jun. 12, 2023", time: "03:30 PM EST", activity: "Logged in", category: "Users" },
    { id: "7", date: "Jun. 13, 2023", time: "03:30 PM EST", activity: "Commented on an Offering", category: "Offerings" },
    { id: "8", date: "Jun. 13, 2023", time: "03:30 PM EST", activity: "Uploaded a new file", category: "My Deals" },
    { id: "9", date: "Jun. 13, 2023", time: "03:30 PM EST", activity: "Uploaded a new file", category: "My Deals" },
    { id: "10", date: "Jun. 13, 2023", time: "03:30 PM EST", activity: "Uploaded a new file", category: "My Deals" },
  ];
}

// ── Sort column header ──────────────────────────────────────────────
// ── Profile Information Card ────────────────────────────────────────
function ProfileInfoCard({
  user,
  onEditProfile,
}: {
  user: User;
  onEditProfile: () => void;
}) {
  const fields = useMemo(
    () => [
      { label: "First Name", value: user.firstName },
      { label: "Last Name", value: user.lastName },
      { label: "User Name", value: user.email },
      { label: "Status", value: user.status },
      { label: "Mobile Number", value: "+97 343 22881992" },
      { label: "Partner", value: user.partner },
    ],
    [user]
  );

  return (
    <div className="bg-white border border-[#acacac] rounded-[10px] p-2.5 flex flex-col gap-2.5 w-full lg:w-[350px] xl:w-[400px] shrink-0 self-start">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ds-teal pb-2">
        <p
          className="font-['Poppins',sans-serif] text-[14px] text-[#3a3a3a] px-2.5 py-1"
          style={{ fontWeight: 500 }}
        >
          Profile Information
        </p>
        <button
          onClick={onEditProfile}
          className="flex items-center gap-1.5 bg-white border border-ds-teal rounded-full px-2.5 py-1.5 cursor-pointer hover:bg-ds-teal/5 transition-colors"
        >
          <svg viewBox="0 0 14.9997 15" fill="none" className="w-[15px] h-[15px]">
            <path d={EDIT_ICON} fill="#5EA7A3" />
          </svg>
          <span
            className="font-['Poppins',sans-serif] text-[10px] text-ds-teal"
            style={{ fontWeight: 500 }}
          >
            Edit Profile
          </span>
        </button>
      </div>

      {/* Fields */}
      {fields.map((f, i) => (
        <div
          key={f.label}
          className={`flex items-center justify-between py-1.5 px-2.5 ${
            i < fields.length - 1 ? "border-b border-[#acacac]" : ""
          }`}
        >
          <span
            className="font-['Montserrat',sans-serif] text-[12px] text-[#5b5b5b]"
            style={{ fontWeight: 600 }}
          >
            {f.label}
          </span>
          <span
            className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a] text-right"
            style={{ fontWeight: 400 }}
          >
            {f.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Partner list for dropdown ───────────────────────────────────────
const PARTNER_OPTIONS = [
  "Recovery Management Solutions, LLC (RMS)",
  "Denali Capital",
  "Takkar",
  "ACME Corporation",
  "Global Financial Services",
  "Pinnacle Asset Group",
  "Summit Collections",
  "Blue Harbor Capital",
];

// ── Edit Profile Full-Page View ─────────────────────────────────────
function EditProfilePage({
  user,
  onCancel,
  onSave,
  onBackToUsers,
}: {
  user: User;
  onCancel: () => void;
  onSave: (updated: User) => void;
  onBackToUsers: () => void;
}) {
  const [form, setForm] = useState({
    email: user.email,
    mobile: "+97 343 22881992",
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    partner: user.partner,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Profile picture upload state ────────────────────────────────
  const [picFile, setPicFile] = useState<File | null>(null);
  const [picPreview, setPicPreview] = useState<string | null>(null);
  const [picDragOver, setPicDragOver] = useState(false);
  const [picError, setPicError] = useState("");
  const picInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_PIC_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
  const MAX_PIC_SIZE = 5 * 1024 * 1024; // 5MB

  const validatePic = useCallback((f: File): string | null => {
    if (!ACCEPTED_PIC_TYPES.includes(f.type)) {
      return "Unsupported file type. Please upload PNG, JPG, GIF, or WebP.";
    }
    if (f.size > MAX_PIC_SIZE) {
      return "File size exceeds 5MB limit.";
    }
    return null;
  }, []);

  const handlePicSelect = useCallback(
    (f: File) => {
      const error = validatePic(f);
      if (error) {
        setPicError(error);
        return;
      }
      setPicError("");
      setPicFile(f);
      if (picPreview) URL.revokeObjectURL(picPreview);
      setPicPreview(URL.createObjectURL(f));
    },
    [validatePic, picPreview]
  );

  const handlePicDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPicDragOver(true);
  }, []);

  const handlePicDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPicDragOver(false);
  }, []);

  const handlePicDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPicDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handlePicSelect(dropped);
    },
    [handlePicSelect]
  );

  const handlePicInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handlePicSelect(selected);
    },
    [handlePicSelect]
  );

  const clearPic = useCallback(() => {
    if (picPreview) URL.revokeObjectURL(picPreview);
    setPicFile(null);
    setPicPreview(null);
    setPicError("");
    if (picInputRef.current) picInputRef.current.value = "";
  }, [picPreview]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        onSave({
          ...user,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          partner: form.partner,
          status: form.status,
        });
      }, 800);
    }, 1000);
  };

  // Shared pill input class
  const inputCls =
    "w-full border border-[#3a3a3a] rounded-[40px] px-[20px] py-[15px] font-['Poppins',sans-serif] text-[16px] text-[#3a3a3a] outline-none focus:border-ds-purple transition-colors bg-white";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* ── Header area ─────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0 flex flex-col gap-2.5">
        {/* Page title */}
        <h1
          className="font-['Montserrat',sans-serif] text-[22px] sm:text-[27px] text-[#4d4085]"
          style={{ fontWeight: 700 }}
        >
          Edit Profile
        </h1>

        {/* Breadcrumb */}
        <Breadcrumb
          segments={[
            { label: "Users", onClick: onBackToUsers },
            { label: "User Profile", onClick: onCancel },
            { label: "Edit Profile" },
          ]}
        />

        {/* User email subtitle */}
        <h2
          className="font-['Montserrat',sans-serif] text-[20px] sm:text-[24px] text-[#1c1c1c] tracking-[-0.24px]"
          style={{ fontWeight: 600 }}
        >
          {user.email}
        </h2>
      </div>

      {/* ── Form content ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 py-4">
        {saved ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emerald-600">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p
              className="font-['Poppins',sans-serif] text-[16px] text-[#3a3a3a] text-center"
              style={{ fontWeight: 600 }}
            >
              Profile updated successfully!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-[980px]">
            {/* Row 1: User Name + Mobile No. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex flex-col gap-3">
                <label
                  className="font-['Poppins',sans-serif] text-[14px] text-black"
                  style={{ fontWeight: 500 }}
                >
                  User Name
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter Email Address"
                  className={inputCls}
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label
                  className="font-['Poppins',sans-serif] text-[14px] text-black"
                  style={{ fontWeight: 500 }}
                >
                  Mobile No.
                </label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  placeholder="Enter Mobile Number"
                  className={inputCls}
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Row 2: First Name + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex flex-col gap-3">
                <label
                  className="font-['Poppins',sans-serif] text-[14px] text-black"
                  style={{ fontWeight: 500 }}
                >
                  First Name
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Enter First Name"
                  className={inputCls}
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label
                  className="font-['Poppins',sans-serif] text-[14px] text-black"
                  style={{ fontWeight: 500 }}
                >
                  Last Name
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Enter Last Name"
                  className={inputCls}
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Row 3: Status + Partner Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="flex flex-col gap-3">
                <label
                  className="font-['Poppins',sans-serif] text-[14px] text-black"
                  style={{ fontWeight: 500 }}
                >
                  Status
                </label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as User["status"] })}
                    className={`${inputCls} appearance-none cursor-pointer pr-[50px]`}
                    style={{ fontWeight: 400 }}
                  >
                    <option value="" disabled>
                      Choose Status
                    </option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="absolute right-[20px] top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none"
                  >
                    <path d="M6 9l6 6 6-6" stroke="#3a3a3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label
                  className="font-['Poppins',sans-serif] text-[14px] text-black"
                  style={{ fontWeight: 500 }}
                >
                  Partner Name
                </label>
                <div className="relative">
                  <select
                    value={form.partner}
                    onChange={(e) => setForm({ ...form, partner: e.target.value })}
                    className={`${inputCls} appearance-none cursor-pointer pr-[50px]`}
                    style={{ fontWeight: 400 }}
                  >
                    <option value="" disabled>
                      Choose Partner
                    </option>
                    {PARTNER_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="absolute right-[20px] top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none"
                  >
                    <path d="M6 9l6 6 6-6" stroke="#3a3a3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Profile picture upload */}
            <div className="flex flex-col gap-3">
              <label
                className="font-['Poppins',sans-serif] text-[14px] text-black"
                style={{ fontWeight: 500 }}
              >
                Profile Picture
              </label>

              {!picFile ? (
                /* ── Drop zone (matches AddImageModal) ────────── */
                <div
                  onDragOver={handlePicDragOver}
                  onDragLeave={handlePicDragLeave}
                  onDrop={handlePicDrop}
                  onClick={() => picInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 sm:py-10 cursor-pointer transition-all ${
                    picDragOver
                      ? "border-ds-purple bg-ds-purple-light"
                      : picError
                      ? "border-red-300 bg-red-50/30 hover:border-red-400"
                      : "border-[#ccc] bg-[#fafafa] hover:border-ds-purple/50 hover:bg-ds-purple-light"
                  }`}
                >
                  {/* Upload icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      picDragOver ? "bg-ds-purple-light" : "bg-[#eee]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                      <path
                        d="M12 16V4M12 4L8 8M12 4L16 8"
                        stroke={picDragOver ? "var(--ds-purple)" : "#888"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16"
                        stroke={picDragOver ? "var(--ds-purple)" : "#888"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-['Poppins',sans-serif] text-[13px] text-[#3a3a3a]" style={{ fontWeight: 500 }}>
                      {picDragOver ? "Drop your image here" : "Drag & drop your profile picture here"}
                    </span>
                    <span className="font-['Poppins',sans-serif] text-[11px] text-[#999]">
                      or{" "}
                      <span className="text-ds-purple underline" style={{ fontWeight: 500 }}>
                        browse files
                      </span>
                    </span>
                  </div>
                  <span className="font-['Poppins',sans-serif] text-[10px] text-[#bbb]">
                    PNG, JPG, GIF, WebP — Max 5MB
                  </span>
                </div>
              ) : (
                /* ── File Preview Card (matches AddImageModal) ── */
                <div className="rounded-xl border border-[#e0dfdf] bg-[#fafafa] overflow-hidden">
                  {/* Image preview */}
                  {picPreview && (
                    <div className="flex items-center justify-center bg-[#f5f5f5] p-4 border-b border-[#e0dfdf]">
                      <img
                        src={picPreview}
                        alt="Preview"
                        className="max-h-[160px] max-w-full object-contain rounded-md"
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
                      <p className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a] truncate" style={{ fontWeight: 500 }}>
                        {picFile.name}
                      </p>
                      <p className="font-['Poppins',sans-serif] text-[10px] text-[#999]">
                        {formatFileSize(picFile.size)} &middot; {picFile.type.split("/")[1].toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={clearPic}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      aria-label="Remove file"
                    >
                      <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                        <path d="M1 1L13 13M13 1L1 13" stroke="#d4183d" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {picError && (
                <span className="font-['Poppins',sans-serif] text-[11px] text-red-500">{picError}</span>
              )}
              <input
                ref={picInputRef}
                type="file"
                accept={ACCEPTED_PIC_TYPES.join(",")}
                onChange={handlePicInputChange}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom action bar ───────────────────────────────────── */}
      {!saved && (
        <div className="shrink-0 px-4 sm:px-6 py-4 flex items-center justify-end gap-4 border-t border-[#e0dfdf]">
          <button
            onClick={onCancel}
            className="px-10 py-3 rounded-[40px] border border-[#4d4085] font-['Poppins',sans-serif] text-[16px] text-[#4d4085] hover:bg-ds-purple-light cursor-pointer transition-colors"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-14 py-3 rounded-[40px] bg-[#4d4085] text-white font-['Poppins',sans-serif] text-[16px] hover:bg-ds-purple-hover cursor-pointer transition-colors disabled:opacity-70"
            style={{ fontWeight: 500 }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Access module data ──────────────────────────────────────────────
type AccessLevel = "No Access" | "View Only" | "Manage";

const ACCESS_MODULES = [
  { id: "offering-groups", label: "Offering Groups" },
  { id: "offering", label: "Offering" },
  { id: "my-deals", label: "My Deals" },
  { id: "post-sale-portal", label: "Post Sale Portal" },
  { id: "sam-documents", label: "SAM Documents" },
  { id: "messages", label: "Messages" },
  { id: "members", label: "Members" },
];

const ACCESS_OPTIONS: AccessLevel[] = ["No Access", "View Only", "Manage"];

// ── Configure User Access Full-Page View ────────────────────────────
function ConfigureUserAccessPage({
  onCancel,
  onSave,
  onBackToUsers,
}: {
  onCancel: () => void;
  onSave: () => void;
  onBackToUsers: () => void;
}) {
  const [access, setAccess] = useState<Record<string, AccessLevel>>(
    Object.fromEntries(ACCESS_MODULES.map((m) => [m.id, "Manage"]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => onSave(), 800);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* ── Header area ─────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0 flex flex-col gap-2.5">
        {/* Page title */}
        <h1
          className="font-['Montserrat',sans-serif] text-[22px] sm:text-[27px] text-[#4d4085]"
          style={{ fontWeight: 700 }}
        >
          Configure User Access
        </h1>

        {/* Breadcrumb */}
        <Breadcrumb
          segments={[
            { label: "Users", onClick: onBackToUsers },
            { label: "User Profile", onClick: onCancel },
            { label: "Configure User Access" },
          ]}
        />
      </div>

      {/* ── Form content ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 py-4">
        {saved ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emerald-600">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p
              className="font-['Poppins',sans-serif] text-[16px] text-[#3a3a3a] text-center"
              style={{ fontWeight: 600 }}
            >
              User access updated successfully!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-w-[700px]">
            {/* Subtitle */}
            <div className="pb-2.5 border-b border-[#acacac]">
              <p
                className="font-['Montserrat',sans-serif] text-[18px] sm:text-[21px] text-ds-teal"
                style={{ fontWeight: 700 }}
              >
                Add User Access Module
              </p>
            </div>

            {/* Module rows */}
            {ACCESS_MODULES.map((mod) => (
              <div
                key={mod.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 py-2.5 border-b border-[#acacac]"
              >
                <p
                  className="font-['Poppins',sans-serif] text-[14px] text-[#5b5b5b] shrink-0"
                  style={{ fontWeight: 500 }}
                >
                  {mod.label}
                </p>

                {/* Pill dropdown */}
                <div className="relative w-full sm:w-[250px] shrink-0">
                  <select
                    value={access[mod.id]}
                    onChange={(e) =>
                      setAccess((prev) => ({
                        ...prev,
                        [mod.id]: e.target.value as AccessLevel,
                      }))
                    }
                    className="w-full h-[32px] border border-[#3a3a3a] rounded-[30px] px-[15px] pr-[40px] appearance-none cursor-pointer bg-white font-['Poppins',sans-serif] text-[14px] text-[#3a3a3a] tracking-[-0.14px] outline-none focus:border-ds-purple transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    {ACCESS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 12 7.41422"
                    fill="none"
                    className="absolute right-[15px] top-1/2 -translate-y-1/2 w-[10px] h-[5px] pointer-events-none"
                  >
                    <path
                      d="M1 1L5.96894 6L11 1"
                      stroke="black"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom action bar ───────────────────────────────────── */}
      {!saved && (
        <div className="shrink-0 px-4 sm:px-6 py-4 flex items-center justify-end gap-5 border-t border-[#e0dfdf]">
          <button
            onClick={onCancel}
            className="h-[49px] px-[80px] rounded-[100px] border border-[#46367f] bg-white font-['Poppins',sans-serif] text-[14px] text-ds-teal hover:bg-ds-purple-light cursor-pointer transition-colors"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-[49px] px-[80px] rounded-[100px] bg-[#46367f] border border-[#46367f] text-white font-['Poppins',sans-serif] text-[14px] hover:bg-ds-purple-hover cursor-pointer transition-colors disabled:opacity-70"
            style={{ fontWeight: 500 }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Configure tab placeholder ───────────────────────────────────────

// Derive available offering names from shared data source
const AVAILABLE_OFFERINGS = OFFERINGS_DATA.map((o) => o.name);

// SVG paths from Figma for plus / minus circle icons
const MINUS_CIRCLE_PATH =
  "M15.5 0C17.6393 0 19.6532 0.40487 21.5391 1.212C23.425 2.01913 25.0706 3.12403 26.4733 4.52671C27.876 5.92939 28.9809 7.57499 29.788 9.4609C30.5951 11.3494 31 13.3607 31 15.5C31 17.6393 30.5951 19.6532 29.788 21.5391C28.9809 23.4276 27.876 25.0706 26.4733 26.4733C25.0706 27.876 23.425 28.9809 21.5391 29.788C19.6506 30.5951 17.6393 31 15.5 31C13.3607 31 11.3468 30.5951 9.4609 29.788C7.57238 28.9809 5.92939 27.876 4.52671 26.4733C3.12403 25.0706 2.01913 23.425 1.212 21.5391C0.40487 19.6532 0 17.6393 0 15.5C0 13.3607 0.402258 11.3468 1.212 9.4609C2.01913 7.57499 3.12403 5.92939 4.52671 4.52671C5.92939 3.12403 7.57499 2.01913 9.4609 1.212C11.3468 0.40487 13.3607 0 15.5 0ZM15.5 29.3413C17.4225 29.3413 19.2196 28.9809 20.8887 28.2599C22.5578 27.539 24.0232 26.549 25.2848 25.2874C26.5464 24.0258 27.5364 22.5604 28.2573 20.8887C28.9783 19.2196 29.3387 17.4225 29.3387 15.5C29.3387 13.5775 28.9783 11.783 28.2573 10.1113C27.5364 8.4422 26.5464 6.97683 25.2848 5.7152C24.0232 4.45357 22.5578 3.4636 20.8887 2.74267C19.2196 2.02174 17.4225 1.66127 15.5 1.66127C13.5775 1.66127 11.7804 2.02174 10.1113 2.74267C8.4422 3.4636 6.97683 4.45357 5.7152 5.7152C4.45357 6.97683 3.4636 8.4422 2.74267 10.1113C2.02174 11.783 1.66127 13.5775 1.66127 15.5C1.66127 17.4225 2.02174 19.2196 2.74267 20.8887C3.4636 22.5578 4.45357 24.0258 5.7152 25.2874C6.97683 26.549 8.4422 27.539 10.1113 28.2599C11.7804 28.9809 13.5775 29.3413 15.5 29.3413ZM23.25 13.5618H7.75261V17.4355H23.25V13.5618Z";

const PLUS_CIRCLE_PATH =
  "M15 0C17.0703 0 19.0192 0.39181 20.8443 1.1729C22.6694 1.95399 24.2619 3.02326 25.6193 4.38069C26.9767 5.73812 28.046 7.33064 28.8271 9.15571C29.6082 10.9833 30 12.9297 30 15C30 17.0703 29.6082 19.0192 28.8271 20.8443C28.046 22.6719 26.9767 24.2619 25.6193 25.6193C24.2619 26.9767 22.6694 28.046 20.8443 28.8271C19.0167 29.6082 17.0703 30 15 30C12.9297 30 10.9808 29.6082 9.15571 28.8271C7.32811 28.046 5.73812 26.9767 4.38069 25.6193C3.02326 24.2619 1.95399 22.6694 1.1729 20.8443C0.39181 19.0192 0 17.0703 0 15C0 12.9297 0.389282 10.9808 1.1729 9.15571C1.95399 7.33064 3.02326 5.73812 4.38069 4.38069C5.73812 3.02326 7.33064 1.95399 9.15571 1.1729C10.9808 0.39181 12.9297 0 15 0ZM15 28.3948C16.8605 28.3948 18.5996 28.046 20.2149 27.3483C21.8301 26.6507 23.2482 25.6926 24.4692 24.4717C25.6901 23.2508 26.6481 21.8327 27.3458 20.2149C28.0435 18.5996 28.3923 16.8605 28.3923 15C28.3923 13.1395 28.0435 11.4029 27.3458 9.78514C26.6481 8.16987 25.6901 6.75177 24.4692 5.53084C23.2482 4.30991 21.8301 3.35187 20.2149 2.6542C18.5996 1.95652 16.8605 1.60768 15 1.60768C13.1395 1.60768 11.4004 1.95652 9.78514 2.6542C8.16987 3.35187 6.75177 4.30991 5.53084 5.53084C4.30991 6.75177 3.35187 8.16987 2.6542 9.78514C1.95652 11.4029 1.60768 13.1395 1.60768 15C1.60768 16.8605 1.95652 18.5996 2.6542 20.2149C3.35187 21.8301 4.30991 23.2508 5.53084 24.4717C6.75177 25.6926 8.16987 26.6507 9.78514 27.3483C11.4004 28.046 13.1395 28.3948 15 28.3948ZM22.5 13.1244H16.8756V7.5H13.1269V13.1244H7.50253V16.8731H13.1269V22.4975H16.8756V16.8731H22.5V13.1244Z";

// ── Configure Offering Access Full-Page View ────────────────────────
interface OfferingRow {
  id: string;
  value: string;
}

function ConfigureOfferingAccessPage({
  onCancel,
  onSave,
  onBackToUsers,
}: {
  onCancel: () => void;
  onSave: () => void;
  onBackToUsers: () => void;
}) {
  const [rows, setRows] = useState<OfferingRow[]>([
    { id: crypto.randomUUID(), value: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addRow = () => {
    setRows((prev) => [...prev, { id: crypto.randomUUID(), value: "" }]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.id !== id);
    });
  };

  const updateRow = (id: string, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  // Offerings already chosen (to exclude from other dropdowns)
  const chosenValues = useMemo(
    () => new Set(rows.filter((r) => r.value).map((r) => r.value)),
    [rows]
  );

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => onSave(), 800);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* ── Header area ─────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0 flex flex-col gap-2.5">
        {/* Page title */}
        <h1
          className="font-['Montserrat',sans-serif] text-[22px] sm:text-[27px] text-[#4d4085]"
          style={{ fontWeight: 700 }}
        >
          Configure Offering Access
        </h1>

        {/* Breadcrumb */}
        <Breadcrumb
          segments={[
            { label: "Users", onClick: onBackToUsers },
            { label: "User Profile", onClick: onCancel },
            { label: "Configure Offering Access" },
          ]}
        />
      </div>

      {/* ── Form content ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 py-4">
        {saved ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emerald-600">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p
              className="font-['Poppins',sans-serif] text-[16px] text-[#3a3a3a] text-center"
              style={{ fontWeight: 600 }}
            >
              Offering access updated successfully!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-w-[700px]">
            {/* Subtitle */}
            <div className="pb-2.5 border-b border-[#acacac]">
              <p
                className="font-['Montserrat',sans-serif] text-[18px] sm:text-[21px] text-ds-teal"
                style={{ fontWeight: 700 }}
              >
                Add Offerings
              </p>
            </div>

            {/* Offering rows */}
            <div className="flex flex-col gap-2.5">
              {rows.map((row) => (
                <div key={row.id} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-5">
                    {/* Minus / remove button */}
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={rows.length <= 1}
                      className="shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
                      title="Remove offering"
                    >
                      <svg viewBox="0 0 31 31" fill="none" className="w-[31px] h-[31px]">
                        <path d={MINUS_CIRCLE_PATH} fill="#ACACAC" />
                      </svg>
                    </button>

                    {/* Pill dropdown */}
                    <div className="relative w-full sm:w-[250px] shrink-0">
                      <select
                        value={row.value}
                        onChange={(e) => updateRow(row.id, e.target.value)}
                        className="w-full h-[32px] border border-[#3a3a3a] rounded-[30px] px-[15px] pr-[40px] appearance-none cursor-pointer bg-white font-['Poppins',sans-serif] text-[14px] text-[#3a3a3a] tracking-[-0.14px] outline-none focus:border-ds-purple transition-colors"
                        style={{ fontWeight: 400 }}
                      >
                        <option value="">Choose Offering</option>
                        {AVAILABLE_OFFERINGS.map((o) => (
                          <option
                            key={o}
                            value={o}
                            disabled={chosenValues.has(o) && row.value !== o}
                          >
                            {o}
                          </option>
                        ))}
                      </select>
                      <svg
                        viewBox="0 0 12 7.41422"
                        fill="none"
                        className="absolute right-[15px] top-1/2 -translate-y-1/2 w-[10px] h-[5px] pointer-events-none"
                      >
                        <path
                          d="M1 1L5.96894 6L11 1"
                          stroke="black"
                          strokeLinecap="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#acacac]" />
                </div>
              ))}
            </div>

            {/* Add new button */}
            <button
              onClick={addRow}
              className="self-start cursor-pointer hover:opacity-70 transition-opacity"
              title="Add another offering"
            >
              <svg viewBox="0 0 30 30" fill="none" className="w-[30px] h-[30px]">
                <path d={PLUS_CIRCLE_PATH} fill="#4D4085" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom action bar ───────────────────────────────────── */}
      {!saved && (
        <div className="shrink-0 px-4 sm:px-6 py-4 flex items-center justify-end gap-5 border-t border-[#e0dfdf]">
          <button
            onClick={onCancel}
            className="h-[49px] px-[80px] rounded-[100px] border border-[#46367f] bg-white font-['Poppins',sans-serif] text-[14px] text-ds-teal hover:bg-ds-purple-light cursor-pointer transition-colors"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-[49px] px-[80px] rounded-[100px] bg-[#46367f] border border-[#46367f] text-white font-['Poppins',sans-serif] text-[14px] hover:bg-ds-purple-hover cursor-pointer transition-colors disabled:opacity-70"
            style={{ fontWeight: 500 }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Notification types for Configure Notifications ──────────────────
const POST_SALE_NOTIFICATIONS = [
  "Account Inquiry",
  "Buyback",
  "Complaint",
  "Direct Payment",
  "Legal Approval",
  "Media",
  "Putback",
  "Important Notification",
];

function ConfigureNotificationsPage({
  onCancel,
  onSave,
  onBackToUsers,
}: {
  onCancel: () => void;
  onSave: () => void;
  onBackToUsers: () => void;
}) {
  const [useDefault, setUseDefault] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(POST_SALE_NOTIFICATIONS.map((n) => [n, true]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleNotification = (name: string) => {
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => onSave(), 800);
    }, 1000);
  };

  // Pair notifications into 2-column rows
  const rows: [string, string | null][] = [];
  for (let i = 0; i < POST_SALE_NOTIFICATIONS.length; i += 2) {
    rows.push([
      POST_SALE_NOTIFICATIONS[i],
      POST_SALE_NOTIFICATIONS[i + 1] ?? null,
    ]);
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* ── Header area ─────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0 flex flex-col gap-2.5">
        {/* Page title */}
        <h1
          className="font-['Montserrat',sans-serif] text-[22px] sm:text-[27px] text-[#4d4085]"
          style={{ fontWeight: 700 }}
        >
          Configure Notification
        </h1>

        {/* Breadcrumb */}
        <Breadcrumb
          segments={[
            { label: "Users", onClick: onBackToUsers },
            { label: "User Profile", onClick: onCancel },
            { label: "Configure Notification" },
          ]}
        />
      </div>

      {/* ── Form content ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 py-4">
        {saved ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emerald-600">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p
              className="font-['Poppins',sans-serif] text-[16px] text-[#3a3a3a] text-center"
              style={{ fontWeight: 600 }}
            >
              Notification settings updated successfully!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[30px] max-w-[1280px]">
            {/* ── Default Notifications toggle ─────────────────── */}
            <div className="flex items-center gap-[30px]">
              <span
                className="font-['Montserrat',sans-serif] text-[18px] sm:text-[21px] text-[#5ea7a3]"
                style={{ fontWeight: 700 }}
              >
                Default Notifications
              </span>
              <button
                onClick={() => setUseDefault(!useDefault)}
                className="relative w-[16px] h-[16px] rounded-[5px] border border-[#46367f] cursor-pointer shrink-0 flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: useDefault ? "#46367f" : "white",
                }}
                aria-checked={useDefault}
                role="checkbox"
              >
                {useDefault && (
                  <svg viewBox="0 0 9.6 6.4" fill="none" className="w-[9.6px] h-[6.4px]">
                    <path d="M0.5 3.4L3.2 5.9L9.1 0.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>

            {/* ── Post Sale Notifications section ──────────────── */}
            <div className="flex flex-col gap-[10px]">
              <span
                className="font-['Montserrat',sans-serif] text-[18px] sm:text-[21px] text-[#5ea7a3]"
                style={{ fontWeight: 700 }}
              >
                Post Sale Notifications
              </span>

              {/* Separator line */}
              <div className="w-full h-px bg-[#acacac]" />

              {/* Notification rows — 2 columns */}
              <div className="flex flex-col gap-[10px] py-[5px]">
                {rows.map(([left, right], rowIdx) => (
                  <div key={rowIdx} className="flex flex-col sm:flex-row gap-[10px]">
                    {/* Left column */}
                    <div className="flex-1 flex flex-col gap-[10px]">
                      <NotificationCheckRow
                        label={left}
                        checked={checked[left]}
                        onChange={() => toggleNotification(left)}
                      />
                      <div className="w-full h-px bg-[#737373]" />
                    </div>

                    {/* Right column */}
                    {right && (
                      <div className="flex-1 flex flex-col gap-[10px]">
                        <NotificationCheckRow
                          label={right}
                          checked={checked[right]}
                          onChange={() => toggleNotification(right)}
                        />
                        <div className="w-full h-px bg-[#737373]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom action bar ───────────────────────────────────── */}
      {!saved && (
        <div className="shrink-0 px-4 sm:px-6 py-4 flex items-center justify-end gap-5 border-t border-[#e0dfdf]">
          <button
            onClick={onCancel}
            className="px-[80px] py-3 rounded-[100px] border border-[#46367f] font-['Poppins',sans-serif] text-[14px] text-[#5ea7a3] hover:bg-ds-purple-light cursor-pointer transition-colors"
            style={{ fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-[80px] py-3 rounded-[100px] bg-[#46367f] border border-[#46367f] text-white font-['Poppins',sans-serif] text-[14px] hover:bg-ds-purple-hover cursor-pointer transition-colors disabled:opacity-70"
            style={{ fontWeight: 500 }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
                </svg>
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/** Individual notification checkbox row */
function NotificationCheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="h-[38px] flex items-center gap-[15px] px-[15px] rounded-[30px]">
      <button
        onClick={onChange}
        className="relative w-[16px] h-[16px] rounded-[5px] border border-[#46367f] cursor-pointer shrink-0 flex items-center justify-center transition-colors"
        style={{
          backgroundColor: checked ? "#46367f" : "white",
        }}
        aria-checked={checked}
        role="checkbox"
      >
        {checked && (
          <svg viewBox="0 0 9.6 6.4" fill="none" className="w-[9.6px] h-[6.4px]">
            <path d="M0.5 3.4L3.2 5.9L9.1 0.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        className="font-['Poppins',sans-serif] text-[16px] text-black"
        style={{ fontWeight: 400 }}
      >
        {label}
      </span>
    </div>
  );
}

// Configuration card data
const CONFIG_CARDS = [
  {
    id: "user-access",
    title: "Configure User Access",
    bullets: [
      "Configure User Access",
      "Define user roles and access levels for system control.",
    ],
  },
  {
    id: "offering-access",
    title: "Configure Offering Access",
    bullets: [
      "Define permissions and restrictions for accessing specific services or products.",
      "Set up user roles and privileges for offering access management.",
    ],
  },
  {
    id: "notifications",
    title: "Configure Notifications",
    bullets: [
      "Customize alert settings for various events and updates.",
      "Choose the preferred communication channels and notification preferences.",
    ],
  },
  {
    id: "password-security",
    title: "Configure Password & Security",
    bullets: [
      "Control how users create, reset, and manage their passwords securely.",
      "Additional security measures like account recovery options and password expiration.",
    ],
  },
];

function ConfigureCard({ title, bullets, onConfigureNow }: { title: string; bullets: string[]; onConfigureNow?: () => void }) {
  return (
    <div className="bg-white relative rounded-[10px] border border-[#737373] flex flex-col justify-between min-h-[200px]">
      <div className="flex flex-col gap-2.5 px-5 pt-2.5">
        {/* Title with bottom border */}
        <div className="border-b border-ds-purple py-1">
          <p
            className="font-['Montserrat',sans-serif] text-[18px] text-ds-purple whitespace-nowrap"
            style={{ fontWeight: 700 }}
          >
            {title}
          </p>
        </div>

        {/* Bullet points */}
        {bullets.map((text, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-[5px] shrink-0">
              <svg viewBox="0 0 8 8" fill="none" className="w-2 h-2">
                <circle cx="4" cy="4" r="4" fill="#46367F" />
              </svg>
            </div>
            <p
              className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]"
              style={{ fontWeight: 400 }}
            >
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* Configure Now button */}
      <div className="flex justify-end px-5 pb-2.5 pt-3">
        <button
          onClick={onConfigureNow}
          className="bg-white border border-ds-purple rounded-full px-5 py-2.5 cursor-pointer hover:bg-ds-purple-light transition-colors"
        >
          <span
            className="font-['Montserrat',sans-serif] text-[12px] text-ds-purple"
            style={{ fontWeight: 600 }}
          >
            Configure Now
          </span>
        </button>
      </div>
    </div>
  );
}

function ConfigureTab({ onOpenPanel }: { onOpenPanel: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-2.5">
      {/* Section heading */}
      <div className="py-2.5 pr-2.5">
        <p
          className="font-['Poppins',sans-serif] text-[14px] text-black"
          style={{ fontWeight: 500 }}
        >
          User Configuration Options
        </p>
      </div>

      {/* 2x2 card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {CONFIG_CARDS.map((card) => (
          <ConfigureCard
            key={card.id}
            title={card.title}
            bullets={card.bullets}
            onConfigureNow={() => onOpenPanel(card.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main UserProfile Component ──────────────────────────────────────
interface UserProfileProps {
  user: User;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
}

export function UserProfile({ user, onBack, onUpdateUser }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "configure">("overview");
  const [editing, setEditing] = useState(false);
  const [configPanel, setConfigPanel] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(user);

  const activities = useMemo(() => generateActivities(currentUser), [currentUser]);

  const ACTIVITY_COLS: ColumnDef[] = [
    { key: "date", initialWidth: 110, minWidth: 70 },
    { key: "time", initialWidth: 119, minWidth: 70 },
    { key: "activity", initialWidth: 320, minWidth: 120 },
    { key: "category", initialWidth: 160, minWidth: 100 },
  ];
  const { gridStyle: activityGridStyle, startResize: activityStartResize } = useResizableColumns(ACTIVITY_COLS);

  const handleSaveProfile = (updated: User) => {
    setCurrentUser(updated);
    onUpdateUser(updated);
    setEditing(false);
  };

  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "configure" as const, label: "Configure" },
  ];

  // ── Full-page Edit Profile view ──────────────────────────────────
  if (editing) {
    return (
      <EditProfilePage
        user={currentUser}
        onCancel={() => setEditing(false)}
        onSave={handleSaveProfile}
        onBackToUsers={onBack}
      />
    );
  }

  // ── Full-page Configure User Access view ─────────────────────────
  if (configPanel === "user-access") {
    return (
      <ConfigureUserAccessPage
        onCancel={() => setConfigPanel(null)}
        onSave={() => setConfigPanel(null)}
        onBackToUsers={onBack}
      />
    );
  }

  // ── Full-page Configure Offering Access view ─────────────────────
  if (configPanel === "offering-access") {
    return (
      <ConfigureOfferingAccessPage
        onCancel={() => setConfigPanel(null)}
        onSave={() => setConfigPanel(null)}
        onBackToUsers={onBack}
      />
    );
  }

  // ── Full-page Configure Notifications view ────────────────────────
  if (configPanel === "notifications") {
    return (
      <ConfigureNotificationsPage
        onCancel={() => setConfigPanel(null)}
        onSave={() => setConfigPanel(null)}
        onBackToUsers={onBack}
      />
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* ── Header area ─────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0 flex flex-col gap-2.5">
        {/* Page title */}
        <h1
          className="font-['Montserrat',sans-serif] text-[22px] sm:text-[27px] text-[#4d4085]"
          style={{ fontWeight: 700 }}
        >
          User Profile
        </h1>

        {/* Breadcrumb */}
        <Breadcrumb
          segments={[
            { label: "Users", onClick: onBack },
            { label: "User Profile" },
          ]}
        />

        {/* User name */}
        <h2
          className="font-['Montserrat',sans-serif] text-[20px] sm:text-[24px] text-[#1c1c1c] tracking-[-0.24px]"
          style={{ fontWeight: 600 }}
        >
          {currentUser.firstName} {currentUser.lastName}
        </h2>

        {/* Tab navigation */}
        <div className="flex gap-2.5 relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-2.5 py-1.5 cursor-pointer"
              >
                <span
                  className={`font-['Montserrat',sans-serif] text-[18px] ${
                    isActive ? "text-ds-purple" : "text-[#3a3a3a] hover:text-ds-purple/70"
                  } transition-colors`}
                  style={{ fontWeight: isActive ? 700 : 500 }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-ds-purple rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 py-4">
        {activeTab === "overview" ? (
          <div className="flex flex-col lg:flex-row gap-5 h-full">
            {/* ── Activity table ─────────────────────────────────── */}
            <div className="flex-1 min-w-0 bg-white border border-[#acacac] rounded-[10px] flex flex-col overflow-hidden">
              {/* Activity header tab */}
              <div className="border-b border-ds-teal px-2.5">
                <div className="flex items-center h-[40px] px-2.5">
                  <span className="font-['Poppins',sans-serif] text-[14px] text-[#3a3a3a]" style={{ fontWeight: 500 }}>
                    Activity
                  </span>
                </div>
              </div>

              {/* Total count */}
              <div className="px-5 py-2">
                <span className="font-['Poppins',sans-serif] text-[12px] text-[#5b5b5b]" style={{ fontWeight: 600 }}>
                  Total {activities.length} Activity
                </span>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto px-2.5 pb-2.5">
                {/* Desktop table */}
                <div className="hidden sm:block min-w-[500px]">
                  {/* Header */}
                  <div className="bg-ds-purple-dark items-center h-[40px]" style={activityGridStyle()}>
                    {[
                      { label: "Date", idx: 0 },
                      { label: "Time", idx: 1 },
                      { label: "Activity", idx: 2 },
                      { label: "Activity Category", idx: 3 },
                    ].map((col) => (
                      <div key={col.label} className="relative h-full">
                        <div className="flex items-center gap-1.5 px-2.5 h-full">
                          <span className="font-['Poppins',sans-serif] text-[12px] text-white tracking-[-0.12px] whitespace-nowrap" style={{ fontWeight: 500 }}>
                            {col.label}
                          </span>
                          <svg viewBox="0 0 12 7.41422" fill="none" className="w-[10px] h-[5px]">
                            <path d="M1 1L5.96894 6L11 1" stroke="white" strokeLinecap="round" strokeWidth="2" />
                          </svg>
                        </div>
                        {col.idx < 3 && <ResizeHandle onMouseDown={(e) => activityStartResize(col.idx, e)} />}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {activities.map((a) => (
                    <div key={a.id} className="items-center border-b border-[#e0dfdf] hover:bg-gray-50/50 transition-colors" style={activityGridStyle()}>
                      <div className="py-2.5 px-2.5">
                        <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>{a.date}</span>
                      </div>
                      <div className="py-2.5 px-2.5">
                        <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a] whitespace-nowrap" style={{ fontWeight: 400 }}>{a.time}</span>
                      </div>
                      <div className="py-2.5 px-2.5">
                        <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>{a.activity}</span>
                      </div>
                      <div className="py-2.5 px-2.5">
                        <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a] whitespace-nowrap" style={{ fontWeight: 400 }}>{a.category}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile card view */}
                <div className="sm:hidden flex flex-col gap-2.5">
                  {activities.map((a) => (
                    <div key={a.id} className="border border-[#e0dfdf] rounded-lg p-3 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-['Poppins',sans-serif] text-[11px] text-[#5b5b5b]" style={{ fontWeight: 500 }}>{a.date}</span>
                        <span className="font-['Poppins',sans-serif] text-[11px] text-[#5b5b5b]" style={{ fontWeight: 400 }}>{a.time}</span>
                      </div>
                      <p className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>{a.activity}</p>
                      <span className="font-['Poppins',sans-serif] text-[10px] text-ds-teal px-2 py-0.5 bg-ds-teal/10 rounded-full self-start" style={{ fontWeight: 500 }}>
                        {a.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Profile Information Card ───────────────────────── */}
            <ProfileInfoCard user={currentUser} onEditProfile={() => setEditing(true)} />
          </div>
        ) : (
          <ConfigureTab onOpenPanel={(id) => setConfigPanel(id)} />
        )}
      </div>
    </div>
  );
}