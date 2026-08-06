import { NavLink } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { Cpu } from "lucide-react";

const Sidebar = ({
  open,
  setOpen,
  navigation = [],
  portalName = "Operations Portal",
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-72 flex-col
          border-r border-slate-800
          bg-[#0f172a] text-white
          shadow-xl shadow-slate-950/10
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* =========================================================
            BRAND
        ========================================================== */}

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600">
              <Cpu size={20} strokeWidth={2} className="text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                NXTHACK
              </h1>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {portalName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* =========================================================
            NAVIGATION
        ========================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((section) => (
            <div key={section.title} className="mb-7">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {section.title}
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
                        item.path === "/vendor" ||
                        item.path === "/trainer"
                      }
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `
                          group flex items-center gap-3
                          rounded-lg px-3 py-2.5
                          text-sm font-semibold
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }
                        `
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            strokeWidth={isActive ? 2.2 : 1.8}
                            className={
                              isActive
                                ? "text-white"
                                : "text-slate-400 transition-colors group-hover:text-white"
                            }
                          />

                          <span className="flex-1">{item.name}</span>

                          {item.badge && (
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
        </nav>

        {/* =========================================================
            COMPANY / STATUS
        ========================================================== */}

        <div className="shrink-0 border-t border-slate-800 p-4">
          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700">
                <Cpu size={16} className="text-blue-400" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  Nxthack IT Solutions
                </p>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />

                  <p className="truncate text-[10px] font-medium text-slate-300">
                    System operational
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] font-medium text-slate-500">
            Version 2.0.1
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
