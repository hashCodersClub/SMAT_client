import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = ({
  setSidebarOpen,
  title = "Trainexus",
  subtitle = "",
  searchPlaceholder = "Search...",
  profilePath = "/settings",
  settingsPath = "/settings",
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [imageError, setImageError] = useState(false);

  // Live time update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Resolve User Avatar URL & Initials
  |--------------------------------------------------------------------------
  */
  const avatarUrl =
    user?.avatar ||
    user?.profilePhotoUrl ||
    user?.trainer?.profilePhotoUrl ||
    user?.trainerId?.profilePhotoUrl ||
    user?.vendor?.logoUrl ||
    user?.vendorId?.logoUrl ||
    "";

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

  const formatRole = (role = "") => {
    if (!role) return "User";
    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleLogout = async () => {
    try {
      setProfileOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex h-20 items-center justify-between px-4 md:px-6">
        {/* ================================================================
            LEFT
        ================================================================= */}
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* ================================================================
            RIGHT
        ================================================================= */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search Bar */}
          <div
            className={`
              relative flex items-center transition-all duration-300
              ${searchFocused ? "w-64 md:w-80" : "w-40 md:w-56"}
            `}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search
                className={`h-4 w-4 transition-colors duration-200 ${
                  searchFocused
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }`}
              />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-100/70 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-indigo-400"
            />
            <kbd className="absolute right-3 hidden items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-xs dark:border-slate-800 dark:bg-slate-800 md:flex">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </div>

          {/* Real-time Clock */}
          <div className="hidden items-center gap-1.5 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 md:flex">
            <Clock className="h-3.5 w-3.5" />
            <span>{currentTime}</span>
          </div>

          {/* Notifications */}
          <NotificationBell />

          <div className="hidden h-8 w-px bg-slate-200 dark:bg-white/10 sm:block" />

          {/* ================================================================
              LOGGED-IN USER AVATAR & MENU
          ================================================================= */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className={`group flex items-center gap-2.5 rounded-2xl p-1.5 pr-3 transition duration-200 ${
                profileOpen
                  ? "bg-slate-100 dark:bg-white/10"
                  : "hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {/* Avatar Container with Online Indicator */}
              <div className="relative shrink-0">
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || "User avatar"}
                    onError={() => setImageError(true)}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20 transition-all duration-300 group-hover:ring-indigo-500/50"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20 ring-2 ring-white dark:ring-slate-900">
                    {getInitials(user?.name)}
                  </div>
                )}
                {/* Online status dot */}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </div>

              {/* User Label (Desktop) */}
              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-[130px] truncate text-xs font-bold text-slate-900 dark:text-white">
                  {user?.name || "User"}
                </p>
                <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {formatRole(user?.role)}
                </span>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* ================================================================
                PROFILE DROPDOWN MENU
            ================================================================= */}
            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setProfileOpen(false)}
                />

                <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-white/20 bg-white/95 p-2 backdrop-blur-2xl shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-900/95">
                  {/* User Profile Header */}
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50/80 p-3 dark:bg-white/5">
                    {avatarUrl && !imageError ? (
                      <img
                        src={avatarUrl}
                        alt={user?.name}
                        className="h-11 w-11 rounded-xl object-cover ring-2 ring-indigo-500/30"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-md">
                        {getInitials(user?.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {user?.name || "User"}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user?.email || ""}
                      </p>
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        <CheckCircle size={10} /> Active (
                        {formatRole(user?.role)})
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(profilePath);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <User size={16} className="text-slate-400" />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(settingsPath);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      <Settings size={16} className="text-slate-400" />
                      Account Settings
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="mt-2 border-t border-slate-100 pt-2 dark:border-white/10">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
