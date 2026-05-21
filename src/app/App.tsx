import { useState, lazy, Suspense, Component, type ReactNode, type ErrorInfo } from "react";
import { Toaster } from "sonner";
import { Sidebar, MobileHeader } from "./components/Sidebar";

// ── Lazy-loaded modules (named export → default via .then) ─────────────
const DocumentTemplateManagement = lazy(() =>
  import("./components/DocumentTemplateManagement").then((m) => ({ default: m.DocumentTemplateManagement }))
);
const UserManagement = lazy(() =>
  import("./components/UserManagement").then((m) => ({ default: m.UserManagement }))
);
const OfferingsManagement = lazy(() =>
  import("./components/OfferingsManagement").then((m) => ({ default: m.OfferingsManagement }))
);
const LoginPage = lazy(() =>
  import("./components/LoginPage").then((m) => ({ default: m.LoginPage }))
);

// ── Error Boundary ─────────────────────────────────────────────────────
interface EBProps { children: ReactNode; fallback?: ReactNode; }
interface EBState { hasError: boolean; error: Error | null; }

const moduleLabels: Record<string, string> = {
  users: "User Management",
  "document-templates": "Document Template Management",
  offerings: "Offerings Management",
};

class ErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-4 p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="#dc2626"
              />
            </svg>
          </div>
          <h2 className="font-['Montserrat',sans-serif] text-[22px] text-[#352b5d] text-center" style={{ fontWeight: 700 }}>
            Something went wrong
          </h2>
          <p className="font-['Poppins',sans-serif] text-[14px] text-ds-gray text-center max-w-[500px]" style={{ fontWeight: 400 }}>
            An unexpected error occurred while loading this module. Please try refreshing the page.
          </p>
          {this.state.error && (
            <pre className="text-xs text-red-600 bg-red-50 p-3 rounded-lg max-w-[600px] overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-ds-purple text-white px-6 py-2 rounded-[50px] font-['Poppins',sans-serif] text-[14px] cursor-pointer hover:bg-ds-purple-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Placeholder module for unbuilt sections ─────────────────────────
function PlaceholderModule({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4 p-8">
      <div className="w-16 h-16 rounded-2xl bg-ds-purple-light flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
            fill="#46367F"
          />
        </svg>
      </div>
      <h2 className="font-['Montserrat',sans-serif] text-[22px] text-[#352b5d] text-center" style={{ fontWeight: 700 }}>
        {title}
      </h2>
      <p className="font-['Poppins',sans-serif] text-[14px] text-ds-gray text-center max-w-[400px]" style={{ fontWeight: 400 }}>
        This module is coming soon. Navigate to <strong>Users</strong> or <strong>Document Templates</strong> to see fully built modules.
      </p>
    </div>
  );
}

// ── Nav ID → label map ──────────────────────────────────────────────
const navLabels: Record<string, string> = {
  home: "Home",
  users: "Users",
  partners: "Partners",
  "document-templates": "Document Templates",
  "account-treatment": "Account Treatment",
  tags: "Tags",
  category: "Category",
  groups: "Groups",
  messages: "Messages",
  offerings: "Offerings",
  "my-deals": "My Deals",
  "post-sale": "Post Sale",
  "sam-documents": "SAM Documents",
  notifications: "Notifications",
  reports: "Reports",
  settings: "Settings",
};

// ── Loading fallback for lazy modules ────────────────────────────────
function ModuleLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-ds-purple border-t-transparent rounded-full animate-spin" />
        <span className="font-['Poppins',sans-serif] text-[14px] text-ds-gray">Loading module...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("ds360_session") === "true";
  });
  const [activeModule, setActiveModule] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openUserId, setOpenUserId] = useState<string | undefined>(undefined);
  const [profileTrigger, setProfileTrigger] = useState(0);

  // Handle sidebar nav changes — clear openUserId when navigating normally
  const handleNavChange = (id: string) => {
    setActiveModule(id);
    setOpenUserId(undefined);
  };

  // Handle user avatar click — navigate to Users module with Kenneth Ngo's profile open
  const handleUserProfile = () => {
    setOpenUserId("17"); // Kenneth Ngo's user ID
    setProfileTrigger((c) => c + 1);
    setActiveModule("users");
  };

  const handleLogin = () => {
    localStorage.setItem("ds360_session", "true");
    setIsLoggedIn(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem("ds360_session");
    setIsLoggedIn(false);
  };

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return (
      <Suspense fallback={<ModuleLoadingFallback />}>
        <LoginPage onLogin={handleLogin} />
      </Suspense>
    );
  }

  // Render the correct module content
  const renderModule = () => {
    const activeLabel = moduleLabels[activeModule] ?? navLabels[activeModule] ?? activeModule;
    switch (activeModule) {
      case "users":
        return <UserManagement openUserId={openUserId} key={`users-${profileTrigger}`} />;
      case "document-templates":
        return <DocumentTemplateManagement />;
      case "offerings":
        return <OfferingsManagement />;
      default:
        return <PlaceholderModule title={activeLabel} />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <Toaster position="top-right" richColors closeButton />
      {/* Mobile top bar */}
      <MobileHeader onMenuToggle={() => setMobileOpen(true)} onUserProfile={handleUserProfile} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeItem={activeModule}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileClose={() => setMobileOpen(false)}
          onNavChange={handleNavChange}
          onSignOut={handleSignOut}
          onUserProfile={handleUserProfile}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <ErrorBoundary>
            <Suspense fallback={<ModuleLoadingFallback />}>
              {renderModule()}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}