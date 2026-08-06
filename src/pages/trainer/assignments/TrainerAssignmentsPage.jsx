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
} from "react-icons/fi";

import assignmentsApi from "../../../api/assignmentsApi";

/*
|--------------------------------------------------------------------------
| Constants & Helpers
|--------------------------------------------------------------------------
*/

const STATUS_STYLES = {
  PROPOSED: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  COMPLETED: "bg-slate-100 text-slate-600 ring-1 ring-slate-600/20",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-600/20",
};

const STATUS_LABELS = {
  PROPOSED: "Proposed",
  CONFIRMED: "Confirmed",
  ACTIVE: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_ICONS = {
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
| Main Component
|--------------------------------------------------------------------------
*/

const TrainerAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const filtered = useMemo(() => {
    if (tab === "PAST") {
      return assignments.filter((assignment) =>
        ["COMPLETED", "CANCELLED"].includes(assignment.status),
      );
    }
    return assignments.filter(
      (assignment) => !["COMPLETED", "CANCELLED"].includes(assignment.status),
    );
  }, [assignments, tab]);

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <FiRefreshCw className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm text-slate-500">
            Loading your assignments...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          My Assignments
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Trainings you've been confirmed for.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === item.key
                ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20"
                : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filtered.map((assignment) => {
          const StatusIcon = STATUS_ICONS[assignment.status] || FiBriefcase;
          return (
            <div
              key={assignment._id}
              className="group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:shadow-md hover:border-indigo-200"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {assignment.requirementId?.title || "Training Assignment"}
                    </h3>
                    <StatusBadge status={assignment.status} />
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {assignment.vendorId?.companyName || "Vendor"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="h-3.5 w-3.5" />
                      {formatDate(assignment.startDate)} –{" "}
                      {formatDate(assignment.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiMapPin className="h-3.5 w-3.5" />
                      {assignment.requirementId?.city || "Online"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-start lg:self-auto">
                  <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-right ring-1 ring-slate-200/50">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Your Rate
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      ₹
                      {Number(assignment.trainerRate || 0).toLocaleString(
                        "en-IN",
                      )}
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
                </div>
              </div>
            </div>
          );
        })}

        {!filtered.length && (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiBriefcase className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No {tab === "UPCOMING" ? "upcoming" : "past"} assignments
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Confirmed trainings will show up here.
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
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

export default TrainerAssignmentsPage;
