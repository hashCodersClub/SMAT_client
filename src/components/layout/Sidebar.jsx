import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import {
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import trainexusMark from "../../assets/logos/trainexus.dark.png";

const StatusDot = ({ status = "online" }) => {
  const colors = {
    online: "bg-emerald-500",
    away: "bg-amber-500",
    busy: "bg-rose-500",
    offline: "bg-slate-400",
  };
  return (
    <span
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${colors[status]} ring-2 ring-slate-900`}
    />
  );
};

export const resolveAvatarUrl = (user) => {
  if (!user) return "";
  let rawUrl =
    user.avatar ||
    user.profilePhotoUrl ||
    user.photoUrl ||
    user.photo ||
    user.picture ||
    user.profilePicture ||
    user.trainer?.profilePhotoUrl ||
    user.trainer?.avatar ||
    user.trainerId?.profilePhotoUrl ||
    user.trainerId?.avatar ||
    user.vendor?.logoUrl ||
    user.vendor?.logo ||
    user.vendorId?.logoUrl ||
    user.vendorId?.logo ||
    user.logoUrl ||
    user.logo ||
    "";

  if (!rawUrl || typeof rawUrl !== "string") return "";
  rawUrl = rawUrl.trim();
  if (!rawUrl) return "";

  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("data:") ||
    rawUrl.startsWith("blob:")
  ) {
    return rawUrl;
  }

  const apiBase = import.meta.env.VITE_API_URL || "https://api.trainexus.in/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}/${rawUrl.replace(/^\//, "")}`;
};

const Sidebar = ({
  open,
  setOpen,
  navigation = [],
  portalName = "Operations Portal",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Close on outside click on mobile
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

  const avatarUrl = resolveAvatarUrl(user);

  // Reset image error state when avatarUrl changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

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

  const handleLogout = async () => {
    try {
      if (window.innerWidth < 1024) setOpen(false);
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col text-white
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}
        style={{ color: "#ffffff" }}
      >
        {/* Dark Glass Background */}
        <div className="absolute inset-0 bg-slate-950 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-2xl" />
        <div className="absolute inset-0 border-r border-white/10 shadow-2xl shadow-indigo-500/10" />

        {/* Sidebar Content */}
        <div className="relative flex h-full flex-col text-white" style={{ color: "#ffffff" }}>
          {/* Brand Header */}
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-4">
            <div
              className={`flex items-center gap-3 transition-all duration-500 ${
                isCollapsed ? "w-full justify-center" : ""
              }`}
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <img
                  src={trainexusMark}
                  alt="Trainexus"
                  className="relative z-10 h-6 w-6 object-contain"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/50 to-purple-600/50 blur-xl" />
              </div>
              <div
                className={`transition-all duration-500 ${
                  isCollapsed
                    ? "w-0 scale-0 opacity-0"
                    : "w-auto scale-100 opacity-100"
                }`}
              >
                <h1 className="text-lg font-bold tracking-tight text-white" style={{ color: "#ffffff" }}>
                  NXTHACK
                </h1>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-300">
                  {portalName}
                </p>
              </div>
            </div>

            {/* Desktop Collapse Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-all duration-300 lg:flex"
              style={{ color: "#ffffff" }}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-500 ${
                  isCollapsed ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-all duration-300 lg:hidden"
              style={{ color: "#ffffff" }}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="space-y-6">
              {navigation.map((section) => (
                <div key={section.title}>
                  <p
                    className={`mb-2 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-500 ${
                      isCollapsed ? "text-center" : "px-3"
                    }`}
                    style={{ color: "#ffffff" }}
                  >
                    {isCollapsed ? "•" : section.title}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.name}
                          to={item.path}
                          end={
                            item.path === "/" ||
                            item.path === "/admin" ||
                            item.path === "/vendor" ||
                            item.path === "/trainer"
                          }
                          onClick={() => {
                            if (window.innerWidth < 1024) setOpen(false);
                          }}
                          className={({ isActive }) => `
                            group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                            text-sm font-semibold transition-all duration-300
                            ${
                              isActive
                                ? "bg-white/20 text-white font-bold shadow-md"
                                : "text-white hover:bg-white/15 hover:text-white"
                            }
                            ${isCollapsed ? "justify-center" : ""}
                          `}
                          style={{ color: "#ffffff" }}
                        >
                          {({ isActive }) => (
                            <>
                              {/* Active Glow Line */}
                              {isActive && (
                                <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-400 shadow-lg shadow-indigo-500/50" />
                              )}

                              <Icon
                                className={`h-5 w-5 shrink-0 transition-all duration-300 ${
                                  isActive ? "text-indigo-300" : "text-white group-hover:text-white"
                                }`}
                                style={{ color: isActive ? "#a5b4fc" : "#ffffff" }}
                              />

                              <span
                                className={`flex-1 truncate text-left text-white transition-all duration-500 ${
                                  isCollapsed
                                    ? "w-0 scale-0 opacity-0"
                                    : "w-auto scale-100 opacity-100 text-white"
                                }`}
                                style={{ color: "#ffffff" }}
                              >
                                {item.name}
                              </span>

                              {item.badge && !isCollapsed && (
                                <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Bottom User & Logout Section */}
          <div className="border-t border-white/10 p-3 space-y-2">
            {/* User Profile Card */}
            <div
              className={`flex items-center gap-3 rounded-xl p-2 transition-all duration-300 hover:bg-white/10 cursor-pointer ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="relative shrink-0">
                {avatarUrl && !imageError ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name}
                    onError={() => setImageError(true)}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-white/20 shadow-md"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm ring-2 ring-white/20">
                    {getInitials(user?.name)}
                  </div>
                )}
                <StatusDot status="online" />
              </div>

              <div
                className={`flex-1 min-w-0 transition-all duration-500 ${
                  isCollapsed
                    ? "w-0 scale-0 opacity-0 hidden"
                    : "w-auto scale-100 opacity-100"
                }`}
              >
                <p className="truncate text-sm font-semibold text-white leading-tight" style={{ color: "#ffffff" }}>
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs text-white/80" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  {user?.email || ""}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className={`p-1.5 text-white hover:text-rose-400 transition-colors ${
                  isCollapsed ? "hidden" : "block"
                }`}
                style={{ color: "#ffffff" }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
