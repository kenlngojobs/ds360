import { useState } from "react";
import { Toaster } from "sonner";
import { Sidebar, MobileHeader } from "./components/Sidebar";
import { DocumentTemplateManagement } from "./components/DocumentTemplateManagement";
import { UserManagement } from "./components/UserManagement";
import { OfferingsManagement } from "./components/OfferingsManagement";
import { LoginPage } from "./components/LoginPage";

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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // Render the correct module content
  const renderModule = () => {
    switch (activeModule) {
      case "users":
        return <UserManagement openUserId={openUserId} key={`users-${profileTrigger}`} />;
      case "document-templates":
        return <DocumentTemplateManagement />;
      case "offerings":
        return <OfferingsManagement />;
      default:
        return <PlaceholderModule title={navLabels[activeModule] ?? activeModule} />;
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
          onSignOut={() => setIsLoggedIn(false)}
          onUserProfile={handleUserProfile}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          {renderModule()}
        </div>
      </div>
    </div>
  );
}