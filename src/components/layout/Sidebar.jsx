import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiBriefcase,
  FiUsers,
  FiUserCheck,
  FiClipboard,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { Cpu } from "lucide-react";

const navigation = [
  {
    title: "MAIN",
    items: [{ name: "Dashboard", path: "/", icon: FiGrid }],
  },
  {
    title: "OPERATIONS",
    items: [
      { name: "Requirements", path: "/requirements", icon: FiClipboard },
      { name: "Trainers", path: "/trainers", icon: FiUsers },
      { name: "Vendors", path: "/vendors", icon: FiBriefcase },
      { name: "Assignments", path: "/assignments", icon: FiUserCheck },
    ],
  },
  {
    title: "ACCOUNT",
    items: [{ name: "Settings", path: "/settings", icon: FiSettings }],
  },
];

const Sidebar = ({ open, setOpen }) => {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col text-primary transition-all duration-500 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        bg-gradient-sidebar shadow-theme
        border-r border-theme`}
      >
        <div className="relative flex h-24 items-center justify-between border-b border-theme px-6">
          <div className="absolute -top-10 left-0 h-32 w-32 bg-blue-600/20 blur-3xl" />

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-blue-500/30 blur-xl" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30">
                <Cpu size={20} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary">
                NXTHACK
              </h1>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-blue-300/70">
                Operations Portal
              </p>
            </div>
          </div>

          <button
            className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-card hover:text-primary lg:hidden"
            onClick={() => setOpen(false)}
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {navigation.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300
                        ${
                          isActive
                            ? "bg-card text-primary shadow-lg shadow-blue-500/10 before:absolute before:inset-y-1/2 before:left-0 before:h-8 before:w-0.5 before:-translate-y-1/2 before:rounded-r-full before:bg-gradient-to-b before:from-blue-400 before:to-cyan-400 before:shadow-lg before:shadow-blue-400/50"
                            : "text-secondary hover:bg-card hover:text-primary"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className="transition-transform duration-300 group-hover:scale-110">
                            <Icon size={18} strokeWidth={1.5} />
                          </span>
                          {item.name}
                          {isActive && (
                            <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-600/10 to-transparent blur-xl" />
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

        <div className="border-t border-theme p-4">
          <div className="relative overflow-hidden rounded-2xl bg-card p-4 backdrop-blur-xl backdrop-saturate-150 border border-theme shadow-theme">
            <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-2xl" />

            <div className="relative flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-theme">
                <Cpu size={16} className="text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">
                  Nxthack IT Solutions
                </p>
                <p className="mt-0.5 text-[10px] text-muted">
                  v2.0.1 · All systems nominal
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
