import { useState, useMemo, useCallback, useEffect } from "react";
import { UserProfile } from "./UserProfile";
import { useResizableColumns, ResizeHandle } from "./useResizableColumns";

// ── Types ───────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  partner: string;
  partnerType: "Buyer" | "Seller";
  status: "Active" | "Suspended" | "Inactive";
}

// ── Mock Data ───────────────────────────────────────────────────────
const initialUsers: User[] = [
  { id: "1", email: "adam@recoverymanagementsolutionllc.com", firstName: "Adam", lastName: "Kazmark", partner: "Recovery Management Solutions, LLC (RMS)", partnerType: "Buyer", status: "Suspended" },
  { id: "2", email: "adowdey@denali-capital.com", firstName: "Amy", lastName: "Dowdey", partner: "Denali Capital", partnerType: "Seller", status: "Inactive" },
  { id: "3", email: "anees.ahmad@gmail.com", firstName: "Anees", lastName: "Ahmad", partner: "Takkar", partnerType: "Buyer", status: "Suspended" },
  { id: "4", email: "adam@recoverymanagementsolutionllc.com", firstName: "Adam", lastName: "Kazmark", partner: "Recovery Management Solutions, LLC (RMS)", partnerType: "Buyer", status: "Suspended" },
  { id: "5", email: "anees.ahmad@gmail.com", firstName: "Anees", lastName: "Ahmad", partner: "Takkar", partnerType: "Buyer", status: "Suspended" },
  { id: "6", email: "adowdey@denali-capital.com", firstName: "Amy", lastName: "Dowdey", partner: "Denali Capital", partnerType: "Seller", status: "Inactive" },
  { id: "7", email: "adam@recoverymanagementsolutionllc.com", firstName: "Adam", lastName: "Kazmark", partner: "Recovery Management Solutions, LLC (RMS)", partnerType: "Buyer", status: "Suspended" },
  { id: "8", email: "adowdey@denali-capital.com", firstName: "Amy", lastName: "Dowdey", partner: "Denali Capital", partnerType: "Seller", status: "Inactive" },
  { id: "9", email: "anees.ahmad@gmail.com", firstName: "Anees", lastName: "Ahmad", partner: "Takkar", partnerType: "Buyer", status: "Suspended" },
  { id: "10", email: "adam@recoverymanagementsolutionllc.com", firstName: "Adam", lastName: "Kazmark", partner: "Recovery Management Solutions, LLC (RMS)", partnerType: "Buyer", status: "Suspended" },
  { id: "11", email: "anees.ahmad@gmail.com", firstName: "Anees", lastName: "Ahmad", partner: "Takkar", partnerType: "Buyer", status: "Suspended" },
  { id: "12", email: "adowdey@denali-capital.com", firstName: "Amy", lastName: "Dowdey", partner: "Denali Capital", partnerType: "Seller", status: "Inactive" },
  { id: "13", email: "adam@recoverymanagementsolutionllc.com", firstName: "Adam", lastName: "Kazmark", partner: "Recovery Management Solutions, LLC (RMS)", partnerType: "Buyer", status: "Suspended" },
  { id: "14", email: "anees.ahmad@gmail.com", firstName: "Anees", lastName: "Ahmad", partner: "Takkar", partnerType: "Buyer", status: "Suspended" },
  { id: "15", email: "sarah.johnson@acmecorp.com", firstName: "Sarah", lastName: "Johnson", partner: "ACME Corporation", partnerType: "Buyer", status: "Active" },
  { id: "16", email: "mike.chen@globalfin.com", firstName: "Mike", lastName: "Chen", partner: "Global Financial Services", partnerType: "Seller", status: "Active" },
  { id: "17", email: "ken@samincsolutions.com", firstName: "Kenneth", lastName: "Ngo", partner: "SAM", partnerType: "Buyer", status: "Active" },
];

// ── Sort direction type ─────────────────────────────────────────────
type SortDir = "asc" | "desc" | null;
type SortField = keyof User;

// ── Refresh icon SVG path ───────────────────────────────────────────
const REFRESH_PATH = "M2.22 10C2.22 5.67 5.66 2.22 10 2.22C11.44 2.22 12.78 2.66 14 3.33H13.56C12.89 3.33 12.45 3.77 12.45 4.44C12.45 5.11 12.89 5.55 13.56 5.55H16.89C17.56 5.55 18 5.11 18 4.44V1.11C18 0.44 17.56 0 16.89 0C16.22 0 15.78 0.44 15.78 1.11V1.89C14.11 0.67 12.11 0 10 0C4.44 0 0 4.44 0 10C0 10.44 0 10.89 0.11 11.22C0.22 11.78 0.67 12.22 1.22 12.22H1.33C1.89 12.11 2.33 11.55 2.33 11C2.22 10.67 2.22 10.33 2.22 10ZM19.89 8.78C19.78 8.22 19.22 7.78 18.67 7.78C18.11 7.89 17.67 8.45 17.67 9C17.67 9.33 17.78 9.67 17.78 10C17.78 14.33 14.34 17.78 10 17.78C8.56 17.78 7.22 17.34 6 16.67H6.67C7.34 16.67 7.78 16.23 7.78 15.56C7.78 14.89 7.34 14.45 6.67 14.45H3.34C2.67 14.45 2.23 14.89 2.23 15.56V18.89C2.23 19.56 2.67 20 3.34 20C4.01 20 4.45 19.56 4.45 18.89V18.33C6.12 19.44 8.01 20 10.01 20C15.57 20 20.01 15.56 20.01 10C20.01 9.56 20.01 9.22 19.9 8.78H19.89Z";

// ── Go-to arrow SVG path ────────────────────────────────────────────
const GOTO_PATH = "M12.3797 8.19633L2.63613 0.359955C1.56823 -0.499113 0 0.276143 0 1.66475V17.3356C0 18.7223 1.56823 19.4995 2.63613 18.6404L12.3797 10.804C13.2068 10.1392 13.2068 8.8592 12.3797 8.19442V8.19633Z";

// ── Status badge colors ─────────────────────────────────────────────
function statusBadge(status: User["status"]) {
  switch (status) {
    case "Active":
      return "bg-emerald-100 text-emerald-700";
    case "Suspended":
      return "bg-amber-100 text-amber-700";
    case "Inactive":
      return "bg-red-100 text-red-700";
  }
}

// ── Resizable column definitions for Users table ────────────────────
const USER_COLUMNS: import("./useResizableColumns").ColumnDef[] = [
  { key: "email", initialWidth: 264, minWidth: 150 },
  { key: "firstName", initialWidth: 156, minWidth: 80 },
  { key: "lastName", initialWidth: 156, minWidth: 80 },
  { key: "partner", initialWidth: 300, minWidth: 120 },
  { key: "partnerType", initialWidth: 144, minWidth: 90 },
  { key: "status", initialWidth: 144, minWidth: 80 },
];

// ── Add / Edit User Modal ───────────────────────────────────────────
interface UserModalProps {
  user: User | null; // null = add new
  onClose: () => void;
  onSave: (user: User) => void;
}

function UserModal({ user, onClose, onSave }: UserModalProps) {
  const isEdit = !!user;
  const [form, setForm] = useState<Omit<User, "id">>({
    email: user?.email ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    partner: user?.partner ?? "",
    partnerType: user?.partnerType ?? "Buyer",
    status: user?.status ?? "Active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.partner.trim()) e.partner = "Partner is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        onSave({ ...form, id: user?.id ?? crypto.randomUUID() });
      }, 800);
    }, 1000);
  };

  const update = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-ds-teal rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="font-['Montserrat',sans-serif] text-[18px] text-white" style={{ fontWeight: 700 }}>
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-white/70 cursor-pointer transition-colors p-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {saved ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emerald-600">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-['Poppins',sans-serif] text-[16px] text-ds-dark-gray text-center" style={{ fontWeight: 600 }}>
              User {isEdit ? "updated" : "created"} successfully!
            </p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="user@company.com"
                className={`w-full border rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray outline-none transition-colors ${
                  errors.email ? "border-red-400 bg-red-50" : "border-ds-haze focus:border-ds-purple"
                }`}
                style={{ fontWeight: 400 }}
              />
              {errors.email && <p className="text-[11px] text-red-500 font-['Poppins',sans-serif]">{errors.email}</p>}
            </div>

            {/* First + Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="First name"
                  className={`w-full border rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray outline-none transition-colors ${
                    errors.firstName ? "border-red-400 bg-red-50" : "border-ds-haze focus:border-ds-purple"
                  }`}
                  style={{ fontWeight: 400 }}
                />
                {errors.firstName && <p className="text-[11px] text-red-500 font-['Poppins',sans-serif]">{errors.firstName}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  placeholder="Last name"
                  className={`w-full border rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray outline-none transition-colors ${
                    errors.lastName ? "border-red-400 bg-red-50" : "border-ds-haze focus:border-ds-purple"
                  }`}
                  style={{ fontWeight: 400 }}
                />
                {errors.lastName && <p className="text-[11px] text-red-500 font-['Poppins',sans-serif]">{errors.lastName}</p>}
              </div>
            </div>

            {/* Partner */}
            <div className="flex flex-col gap-1.5">
              <label className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                Partner <span className="text-red-500">*</span>
              </label>
              <input
                value={form.partner}
                onChange={(e) => update("partner", e.target.value)}
                placeholder="Partner organization"
                className={`w-full border rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray outline-none transition-colors ${
                  errors.partner ? "border-red-400 bg-red-50" : "border-ds-haze focus:border-ds-purple"
                }`}
                style={{ fontWeight: 400 }}
              />
              {errors.partner && <p className="text-[11px] text-red-500 font-['Poppins',sans-serif]">{errors.partner}</p>}
            </div>

            {/* Partner Type + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                  Partner Type
                </label>
                <select
                  value={form.partnerType}
                  onChange={(e) => update("partnerType", e.target.value)}
                  className="w-full border border-ds-haze rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray outline-none focus:border-ds-purple cursor-pointer bg-white"
                  style={{ fontWeight: 400 }}
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Seller">Seller</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 500 }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className="w-full border border-ds-haze rounded-xl px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray outline-none focus:border-ds-purple cursor-pointer bg-white"
                  style={{ fontWeight: 400 }}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full border border-ds-haze font-['Poppins',sans-serif] text-[13px] text-ds-gray hover:bg-gray-50 cursor-pointer transition-colors"
                style={{ fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2.5 rounded-full bg-ds-purple text-white font-['Poppins',sans-serif] text-[13px] hover:bg-ds-purple-hover cursor-pointer transition-colors disabled:opacity-70"
                style={{ fontWeight: 500 }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="10" />
                    </svg>
                    Saving...
                  </span>
                ) : isEdit ? "Update User" : "Add User"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Three-Dot Options Menu ──────────────────────────────────────────
function OptionsMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-[44px] h-[44px] cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg viewBox="0 0 5 25" fill="none" className="w-[5px] h-[25px]">
          <circle cx="2.5" cy="2.5" r="2.5" fill="black" />
          <circle cx="2.5" cy="12.5" r="2.5" fill="black" />
          <circle cx="2.5" cy="22.5" r="2.5" fill="black" />
        </svg>
      </button>
      {open && (
        <div className="contents">
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-ds-haze z-20 py-1">
            {["Export Users", "Import Users", "Bulk Actions"].map((item) => (
              <button
                key={item}
                className="w-full text-left px-4 py-2.5 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray hover:bg-ds-purple-light cursor-pointer transition-colors"
                style={{ fontWeight: 400 }}
                onClick={() => setOpen(false)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main UserManagement Component ───────────────────────────────────
export function UserManagement({ openUserId }: { openUserId?: string }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [modalUser, setModalUser] = useState<User | null | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(() => {
    if (openUserId) {
      return initialUsers.find((u) => u.id === openUserId) ?? null;
    }
    return null;
  });

  const { gridStyle, startResize } = useResizableColumns(USER_COLUMNS, 38);

  // React to openUserId changes (e.g. sidebar avatar clicked while on another module)
  useEffect(() => {
    if (openUserId) {
      const found = users.find((u) => u.id === openUserId) ?? null;
      setSelectedUser(found);
    }
  }, [openUserId]);

  // ── Sort handler ──────────────────────────────────────────────────
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
        if (sortDir === "desc") setSortField(null);
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField, sortDir]
  );

  // ── Filtered + sorted users ───────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.partner.toLowerCase().includes(q) ||
          u.partnerType.toLowerCase().includes(q) ||
          u.status.toLowerCase().includes(q)
      );
    }
    if (sortField && sortDir) {
      list.sort((a, b) => {
        const aVal = String(a[sortField]).toLowerCase();
        const bVal = String(b[sortField]).toLowerCase();
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    return list;
  }, [users, searchQuery, sortField, sortDir]);

  // ── Save handler ──────────────────────────────────────────────────
  const handleSave = (user: User) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = user;
        return copy;
      }
      return [...prev, user];
    });
    setModalUser(undefined);
  };

  // ── Refresh ───────────────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  // ── If a user is selected, show their profile ─────────────────────
  if (selectedUser) {
    return (
      <UserProfile
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onUpdateUser={(updated) => {
          setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
          setSelectedUser(updated);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 pt-4 pb-3 gap-3 shrink-0">
        <div className="px-2.5 py-1">
          <h1
            className="font-['Montserrat',sans-serif] text-[22px] sm:text-[27px] text-[#352b5d]"
            style={{ fontWeight: 700 }}
          >
            Users
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-[15px] flex-wrap">
          {/* Add New User */}
          <button
            onClick={() => setModalUser(null)}
            className="bg-[#4d4085] hover:bg-ds-purple-hover text-white font-['Poppins',sans-serif] text-[14px] sm:text-[16px] px-5 sm:px-[30px] py-[10px] sm:py-[12px] rounded-[50px] cursor-pointer transition-colors whitespace-nowrap"
            style={{ fontWeight: 500 }}
          >
            Add New User
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2.5 bg-white border border-[#46367f] text-[#46367f] font-['Poppins',sans-serif] text-[14px] px-6 sm:px-[60px] py-[10px] sm:py-[12px] rounded-[100px] cursor-pointer hover:bg-ds-purple-light transition-colors disabled:opacity-60 whitespace-nowrap"
            style={{ fontWeight: 500 }}
          >
            <svg viewBox="0 0 20.01 20" fill="none" className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}>
              <path d={REFRESH_PATH} fill="#46367F" />
            </svg>
            Refresh
          </button>

          {/* Options */}
          <OptionsMenu />
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pb-3 shrink-0">
        <div className="relative max-w-[400px]">
          <svg viewBox="0 0 20 20" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4">
            <path
              d="M9 2a7 7 0 104.32 12.54l3.58 3.58a1 1 0 001.42-1.42l-3.58-3.58A7 7 0 009 2zm-5 7a5 5 0 1110 0A5 5 0 014 9z"
              fill="#AFAEAE"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full border border-ds-haze rounded-xl pl-9 pr-4 py-2 font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray outline-none focus:border-ds-purple transition-colors"
            style={{ fontWeight: 400 }}
          />
        </div>
      </div>

      {/* ── Table (Desktop) ─────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 pb-4">
        {/* Desktop table */}
        <div className="hidden md:block w-full min-w-[900px]">
          {/* Header */}
          <div className="bg-ds-purple-dark items-center h-[40px] sticky top-0 z-10" style={gridStyle()}>
            {["User Name", "First Name", "Last Name", "Partner", "Partner Type", "Status"].map((label, i) => {
              const fields: SortField[] = ["email", "firstName", "lastName", "partner", "partnerType", "status"];
              const isActive = sortField === fields[i];
              return (
                <div key={fields[i]} className="relative h-full">
                  <button
                    onClick={() => handleSort(fields[i])}
                    className="flex items-center gap-1.5 px-2.5 h-full cursor-pointer overflow-hidden w-full"
                  >
                    <span className="font-['Poppins',sans-serif] text-[12px] text-white tracking-[-0.12px] whitespace-nowrap" style={{ fontWeight: 500 }}>
                      {label}
                    </span>
                    <svg viewBox="0 0 12 7.41422" fill="none" className={`w-[10px] h-[5px] shrink-0 transition-transform ${isActive && sortDir === "asc" ? "rotate-180" : ""}`}>
                      <path d="M1 1L5.96894 6L11 1" stroke="white" strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </button>
                  {i < 5 && <ResizeHandle onMouseDown={(e) => startResize(i, e)} />}
                </div>
              );
            })}
            <div />
          </div>

          {/* Rows */}
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-['Poppins',sans-serif] text-[14px] text-ds-gray" style={{ fontWeight: 400 }}>
                No users found.
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="items-center border-b border-ds-haze hover:bg-ds-purple-light/30 transition-colors group"
                style={gridStyle()}
              >
                {/* User Name (email) */}
                <div className="px-2.5 py-2.5 border-r border-white">
                  <p
                    className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a] truncate"
                    style={{ fontWeight: 400 }}
                    title={user.email}
                  >
                    {user.email}
                  </p>
                </div>

                {/* First Name */}
                <div className="px-2.5 py-2.5">
                  <p className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>
                    {user.firstName}
                  </p>
                </div>

                {/* Last Name */}
                <div className="px-2.5 py-2.5">
                  <p className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>
                    {user.lastName}
                  </p>
                </div>

                {/* Partner */}
                <div className="px-2.5 py-2.5">
                  <p
                    className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a] truncate"
                    style={{ fontWeight: 400 }}
                    title={user.partner}
                  >
                    {user.partner}
                  </p>
                </div>

                {/* Partner Type */}
                <div className="px-2.5 py-2.5">
                  <p className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>
                    {user.partnerType}
                  </p>
                </div>

                {/* Status */}
                <div className="px-2.5 py-2.5">
                  <p className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>
                    {user.status}
                  </p>
                </div>

                {/* Go To */}
                <div className="w-[38px] shrink-0 flex items-center justify-center">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2 cursor-pointer hover:bg-ds-purple-light rounded-md transition-colors"
                    title="View user profile"
                  >
                    <svg viewBox="0 0 13 19" fill="none" className="w-[13px] h-[19px]">
                      <path d={GOTO_PATH} fill="#46367F" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Mobile Card View ──────────────────────────────────── */}
        <div className="md:hidden flex flex-col gap-3">
          {filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="font-['Poppins',sans-serif] text-[14px] text-ds-gray" style={{ fontWeight: 400 }}>
                No users found.
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-ds-haze rounded-xl p-4 flex flex-col gap-2.5 shadow-sm"
              >
                {/* Email header */}
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="font-['Poppins',sans-serif] text-[13px] text-ds-purple flex-1 min-w-0 break-all"
                    style={{ fontWeight: 600 }}
                  >
                    {user.email}
                  </p>
                  <span
                    className={`shrink-0 font-['Poppins',sans-serif] text-[11px] px-2.5 py-1 rounded-full ${statusBadge(user.status)}`}
                    style={{ fontWeight: 500 }}
                  >
                    {user.status}
                  </span>
                </div>

                {/* Info rows */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <div>
                    <p className="font-['Poppins',sans-serif] text-[10px] text-ds-gray uppercase tracking-wider" style={{ fontWeight: 500 }}>Name</p>
                    <p className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 400 }}>
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Poppins',sans-serif] text-[10px] text-ds-gray uppercase tracking-wider" style={{ fontWeight: 500 }}>Type</p>
                    <p className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 400 }}>
                      {user.partnerType}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-['Poppins',sans-serif] text-[10px] text-ds-gray uppercase tracking-wider" style={{ fontWeight: 500 }}>Partner</p>
                    <p className="font-['Poppins',sans-serif] text-[13px] text-ds-dark-gray" style={{ fontWeight: 400 }}>
                      {user.partner}
                    </p>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  onClick={() => setSelectedUser(user)}
                  className="self-end flex items-center gap-1.5 text-ds-purple font-['Poppins',sans-serif] text-[12px] cursor-pointer hover:underline"
                  style={{ fontWeight: 500 }}
                >
                  View Profile
                  <svg viewBox="0 0 13 19" fill="none" className="w-[10px] h-[15px]">
                    <path d={GOTO_PATH} fill="#46367F" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────── */}
      {modalUser !== undefined && (
        <UserModal
          user={modalUser}
          onClose={() => setModalUser(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}