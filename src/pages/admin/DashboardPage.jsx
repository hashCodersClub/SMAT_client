import { useCallback, useEffect, useState } from "react";
import {
  FiClipboard,
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiRefreshCw,
} from "react-icons/fi";

import requirementsApi from "../../api/requirementsApi";
import trainersApi from "../../api/trainersApi";
import vendorsApi from "../../api/vendorsApi";
import assignmentsApi from "../../api/assignmentsApi";

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
|
| Previously this page rendered entirely hardcoded numbers and sample
| rows. There's no dedicated /api/dashboard aggregate endpoint on the
| backend yet, so this pulls real counts using the existing list
| endpoints (limit=1, reading `pagination.total`) plus a small "recent
| requirements" list. It's a handful of lightweight parallel requests —
| fine for MVP traffic. If the dashboard becomes a bottleneck later,
| the right fix is a single backend /api/dashboard/summary endpoint
| that returns all of this in one round trip.
|--------------------------------------------------------------------------
*/

const REQUIREMENT_PIPELINE_STATUSES = [
  { key: "OPEN", label: "Open" },
  { key: "SOURCING", label: "Sourcing" },
  { key: "PROFILES_SENT", label: "Profiles Sent" },
  { key: "SHORTLISTED", label: "Shortlisted" },
  { key: "CONFIRMED", label: "Confirmed" },
];

const PIPELINE_COLORS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-amber-500 to-orange-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-400",
];

const STATUS_COLORS = {
  OPEN: "from-blue-500 to-cyan-400",
  SOURCING: "from-amber-500 to-orange-400",
  PROFILES_SENT: "from-amber-500 to-orange-400",
  SHORTLISTED: "from-emerald-500 to-teal-400",
  CONFIRMED: "from-rose-500 to-pink-400",
};

const formatStatusLabel = (status = "") =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const getTotal = (response) => response?.pagination?.total ?? 0;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    openRequirements: 0,
    activeTrainers: 0,
    activeAssignments: 0,
    activeVendors: 0,
  });

  const [pipeline, setPipeline] = useState([]);
  const [recentRequirements, setRecentRequirements] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | Load Dashboard Data
  |--------------------------------------------------------------------------
  */

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        openRequirementsRes,
        activeTrainersRes,
        activeVendorsRes,
        activeAssignmentsRes,
        confirmedAssignmentsRes,
        recentRequirementsRes,
        ...pipelineResponses
      ] = await Promise.all([
        requirementsApi.getAll({ status: "OPEN", limit: 1 }),
        trainersApi.getAll({ status: "ACTIVE", limit: 1 }),
        vendorsApi.getAll({ status: "ACTIVE", limit: 1 }),
        assignmentsApi.getAll({ status: "ACTIVE", limit: 1 }),
        assignmentsApi.getAll({ status: "CONFIRMED", limit: 1 }),
        requirementsApi.getAll({ limit: 5 }),
        ...REQUIREMENT_PIPELINE_STATUSES.map(({ key }) =>
          requirementsApi.getAll({ status: key, limit: 1 }),
        ),
      ]);

      setStats({
        openRequirements: getTotal(openRequirementsRes),
        activeTrainers: getTotal(activeTrainersRes),
        activeVendors: getTotal(activeVendorsRes),
        activeAssignments:
          getTotal(activeAssignmentsRes) + getTotal(confirmedAssignmentsRes),
      });

      setPipeline(
        REQUIREMENT_PIPELINE_STATUSES.map(({ key, label }, index) => ({
          key,
          label,
          value: getTotal(pipelineResponses[index]),
          color: PIPELINE_COLORS[index % PIPELINE_COLORS.length],
        })),
      );

      setRecentRequirements(recentRequirementsRes?.requirements || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards = [
    {
      title: "Open Requirements",
      value: stats.openRequirements,
      icon: FiClipboard,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Active Trainers",
      value: stats.activeTrainers,
      icon: FiUsers,
      color: "from-violet-500 to-purple-400",
    },
    {
      title: "Active Assignments",
      value: stats.activeAssignments,
      icon: FiUserCheck,
      color: "from-emerald-500 to-teal-400",
    },
    {
      title: "Active Vendors",
      value: stats.activeVendors,
      icon: FiBriefcase,
      color: "from-amber-500 to-orange-400",
    },
  ];

  const pipelineMax = Math.max(1, ...pipeline.map((item) => item.value));

  return (
    <div className="space-y-8">
      {/* ============================================================
          PAGE HEADER
      ============================================================ */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Overview of your trainer sourcing operations.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 hover:shadow-xl active:scale-95 disabled:opacity-60"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Couldn't load dashboard data. Try refreshing.
        </div>
      )}

      {/* ============================================================
          STATS GRID
      ============================================================ */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/30 hover:shadow-2xl"
            >
              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
              </div>

              <p className="relative mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.title}
              </p>

              <h2 className="relative mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {loading ? "—" : stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          BOTTOM SECTION: Recent Requirements + Pipeline
      ============================================================ */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent Requirements */}
        <div className="xl:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="flex flex-col items-start justify-between gap-3 border-b border-slate-200/20 p-6 dark:border-white/5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Requirements
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Latest training requirements received
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200/20 dark:divide-white/5">
              {loading && (
                <div className="p-6 text-sm font-medium text-slate-500">
                  Loading requirements...
                </div>
              )}

              {!loading && recentRequirements.length === 0 && (
                <div className="p-6 text-sm font-medium text-slate-500">
                  No requirements yet.
                </div>
              )}

              {!loading &&
                recentRequirements.map((requirement) => (
                  <Requirement
                    key={requirement._id}
                    title={requirement.title}
                    vendor={requirement.vendorId?.companyName || "—"}
                    location={requirement.city || "—"}
                    status={requirement.status}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="border-b border-slate-200/20 p-6 dark:border-white/5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Requirement Pipeline
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Current sourcing activity
              </p>
            </div>

            <div className="p-6 space-y-4">
              {loading && (
                <p className="text-sm font-medium text-slate-500">Loading...</p>
              )}

              {!loading &&
                pipeline.map((item) => (
                  <Pipeline
                    key={item.key}
                    name={item.label}
                    value={item.value}
                    max={pipelineMax}
                    color={item.color}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| COMPONENT: Requirement Item
|--------------------------------------------------------------------------
*/

const Requirement = ({ title, vendor, location, status }) => {
  const statusColor = STATUS_COLORS[status] || "from-gray-500 to-gray-400";

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
        className={`inline-flex w-fit items-center rounded-full bg-gradient-to-r ${statusColor} px-3.5 py-1.5 text-xs font-medium text-white shadow-lg`}
      >
        {formatStatusLabel(status)}
      </span>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| COMPONENT: Pipeline Item
|--------------------------------------------------------------------------
*/

const Pipeline = ({ name, value, max, color }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {name}
      </span>

      <div className="flex flex-1 items-center gap-3">
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span
          className={`min-w-[2rem] rounded-md bg-gradient-to-r ${color} bg-opacity-20 px-2.5 py-1 text-center text-sm font-semibold text-white shadow-sm`}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

export default DashboardPage;
