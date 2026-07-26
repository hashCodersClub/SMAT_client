import { useState } from "react";
import {
  FiBell,
  FiMenu,
  FiSearch,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiMonitor,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

const Navbar = ({ setSidebarOpen }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className={`sticky top-0 z-30 flex h-20 items-center justify-between px-4 md:px-6 transition-all duration-300
      bg-primary/80 backdrop-blur-xl backdrop-saturate-150
      border-b border-theme shadow-theme`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-secondary transition-colors hover:bg-card hover:text-primary lg:hidden"
        >
          <FiMenu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-primary">
            Trainer Operations
          </h2>
          <p className="hidden text-xs text-secondary sm:block">
            Manage requirements, trainers and assignments
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle buttons */}
        <div className="flex items-center gap-1 border-r border-theme pr-3">
          <button
            onClick={() => toggleTheme("dark")}
            className={`p-2 rounded-lg transition ${
              theme === "dark"
                ? "bg-card text-primary"
                : "text-secondary hover:text-primary"
            }`}
            title="Dark theme"
          >
            <FiMoon size={18} />
          </button>
          <button
            onClick={() => toggleTheme("light")}
            className={`p-2 rounded-lg transition ${
              theme === "light"
                ? "bg-card text-primary"
                : "text-secondary hover:text-primary"
            }`}
            title="Light theme"
          >
            <FiSun size={18} />
          </button>
          <button
            onClick={() => toggleTheme("blue")}
            className={`p-2 rounded-lg transition ${
              theme === "blue"
                ? "bg-card text-primary"
                : "text-secondary hover:text-primary"
            }`}
            title="Blue theme"
          >
            <FiMonitor size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <FiSearch
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              searchFocused ? "text-blue-400" : "text-muted"
            }`}
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-64 rounded-xl border bg-card py-2.5 pl-9 pr-3 text-sm text-primary placeholder-muted outline-none transition-all duration-300
              ${
                searchFocused
                  ? "border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                  : "border-theme hover:border-white/20"
              }`}
          />
        </div>

        {/* Notifications */}
        <button className="group relative rounded-xl p-2.5 text-secondary transition-all hover:bg-card hover:text-primary">
          <FiBell size={20} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-500 to-orange-400 shadow-lg shadow-red-500/50 animate-pulse" />
          <span className="absolute inset-0 rounded-xl bg-white/0 transition-all group-hover:bg-card" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 border-l border-theme pl-3">
          <div className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105">
            MH
            <div className="absolute inset-0 rounded-full border border-white/20 group-hover:border-white/40" />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-primary">Admin</p>
            <p className="text-xs text-secondary">Administrator</p>
          </div>

          <button className="hidden text-secondary hover:text-primary sm:block">
            <FiChevronDown size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
