import { useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiFilter,
  FiDownload,
  FiClock,
  FiMoreVertical,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
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

const priorityColors = {
  High: "text-red-400 bg-red-500/20 border-red-500/30",
  Medium: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
  Low: "text-green-400 bg-green-500/20 border-green-500/30",
};

const RequirementsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Filter logic
  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch = req.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Requirements
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage all training requirements across vendors
          </p>
        </div>
        <div className="mt-3 flex gap-3 sm:mt-0">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
            <FiDownload size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50">
            <FiPlus size={16} />
            Add Requirement
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-xl font-bold text-white">{requirements.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Open</p>
          <p className="text-xl font-bold text-blue-400">
            {requirements.filter((r) => r.status === "Open").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Sourcing</p>
          <p className="text-xl font-bold text-amber-400">
            {requirements.filter((r) => r.status === "Sourcing").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Confirmed</p>
          <p className="text-xl font-bold text-emerald-400">
            {requirements.filter((r) => r.status === "Confirmed").length}
          </p>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Open", "Sourcing", "Shortlisted", "Confirmed"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Requirements list */}
      <div className="space-y-4">
        {filteredRequirements.length > 0 ? (
          filteredRequirements.map((req) => (
            <RequirementCard key={req.id} req={req} />
          ))
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
            <p className="text-slate-400">
              No requirements match your filters.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs text-slate-400">
          Showing {filteredRequirements.length} of {requirements.length}{" "}
          requirements
        </p>
        <div className="flex gap-1">
          <button className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10">
            Previous
          </button>
          <button className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 text-sm font-medium text-white">
            1
          </button>
          <button className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10">
            2
          </button>
          <button className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10">
            3
          </button>
          <button className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Requirement Card Component
const RequirementCard = ({ req }) => {
  const StatusIcon = statusIcons[req.status] || FiClock;
  const statusColor = statusColors[req.status] || "from-gray-500 to-gray-400";
  const priorityColor = priorityColors[req.priority] || "";

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side */}
        <div className="flex-1">
          <div className="flex flex-wrap items-start gap-3">
            <h3 className="text-base font-semibold text-white group-hover:text-blue-200">
              {req.title}
            </h3>
            <span
              className={`rounded-full bg-gradient-to-r ${statusColor} px-2.5 py-0.5 text-xs font-medium text-white shadow-lg shadow-blue-500/20`}
            >
              {req.status}
            </span>
            <span
              className={`rounded border px-2 py-0.5 text-xs font-medium ${priorityColor}`}
            >
              {req.priority}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span>{req.vendor}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>{req.location}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1">
              <FiClock size={12} />
              {req.posted}
            </span>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white">
            <FiSearch size={14} />
            View
          </button>
          <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <FiMoreVertical size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequirementsPage;
