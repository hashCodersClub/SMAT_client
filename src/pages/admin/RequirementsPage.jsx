import { useState, useMemo } from "react";
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiClock,
  FiMoreVertical,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiArrowRight,
  FiTrendingUp,
  FiTrendingDown,
  FiBriefcase,
} from "react-icons/fi";

// Mock data
const requirements = [
  {
    id: 1,
    title: "Python + Data Analytics Trainer",
    vendor: "ABC Training Solutions",
    location: "Noida",
    status: "Open",
    priority: "High",
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Power BI Corporate Trainer",
    vendor: "XYZ Technologies",
    location: "Gurgaon",
    status: "Sourcing",
    priority: "Medium",
    posted: "5 days ago",
  },
  {
    id: 3,
    title: "Java Full Stack Trainer",
    vendor: "Tech Learning Pvt Ltd",
    location: "Delhi",
    status: "Shortlisted",
    priority: "Low",
    posted: "1 week ago",
  },
  {
    id: 4,
    title: "AWS Cloud Practitioner Trainer",
    vendor: "CloudGuru Inc.",
    location: "Bangalore",
    status: "Confirmed",
    priority: "High",
    posted: "3 days ago",
  },
  {
    id: 5,
    title: "React Native Mobile Trainer",
    vendor: "AppMasters",
    location: "Hyderabad",
    status: "Open",
    priority: "Medium",
    posted: "6 days ago",
  },
  {
    id: 6,
    title: "Data Science with R Trainer",
    vendor: "AnalyticsHub",
    location: "Pune",
    status: "Sourcing",
    priority: "High",
    posted: "4 days ago",
  },
];

const statusColors = {
  Open: "from-blue-500 to-cyan-400",
  Sourcing: "from-amber-500 to-orange-400",
  Shortlisted: "from-emerald-500 to-teal-400",
  Confirmed: "from-rose-500 to-pink-400",
};

const statusIcons = {
  Open: FiClock,
  Sourcing: FiAlertCircle,
  Shortlisted: FiCheckCircle,
  Confirmed: FiCheckCircle,
};

const priorityStyles = {
  High: "text-rose-400 bg-rose-500/20 border-rose-500/30",
  Medium: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  Low: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
};

// Stats generator
const getStats = (requirements) => {
  const total = requirements.length;
  const open = requirements.filter((r) => r.status === "Open").length;
  const sourcing = requirements.filter((r) => r.status === "Sourcing").length;
  const confirmed = requirements.filter((r) => r.status === "Confirmed").length;

  return [
    {
      label: "Total Requirements",
      value: total,
      trend: "+3 this week",
      trendUp: true,
      color: "from-indigo-500 to-blue-400",
      icon: FiBriefcase,
    },
    {
      label: "Open",
      value: open,
      trend: "+1 new today",
      trendUp: true,
      color: "from-blue-500 to-cyan-400",
      icon: FiClock,
    },
    {
      label: "Sourcing",
      value: sourcing,
      trend: "-2 from yesterday",
      trendUp: false,
      color: "from-amber-500 to-orange-400",
      icon: FiAlertCircle,
    },
    {
      label: "Confirmed",
      value: confirmed,
      trend: "+1 this week",
      trendUp: true,
      color: "from-emerald-500 to-teal-400",
      icon: FiCheckCircle,
    },
  ];
};

const RequirementsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter logic
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesSearch =
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || req.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredRequirements.length / itemsPerPage);
  const paginatedItems = filteredRequirements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = getStats(requirements);

  return (
    <div className="space-y-8">
      {/* ============================================================
          PAGE HEADER
      ============================================================ */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Requirements
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage all training requirements across vendors
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 dark:text-slate-200">
            <FiDownload className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span>Export</span>
          </button>
          <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 hover:shadow-xl active:scale-95">
            <FiPlus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Requirement</span>
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        </div>
      </div>

      {/* ============================================================
          STATS CARDS
      ============================================================ */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-500 hover:scale-[1.02] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div
                className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-20`}
              />

              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    stat.trendUp
                      ? "bg-emerald-500/10 text-emerald-400 dark:bg-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 dark:bg-rose-500/20"
                  }`}
                >
                  {stat.trendUp ? (
                    <FiTrendingUp className="h-3 w-3" />
                  ) : (
                    <FiTrendingDown className="h-3 w-3" />
                  )}
                  {stat.trend}
                </span>
              </div>

              <p className="relative mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <h2 className="relative mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </h2>

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
          SEARCH & FILTER BAR
      ============================================================ */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-4 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by title or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200/20 bg-white/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/80 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500 dark:focus:bg-white/10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
            >
              <FiXCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Open", "Sourcing", "Shortlisted", "Confirmed"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "border border-white/10 bg-white/5 text-slate-500 hover:bg-white/10 dark:text-slate-400"
                }`}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </div>

      {/* ============================================================
          REQUIREMENTS LIST
      ============================================================ */}
      <div className="space-y-4">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((req) => (
            <RequirementCard key={req.id} req={req} />
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-12 text-center shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <FiAlertCircle className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              No requirements match your filters.
            </p>
          </div>
        )}
      </div>

      {/* ============================================================
          PAGINATION
      ============================================================ */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 px-4 py-3 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {paginatedItems.length} of {filteredRequirements.length}{" "}
            requirements
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-400"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "text-slate-500 hover:bg-white/10 dark:text-slate-400"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-400"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// COMPONENT: Requirement Card
// ============================================================

const RequirementCard = ({ req }) => {
  const StatusIcon = statusIcons[req.status] || FiClock;
  const statusColor = statusColors[req.status] || "from-gray-500 to-gray-400";
  const priorityClass = priorityStyles[req.priority] || "";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-5 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-500 hover:scale-[1.01] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10">
      {/* Glow effect */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
              {req.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span
                className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${statusColor} px-2.5 py-0.5 text-xs font-medium text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105`}
              >
                <StatusIcon size={12} className="shrink-0" />
                {req.status}
              </span>
              <span
                className={`rounded border px-2 py-0.5 text-xs font-medium ${priorityClass}`}
              >
                {req.priority}
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
            <span>{req.vendor}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{req.location}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="flex items-center gap-1">
              <FiClock size={12} className="shrink-0" />
              {req.posted}
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <button className="group/btn inline-flex items-center gap-1 rounded-lg border border-slate-200/20 bg-white/50 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100/80 hover:border-slate-300/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:border-white/20">
            <span>View</span>
            <FiArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </button>
          <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100/50 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">
            <FiMoreVertical size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementsPage;
