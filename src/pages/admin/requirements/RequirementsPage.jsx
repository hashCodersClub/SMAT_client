import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiUserCheck,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiBriefcase,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";

import RequirementStats from "../../../components/admin/requirements/RequirementStats";
import RequirementFilters from "../../../components/admin/requirements/RequirementFilters";
import RequirementTable from "../../../components/admin/requirements/RequirementTable";

import requirementsApi from "../../../api/requirementsApi";
import trainersApi from "../../../api/trainersApi";
import { mapTrainerFromApi } from "../../../utils/trainerAdapter";

// ---------- Helper for stats ----------
const getStats = (requirements) => {
  const total = requirements.length;
  const open = requirements.filter((r) => r.status === "OPEN").length;
  const sourcing = requirements.filter((r) => r.status === "SOURCING").length;
  const confirmed = requirements.filter((r) => r.status === "CONFIRMED").length;

  return [
    {
      label: "Total Requirements",
      value: total,
      trend: "+3 this week",
      trendUp: true,
      color: "from-indigo-500 to-blue-400",
      icon: FiBriefcase,
      filterKey: null,
    },
    {
      label: "Open",
      value: open,
      trend: "+1 new today",
      trendUp: true,
      color: "from-blue-500 to-cyan-400",
      icon: FiClock,
      filterKey: "status",
      filterValue: "OPEN",
    },
    {
      label: "Sourcing",
      value: sourcing,
      trend: "-2 from yesterday",
      trendUp: false,
      color: "from-amber-500 to-orange-400",
      icon: FiAlertCircle,
      filterKey: "status",
      filterValue: "SOURCING",
    },
    {
      label: "Confirmed",
      value: confirmed,
      trend: "+1 this week",
      trendUp: true,
      color: "from-emerald-500 to-teal-400",
      icon: FiCheckCircle,
      filterKey: "status",
      filterValue: "CONFIRMED",
    },
  ];
};

const RequirementsPage = () => {
  const navigate = useNavigate();

  // ---------- Data State ----------
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- Filter State ----------
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [priority, setPriority] = useState("");

  // ---------- Assign-Trainer Hand-off ----------
  const [searchParams, setSearchParams] = useSearchParams();
  const assignTrainerId = searchParams.get("assignTrainerId") || "";
  const [assignTrainer, setAssignTrainer] = useState(null);

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
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-95"
        >
          <FiPlus className="h-4 w-4" />
          New Requirement
        </button>
      </div>

      {/* Assign Trainer Banner */}
      {assignTrainerId && (
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-blue-200/80 bg-white/80 px-5 py-4 backdrop-blur-sm dark:border-blue-800/30 dark:bg-slate-800/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-blue-800 dark:text-blue-300">
              <div className="rounded-full bg-blue-100/70 p-1.5 dark:bg-blue-900/30">
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
              className="inline-flex items-center gap-1 self-start rounded-full bg-blue-100/70 px-4 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-200/80 dark:bg-blue-800/30 dark:text-blue-300 dark:hover:bg-blue-800/50 sm:self-auto"
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
        <div className="relative mt-8 flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-xl">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-30 animate-pulse" />
            <FiRefreshCw className="relative h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
            Loading requirements…
          </p>
        </div>
      ) : error ? (
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-red-200/80 bg-white/80 p-6 backdrop-blur-sm shadow-lg shadow-red-100/20">
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
              className="rounded-full bg-red-100/80 px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200/80 hover:shadow-md active:scale-95 dark:bg-red-800/30 dark:text-red-300 dark:hover:bg-red-800/50"
            >
              Retry
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const isActive = status === stat.filterValue;

              return (
                <button
                  key={stat.label}
                  onClick={() => handleStatClick(stat)}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isActive
                    ? "border-blue-500 bg-blue-50/80 shadow-blue-100/50 dark:border-blue-400 dark:bg-blue-900/20"
                    : "border-white/20 bg-white/60 backdrop-blur-sm hover:border-slate-200/80 dark:border-slate-700/50 dark:bg-slate-800/30 dark:hover:border-slate-600/80"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${stat.trendUp
                        ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-rose-100/80 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
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
                  <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30">
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

          {/* Result count */}
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {filteredRequirements.length}
            </span>{" "}
            requirements
          </p>

          {/* Table */}
          <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/20 bg-white/60 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30">
            <RequirementTable
              requirements={filteredRequirements}
              assignTrainerId={assignTrainerId}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default RequirementsPage;
