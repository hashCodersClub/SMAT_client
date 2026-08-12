import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiArrowRight,
  FiAlertCircle,
  FiCalendar,
  FiClipboard,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiUser,
  FiCpu,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import requirementsApi from "../../../api/requirementsApi";
import assignmentsApi from "../../../api/assignmentsApi";

/*
|--------------------------------------------------------------------------
| Pipeline Stages
|--------------------------------------------------------------------------
|
| Mirrors the grouping used on the Requirements board so the same mental
| model — "where does this sit in my pipeline" — carries across the
| portal. Order matters here: it's the left-to-right flow of the bar.
|--------------------------------------------------------------------------
*/

const STAGES = [
  {
    key: "DRAFT",
    label: "Draft",
    statuses: ["DRAFT"],
    bar: "bg-slate-300",
    dot: "bg-slate-400",
  },
  {
    key: "SUBMITTED",
    label: "Submitted",
    statuses: ["SUBMITTED", "OPEN"],
    bar: "bg-indigo-500",
    dot: "bg-indigo-500",
  },
  {
    key: "SOURCING",
    label: "Sourcing",
    statuses: ["SOURCING", "PROFILES_SENT"],
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  {
    key: "SHORTLISTED",
    label: "Shortlisted",
    statuses: ["SHORTLISTED"],
    bar: "bg-cyan-500",
    dot: "bg-cyan-500",
  },
  {
    key: "TRAINER_SELECTED",
    label: "Trainer Selected",
    statuses: ["TRAINER_SELECTED"],
    bar: "bg-violet-500",
    dot: "bg-violet-500",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    statuses: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"],
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/*
|--------------------------------------------------------------------------
| Vendor Dashboard
|--------------------------------------------------------------------------
*/

const VendorDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [requirements, setRequirements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [requirementsRes, assignmentsRes] = await Promise.all([
        requirementsApi.getAll({ limit: 100 }),
        assignmentsApi.getMine(),
      ]);

      setRequirements(requirementsRes.requirements || []);
      setAssignments(assignmentsRes?.data || []);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(err.response?.data?.message || "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
  |--------------------------------------------------------------------------
  | Derived Data
  |--------------------------------------------------------------------------
  */

  const pipeline = useMemo(() => {
    const total = requirements.length;

    return STAGES.map((stage) => {
      const count = requirements.filter((requirement) =>
        stage.statuses.includes(requirement.status),
      ).length;

      return {
        ...stage,
        count,
        percent: total ? (count / total) * 100 : 0,
      };
    });
  }, [requirements]);

  const activeAssignmentsCount = useMemo(
    () =>
      assignments.filter(
        (assignment) => !["COMPLETED", "CANCELLED"].includes(assignment.status),
      ).length,
    [assignments],
  );

  const recentRequirements = useMemo(() => {
    return [...requirements]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 5);
  }, [requirements]);

  const upcomingAssignments = useMemo(() => {
    return assignments
      .filter(
        (assignment) => !["COMPLETED", "CANCELLED"].includes(assignment.status),
      )
      .sort(
        (a, b) =>
          new Date(a.startDate || 0).getTime() -
          new Date(b.startDate || 0).getTime(),
      )
      .slice(0, 4);
  }, [assignments]);

  const firstName = (user?.name || "there").split(" ")[0];

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={22}
            className="mx-auto animate-spin text-indigo-600"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================================================================
          HERO
      ================================================================= */}

      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Vendor Portal
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              {requirements.length
                ? `You have ${requirements.length} requirement${requirements.length === 1 ? "" : "s"} in your pipeline right now.`
                : "Submit your first training requirement to get started."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/requirements/smart")}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/10"
            >
              <FiCpu size={15} />
              AI Parser
            </button>

            <button
              type="button"
              onClick={() => navigate("/vendor/requirements/add")}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-slate-100 active:scale-[0.98]"
            >
              <FiPlus size={15} />
              New Requirement
            </button>
          </div>
        </div>

        {/* Pipeline Flow Bar */}
        <div className="relative mt-8">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            {pipeline.every((stage) => stage.count === 0) ? (
              <div className="h-full w-full bg-white/5" />
            ) : (
              pipeline.map((stage) =>
                stage.count ? (
                  <div
                    key={stage.key}
                    style={{ width: `${stage.percent}%` }}
                    className={`h-full ${stage.bar} transition-all duration-500`}
                    title={`${stage.label}: ${stage.count}`}
                  />
                ) : null,
              )
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {pipeline.map((stage) => (
              <button
                key={stage.key}
                type="button"
                onClick={() => navigate("/vendor/requirements")}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
                {stage.label}
                <span className="font-semibold text-white">{stage.count}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => navigate("/vendor/assignments")}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Active Assignments
              <span className="font-semibold text-white">
                {activeAssignmentsCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================
          ERROR
      ================================================================= */}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="text-sm font-semibold text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ================================================================
            RECENT ACTIVITY (timeline)
        ================================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Activity</h2>

            {!!recentRequirements.length && (
              <button
                type="button"
                onClick={() => navigate("/vendor/requirements")}
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                View pipeline
                <FiArrowRight size={14} />
              </button>
            )}
          </div>

          {recentRequirements.length ? (
            <div className="mt-5">
              {recentRequirements.map((requirement, index) => {
                const stage = STAGES.find((s) =>
                  s.statuses.includes(requirement.status),
                );

                return (
                  <button
                    key={requirement._id}
                    type="button"
                    onClick={() =>
                      navigate(`/vendor/requirements/${requirement._id}`)
                    }
                    className="group relative flex w-full gap-4 pb-6 text-left last:pb-0"
                  >
                    {/* Timeline rail */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${stage?.dot || "bg-slate-300"} ring-4 ring-white`}
                      />
                      {index !== recentRequirements.length - 1 && (
                        <span className="mt-1 w-px flex-1 bg-slate-100" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 rounded-xl px-3 py-2 -mt-2 transition-colors duration-150 group-hover:bg-slate-50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="truncate font-semibold text-slate-900">
                          {requirement.title}
                        </p>
                        <span className="text-xs font-medium text-slate-400">
                          {stage?.label || "—"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiCalendar size={12} />
                          {formatDate(requirement.startDate)}
                        </span>

                        <span className="flex items-center gap-1">
                          <FiMapPin size={12} />
                          {requirement.city ||
                            (requirement.mode === "ONLINE" ? "Online" : "—")}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FiClipboard size={21} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No requirements yet
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Submit your first training requirement and Nxthack will start
                sourcing suitable trainers.
              </p>

              <button
                type="button"
                onClick={() => navigate("/vendor/requirements/add")}
                className="mt-5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create Requirement
              </button>
            </div>
          )}
        </div>

        {/* ================================================================
            UPCOMING ASSIGNMENTS
        ================================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Upcoming Assignments
            </h2>

            {!!upcomingAssignments.length && (
              <button
                type="button"
                onClick={() => navigate("/vendor/assignments")}
                className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                View all
                <FiArrowRight size={14} />
              </button>
            )}
          </div>

          {upcomingAssignments.length ? (
            <div className="mt-4 space-y-3">
              {upcomingAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="rounded-xl border border-slate-100 p-3.5 transition-colors duration-150 hover:bg-slate-50"
                >
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {assignment.requirementId?.title || "Training Assignment"}
                  </p>

                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <FiUser size={12} />
                    {assignment.trainerId?.name || "Trainer"}
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <FiCalendar size={12} />
                    {formatDate(assignment.startDate)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FiUser size={18} />
              </div>

              <p className="mx-auto mt-3 max-w-[220px] text-sm text-slate-500">
                Confirmed trainers will show up here once assigned.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
