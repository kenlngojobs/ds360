import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Sidebar, MobileHeader } from "./components/Sidebar";
import { DocumentTemplateManagement } from "./components/DocumentTemplateManagement";
import { UserManagement } from "./components/UserManagement";
import { OfferingsManagement } from "./components/OfferingsManagement";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ForgotPasswordPage } from "./components/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { apiVerifyEmail } from "./auth/api";
import { FeatureFlagProvider, useFlag } from "./auth/feature-flags";

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

const SESSION_KEY = "ds360_session";
type AuthView = "login" | "register" | "forgot" | "reset" | "verify-pending";

export default function App() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem(SESSION_KEY)
  );
  const [authView, setAuthView] = useState<AuthView>("login");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [activeModule, setActiveModule] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openUserId, setOpenUserId] = useState<string | undefined>(undefined);
  const [profileTrigger, setProfileTrigger] = useState(0);

  // Handle ?verify= and ?reset= URL params from email links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verify = params.get("verify");
    const reset  = params.get("reset");
    if (verify) {
      // Clear URL param
      window.history.replaceState({}, "", window.location.pathname);
      apiVerifyEmail(verify).then(res => {
        setVerifyMsg(res.ok
          ? "Email verified! You can now log in."
          : (res.error ?? "Verification link is invalid or already used.")
        );
        setAuthView("verify-pending");
      });
    } else if (reset) {
      window.history.replaceState({}, "", window.location.pathname);
      setResetToken(reset);
      setAuthView("reset");
    }
  }, []);

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

  const handleLogin = (t: string) => {
    sessionStorage.setItem(SESSION_KEY, t);
    setToken(t);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setToken(null);
    setAuthView("login");
  };

  // Show auth screens if not logged in
  if (!token) {
    if (authView === "register") return <RegisterPage onBack={() => setAuthView("login")} />;
    if (authView === "forgot")   return <ForgotPasswordPage onBack={() => setAuthView("login")} />;
    if (authView === "reset" && resetToken) return <ResetPasswordPage token={resetToken} onDone={() => setAuthView("login")} />;
    if (authView === "verify-pending") return (
      <div className="flex items-center justify-center h-full w-full bg-white p-8">
        <div className="flex flex-col items-center gap-4 text-center max-w-[400px]">
          <div className="w-16 h-16 rounded-full bg-ds-purple-light flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
              <path d="M20 6L9 17l-5-5" stroke="#46367F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="font-['Poppins',sans-serif] text-[15px] text-[#3a3a3a]" style={{ fontWeight: 500 }}>{verifyMsg}</p>
          <button onClick={() => setAuthView("login")}
            className="flex items-center justify-center w-[180px] h-[45px] rounded-[100px] bg-[#46367f] hover:bg-ds-purple-hover text-white font-['Poppins',sans-serif] text-[14px] transition-all cursor-pointer border-none"
            style={{ fontWeight: 500 }}>
            Go to Login
          </button>
        </div>
      </div>
    );
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={() => setAuthView("register")}
        onForgot={() => setAuthView("forgot")}
      />
    );
  }

  return (
    <FeatureFlagProvider token={token}>
      <AuthenticatedApp
        activeModule={activeModule}
        onNavChange={handleNavChange}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileOpen={() => setMobileOpen(true)}
        onMobileClose={() => setMobileOpen(false)}
        onSignOut={handleSignOut}
        onUserProfile={handleUserProfile}
        openUserId={openUserId}
        profileTrigger={profileTrigger}
      />
    </FeatureFlagProvider>
  );
}

// ── Authenticated shell — lives inside FeatureFlagProvider so hooks work ──
function AuthenticatedApp({
  activeModule, onNavChange, sidebarCollapsed, onToggleCollapse,
  mobileOpen, onMobileOpen, onMobileClose, onSignOut, onUserProfile,
  openUserId, profileTrigger,
}: {
  activeModule: string;
  onNavChange: (id: string) => void;
  sidebarCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
  onSignOut: () => void;
  onUserProfile: () => void;
  openUserId: string | undefined;
  profileTrigger: number;
}) {
  const flagUsers = useFlag("module.users");
  const flagDocTemplates = useFlag("module.document-templates");
  const flagOfferings = useFlag("module.offerings");

  const renderModule = () => {
    switch (activeModule) {
      case "users":
        return flagUsers
          ? <UserManagement openUserId={openUserId} key={`users-${profileTrigger}`} />
          : <PlaceholderModule title="Users" />;
      case "document-templates":
        return flagDocTemplates
          ? <DocumentTemplateManagement />
          : <PlaceholderModule title="Document Templates" />;
      case "offerings":
        return flagOfferings
          ? <OfferingsManagement />
          : <PlaceholderModule title="Offerings" />;
      default:
        return <PlaceholderModule title={navLabels[activeModule] ?? activeModule} />;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <Toaster position="top-right" richColors closeButton />
      <MobileHeader onMenuToggle={onMobileOpen} onUserProfile={onUserProfile} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar
          activeItem={activeModule}
          collapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={onToggleCollapse}
          onMobileClose={onMobileClose}
          onNavChange={onNavChange}
          onSignOut={onSignOut}
          onUserProfile={onUserProfile}
        />

        <div className="flex-1 min-w-0 h-full overflow-hidden">
          {renderModule()}
        </div>
      </div>
    </div>
  );
}