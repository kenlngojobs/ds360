import { useState, useMemo, useCallback } from "react";
import { OFFERINGS_DATA, type Offering } from "./offeringsData";
import { useResizableColumns, ResizeHandle, type ColumnDef } from "./useResizableColumns";

// ── Sort direction type ─────────────────────────────────────────────
type SortDir = "asc" | "desc" | null;
type SortField = keyof Offering;

// ── Go-to arrow SVG path ────────────────────────────────────────────
const GOTO_PATH =
  "M12.3797 8.19633L2.63613 0.359955C1.56823 -0.499113 0 0.276143 0 1.66475V17.3356C0 18.7223 1.56823 19.4995 2.63613 18.6404L12.3797 10.804C13.2068 10.1392 13.2068 8.8592 12.3797 8.19442V8.19633Z";

// ── Create icon SVG paths (from Figma) ──────────────────────────────
const CREATE_ICON_1 =
  "M12.5 0C5.59625 0 0 5.59625 0 12.5C0 19.4037 5.59625 25 12.5 25C19.4037 25 25 19.4037 25 12.5C25 5.59625 19.4037 0 12.5 0ZM12.5 22.6562C6.89875 22.6562 2.34375 18.1013 2.34375 12.5C2.34375 6.89875 6.89875 2.34375 12.5 2.34375C18.1013 2.34375 22.6562 6.89875 22.6562 12.5C22.6562 18.1013 18.1013 22.6562 12.5 22.6562Z";
const CREATE_ICON_2 =
  "M17.1875 11.7188H13.2812V7.8125C13.2812 7.38125 12.9313 7.03125 12.5 7.03125C12.0688 7.03125 11.7188 7.38125 11.7188 7.8125V11.7188H7.8125C7.38125 11.7188 7.03125 12.0688 7.03125 12.5C7.03125 12.9313 7.38125 13.2812 7.8125 13.2812H11.7188V17.1875C11.7188 17.6188 12.0688 17.9688 12.5 17.9688C12.9313 17.9688 13.2812 17.6188 13.2812 17.1875V13.2812H17.1875C17.6188 13.2812 17.9688 12.9313 17.9688 12.5C17.9688 12.0688 17.6188 11.7188 17.1875 11.7188Z";

// ── Refresh icon SVG path ───────────────────────────────────────────
const REFRESH_PATH =
  "M2.22 10C2.22 5.67 5.66 2.22 10 2.22C11.44 2.22 12.78 2.66 14 3.33H13.56C12.89 3.33 12.45 3.77 12.45 4.44C12.45 5.11 12.89 5.55 13.56 5.55H16.89C17.56 5.55 18 5.11 18 4.44V1.11C18 0.44 17.56 0 16.89 0C16.22 0 15.78 0.44 15.78 1.11V1.89C14.11 0.67 12.11 0 10 0C4.44 0 0 4.44 0 10C0 10.44 0 10.89 0.11 11.22C0.22 11.78 0.67 12.22 1.22 12.22H1.33C1.89 12.11 2.33 11.55 2.33 11C2.22 10.67 2.22 10.33 2.22 10ZM19.89 8.78C19.78 8.22 19.22 7.78 18.67 7.78C18.11 7.89 17.67 8.45 17.67 9C17.67 9.33 17.78 9.67 17.78 10C17.78 14.33 14.34 17.78 10 17.78C8.56 17.78 7.22 17.34 6 16.67H6.67C7.34 16.67 7.78 16.23 7.78 15.56C7.78 14.89 7.34 14.45 6.67 14.45H3.34C2.67 14.45 2.23 14.89 2.23 15.56V18.89C2.23 19.56 2.67 20 3.34 20C4.01 20 4.45 19.56 4.45 18.89V18.33C6.12 19.44 8.01 20 10.01 20C15.57 20 20.01 15.56 20.01 10C20.01 9.56 20.01 9.22 19.9 8.78H19.89Z";

// ── Search icon SVG path ────────────────────────────────────────────
const SEARCH_PATH =
  "M12.4602 11.2988L9.42627 8.2651C10.0262 7.39763 10.3363 6.37047 10.3164 5.32401C10.2965 4.27756 9.94751 3.26302 9.31526 2.41813C8.68301 1.57324 7.79892 0.939266 6.78521 0.602682C5.77149 0.266098 4.67986 0.24326 3.65219 0.537521C2.62452 0.831782 1.71318 1.42871 1.04464 2.24656C0.376102 3.06442 -0.0162544 4.06321 -0.0811629 5.10786C-0.146071 6.15252 0.118709 7.19199 0.674897 8.08621C1.23108 8.98044 2.05207 9.68555 3.02734 10.1075C3.91419 10.4949 4.88996 10.6117 5.83874 10.4441C6.78752 10.2764 7.66802 9.83161 8.37429 9.16309L11.4082 12.1968C11.4773 12.2683 11.56 12.3254 11.6513 12.3649C11.7427 12.4044 11.8409 12.4255 11.9404 12.4271C12.0399 12.4287 12.1387 12.4108 12.2313 12.3742C12.3238 12.3376 12.4083 12.2833 12.4796 12.214C12.551 12.1448 12.6077 12.0621 12.6466 11.9705C12.6856 11.879 12.706 11.7806 12.7069 11.681C12.7079 11.5815 12.6894 11.4827 12.6523 11.3903C12.6151 11.2979 12.5603 11.2137 12.4902 11.1428L12.4602 11.2988ZM5.17529 8.97412C4.42365 8.97412 3.68941 8.75138 3.06577 8.33459C2.44213 7.9178 1.95708 7.32589 1.67017 6.63273C1.38326 5.93957 1.30711 5.17656 1.45105 4.43996C1.59499 3.70336 1.95259 3.02598 2.48403 2.49454C3.01547 1.9631 3.69286 1.6055 4.42946 1.46156C5.16606 1.31762 5.92907 1.39377 6.62222 1.68068C7.31538 1.96759 7.90729 2.45264 8.32408 3.07628C8.74087 3.69992 8.96361 4.43416 8.96361 5.18579C8.96249 6.19006 8.56299 7.15278 7.85313 7.86264C7.14327 8.5725 6.17956 8.973 5.17529 8.97412Z";

// ── Main Offerings Management Component ─────────────────────────────
const OFFERING_COLS: ColumnDef[] = [
  { key: "name", initialWidth: 300, minWidth: 150 },
  { key: "group", initialWidth: 180, minWidth: 100 },
  { key: "scenarios", initialWidth: 100, minWidth: 70 },
  { key: "seller", initialWidth: 180, minWidth: 100 },
  { key: "status", initialWidth: 240, minWidth: 120 },
];

export function OfferingsManagement() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { gridStyle, startResize } = useResizableColumns(OFFERING_COLS, 38);

  // Handle sort
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

  // Filter + sort
  const filtered = useMemo(() => {
    let items = [...OFFERINGS_DATA];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.group.toLowerCase().includes(q) ||
          o.seller.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q)
      );
    }

    if (sortField && sortDir) {
      items.sort((a, b) => {
        const va = String(a[sortField]).toLowerCase();
        const vb = String(b[sortField]).toLowerCase();
        const cmp = va.localeCompare(vb, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return items;
  }, [search, sortField, sortDir]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* ── Top bar: search + action buttons ─────────────────── */}
      <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0 flex flex-col gap-3">
        {/* Title row (mobile) */}
        <h1
          className="sm:hidden font-['Montserrat',sans-serif] text-[22px] text-[#4d4085]"
          style={{ fontWeight: 700 }}
        >
          Offerings
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4">
              <svg viewBox="0 0 13 13" fill="none" className="w-full h-full">
                <path d={SEARCH_PATH} fill="black" fillOpacity="0.2" />
              </svg>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full h-[41px] bg-black/5 rounded-[45px] pl-9 pr-4 font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a] outline-none placeholder:text-black/20 focus:ring-1 focus:ring-ds-purple/30 transition-shadow"
              style={{ fontWeight: 500 }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="w-[38px] h-[38px] rounded-full border border-ds-purple flex items-center justify-center cursor-pointer hover:bg-ds-purple-light transition-colors"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              >
                <path d={REFRESH_PATH} fill="#46367F" />
              </svg>
            </button>

            {/* Create New Offering */}
            <button className="bg-[#46367f] flex items-center gap-2.5 h-[49px] px-[30px] rounded-[50px] cursor-pointer hover:bg-ds-purple-hover transition-colors">
              <svg viewBox="0 0 25 25" fill="none" className="w-[25px] h-[25px] shrink-0">
                <path d={CREATE_ICON_1} fill="white" />
                <path d={CREATE_ICON_2} fill="white" />
              </svg>
              <span
                className="font-['Poppins',sans-serif] text-[16px] text-white whitespace-nowrap"
                style={{ fontWeight: 500 }}
              >
                Create New Offering
              </span>
            </button>

            {/* Offering Groups */}
            <button className="bg-[#46367f] h-[49px] px-[30px] rounded-[100px] border border-[#46367f] cursor-pointer hover:bg-ds-purple-hover transition-colors">
              <span
                className="font-['Poppins',sans-serif] text-[14px] text-white whitespace-nowrap"
                style={{ fontWeight: 500 }}
              >
                Offering Groups
              </span>
            </button>
          </div>
        </div>

        {/* Result count */}
        <p
          className="font-['Poppins',sans-serif] text-[12px] text-[#5b5b5b]"
          style={{ fontWeight: 600 }}
        >
          Total {filtered.length} Offering{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Desktop Table ────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-auto px-4 sm:px-6 pb-4">
        {/* Desktop */}
        <div className="hidden md:block min-w-[1200px]">
          {/* Header */}
          <div className="bg-ds-purple-dark items-center h-[40px] sticky top-0 z-10" style={gridStyle()}>
            {[
              { label: "Offerings", field: "name" as SortField },
              { label: "Group", field: "group" as SortField },
              { label: "Scenarios", field: "scenarios" as SortField },
              { label: "Seller", field: "seller" as SortField },
              { label: "Status", field: "status" as SortField },
            ].map((col, i) => {
              const isActive = sortField === col.field;
              return (
                <div key={col.field} className="relative h-full">
                  <button
                    onClick={() => handleSort(col.field)}
                    className="flex items-center gap-1.5 px-2.5 h-full cursor-pointer overflow-hidden w-full"
                  >
                    <span className="font-['Poppins',sans-serif] text-[12px] text-white tracking-[-0.12px] whitespace-nowrap flex-1 text-left" style={{ fontWeight: 500 }}>
                      {col.label}
                    </span>
                    <svg viewBox="0 0 12 7.41422" fill="none" className={`w-[10px] h-[5px] shrink-0 transition-transform ${isActive && sortDir === "asc" ? "rotate-180" : ""}`}>
                      <path d="M1 1L5.96894 6L11 1" stroke={isActive ? "#5EA7A3" : "white"} strokeLinecap="round" strokeWidth="2" />
                    </svg>
                  </button>
                  {i < 4 && <ResizeHandle onMouseDown={(e) => startResize(i, e)} />}
                </div>
              );
            })}
            <div />
          </div>

          {/* Rows */}
          {filtered.map((o) => (
            <div
              key={o.id}
              className="items-center border-b border-[#e0dfdf] hover:bg-gray-50/50 transition-colors group"
              style={gridStyle()}
            >
              <div className="py-2.5 px-2.5 truncate">
                <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>{o.name}</span>
              </div>
              <div className="py-2.5 px-2.5 truncate">
                <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>{o.group}</span>
              </div>
              <div className="py-2.5 px-2.5">
                <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>{o.scenarios}</span>
              </div>
              <div className="py-2.5 px-2.5 truncate">
                <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>{o.seller}</span>
              </div>
              <div className="py-2.5 px-2.5 truncate">
                <span className="font-['Poppins',sans-serif] text-[12px] text-[#3a3a3a]" style={{ fontWeight: 400 }}>{o.status}</span>
              </div>
              <div className="flex items-center justify-center py-2.5">
                <button className="w-[13px] h-[19px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg viewBox="0 0 13 19" fill="none" className="w-full h-full">
                    <path d={GOTO_PATH} fill="#46367F" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p
                className="font-['Poppins',sans-serif] text-[14px] text-[#acacac]"
                style={{ fontWeight: 500 }}
              >
                No offerings found.
              </p>
            </div>
          )}
        </div>

        {/* Mobile card view */}
        <div className="md:hidden flex flex-col gap-2.5">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="border border-[#e0dfdf] rounded-lg p-4 flex flex-col gap-2 bg-white"
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className="font-['Poppins',sans-serif] text-[13px] text-[#3a3a3a] flex-1"
                  style={{ fontWeight: 500 }}
                >
                  {o.name}
                </p>
                <button className="w-[13px] h-[19px] shrink-0 cursor-pointer mt-0.5">
                  <svg viewBox="0 0 13 19" fill="none" className="w-full h-full">
                    <path d={GOTO_PATH} fill="#46367F" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div className="flex flex-col">
                  <span
                    className="font-['Montserrat',sans-serif] text-[10px] text-[#5b5b5b]"
                    style={{ fontWeight: 600 }}
                  >
                    Group
                  </span>
                  <span
                    className="font-['Poppins',sans-serif] text-[11px] text-[#3a3a3a]"
                    style={{ fontWeight: 400 }}
                  >
                    {o.group}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-['Montserrat',sans-serif] text-[10px] text-[#5b5b5b]"
                    style={{ fontWeight: 600 }}
                  >
                    Scenarios
                  </span>
                  <span
                    className="font-['Poppins',sans-serif] text-[11px] text-[#3a3a3a]"
                    style={{ fontWeight: 400 }}
                  >
                    {o.scenarios}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-['Montserrat',sans-serif] text-[10px] text-[#5b5b5b]"
                    style={{ fontWeight: 600 }}
                  >
                    Seller
                  </span>
                  <span
                    className="font-['Poppins',sans-serif] text-[11px] text-[#3a3a3a]"
                    style={{ fontWeight: 400 }}
                  >
                    {o.seller}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-['Montserrat',sans-serif] text-[10px] text-[#5b5b5b]"
                    style={{ fontWeight: 600 }}
                  >
                    Status
                  </span>
                  <span
                    className="font-['Poppins',sans-serif] text-[11px] text-[#3a3a3a] truncate"
                    style={{ fontWeight: 400 }}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16">
              <p
                className="font-['Poppins',sans-serif] text-[14px] text-[#acacac]"
                style={{ fontWeight: 500 }}
              >
                No offerings found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}