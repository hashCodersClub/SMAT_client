import { useState } from "react";
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

const AssignmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Filter logic
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.requirement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" || assignment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Assignments
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Confirmed trainer assignments will appear here.
          </p>
        </div>
        <div className="mt-3 flex gap-3 sm:mt-0">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
            <FiDownload size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50">
            <FiPlus size={16} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Total Assignments</p>
          <p className="text-xl font-bold text-white">{assignments.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Confirmed</p>
          <p className="text-xl font-bold text-blue-400">
            {assignments.filter((a) => a.status === "Confirmed").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Ongoing</p>
          <p className="text-xl font-bold text-amber-400">
            {assignments.filter((a) => a.status === "Ongoing").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Completed</p>
          <p className="text-xl font-bold text-emerald-400">
            {assignments.filter((a) => a.status === "Completed").length}
          </p>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by requirement, trainer or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", "Confirmed", "Ongoing", "Completed", "Cancelled"].map(
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

      {/* Assignments grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
            <p className="text-slate-400">No assignments match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs text-slate-400">
          Showing {filteredAssignments.length} of {assignments.length}{" "}
          assignments
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

// Assignment Card Component
const AssignmentCard = ({ assignment }) => {
  const StatusIcon = statusIcons[assignment.status] || FiClock;
  const statusColor =
    statusColors[assignment.status] || "from-gray-500 to-gray-400";

  // Format date to readable string
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  // Determine progress bar color based on status
  const progressColor =
    assignment.status === "Completed"
      ? "from-emerald-500 to-teal-400"
      : assignment.status === "Ongoing"
        ? "from-amber-500 to-orange-400"
        : "from-blue-500 to-cyan-400";

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
      <div className="flex flex-col gap-3">
        {/* Header: Requirement and status */}
        <div className="flex items-start justify-between">
          <h3 className="flex-1 text-base font-semibold text-white group-hover:text-blue-200">
            {assignment.requirement}
          </h3>
          <span
            className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${statusColor} px-2.5 py-0.5 text-xs font-medium text-white shadow-lg shadow-blue-500/20`}
          >
            <StatusIcon size={12} />
            {assignment.status}
          </span>
        </div>

        {/* Details: Trainer, Vendor, Location */}
        <div className="space-y-1.5 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <FiUser size={14} className="text-slate-500" />
            <span>Trainer: {assignment.trainer}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiBriefcase size={14} className="text-slate-500" />
            <span>Vendor: {assignment.vendor}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar size={14} className="text-slate-500" />
            <span>
              {formatDate(assignment.startDate)} –{" "}
              {formatDate(assignment.endDate)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Progress</span>
            <span>{assignment.progress}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
              style={{ width: `${assignment.progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-3">
          <button className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white">
            View Details
          </button>
          <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <FiMoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsPage;
