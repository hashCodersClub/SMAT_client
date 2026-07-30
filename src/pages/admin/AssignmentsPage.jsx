import { useState, useMemo } from "react";
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiCalendar,
  FiClock,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUser,
  FiBriefcase,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
} from "react-icons/fi";

// Mock data
const assignments = [
  {
    id: 1,
    requirement: "Python + Data Analytics Trainer",
    trainer: "Aarav Sharma",
    vendor: "ABC Training Solutions",
    startDate: "2026-08-01",
    endDate: "2026-08-15",
    status: "Confirmed",
    progress: 30,
    location: "Noida",
  },
  {
    id: 2,
    requirement: "Power BI Corporate Trainer",
    trainer: "Priya Patel",
    vendor: "XYZ Technologies",
    startDate: "2026-08-05",
    endDate: "2026-08-20",
    status: "Ongoing",
    progress: 70,
    location: "Gurgaon",
  },
  {
    id: 3,
    requirement: "Java Full Stack Trainer",
    trainer: "Rahul Gupta",
    vendor: "Tech Learning Pvt Ltd",
    startDate: "2026-08-10",
    endDate: "2026-08-25",
    status: "Completed",
    progress: 100,
    location: "Delhi",
  },
  {
    id: 4,
    requirement: "AWS Cloud Practitioner Trainer",
    trainer: "Sneha Reddy",
    vendor: "CloudGuru Inc.",
    startDate: "2026-08-12",
    endDate: "2026-08-22",
    status: "Confirmed",
    progress: 10,
    location: "Bangalore",
  },
  {
    id: 5,
    requirement: "React Native Mobile Trainer",
    trainer: "Vikram Singh",
    vendor: "AppMasters",
    startDate: "2026-08-15",
    endDate: "2026-08-30",
    status: "Ongoing",
    progress: 45,
    location: "Hyderabad",
  },
  {
    id: 6,
    requirement: "Data Science with R Trainer",
    trainer: "Ananya Desai",
    vendor: "AnalyticsHub",
    startDate: "2026-07-20",
    endDate: "2026-08-05",
    status: "Completed",
    progress: 100,
    location: "Pune",
  },
];

const statusColors = {
  Confirmed: "from-blue-500 to-cyan-400",
  Ongoing: "from-amber-500 to-orange-400",
  Completed: "from-emerald-500 to-teal-400",
  Cancelled: "from-red-500 to-pink-400",
};

const statusIcons = {
  Confirmed: FiCheckCircle,
  Ongoing: FiClock,
  Completed: FiCheckCircle,
  Cancelled: FiXCircle,
};

// Stats with trends (mock)
const getStats = (assignments) => {
  const total = assignments.length;
  const confirmed = assignments.filter((a) => a.status === "Confirmed").length;
  const ongoing = assignments.filter((a) => a.status === "Ongoing").length;
  const completed = assignments.filter((a) => a.status === "Completed").length;

  return [
    {
      label: "Total Assignments",
      value: total,
      trend: "+2 this month",
      trendUp: true,
      color: "from-indigo-500 to-blue-400",
      icon: FiBriefcase,
    },
    {
      label: "Confirmed",
      value: confirmed,
      trend: "+1 this week",
      trendUp: true,
      color: "from-blue-500 to-cyan-400",
      icon: FiCheckCircle,
    },
    {
      label: "Ongoing",
      value: ongoing,
      trend: "-1 from last week",
      trendUp: false,
      color: "from-amber-500 to-orange-400",
      icon: FiClock,
    },
    {
      label: "Completed",
      value: completed,
      trend: "+3 this month",
      trendUp: true,
      color: "from-emerald-500 to-teal-400",
      icon: FiCheckCircle,
    },
  ];
};

const AssignmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter logic
  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesSearch =
        assignment.requirement
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        assignment.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || assignment.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedItems = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = getStats(assignments);

  return (
    <div className="space-y-8">
      {/* ============================================================
          PAGE HEADER
      ============================================================ */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assignments
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Confirmed trainer assignments will appear here.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 dark:text-slate-200">
            <FiDownload className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span>Export</span>
          </button>
          <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 hover:shadow-xl active:scale-95">
            <FiPlus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Create Assignment</span>
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
            placeholder="Search by requirement, trainer or vendor..."
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
          {["All", "Confirmed", "Ongoing", "Completed", "Cancelled"].map(
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
          ASSIGNMENTS GRID
      ============================================================ */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-12 text-center shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <FiAlertCircle className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-3 text-slate-500 dark:text-slate-400">
              No assignments match your filters.
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
            Showing {paginatedItems.length} of {filteredAssignments.length}{" "}
            assignments
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
// COMPONENT: Assignment Card
// ============================================================

const AssignmentCard = ({ assignment }) => {
  const StatusIcon = statusIcons[assignment.status] || FiClock;
  const statusColor =
    statusColors[assignment.status] || "from-gray-500 to-gray-400";

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const progressColor =
    assignment.status === "Completed"
      ? "from-emerald-500 to-teal-400"
      : assignment.status === "Ongoing"
        ? "from-amber-500 to-orange-400"
        : "from-blue-500 to-cyan-400";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-5 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-500 hover:scale-[1.02] hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10">
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex-1 text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {assignment.requirement}
          </h3>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r ${statusColor} px-2.5 py-0.5 text-xs font-medium text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-105`}
          >
            <StatusIcon size={12} className="shrink-0" />
            {assignment.status}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <FiUser
              size={14}
              className="text-slate-400 dark:text-slate-500 shrink-0"
            />
            <span className="truncate">Trainer: {assignment.trainer}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiBriefcase
              size={14}
              className="text-slate-400 dark:text-slate-500 shrink-0"
            />
            <span className="truncate">Vendor: {assignment.vendor}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar
              size={14}
              className="text-slate-400 dark:text-slate-500 shrink-0"
            />
            <span>
              {formatDate(assignment.startDate)} –{" "}
              {formatDate(assignment.endDate)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span className="font-medium">{assignment.progress}%</span>
          </div>
          <div className="relative mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/50 dark:bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-1000 ease-out`}
              style={{ width: `${assignment.progress}%` }}
            />
            {/* Shimmer on hover */}
            <div
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
              style={{ width: "50%" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-2 border-t border-slate-200/20 dark:border-white/5 pt-3">
          <button className="group/btn flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200/20 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100/50 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
            View Details
            <FiArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
          </button>
          <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100/50 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
