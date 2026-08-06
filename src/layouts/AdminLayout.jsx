import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import { getNavigationConfig } from "../config/navigationConfig";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get navigation config for current user role
  const config = getNavigationConfig(user?.role);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        navigation={config.navigation}
        portalName={config.portalName}
      />

      <div
        className={`
          min-h-screen transition-all duration-500 ease-in-out
          lg:pl-72
          ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}
      >
        <Navbar
          setSidebarOpen={setSidebarOpen}
          title={config.navbar.title}
          subtitle={config.navbar.subtitle}
          searchPlaceholder={config.navbar.searchPlaceholder}
          profilePath={config.profilePath}
          settingsPath={config.settingsPath}
        />

        <main className="relative p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
