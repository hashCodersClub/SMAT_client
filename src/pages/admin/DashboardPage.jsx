import {
  FiClipboard,
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiArrowUpRight,
  FiClock,
  FiTrendingUp,
  FiMoreHorizontal,
} from "react-icons/fi";

const stats = [
  {
    title: "Open Requirements",
    value: "12",
    description: "4 require attention",
    icon: FiClipboard,
    trend: "+2 from last week",
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    title: "Active Trainers",
    value: "286",
    description: "Across 42 skills",
    icon: FiUsers,
    trend: "+12 this month",
    color: "from-violet-500 to-purple-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
  },
  {
    title: "Active Assignments",
    value: "18",
    description: "6 completing this week",
    icon: FiUserCheck,
    trend: "+3 pending",
    color: "from-emerald-500 to-teal-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    title: "Active Vendors",
    value: "8",
    description: "3 requirements this week",
    icon: FiBriefcase,
    trend: "2 new this month",
    color: "from-amber-500 to-orange-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
];

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      {/* ============================================================
          PAGE HEADER (animated entrance)
      ============================================================ */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overview of your trainer sourcing operations.
          </p>
        </div>

        <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 hover:shadow-xl active:scale-95">
          <FiClock className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          <span>Refresh Data</span>
          <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        </button>
      </div>

      {/* ============================================================
          STATS GRID (with staggered entrance)
      ============================================================ */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-500 hover:scale-[1.02] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Subtle glow */}
              <div
                className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-20`}
              />

              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>

                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 dark:bg-emerald-500/20">
                  <FiArrowUpRight className="h-3 w-3" />
                  {stat.trend}
                </span>
              </div>

              <p className="relative mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.title}
              </p>

              <h2 className="relative mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </h2>

              <p className="relative mt-2 text-xs text-slate-400 dark:text-slate-500">
                {stat.description}
              </p>

              {/* Decorative progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl bg-slate-100 dark:bg-slate-700">
                <div
                  className={`h-full w-0 bg-gradient-to-r ${stat.color} transition-all duration-1000 group-hover:w-full`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          BOTTOM SECTION: Recent Requirements + Pipeline
      ============================================================ */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent Requirements - spans 2 columns */}
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5">
            <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-200/20 p-6 dark:border-white/5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Requirements
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Latest training requirements received
                </p>
              </div>

              <button className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-1.5 text-sm font-medium text-blue-500 transition-all duration-300 hover:bg-blue-500/20 hover:scale-105 active:scale-95 dark:bg-blue-500/20">
                View all
                <FiArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-200/20 dark:divide-white/5">
              <Requirement
                title="Python + Data Analytics Trainer"
                vendor="ABC Training Solutions"
                location="Noida"
                status="Open"
              />
              <Requirement
                title="Power BI Corporate Trainer"
                vendor="XYZ Technologies"
                location="Gurgaon"
                status="Sourcing"
              />
              <Requirement
                title="Java Full Stack Trainer"
                vendor="Tech Learning Pvt Ltd"
                location="Delhi"
                status="Shortlisted"
              />
            </div>
          </div>
        </div>

        {/* Pipeline - 1 column */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5">
            <div className="border-b border-slate-200/20 p-6 dark:border-white/5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Requirement Pipeline
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Current sourcing activity
              </p>
            </div>

            <div className="p-6 space-y-4">
              <Pipeline
                name="Open"
                value={12}
                color="from-blue-500 to-cyan-400"
              />
              <Pipeline
                name="Sourcing"
                value={8}
                color="from-violet-500 to-purple-400"
              />
              <Pipeline
                name="Profiles Sent"
                value={6}
                color="from-amber-500 to-orange-400"
              />
              <Pipeline
                name="Shortlisted"
                value={4}
                color="from-emerald-500 to-teal-400"
              />
              <Pipeline
                name="Confirmed"
                value={3}
                color="from-rose-500 to-pink-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENT: Requirement Item
// ============================================================

const Requirement = ({ title, vendor, location, status }) => {
  const statusColors = {
    Open: "from-blue-500 to-cyan-400",
    Sourcing: "from-amber-500 to-orange-400",
    Shortlisted: "from-emerald-500 to-teal-400",
    Confirmed: "from-rose-500 to-pink-400",
  };

  const statusColor = statusColors[status] || "from-gray-500 to-gray-400";

  return (
    <div className="group flex flex-col justify-between gap-3 p-5 transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-white/5 sm:flex-row sm:items-center">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span>{vendor}</span>
          <span className="hidden sm:inline">•</span>
          <span>{location}</span>
        </div>
      </div>

      <span
        className={`inline-flex w-fit items-center rounded-full bg-gradient-to-r ${statusColor} px-3.5 py-1.5 text-xs font-medium text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105`}
      >
        {status}
      </span>
    </div>
  );
};

// ============================================================
// COMPONENT: Pipeline Item
// ============================================================

const Pipeline = ({ name, value, color }) => {
  const percentage = Math.min((value / 12) * 100, 100);

  return (
    <div className="group flex items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.02]">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {name}
      </span>

      <div className="flex flex-1 items-center gap-3">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out group-hover:scale-x-100`}
            style={{
              width: `${percentage}%`,
              transformOrigin: "left",
            }}
          />
          {/* Animated shimmer */}
          <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
            style={{ width: "50%" }}
          />
        </div>

        <span
          className={`min-w-[2rem] rounded-md bg-gradient-to-r ${color} bg-opacity-20 px-2.5 py-1 text-center text-sm font-semibold text-white shadow-sm shadow-blue-500/10`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default DashboardPage;
