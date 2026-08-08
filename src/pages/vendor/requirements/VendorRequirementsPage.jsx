import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiAlertCircle,
  FiCalendar,
  FiCpu,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";

/*
|--------------------------------------------------------------------------
| Pipeline Stages
|--------------------------------------------------------------------------
|
| The board groups every requirement status into one of these workflow
| stages. This is the core shift from the old table view: instead of a
| flat list you scan row by row, requirements are grouped by where they
| actually sit in the sourcing lifecycle — the same way a vendor would
| think about their own pipeline.
|--------------------------------------------------------------------------
*/

const STAGES = [
  {
    key: "DRAFT",
    label: "Draft",
    statuses: ["DRAFT"],
    dot: "bg-slate-400",
    ring: "group-hover:border-slate-300",
    chip: "bg-slate-100 text-slate-600",
  },
  {
    key: "SUBMITTED",
    label: "Submitted",
    statuses: ["SUBMITTED", "OPEN"],
    dot: "bg-indigo-500",
    ring: "group-hover:border-indigo-200",
    chip: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "SOURCING",
    label: "Sourcing",
    statuses: ["SOURCING", "PROFILES_SENT"],
    dot: "bg-amber-500",
    ring: "group-hover:border-amber-200",
    chip: "bg-amber-50 text-amber-600",
  },
  {
    key: "SHORTLISTED",
    label: "Shortlisted",
    statuses: ["SHORTLISTED"],
    dot: "bg-cyan-500",
    ring: "group-hover:border-cyan-200",
    chip: "bg-cyan-50 text-cyan-600",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    statuses: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"],
    dot: "bg-emerald-500",
    ring: "group-hover:border-emerald-200",
    chip: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    statuses: ["CANCELLED"],
    dot: "bg-rose-400",
    ring: "group-hover:border-rose-200",
    chip: "bg-rose-50 text-rose-600",
  },
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const formatCompactBudget = (value) => {
  const num = Number(value);
  if (!num) return null;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
  return `₹${num}`;
};

/*
|--------------------------------------------------------------------------
| Vendor Requirements Page (Pipeline Board)
|--------------------------------------------------------------------------
*/

const VendorRequirementsPage = () => {
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadRequirements = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await requirementsApi.getAll({ limit: 100 });

      setRequirements(data.requirements || []);
    } catch (err) {
      console.error("Failed to load requirements:", err);
      setError(err.response?.data?.message || "Unable to load requirements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requirements;

    return requirements.filter(
      (requirement) =>
        requirement.title?.toLowerCase().includes(query) ||
        requirement.city?.toLowerCase().includes(query) ||
        requirement.skills?.some((skill) =>
          skill.toLowerCase().includes(query),
        ),
    );
  }, [requirements, search]);

  const columns = useMemo(() => {
    return STAGES.map((stage) => ({
      ...stage,
      items: filteredRequirements.filter((requirement) =>
        stage.statuses.includes(requirement.status),
      ),
    }));
  }, [filteredRequirements]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={22}
            className="mx-auto animate-spin text-indigo-600"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading your pipeline...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Vendor Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Requirements
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your sourcing pipeline, at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/requirements/smart")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:text-indigo-600"
          >
            <FiCpu size={15} />
            AI Parser
          </button>

          <button
            type="button"
            onClick={() => navigate("/vendor/requirements/add")}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]"
          >
            <FiPlus size={15} />
            New Requirement
          </button>
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
            onClick={loadRequirements}
            className="text-sm font-semibold text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================================================
          SEARCH BAR
      ================================================================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <FiSearch
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search requirement, skill, or city..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <button
          type="button"
          onClick={loadRequirements}
          className="flex shrink-0 items-center gap-2 self-start text-sm font-medium text-slate-500 transition hover:text-slate-900 sm:self-auto"
        >
          <FiRefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ================================================================
          EMPTY STATE (no requirements at all)
      ================================================================= */}

      {!requirements.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600">
            <FiSearch size={21} />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">
            Your pipeline is empty
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Submit your first training requirement to start tracking it through
            sourcing, shortlisting, and confirmation.
          </p>
          <button
            type="button"
            onClick={() => navigate("/vendor/requirements/add")}
            className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]"
          >
            Create First Requirement
          </button>
        </div>
      ) : (
        /* ================================================================
           PIPELINE BOARD
        ================================================================= */

        <div className="-mx-4 flex flex-1 gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
          {columns.map((column) => (
            <div
              key={column.key}
              className="flex w-72 shrink-0 flex-col rounded-2xl bg-slate-100/60 p-3"
            >
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                  <p className="text-sm font-semibold text-slate-700">
                    {column.label}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm">
                  {column.items.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2.5">
                {column.items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300/80 px-3 py-6 text-center text-xs text-slate-400">
                    No requirements
                  </div>
                ) : (
                  column.items.map((requirement) => (
                    <button
                      key={requirement._id}
                      type="button"
                      onClick={() =>
                        navigate(`/vendor/requirements/${requirement._id}`)
                      }
                      className={`group rounded-xl border border-transparent bg-white p-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${column.ring}`}
                    >
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                        {requirement.title}
                      </p>

                      {requirement.skills?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {requirement.skills.slice(0, 2).map((skill) => (
                            <span
                              key={skill}
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${column.chip}`}
                            >
                              {skill}
                            </span>
                          ))}
                          {requirement.skills.length > 2 && (
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              +{requirement.skills.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar size={11} />
                          {formatDate(requirement.startDate)}
                        </span>

                        <span className="flex items-center gap-1 truncate">
                          <FiMapPin size={11} />
                          {requirement.city ||
                            (requirement.mode === "ONLINE" ? "Online" : "—")}
                        </span>
                      </div>

                      {formatCompactBudget(requirement.budget) && (
                        <p className="mt-2 text-xs font-semibold text-slate-600">
                          {formatCompactBudget(requirement.budget)}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorRequirementsPage;
