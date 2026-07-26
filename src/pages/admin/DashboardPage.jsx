import {
  FiClipboard,
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiArrowUpRight,
  FiClock,
} from "react-icons/fi";

const stats = [
  {
    title: "Open Requirements",
    value: "12",
    description: "4 require attention",
    icon: FiClipboard,
    trend: "+2 from last week",
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Active Trainers",
    value: "286",
    description: "Across 42 skills",
    icon: FiUsers,
    trend: "+12 this month",
    color: "from-violet-500 to-purple-400",
  },
  {
    title: "Active Assignments",
    value: "18",
    description: "6 completing this week",
    icon: FiUserCheck,
    trend: "+3 pending",
    color: "from-emerald-500 to-teal-400",
  },
  {
    title: "Active Vendors",
    value: "8",
    description: "3 requirements this week",
    icon: FiBriefcase,
    trend: "2 new this month",
    color: "from-amber-500 to-orange-400",
  },
];

const DashboardPage = () => {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Overview of your trainer sourcing operations.
          </p>
        </div>
        <button className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50 sm:mt-0">
          <FiClock size={16} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl shadow-black/20 transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl"
            >
              {/* Background glow */}
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl group-hover:from-blue-500/20 group-hover:to-cyan-500/20" />

              <div className="relative flex items-start justify-between">
                <div
                  className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg shadow-blue-500/20`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <FiArrowUpRight size={14} />
                  {stat.trend}
                </span>
              </div>

              <p className="relative mt-4 text-sm font-medium text-slate-400">
                {stat.title}
              </p>

              <h2 className="relative mt-1 text-3xl font-bold text-white">
                {stat.value}
              </h2>

              <p className="relative mt-2 text-xs text-slate-500">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom section: Recent Requirements + Pipeline */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Recent Requirements - spans 2 columns */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl shadow-black/20 xl:col-span-2">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Requirements
              </h2>
              <p className="text-sm text-slate-400">
                Latest training requirements received
              </p>
            </div>

            <button className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300 sm:mt-0">
              View all
              <FiArrowUpRight size={16} />
            </button>
          </div>

          <div className="space-y-3">
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

        {/* Pipeline */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl shadow-black/20">
          <h2 className="text-lg font-semibold text-white">
            Requirement Pipeline
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Current sourcing activity
          </p>

          <div className="mt-6 space-y-4">
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
  );
};

// Requirement item component
const Requirement = ({ title, vendor, location, status }) => {
  // Status color mapping
  const statusColors = {
    Open: "from-blue-500 to-cyan-400",
    Sourcing: "from-amber-500 to-orange-400",
    Shortlisted: "from-emerald-500 to-teal-400",
    Confirmed: "from-rose-500 to-pink-400",
  };

  const statusColor = statusColors[status] || "from-gray-500 to-gray-400";

  return (
    <div className="group flex flex-col justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10 sm:flex-row sm:items-center">
      <div>
        <p className="font-medium text-white group-hover:text-blue-200">
          {title}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {vendor} • {location}
        </p>
      </div>

      <span
        className={`w-fit rounded-full bg-gradient-to-r ${statusColor} px-3 py-1 text-xs font-medium text-white shadow-lg shadow-blue-500/20`}
      >
        {status}
      </span>
    </div>
  );
};

// Pipeline item component
const Pipeline = ({ name, value, color }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{name}</span>

      <div className="flex items-center gap-2">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color}`}
            style={{ width: `${Math.min((value / 12) * 100, 100)}%` }}
          />
        </div>
        <span
          className={`rounded-md bg-gradient-to-r ${color} bg-opacity-20 px-2.5 py-1 text-sm font-semibold text-white`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default DashboardPage;
