import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  UserCircle,
  CreditCard,
  Gift,
  MoreHorizontal,
  Clock,
} from "lucide-react";

// Import your actual navigation config
import { getNavigationConfig } from "../config/navigationConfig";
import { useAuth } from "../context/AuthContext";

// ============================================================
// UTILITY COMPONENTS
// ============================================================

const NotificationBadge = ({ count }) => (
  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/25 ring-2 ring-white dark:ring-slate-900 animate-pulse">
    {count}
  </span>
);

const StatusDot = ({ status = "online" }) => {
  const colors = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    busy: "bg-rose-500",
    offline: "bg-slate-400",
  };
  return (
    <span
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${colors[status]} ring-2 ring-white dark:ring-slate-900`}
    />
  );
};

// ============================================================
// SIDEBAR COMPONENT (accepts user & logout as props)
// ============================================================

const Sidebar = ({ open, setOpen, navigation, portalName, user, logout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Close on outside click (mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  // Handle navigation with animation
  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) setOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-2xl" />

        {/* Border glow */}
        <div className="absolute inset-0 border-r border-white/5 shadow-2xl shadow-indigo-500/5" />

        {/* Content */}
        <div className="relative flex h-full flex-col">
          {/* Brand */}
          <div className="flex h-20 items-center justify-between px-4 border-b border-white/5">
            <div
              className={`flex items-center gap-3 transition-all duration-500 ${
                isCollapsed ? "justify-center w-full" : ""
              }`}
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/50 to-purple-600/50 blur-xl" />
              </div>
              <span
                className={`text-xl font-bold text-white tracking-tight transition-all duration-500 ${
                  isCollapsed
                    ? "w-0 scale-0 opacity-0"
                    : "w-auto scale-100 opacity-100"
                }`}
              >
                {portalName}
                <span className="ml-1 text-indigo-400">.</span>
              </span>
            </div>

            {/* Collapse toggle (desktop) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-500 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Close button (mobile) */}
            <button
              onClick={() => setOpen(false)}
              className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation - now mapping sections */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            <div className="space-y-6">
              {navigation.map((section, idx) => (
                <div key={idx}>
                  <p
                    className={`mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500 transition-all duration-500 ${
                      isCollapsed ? "text-center" : "px-3"
                    }`}
                  >
                    {isCollapsed ? "•" : section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.name}
                        item={item}
                        isCollapsed={isCollapsed}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Bottom section - User & Actions */}
          <div className="border-t border-white/5 p-3 space-y-2">
            {/* Upgrade CTA */}
            <div
              className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-3 transition-all duration-500 ${
                isCollapsed ? "opacity-0 h-0 p-0" : "opacity-100"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 animate-pulse" />
              <div className="relative flex items-center gap-2">
                <Gift className="h-4 w-4 text-indigo-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">
                    Upgrade to Pro
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Unlock all features
                  </p>
                </div>
                <button className="rounded-lg bg-indigo-500/20 px-2 py-1 text-[10px] font-medium text-indigo-400 hover:bg-indigo-500/30 transition-colors">
                  Go
                </button>
              </div>
            </div>

            {/* User profile */}
            <div
              className={`flex items-center gap-3 rounded-xl p-2 transition-all duration-300 hover:bg-white/5 cursor-pointer group ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  alt="User"
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10 transition-all duration-300 group-hover:ring-indigo-400/50"
                />
                <StatusDot status="online" />
              </div>
              <div
                className={`flex-1 transition-all duration-500 ${
                  isCollapsed
                    ? "w-0 scale-0 opacity-0"
                    : "w-auto scale-100 opacity-100"
                }`}
              >
                <p className="text-sm font-medium text-white leading-tight">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400">{user?.email || ""}</p>
              </div>
              <button
                className={`transition-all duration-300 text-slate-500 hover:text-white ${
                  isCollapsed ? "hidden" : ""
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// ============================================================
// NAV ITEM COMPONENT
// ============================================================

const NavItem = ({ item, isCollapsed, onNavigate }) => {
  const Icon = item.icon;
  const isActive = window.location.pathname === item.path;

  return (
    <button
      onClick={() => onNavigate(item.path)}
      className={`
        group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5
        text-sm font-medium text-slate-400
        transition-all duration-300
        hover:bg-white/5 hover:text-white
        ${isActive ? "text-white" : ""}
        ${isCollapsed ? "justify-center" : ""}
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/50" />
      )}

      <Icon
        className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
          isActive ? "text-indigo-400" : "group-hover:text-white"
        }`}
        strokeWidth={isActive ? 2.5 : 1.8}
      />

      <span
        className={`flex-1 text-left transition-all duration-500 ${
          isCollapsed ? "w-0 scale-0 opacity-0" : "w-auto scale-100 opacity-100"
        }`}
      >
        {item.name}
      </span>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white opacity-0 shadow-xl transition-all duration-300 group-hover:opacity-100 pointer-events-none">
          {item.name}
          <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-800" />
        </div>
      )}
    </button>
  );
};

// ============================================================
// NAVBAR COMPONENT (accepts user & logout as props)
// ============================================================

const Navbar = ({
  setSidebarOpen,
  title,
  subtitle,
  searchPlaceholder,
  profilePath,
  settingsPath,
  user,
  logout,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const navigate = useNavigate();

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

  const notifications = [
    { id: 1, title: "New message from John", time: "2 min ago", read: false },
    {
      id: 2,
      title: "Project Alpha completed",
      time: "1 hour ago",
      read: false,
    },
    { id: 3, title: "Meeting at 3 PM", time: "3 hours ago", read: true },
    {
      id: 4,
      title: "System update available",
      time: "5 hours ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-white/70 backdrop-blur-2xl dark:bg-slate-900/70">
      <div className="flex h-20 items-center justify-between px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all duration-300"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <div
            className={`
              relative flex items-center transition-all duration-500
              ${searchFocused ? "w-64 md:w-80" : "w-40 md:w-56"}
            `}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search
                className={`h-4 w-4 transition-colors duration-300 ${
                  searchFocused ? "text-indigo-500" : "text-slate-400"
                }`}
              />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="
                h-10 w-full rounded-xl border-0 bg-slate-100 pl-10 pr-4
                text-sm text-slate-900 placeholder:text-slate-400
                focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-0
                dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500
                transition-all duration-300
              "
            />
            <kbd className="absolute right-3 hidden items-center gap-0.5 rounded-md bg-white/50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-white/5 md:flex">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </div>

          {/* Time */}
          <div className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-mono">
            <Clock className="h-3.5 w-3.5" />
            {currentTime}
          </div>

          {/* Theme toggle */}
          <button className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all duration-300">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-all duration-300 flex"
            >
              <Bell className="h-5 w-5" strokeWidth={1.8} />
              {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
            </button>

            {/* Dropdown */}
            <div
              className={`
                absolute right-0 top-full mt-2 w-80 origin-top-right
                rounded-2xl bg-white/90 backdrop-blur-2xl shadow-2xl shadow-slate-200/50
                dark:bg-slate-900/90 dark:shadow-slate-900/50
                border border-white/20 dark:border-white/5
                transition-all duration-300
                ${
                  showNotifications
                    ? "scale-100 opacity-100 translate-y-0"
                    : "scale-95 opacity-0 translate-y-2 pointer-events-none"
                }
              `}
            >
              <div className="p-4 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <button className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
                    Mark all read
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`
                      flex items-start gap-3 p-4 transition-all duration-200
                      hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer
                      ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-500/5" : ""}
                    `}
                  >
                    <div
                      className={`
                        mt-0.5 h-2 w-2 rounded-full flex-shrink-0
                        ${!n.read ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}
                      `}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 dark:border-white/5">
                <button className="w-full rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="group flex items-center gap-2 rounded-xl p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  alt="User"
                  className="h-9 w-9 rounded-xl object-cover ring-2 ring-transparent transition-all duration-300 group-hover:ring-indigo-400/50"
                />
                <StatusDot status="online" />
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                  showProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            <div
              className={`
                absolute right-0 top-full mt-2 w-56 origin-top-right
                rounded-2xl bg-white/90 backdrop-blur-2xl shadow-2xl shadow-slate-200/50
                dark:bg-slate-900/90 dark:shadow-slate-900/50
                border border-white/20 dark:border-white/5
                transition-all duration-300
                ${
                  showProfile
                    ? "scale-100 opacity-100 translate-y-0"
                    : "scale-95 opacity-0 translate-y-2 pointer-events-none"
                }
              `}
            >
              <div className="p-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.avatar || "/default-avatar.png"}
                    alt="User"
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <DropdownItem
                  icon={UserCircle}
                  label="My Profile"
                  onClick={() => navigate(profilePath)}
                />
                <DropdownItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => navigate(settingsPath)}
                />
                <DropdownItem
                  icon={CreditCard}
                  label="Billing"
                  onClick={() => navigate("/billing")}
                />
                <DropdownItem
                  icon={Gift}
                  label="Refer a Friend"
                  onClick={() => navigate("/refer")}
                />
                <div className="my-1 border-t border-slate-100 dark:border-white/5" />
                <DropdownItem
                  icon={LogOut}
                  label="Logout"
                  onClick={handleLogout}
                  className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const DropdownItem = ({ icon: Icon, label, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`
      flex w-full items-center gap-3 rounded-xl px-3 py-2.5
      text-sm font-medium text-slate-700 dark:text-slate-300
      hover:bg-slate-50 dark:hover:bg-white/5
      transition-all duration-200
      ${className}
    `}
  >
    <Icon className="h-4 w-4" strokeWidth={1.8} />
    {label}
  </button>
);

// ============================================================
// MAIN ADMIN LAYOUT
// ============================================================

const AdminLayout = () => {
  const { user, logout } = useAuth(); // ✅ destructure logout here
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get config based on user role
  const config = getNavigationConfig(user?.role);

  // Page load animation
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        navigation={config.navigation}
        portalName={config.portalName}
        user={user}
        logout={logout}
      />

      <div
        className={`
          min-h-screen transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
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
          user={user}
          logout={logout}
        />

        <main className="relative p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div
              className={`
                transition-all duration-700 delay-100
                ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
            >
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
