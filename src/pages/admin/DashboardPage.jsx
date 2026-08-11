import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiClipboard,
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiRefreshCw,
  FiShoppingCart,
  FiFileText,
  FiArrowRight,
  FiPlus,
  FiUserPlus,
  FiBriefcase as FiBriefcaseAlt,
  FiZap,
  FiTrendingUp,
} from "react-icons/fi";

import requirementsApi from "../../api/requirementsApi";
import trainersApi from "../../api/trainersApi";
import vendorsApi from "../../api/vendorsApi";
import assignmentsApi from "../../api/assignmentsApi";
import purchaseOrdersApi from "../../api/purchaseOrdersApi";
import invoicesApi from "../../api/invoicesApi";

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
|
| There's no dedicated /api/dashboard aggregate endpoint on the backend
| yet, so this pulls real counts using the existing list endpoints
| (limit=1, reading `pagination.total`) plus small "recent" lists. It's a
| handful of lightweight parallel requests — fine for MVP traffic. If the
| dashboard becomes a bottleneck later, the right fix is a single backend
| /api/dashboard/summary endpoint that returns all of this in one round
| trip.
|
| Every stat card, action-needed item, and list row here is clickable and
| routes into the real page it summarizes — the dashboard is meant to be
| a jumping-off point into the rest of the app, not a dead end.
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
  TRAINER_SELECTED: "from-emerald-500 to-teal-400",
};

const formatStatusLabel = (status = "") =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const getTotal = (response) => response?.pagination?.total ?? 0;

const DashboardPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    openRequirements: 0,
    activeTrainers: 0,
    activeAssignments: 0,
    activeVendors: 0,
    pendingPurchaseOrders: 0,
    pendingTrainerInvoices: 0,
    outstandingFromVendors: 0,
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
        pendingPurchaseOrdersRes,
        pendingTrainerInvoicesRes,
        vendorInvoicesRes,
        ...pipelineResponses
      ] = await Promise.all([
        requirementsApi.getAll({ status: "OPEN", limit: 1 }),
        trainersApi.getAll({ status: "ACTIVE", limit: 1 }),
        vendorsApi.getAll({ status: "ACTIVE", limit: 1 }),
        assignmentsApi.getAll({ status: "ACTIVE", limit: 1 }),
        assignmentsApi.getAll({ status: "CONFIRMED", limit: 1 }),
        requirementsApi.getAll({ limit: 5 }),
        purchaseOrdersApi.getAll({ status: "VENDOR_REQUESTED", limit: 1 }),
        invoicesApi.getAll({
          direction: "TRAINER_TO_ADMIN",
          status: "SENT",
          limit: 1,
        }),
        invoicesApi.getAll({ direction: "ADMIN_TO_VENDOR", limit: 1 }),
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
        pendingPurchaseOrders: getTotal(pendingPurchaseOrdersRes),
        pendingTrainerInvoices: getTotal(pendingTrainerInvoicesRes),
        outstandingFromVendors:
          vendorInvoicesRes?.summary?.totalOutstanding || 0,
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
      path: "/admin/requirements",
    },
    {
      title: "Active Trainers",
      value: stats.activeTrainers,
      icon: FiUsers,
      color: "from-violet-500 to-purple-400",
      path: "/admin/trainers",
    },
    {
      title: "Active Assignments",
      value: stats.activeAssignments,
      icon: FiUserCheck,
      color: "from-emerald-500 to-teal-400",
      path: "/admin/assignments",
    },
    {
      title: "Active Vendors",
      value: stats.activeVendors,
      icon: FiBriefcase,
      color: "from-amber-500 to-orange-400",
      path: "/admin/vendors",
    },
    {
      title: "Purchase Orders Pending",
      value: stats.pendingPurchaseOrders,
      icon: FiShoppingCart,
      color: "from-fuchsia-500 to-pink-400",
      path: "/admin/purchase-orders",
    },
    {
      title: "Outstanding From Vendors",
      value: formatMoney(stats.outstandingFromVendors),
      icon: FiTrendingUp,
      color: "from-indigo-500 to-blue-400",
      path: "/admin/invoices",
    },
  ];

  const actionItems = [
    {
      key: "po",
      count: stats.pendingPurchaseOrders,
      title: "Purchase order requests waiting for review",
      description:
        "Vendors have requested POs — review and issue them to trainers.",
      icon: FiShoppingCart,
      color: "from-fuchsia-500 to-pink-400",
      path: "/admin/purchase-orders",
      cta: "Review Requests",
    },
    {
      key: "invoices",
      count: stats.pendingTrainerInvoices,
      title: "Trainer invoices waiting for review",
      description:
        "Trainers have submitted invoices — generate the matching vendor invoice.",
      icon: FiFileText,
      color: "from-amber-500 to-orange-400",
      path: "/admin/invoices",
      cta: "Review Invoices",
    },
  ].filter((item) => item.count > 0);

  const quickActions = [
    {
      label: "Add Requirement",
      icon: FiPlus,
      path: "/admin/requirements/add",
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Add Trainer",
      icon: FiUserPlus,
      path: "/admin/trainers/add",
      color: "from-violet-500 to-purple-400",
    },
    {
      label: "Add Vendor",
      icon: FiBriefcaseAlt,
      path: "/admin/vendors/add",
      color: "from-amber-500 to-orange-400",
    },
    {
      label: "Purchase Orders",
      icon: FiShoppingCart,
      path: "/admin/purchase-orders",
      color: "from-fuchsia-500 to-pink-400",
    },
    {
      label: "Invoices",
      icon: FiFileText,
      path: "/admin/invoices",
      color: "from-emerald-500 to-teal-400",
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
          NEEDS YOUR ATTENTION
      ============================================================ */}
      {!loading && actionItems.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-xl shadow-amber-100/50 dark:border-amber-500/20 dark:from-amber-500/10 dark:via-slate-800/70 dark:to-orange-500/10">
          <div className="flex items-center gap-2 border-b border-amber-200/50 px-6 py-4 dark:border-amber-500/10">
            <FiZap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
              Needs Your Attention
            </h2>
          </div>

          <div className="grid gap-px bg-amber-200/30 dark:bg-amber-500/10 sm:grid-cols-2">
            {actionItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="group flex items-start gap-4 bg-white/80 p-6 text-left transition-colors duration-200 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
                  >
                    <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {item.count}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.title}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 group-hover:gap-1.5 dark:text-amber-400">
                      {item.cta}
                      <FiArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          STATS GRID — every card is clickable
      ============================================================ */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              key={stat.title}
              type="button"
              onClick={() => navigate(stat.path)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-6 text-left shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/30 hover:shadow-2xl"
            >
              <div className="relative flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>

                <FiArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-600" />
              </div>

              <p className="relative mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.title}
              </p>

              <h2 className="relative mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {loading ? "—" : stat.value}
              </h2>
            </button>
          );
        })}
      </div>

      {/* ============================================================
          QUICK ACTIONS
      ============================================================ */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
        <div className="border-b border-slate-200/20 px-6 py-4 dark:border-white/5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Quick Actions
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 p-6">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.path)}
                className={`group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${action.color} px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </button>
            );
          })}
        </div>
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

              <button
                type="button"
                onClick={() => navigate("/admin/requirements")}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-1.5 dark:text-blue-400"
              >
                View All
                <FiArrowRight className="h-3.5 w-3.5 transition-transform duration-200" />
              </button>
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
                    onClick={() =>
                      navigate(`/admin/requirements/${requirement._id}`)
                    }
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
                    onClick={() =>
                      navigate(`/admin/requirements?status=${item.key}`)
                    }
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

const Requirement = ({ title, vendor, location, status, onClick }) => {
  const statusColor = STATUS_COLORS[status] || "from-gray-500 to-gray-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col justify-between gap-3 p-5 text-left transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-white/5 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
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
    </button>
  );
};

/*
|--------------------------------------------------------------------------
| COMPONENT: Pipeline Item
|--------------------------------------------------------------------------
*/

const Pipeline = ({ name, value, max, color, onClick }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-4 rounded-lg -mx-2 px-2 py-1 text-left transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-white/5"
    >
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
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
    </button>
  );
};

export default DashboardPage;
