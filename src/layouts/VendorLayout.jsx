import {
  FiClipboard,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiX,
} from "react-icons/fi";

import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../context/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    path: "/vendor/dashboard",
    icon: FiGrid,
  },
  {
    name: "Requirements",
    path: "/vendor/requirements",
    icon: FiClipboard,
  },
  {
    name: "Settings",
    path: "/vendor/settings",
    icon: FiSettings,
  },
];

const VendorLayout = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* ================================================================
          SIDEBAR
      ================================================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
          <div>
            <h1 className="text-lg font-bold">NXTHACK</h1>

            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Vendor Portal
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <FiX />
          </button>
        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <Icon size={18} />

              {name}
            </NavLink>
          ))}
        </nav>

        {/* User */}

        <div className="border-t border-slate-800 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name || "Vendor"}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {user?.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
          >
            <FiLogOut />
            Sign out
          </button>
        </div>
      </aside>

      {/* ================================================================
          CONTENT
      ================================================================= */}

      <div className="lg:pl-64">
        {/* Header */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <FiMenu size={21} />
            </button>

            <div>
              <p className="font-semibold text-slate-900">Vendor Portal</p>

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your training requirements
              </p>
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || "Vendor"}
            </p>

            <p className="text-xs text-slate-500">Vendor</p>
          </div>
        </header>

        {/* Page */}

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
