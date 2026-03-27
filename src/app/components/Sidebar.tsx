import { useState, useEffect, useRef, useCallback } from "react";
import svgPaths from "../../imports/svg-m2vo2ju2qk";
import imgKennethNgo from "figma:asset/e9ae7dd1b0fec57a241956478eec0e78bb6d67c7.png";

const navItems = [
  { id: "home", label: "Home", iconPath: svgPaths.p1daf6d00, viewBox: "0 0 17.5 17.1904" },
  { id: "users", label: "Users", iconPath: svgPaths.p2f426080, viewBox: "0 0 17.3091 17.5195" },
  { id: "partners", label: "Partners", iconPath: svgPaths.p3faf8900, viewBox: "0 0 17.5062 17.4902" },
  { id: "document-templates", label: "Document Templates", iconPath: svgPaths.p2a4b3a00, viewBox: "0 0 15.502 17.5" },
  { id: "account-treatment", label: "Account Treatment", iconPath: svgPaths.p3d6a2d00, viewBox: "0 0 17.4957 17.5498" },
  { id: "tags", label: "Tags", iconPath: svgPaths.p2d257300, viewBox: "0 0 18.0007 19.286" },
  { id: "category", label: "Category", iconType: "category" as const },
  { id: "groups", label: "Groups", iconPath: svgPaths.pe90c700, viewBox: "0 0 15.9988 15.9998" },
  { id: "messages", label: "Messages", iconPath: svgPaths.pe1bae00, viewBox: "0 0 17.4908 17.5" },
  { id: "offerings", label: "Offerings", iconPath: svgPaths.p11fd8f00, viewBox: "0 0 18.0098 18.0195" },
  { id: "my-deals", label: "My Deals", iconPath: svgPaths.p3e52e800, viewBox: "0 0 17.5316 16.04" },
  { id: "post-sale", label: "Post Sale", iconPath: svgPaths.p33582200, viewBox: "0 0 17.9795 18" },
  { id: "sam-documents", label: "SAM Documents", iconPath: svgPaths.p2a14a200, viewBox: "0 0 17.4905 16.9902" },
  { id: "notifications", label: "Notifications", iconPath: svgPaths.p2797f980, viewBox: "0 0 17.5 19.9111" },
  { id: "reports", label: "Reports", iconPath: svgPaths.p14dc2e00, viewBox: "0 0 17.4999 17.5098" },
  { id: "settings", label: "Settings", iconPath: svgPaths.p39d8a800, viewBox: "0 0 16.2205 17.9865" },
];

function CategoryIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
      <g clipPath="url(#clip_cat_sb)">
        <path d={svgPaths.p9035b00} fill={color} />
        <path d={svgPaths.p9270c80} fill={color} />
        <path d={svgPaths.p2cd77300} fill={color} />
        <path d={svgPaths.p34a600} fill={color} />
      </g>
      <defs>
        <clipPath id="clip_cat_sb">
          <rect fill="white" height="18" width="18" />
        </clipPath>
      </defs>
    </svg>
  );
}

function DS360Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100.083 61.3986" fill="none" className={className}>
      <path d={svgPaths.p32a58670} fill="white" />
      <path d={svgPaths.p1e17cd00} fill="white" />
      <path d={svgPaths.p32fd6300} fill="white" />
      <path d={svgPaths.p38a8b900} fill="var(--ds-teal)" />
      <path d={svgPaths.p3a60c600} fill="white" />
      <path d={svgPaths.p108b6fc0} fill="white" />
      <path d={svgPaths.pdbc4380} fill="white" />
      <path d={svgPaths.p2003d440} fill="white" />
      <path d={svgPaths.p16edf800} fill="white" />
      <path d={svgPaths.p755140} fill="var(--ds-teal)" />
      <path d={svgPaths.p9f3d00} fill="white" />
      <path d={svgPaths.p296e6600} fill="white" />
      <path d={svgPaths.p2185d800} fill="white" />
      <path d={svgPaths.p293b1240} fill="white" />
      <path d={svgPaths.p1f745880} fill="var(--ds-teal)" />
      <path d={svgPaths.p311b9780} fill="var(--ds-teal)" />
    </svg>
  );
}

function CollapseChevron({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
    >
      <path
        d="M15 19L8 12L15 5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SidebarProps {
  activeItem?: string;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onToggleCollapse?: () => void;
  onMobileClose?: () => void;
  onNavChange?: (itemId: string) => void;
  onSignOut?: () => void;
  onUserProfile?: () => void;
}

export function Sidebar({
  activeItem = "document-templates",
  collapsed = false,
  mobileOpen = false,
  onToggleCollapse,
  onMobileClose,
  onNavChange,
  onSignOut,
  onUserProfile,
}: SidebarProps) {
  const [active, setActive] = useState(activeItem);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchCurrentX = useRef<number>(0);
  const isDragging = useRef(false);

  // Sync active state when parent changes activeItem
  useEffect(() => {
    setActive(activeItem);
  }, [activeItem]);

  // Handle open/close with animation states
  useEffect(() => {
    if (mobileOpen) {
      setIsVisible(true);
      // Small delay to ensure the DOM is ready before starting animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      setIsAnimating(false);
      // Wait for close animation to finish before hiding
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) onMobileClose?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mobileOpen, onMobileClose]);

  // Swipe-to-close touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchCurrentX.current = e.touches[0].clientX;
    const deltaX = touchStartX.current - touchCurrentX.current;
    // Only start dragging if moving left (to close)
    if (deltaX > 10) {
      isDragging.current = true;
      if (drawerRef.current) {
        const translateX = Math.max(-deltaX, -260);
        drawerRef.current.style.transform = `translateX(${translateX}px)`;
        drawerRef.current.style.transition = "none";
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - touchCurrentX.current;
    if (drawerRef.current) {
      drawerRef.current.style.transition = "";
      drawerRef.current.style.transform = "";
    }
    // If swiped more than 80px to the left, close the drawer
    if (isDragging.current && deltaX > 80) {
      onMobileClose?.();
    }
    touchStartX.current = null;
    isDragging.current = false;
  }, [onMobileClose]);

  const showLabels = !collapsed || mobileOpen;
  const sidebarWidth = mobileOpen ? "w-[260px]" : collapsed ? "w-[60px]" : "w-[210px]";

  const sidebarContent = (
    <div className={`bg-ds-purple-mid flex flex-col h-full shrink-0 overflow-x-hidden transition-all duration-300 ${sidebarWidth}`}>
      {/* Logo & User */}
      <div className="flex flex-col items-center pt-5 pb-2 px-2 shrink-0">
        <div className={`flex justify-center w-full ${!showLabels ? "px-1" : "px-4"}`}>
          <DS360Logo className={`${!showLabels ? "w-[36px]" : "w-[100px]"} h-auto transition-all duration-300`} />
        </div>
        {showLabels && (
          <button
            onClick={() => { onMobileClose?.(); onUserProfile?.(); }}
            className="flex items-center gap-2 py-1 mt-2 cursor-pointer rounded-md px-2 hover:bg-white/10 active:bg-white/20 transition-colors"
            title="View my profile"
          >
            <img
              src={imgKennethNgo}
              alt="Kenneth Ngo"
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
            <span className="font-['Poppins',sans-serif] text-[14px] text-white whitespace-nowrap" style={{ fontWeight: 500 }}>
              Kenneth Ngo
            </span>
          </button>
        )}
        {!showLabels && (
          <button
            onClick={() => onUserProfile?.()}
            className="mt-2 cursor-pointer rounded-full hover:ring-2 hover:ring-white/40 transition-all"
            title="View my profile"
          >
            <img
              src={imgKennethNgo}
              alt="Kenneth Ngo"
              className="w-7 h-7 rounded-full object-cover"
            />
          </button>
        )}
      </div>

      {/* Collapse Toggle (hidden on mobile drawer) */}
      <div className="hidden md:flex justify-end px-2 py-1 shrink-0">
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center h-[30px] rounded-md cursor-pointer hover:bg-white/10 transition-colors ${
            showLabels ? "justify-between px-3" : "justify-center"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {showLabels && (
            <span className="font-['Poppins',sans-serif] text-[11px] text-white/70 tracking-wide uppercase" style={{ fontWeight: 500 }}>
              Collapse
            </span>
          )}
          <CollapseChevron collapsed={collapsed} />
        </button>
      </div>

      {/* Mobile close button */}
      {mobileOpen && (
        <div className="md:hidden flex justify-end px-3 pb-1 shrink-0">
          <button
            onClick={onMobileClose}
            className="flex items-center justify-center w-10 h-10 rounded-md cursor-pointer hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 overscroll-contain">
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  onMobileClose?.();
                  onNavChange?.(item.id);
                }}
                className={`flex items-center gap-2.5 min-h-[44px] md:h-9 rounded-l-md cursor-pointer transition-colors ${
                  !showLabels ? "px-4 justify-center" : "px-5"
                } ${
                  isActive ? "bg-white" : "hover:bg-white/10 active:bg-white/20"
                }`}
                title={!showLabels ? item.label : undefined}
              >
                {"iconType" in item && item.iconType === "category" ? (
                  <CategoryIcon color={isActive ? "black" : "white"} />
                ) : (
                  <svg
                    viewBox={(item as any).viewBox}
                    fill="none"
                    className="w-[17px] h-[17px] shrink-0"
                  >
                    <path d={(item as any).iconPath} fill={isActive ? "black" : "white"} />
                  </svg>
                )}
                {showLabels && (
                  <span
                    className={`font-['Poppins',sans-serif] text-[12px] tracking-[-0.12px] whitespace-nowrap overflow-hidden text-ellipsis min-w-0 ${ 
                      isActive ? "text-black" : "text-white"
                    }`}
                    style={{ fontWeight: 500 }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Divider & Sign Out */}
      <div className="px-3 pb-3 shrink-0">
        <div className="border-t border-white/30 mb-2" />
        <button
          className={`flex items-center gap-2 min-h-[44px] md:h-9 w-full bg-ds-purple-dark rounded-md cursor-pointer hover:bg-ds-purple-hover active:bg-ds-purple transition-colors ${
            !showLabels ? "px-4 justify-center" : "px-5"
          }`}
          onClick={onSignOut}
        >
          <svg viewBox="0 0 17.1999 17.2" fill="none" className="w-[17px] h-[17px] shrink-0">
            <path d={svgPaths.p5d15c80} fill="white" />
          </svg>
          {showLabels && (
            <span className="font-['Poppins',sans-serif] text-[12px] text-white tracking-[-0.12px] whitespace-nowrap" style={{ fontWeight: 500 }}>
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="contents">
      {/* Desktop sidebar - always visible */}
      <div className="hidden md:flex h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar - overlay drawer with smooth transitions */}
      {isVisible && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              isAnimating ? "opacity-100" : "opacity-0"
            }`}
            onClick={onMobileClose}
            aria-label="Close sidebar"
          />
          {/* Drawer */}
          <div
            ref={drawerRef}
            className={`relative z-10 h-full transition-transform duration-300 ease-out ${
              isAnimating ? "translate-x-0" : "-translate-x-full"
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </div>
  );
}

/** Mobile header bar with hamburger */
export function MobileHeader({ onMenuToggle, onUserProfile }: { onMenuToggle: () => void; onUserProfile?: () => void }) {
  return (
    <div className="md:hidden flex items-center gap-3 bg-ds-purple-mid px-4 py-2 shrink-0 safe-area-top">
      <button
        onClick={onMenuToggle}
        className="flex items-center justify-center w-10 h-10 rounded-md cursor-pointer hover:bg-white/10 active:bg-white/20 transition-colors"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <DS360Logo className="w-[70px] h-auto" />
      <div className="flex-1" />
      <button
        onClick={() => onUserProfile?.()}
        className="flex items-center gap-2 cursor-pointer rounded-full hover:ring-2 hover:ring-white/40 transition-all"
        title="View my profile"
      >
        <img
          src={imgKennethNgo}
          alt="Kenneth Ngo"
          className="w-8 h-8 rounded-full object-cover"
        />
      </button>
    </div>
  );
}