/**
 * Global Breadcrumb component for all sub-pages.
 *
 * Usage:
 *   <Breadcrumb
 *     segments={[
 *       { label: "Users", onClick: () => goBack() },
 *       { label: "User Profile" },          // last = teal, no click
 *     ]}
 *   />
 */

export interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  segments: BreadcrumbSegment[];
}

/** Circle-chevron separator matching the Figma design */
function Separator() {
  return (
    <div className="relative shrink-0 w-5 h-5">
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
        <circle cx="10" cy="10" r="9.5" fill="white" stroke="#ACACAC" />
      </svg>
      {/* Rotated chevron inside the circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 10 6.41422" fill="none" className="w-[10px] h-[6px] -rotate-90">
          <path
            d="M1 1L4.97516 5L9 1"
            stroke="#ACACAC"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}

export function Breadcrumb({ segments }: BreadcrumbProps) {
  if (!segments.length) return null;

  return (
    <nav className="flex items-center gap-2.5 flex-wrap" aria-label="Breadcrumb">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <div key={i} className="flex items-center gap-2.5">
            {i > 0 && <Separator />}
            {seg.onClick && !isLast ? (
              <button
                onClick={seg.onClick}
                className="font-['Montserrat',sans-serif] text-[14px] text-[#5b5b5b] hover:text-ds-purple cursor-pointer transition-colors"
                style={{ fontWeight: 600 }}
              >
                {seg.label}
              </button>
            ) : isLast ? (
              <span
                className="font-['Montserrat',sans-serif] text-[14px] text-ds-teal"
                style={{ fontWeight: 600 }}
              >
                {seg.label}
              </span>
            ) : (
              <span
                className="font-['Montserrat',sans-serif] text-[14px] text-[#5b5b5b]"
                style={{ fontWeight: 600 }}
              >
                {seg.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
