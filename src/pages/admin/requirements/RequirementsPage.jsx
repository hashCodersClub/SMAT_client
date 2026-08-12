import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiUserCheck,
  FiX,
  FiTrendingUp,
  FiBriefcase,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiGrid,
  FiList,
} from "react-icons/fi";

import RequirementFilters from "../../../components/admin/requirements/RequirementFilters";
import RequirementTable from "../../../components/admin/requirements/RequirementTable";
import RequirementBoard from "../../../components/admin/requirements/RequirementBoard";

import requirementsApi from "../../../api/requirementsApi";
import trainersApi from "../../../api/trainersApi";
import { mapTrainerFromApi } from "../../../utils/trainerAdapter";
import { useCountUp } from "../../../hooks/useCountUp";

/*
|--------------------------------------------------------------------------
| Stats
|--------------------------------------------------------------------------
|
| Every number here is computed from the actual requirements list — no
| placeholder trend text. The "Total" card shows a real count of
| requirements created in the last 7 days (from createdAt); the stage
| cards show each stage's real share of the total instead of a fabricated
| up/down delta we have no historical data to support.
|--------------------------------------------------------------------------
*/

const getStats = (requirements) => {
  const total = requirements.length;
  const open = requirements.filter((r) => r.status === "OPEN").length;
  const sourcing = requirements.filter((r) => r.status === "SOURCING").length;
  const confirmed = requirements.filter((r) => r.status === "CONFIRMED").length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const createdThisWeek = requirements.filter(
    (r) => r.createdAt && new Date(r.createdAt) >= sevenDaysAgo,
  ).length;

  const shareOf = (count) =>
    total > 0
      ? `${Math.round((count / total) * 100)}% of total`
      : "No data yet";

  return [
    {
      label: "Total Requirements",
      value: total,
      badge:
        createdThisWeek > 0
          ? `+${createdThisWeek} this week`
          : "No new requirements this week",
      badgeTone: createdThisWeek > 0 ? "positive" : "neutral",
      color: "from-indigo-500 to-blue-400",
      icon: FiBriefcase,
      filterKey: null,
    },
    {
      label: "Open",
      value: open,
      badge: shareOf(open),
      badgeTone: "neutral",
      color: "from-blue-500 to-cyan-400",
      icon: FiClock,
      filterKey: "status",
      filterValue: "OPEN",
    },
    {
      label: "Sourcing",
      value: sourcing,
      badge: shareOf(sourcing),
      badgeTone: "neutral",
      color: "from-amber-500 to-orange-400",
      icon: FiAlertCircle,
      filterKey: "status",
      filterValue: "SOURCING",
    },
    {
      label: "Confirmed",
      value: confirmed,
      badge: shareOf(confirmed),
      badgeTone: "neutral",
      color: "from-emerald-500 to-teal-400",
      icon: FiCheckCircle,
      filterKey: "status",
      filterValue: "CONFIRMED",
    },
  ];
};

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
|
| Split out so useCountUp (a hook) can be called once per card — hooks
| can't be called conditionally inside a .map() in the parent.
|--------------------------------------------------------------------------
*/

const StatCard = ({ stat, isActive, index, onClick }) => {
  const Icon = stat.icon;
  const animatedValue = useCountUp(stat.value, { duration: 700 });

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`animate-rise-in hover-lift press-scale group relative overflow-hidden rounded-2xl border p-5 text-left ${
        isActive
          ? "border-blue-500 bg-blue-50/80 shadow-lg shadow-blue-100/50 dark:border-blue-400 dark:bg-blue-900/20"
          : "border-white/20 bg-white/60 shadow-sm backdrop-blur-sm hover:border-slate-200/80 hover:shadow-xl dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:border-slate-600/80"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 ${
            stat.badgeTone === "positive"
              ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-slate-100/80 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400"
          }`}
        >
          {stat.badgeTone === "positive" && (
            <FiTrendingUp className="h-3 w-3" />
          )}
          {stat.badge}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
        {stat.label}
      </p>
      <p
        key={animatedValue}
        className="animate-count-tick mt-0.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white"
      >
        {animatedValue}
      </p>
      {isActive && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 animate-scale-in bg-gradient-to-r from-blue-500 to-cyan-400" />
      )}
      {/* Subtle sheen sweep on hover — Stripe-card style */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
    </button>
  );
};

/*
|--------------------------------------------------------------------------
| Loading Skeleton
|--------------------------------------------------------------------------
|
| A shimmering, shaped skeleton beats a spinner for perceived
| performance — the eye can already see where content will land.
|--------------------------------------------------------------------------
*/

const RequirementsSkeleton = () => (
  <div className="mt-8 animate-rise-in space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 60}ms` }}
          className="animate-rise-in space-y-4 rounded-2xl border border-white/20 bg-white/60 p-5 backdrop-blur-sm"
        >
          <div className="skeleton h-12 w-12 rounded-xl" />
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>

    <div className="skeleton h-16 w-full rounded-2xl" />

    <div className="space-y-3 rounded-2xl border border-white/20 bg-white/60 p-5 backdrop-blur-sm">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 50}ms` }}
          className="skeleton animate-rise-in h-14 w-full rounded-xl"
        />
      ))}
    </div>
  </div>
);

const RequirementsPage = () => {
  const navigate = useNavigate();

  // ---------- Data State ----------
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- Assign-Trainer Hand-off ----------
  const [searchParams, setSearchParams] = useSearchParams();
  const assignTrainerId = searchParams.get("assignTrainerId") || "";
  const [assignTrainer, setAssignTrainer] = useState(null);

  // ---------- Filter State ----------
  // `status` can arrive via ?status=OPEN (e.g. from the dashboard's
  // pipeline widget) so a deep link lands pre-filtered instead of on the
  // full unfiltered list. `view` similarly persists in the URL so a
  // bookmarked/shared link opens in the same view it was copied from.
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [mode, setMode] = useState("");
  const [priority, setPriority] = useState("");
  const [view, setView] = useState(
    searchParams.get("view") === "board" ? "board" : "table",
  );

  const setViewAndPersist = (nextView) => {
    setView(nextView);
    const next = new URLSearchParams(searchParams);
    next.set("view", nextView);
    setSearchParams(next);
  };

  // ---------- Fetch Requirements ----------
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await requirementsApi.getAll();
      const list =
        response?.requirements ||
        response?.data?.requirements ||
        response?.data ||
        [];
      setRequirements(list);
    } catch (err) {
      console.error("Failed to load requirements:", err);
      setError(err.response?.data?.message || "Unable to load requirements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  // ---------- Load Trainer for Assignment ----------
  useEffect(() => {
    if (!assignTrainerId) {
      setAssignTrainer(null);
      return;
    }

    let cancelled = false;
    const loadAssignTrainer = async () => {
      try {
        const data = await trainersApi.getById(assignTrainerId);
        if (!cancelled) {
          setAssignTrainer(mapTrainerFromApi(data?.trainer));
        }
      } catch (err) {
        console.error("Failed to load trainer for assignment:", err);
        if (!cancelled) setAssignTrainer(null);
      }
    };
    loadAssignTrainer();
    return () => {
      cancelled = true;
    };
  }, [assignTrainerId]);

  const clearAssignTrainer = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("assignTrainerId");
    setSearchParams(next);
  };

  // ---------- Filtering (client-side) ----------
  const filteredRequirements = useMemo(() => {
    const query = search.toLowerCase().trim();
    return requirements.filter((req) => {
      const vendorName =
        (typeof req.vendorId === "object" && req.vendorId
          ? req.vendorId.companyName
          : req.vendorName) || "";

      const matchesSearch =
        !query ||
        req.title?.toLowerCase().includes(query) ||
        vendorName.toLowerCase().includes(query) ||
        req.city?.toLowerCase().includes(query) ||
        (req.skills && req.skills.some((s) => s.toLowerCase().includes(query)));

      const matchesStatus = !status || req.status === status;
      const matchesMode = !mode || req.mode === mode;
      const matchesPriority = !priority || req.priority === priority;

      return matchesSearch && matchesStatus && matchesMode && matchesPriority;
    });
  }, [search, status, mode, priority, requirements]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setMode("");
    setPriority("");
  };

  // ---------- Stats with click filters ----------
  const stats = useMemo(() => getStats(requirements), [requirements]);
  const handleStatClick = (stat) => {
    if (!stat.filterKey) {
      resetFilters();
      return;
    }
    const current = status;
    const newValue = current === stat.filterValue ? "" : stat.filterValue;
    setStatus(newValue);
  };

  // ---------- Render ----------
  return (
    <div className="relative mx-auto max-w-7xl animate-fade-in-up px-4 py-6 sm:px-6 lg:px-8">
      {/* Subtle background orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/20 to-pink-100/20 blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 sm:text-4xl">
            Requirements
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage incoming training requirements and trainer sourcing.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/requirements/add")}
          className="press-scale group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
        >
          <FiPlus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          New Requirement
        </button>
      </div>

      {/* Assign Trainer Banner */}
      {assignTrainerId && (
        <div className="animate-slide-in-right relative mt-6 overflow-hidden rounded-2xl border border-blue-200/80 bg-white/80 px-5 py-4 backdrop-blur-sm dark:border-blue-800/30 dark:bg-slate-800/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-blue-800 dark:text-blue-300">
              <div className="animate-glow-pulse rounded-full bg-blue-100/70 p-1.5 dark:bg-blue-900/30">
                <FiUserCheck className="h-4 w-4" />
              </div>
              <span>
                Assigning{" "}
                <span className="font-semibold">
                  {assignTrainer?.name || "selected trainer"}
                </span>{" "}
                — pick a requirement below to continue.
              </span>
            </div>
            <button
              onClick={clearAssignTrainer}
              className="press-scale inline-flex items-center gap-1 self-start rounded-full bg-blue-100/70 px-4 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-200/80 dark:bg-blue-800/30 dark:text-blue-300 dark:hover:bg-blue-800/50 sm:self-auto"
            >
              <FiX className="h-4 w-4" />
              Cancel
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 to-cyan-400" />
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <RequirementsSkeleton />
      ) : error ? (
        <div className="animate-rise-in relative mt-8 overflow-hidden rounded-3xl border border-red-200/80 bg-white/80 p-6 backdrop-blur-sm shadow-lg shadow-red-100/20">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-red-100/70 p-2.5">
              <FiAlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
            <button
              onClick={fetchRequirements}
              className="press-scale group inline-flex items-center gap-2 rounded-full bg-red-100/80 px-5 py-2 text-sm font-medium text-red-700 transition-all duration-200 hover:bg-red-200/80 hover:shadow-md dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              <FiRefreshCw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-180" />
              Retry
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                stat={stat}
                index={index}
                isActive={status === stat.filterValue}
                onClick={() => handleStatClick(stat)}
              />
            ))}
          </div>

          {/* Filters */}
          <div
            style={{ animationDelay: "240ms" }}
            className="animate-rise-in relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30"
          >
            <RequirementFilters
              search={search}
              setSearch={setSearch}
              status={status}
              setStatus={setStatus}
              mode={mode}
              setMode={setMode}
              priority={priority}
              setPriority={setPriority}
              resetFilters={resetFilters}
            />
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
          </div>

          {/* Result count + View toggle */}
          <div
            style={{ animationDelay: "280ms" }}
            className="animate-rise-in mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span
                key={filteredRequirements.length}
                className="animate-count-tick inline-block font-semibold text-slate-700 dark:text-slate-200"
              >
                {filteredRequirements.length}
              </span>{" "}
              requirements
            </p>

            <div className="inline-flex items-center gap-1 self-start rounded-xl border border-slate-200 bg-white/70 p-1 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50">
              <button
                type="button"
                onClick={() => setViewAndPersist("table")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                  view === "table"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
                }`}
              >
                <FiList size={14} />
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewAndPersist("board")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                  view === "board"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
                }`}
              >
                <FiGrid size={14} />
                Board
              </button>
            </div>
          </div>

          {/* Table or Board */}
          <div
            style={{ animationDelay: "320ms" }}
            className={
              view === "table"
                ? "animate-rise-in relative mt-2 overflow-hidden rounded-2xl border border-white/20 bg-white/60 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30"
                : "animate-rise-in relative mt-2"
            }
          >
            {view === "table" ? (
              <RequirementTable
                requirements={filteredRequirements}
                assignTrainerId={assignTrainerId}
              />
            ) : (
              <RequirementBoard
                requirements={filteredRequirements}
                assignTrainerId={assignTrainerId}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RequirementsPage;
