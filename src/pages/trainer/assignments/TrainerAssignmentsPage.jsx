import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiMapPin,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiCheck,
  FiX,
} from "react-icons/fi";

import assignmentsApi from "../../../api/assignmentsApi";

/*
|--------------------------------------------------------------------------
| Constants & Helpers
|--------------------------------------------------------------------------
*/

const STATUS_STYLES = {
  PENDING_CONFIRMATION: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  ASSIGNMENT_CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  ASSIGNMENT_REJECTED: "bg-red-50 text-red-600 ring-1 ring-red-600/20",
  PROPOSED: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  ACTIVE: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20",
  COMPLETED: "bg-slate-100 text-slate-600 ring-1 ring-slate-600/20",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-600/20",
};

const STATUS_LABELS = {
  PENDING_CONFIRMATION: "Pending Confirmation",
  ASSIGNMENT_CONFIRMED: "Confirmed",
  ASSIGNMENT_REJECTED: "Rejected",
  PROPOSED: "Proposed",
  CONFIRMED: "Confirmed",
  ACTIVE: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_ICONS = {
  PENDING_CONFIRMATION: FiClock,
  ASSIGNMENT_CONFIRMED: FiCheckCircle,
  ASSIGNMENT_REJECTED: FiXCircle,
  PROPOSED: FiClock,
  CONFIRMED: FiCheckCircle,
  ACTIVE: FiRefreshCw,
  COMPLETED: FiCheckCircle,
  CANCELLED: FiXCircle,
};

const TABS = [
  { key: "UPCOMING", label: "Upcoming" },
  { key: "PAST", label: "Past" },
];

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/*
|--------------------------------------------------------------------------
| Skeleton
|--------------------------------------------------------------------------
*/

const AssignmentsSkeleton = () => (
  <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    <div className="space-y-2">
      <div className="skeleton h-8 w-56 rounded-lg" />
      <div className="skeleton h-4 w-72 rounded-full" />
    </div>
    <div className="flex gap-2">
      <div className="skeleton h-10 w-28 rounded-xl" />
      <div className="skeleton h-10 w-24 rounded-xl" />
    </div>
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 70}ms` }}
          className="skeleton animate-rise-in h-28 w-full rounded-2xl"
        />
      ))}
    </div>
  </div>
);

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

const TrainerAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [tab, setTab] = useState("UPCOMING");

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await assignmentsApi.getMine();
      setAssignments(response?.data || []);
    } catch (err) {
      console.error("Failed to load assignments:", err);
      setError(
        err.response?.data?.message || "Unable to load your assignments.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleConfirm = async (assignmentId) => {
    try {
      setActionLoadingId(assignmentId);
      setError("");
      await assignmentsApi.confirmMine(assignmentId);
      setActionSuccess("Assignment confirmed successfully! Requirement status updated to ASSIGNMENT_CONFIRMED.");
      setTimeout(() => setActionSuccess(""), 4000);
      await loadAssignments();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to confirm assignment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to reject this assignment?")) return;

    try {
      setActionLoadingId(assignmentId);
      setError("");
      await assignmentsApi.rejectMine(assignmentId);
      setActionSuccess("Assignment rejected.");
      setTimeout(() => setActionSuccess(""), 4000);
      await loadAssignments();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to reject assignment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = useMemo(() => {
    if (tab === "PAST") {
      return assignments.filter((assignment) =>
        ["COMPLETED", "CANCELLED", "ASSIGNMENT_REJECTED"].includes(assignment.status),
      );
    }
    return assignments.filter(
      (assignment) => !["COMPLETED", "CANCELLED", "ASSIGNMENT_REJECTED"].includes(assignment.status),
    );
  }, [assignments, tab]);

  const upcomingCount = useMemo(
    () =>
      assignments.filter(
        (assignment) => !["COMPLETED", "CANCELLED", "ASSIGNMENT_REJECTED"].includes(assignment.status),
      ).length,
    [assignments],
  );

  const pastCount = assignments.length - upcomingCount;

  if (loading) {
    return <AssignmentsSkeleton />;
  }

  return (
    <div className="animate-fade-in-up mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          My Assignments
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Confirm and manage your training assignments.
        </p>
      </div>

      {/* Action Success Message */}
      {actionSuccess && (
        <div className="animate-rise-in flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-medium">
          <FiCheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="animate-rise-in flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((item) => {
          const count = item.key === "UPCOMING" ? upcomingCount : pastCount;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`press-scale flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                tab === item.key
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-500/20"
                  : "bg-white text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm"
              }`}
            >
              {item.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  tab === item.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filtered.map((assignment, index) => {
          const isPending = ["PENDING_CONFIRMATION", "PROPOSED"].includes(assignment.status);
          const isActionBusy = actionLoadingId === assignment._id;

          return (
            <div
              key={assignment._id}
              style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
              className={`hover-lift animate-rise-in group rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
                isPending
                  ? "border-amber-300 bg-amber-50/20 ring-2 ring-amber-500/10"
                  : "border-slate-200 bg-white/80 hover:border-indigo-200"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {assignment.requirementId?.title || "Training Assignment"}
                    </h3>
                    <StatusBadge status={assignment.status} />
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {assignment.vendorId?.companyName || "Vendor"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="h-4 w-4 text-slate-400" />
                      {formatDate(assignment.startDate)} –{" "}
                      {formatDate(assignment.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiMapPin className="h-4 w-4 text-slate-400" />
                      {assignment.requirementId?.city || "Online"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 self-start lg:self-auto">
                  <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-right ring-1 ring-slate-200/50 transition-colors duration-200 group-hover:bg-indigo-50/60 group-hover:ring-indigo-200/50">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Your Rate
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      ₹
                      {Number(
                        assignment.selectedRate || assignment.trainerRate || 0,
                      ).toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-slate-400">
                        /
                        {assignment.rateType === "PER_HOUR"
                          ? "hr"
                          : assignment.rateType === "PER_BATCH"
                            ? "batch"
                            : "day"}
                      </span>
                    </p>
                  </div>

                  {/* Confirmation Actions */}
                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isActionBusy}
                        onClick={() => handleConfirm(assignment._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        <FiCheck size={16} />
                        Confirm Assignment
                      </button>

                      <button
                        type="button"
                        disabled={isActionBusy}
                        onClick={() => handleReject(assignment._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <FiX size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <div className="animate-scale-in rounded-2xl border border-slate-200 bg-white/80 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiBriefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No {tab === "UPCOMING" ? "upcoming" : "past"} assignments
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Assignments will show up here for your confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

const StatusBadge = ({ status }) => {
  const Icon = STATUS_ICONS[status] || FiBriefcase;
  const label = STATUS_LABELS[status] || status;
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-transform duration-200 ${style}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

export default TrainerAssignmentsPage;
