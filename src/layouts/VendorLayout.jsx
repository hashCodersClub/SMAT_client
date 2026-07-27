import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import { useAuth } from "../context/AuthContext";
import { getNavigationConfig } from "../config/navigationConfig";

const VendorLayout = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Vendor Configuration
  |--------------------------------------------------------------------------
  */

  const config = getNavigationConfig(user?.role);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}

      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        navigation={config.navigation}
        portalName={config.portalName}
      />

      {/* Main */}

      <div className="min-h-screen lg:pl-72">
        <Navbar
          setSidebarOpen={setSidebarOpen}
          title={config.navbar.title}
          subtitle={config.navbar.subtitle}
          searchPlaceholder={config.navbar.searchPlaceholder}
          profilePath={config.profilePath}
          settingsPath={config.settingsPath}
        />

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
