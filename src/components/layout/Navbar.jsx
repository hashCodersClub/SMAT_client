import { useState } from "react";

import {
  FiBell,
  FiMenu,
  FiSearch,
  FiChevronDown,
  FiLogOut,
  FiUser,
  FiSettings,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({
  setSidebarOpen,
  title = "Nxthack",
  subtitle = "",
  searchPlaceholder = "Search...",
  profilePath = "/settings",
  settingsPath = "/settings",
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Initials
  |--------------------------------------------------------------------------
  */

  const getInitials = (name = "") => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  /*
  |--------------------------------------------------------------------------
  | Format Role
  |--------------------------------------------------------------------------
  */

  const formatRole = (role = "") => {
    if (!role) return "User";

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-300 bg-white px-4 shadow-sm md:px-6">
      {/* ================================================================
          LEFT
      ================================================================= */}

      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
          aria-label="Open navigation"
        >
          <FiMenu size={21} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight text-slate-950">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 hidden text-xs font-medium text-slate-600 sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ================================================================
          RIGHT
      ================================================================= */}

      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}

        <div className="relative hidden lg:block">
          <FiSearch
            size={17}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              searchFocused ? "text-blue-600" : "text-slate-500"
            }`}
          />

          <input
            type="text"
            placeholder={searchPlaceholder}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-72 rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-500 hover:border-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Mobile Search */}

        <button
          type="button"
          className="rounded-lg p-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
          aria-label="Search"
        >
          <FiSearch size={19} />
        </button>

        {/* Notifications */}

        <button
          type="button"
          className="relative rounded-lg border border-transparent p-2.5 text-slate-700 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950"
          aria-label="Notifications"
        >
          <FiBell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
        </button>

        <div className="hidden h-9 w-px bg-slate-300 sm:block" />

        {/* ================================================================
            PROFILE
        ================================================================= */}

        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((current) => !current)}
            className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition ${
              profileOpen ? "bg-slate-100" : "hover:bg-slate-100"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-sm">
              {getInitials(user?.name)}
            </div>

            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-36 truncate text-sm font-bold text-slate-950">
                {user?.name || "User"}
              </p>

              <p className="mt-0.5 max-w-36 truncate text-xs font-medium text-slate-600">
                {formatRole(user?.role)}
              </p>
            </div>

            <FiChevronDown
              size={16}
              className={`hidden text-slate-600 transition-transform duration-200 sm:block ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* ================================================================
              DROPDOWN
          ================================================================= */}

          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileOpen(false)}
              />

              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                {/* User */}

                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                      {getInitials(user?.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950">
                        {user?.name || "User"}
                      </p>

                      <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu */}

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(profilePath);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <FiUser size={17} className="text-slate-600" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(settingsPath);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <FiSettings size={17} className="text-slate-600" />
                    Settings
                  </button>
                </div>

                {/* Logout */}

                <div className="border-t border-slate-200 p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                  >
                    <FiLogOut size={17} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
