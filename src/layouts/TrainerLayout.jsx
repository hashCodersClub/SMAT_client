import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

import { useAuth } from "../context/AuthContext";
import { getNavigationConfig } from "../config/navigationConfig";
import opportunitiesApi from "../api/opportunitiesApi";
import outreachApi from "../api/outreachApi";

const TrainerLayout = () => {
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOpportunities, setPendingOpportunities] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Smart Navigation — Live Badge
  |--------------------------------------------------------------------------
  |
  | A traditional nav just lists pages. This pulls the trainer's pending
  | opportunity count into the sidebar itself, so "where do I need to
  | act?" is answered before they even click into a page.
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const loadBadgeCounts = async () => {
      try {
        const statsRes = await opportunitiesApi.getMineStats().catch(() => null);
        let count = statsRes?.stats?.pendingOpportunities ?? 0;

        if (!count) {
          const response = await outreachApi.getMine().catch(() => null);
          const records = response?.outreach || [];
          count = records.filter((record) =>
            ["NOT_CONTACTED", "CONTACTED"].includes(record.outreachStatus),
          ).length;
        }

        if (!cancelled) {
          setPendingOpportunities(count);
        }
      } catch (error) {
        console.error("Failed to load sidebar badge counts:", error.message);
      }
    };

    loadBadgeCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  const config = getNavigationConfig(user?.role);

  const navigation = useMemo(() => {
    if (user?.role !== "TRAINER" || !pendingOpportunities) {
      return config.navigation;
    }

    return config.navigation.map((section) => ({
      ...section,
      items: section.items.map((item) =>
        item.path === "/trainer/opportunities"
          ? { ...item, badge: pendingOpportunities }
          : item,
      ),
    }));
  }, [config.navigation, pendingOpportunities, user?.role]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================================================================
          SIDEBAR
      ================================================================= */}

      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        navigation={navigation}
        portalName={config.portalName}
      />

      {/* ================================================================
          MAIN
      ================================================================= */}

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

export default TrainerLayout;
