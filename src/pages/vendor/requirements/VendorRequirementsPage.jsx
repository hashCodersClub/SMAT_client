import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiAlertCircle,
  FiCalendar,
  FiCpu,
  FiEye,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";

/*
|--------------------------------------------------------------------------
| Status Styles
|--------------------------------------------------------------------------
*/

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-50 text-blue-700",
  OPEN: "bg-indigo-50 text-indigo-700",
  SOURCING: "bg-amber-50 text-amber-700",
  PROFILES_SENT: "bg-purple-50 text-purple-700",
  SHORTLISTED: "bg-cyan-50 text-cyan-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatStatus = (status = "") =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatBudgetType = (value = "") =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

/*
|--------------------------------------------------------------------------
| Vendor Requirements Page
|--------------------------------------------------------------------------
*/

const VendorRequirementsPage = () => {
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Requirements
  |--------------------------------------------------------------------------
  */

  const loadRequirements = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await requirementsApi.getAll({
        limit: 100,
      });

      setRequirements(data.requirements || []);
    } catch (error) {
      console.error("Failed to load requirements:", error);

      setError(error.response?.data?.message || "Unable to load requirements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const fetchInitialData = async () => {
      try {
        const data = await requirementsApi.getAll({ limit: 100 });
        if (isSubscribed) {
          setRequirements(data.requirements || []);
          setError("");
        }
      } catch (error) {
        if (isSubscribed) {
          console.error("Failed to load requirements:", error);
          setError(error.response?.data?.message || "Unable to load requirements.");
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Client-side Filters
  |--------------------------------------------------------------------------
  */

  const filteredRequirements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requirements.filter((requirement) => {
      const matchesSearch =
        !query ||
        requirement.title?.toLowerCase().includes(query) ||
        requirement.city?.toLowerCase().includes(query) ||
        requirement.skills?.some((skill) =>
          skill.toLowerCase().includes(query),
        );

      const matchesStatus = !status || requirement.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [requirements, search, status]);

  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    return {
      total: requirements.length,

      submitted: requirements.filter((requirement) =>
        ["SUBMITTED", "OPEN"].includes(requirement.status),
      ).length,

      sourcing: requirements.filter((requirement) =>
        ["SOURCING", "PROFILES_SENT", "SHORTLISTED"].includes(
          requirement.status,
        ),
      ).length,

      confirmed: requirements.filter((requirement) =>
        ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(requirement.status),
      ).length,
    };
  }, [requirements]);

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
            size={24}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">Loading requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Requirements
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Submit and track your training requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/requirements/smart")}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:from-indigo-700 hover:to-purple-700"
          >
            <FiCpu />
            ✨ AI Requirement Parser
          </button>

          <button
            type="button"
            onClick={() => navigate("/vendor/requirements/add")}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiPlus />
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
          STATS
      ================================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={stats.total} />

        <StatCard label="Submitted" value={stats.submitted} />

        <StatCard label="Sourcing" value={stats.sourcing} />

        <StatCard label="Confirmed" value={stats.confirmed} />
      </div>

      {/* ================================================================
          FILTERS
      ================================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <FiSearch
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requirement, skill or city..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 md:w-52"
          >
            <option value="">All Statuses</option>

            <option value="SUBMITTED">Submitted</option>

            <option value="OPEN">Open</option>

            <option value="SOURCING">Sourcing</option>

            <option value="PROFILES_SENT">Profiles Sent</option>

            <option value="SHORTLISTED">Shortlisted</option>

            <option value="CONFIRMED">Confirmed</option>

            <option value="IN_PROGRESS">In Progress</option>

            <option value="COMPLETED">Completed</option>

            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ================================================================
          RESULT COUNT
      ================================================================= */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredRequirements.length}
          </span>{" "}
          requirements
        </p>

        <button
          type="button"
          onClick={loadRequirements}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* ================================================================
          EMPTY STATE
      ================================================================= */}

      {!filteredRequirements.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FiSearch size={21} />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            No requirements found
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {requirements.length
              ? "Try changing your search or status filter."
              : "You haven't submitted any training requirements yet."}
          </p>

          {!requirements.length && (
            <button
              type="button"
              onClick={() => navigate("/vendor/requirements/add")}
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create First Requirement
            </button>
          )}
        </div>
      ) : (
        /* ================================================================
           TABLE
        ================================================================= */

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {[
                    "Requirement",
                    "Schedule",
                    "Location",
                    "Budget",
                    "Status",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRequirements.map((requirement) => (
                  <tr
                    key={requirement._id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Requirement */}

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {requirement.title}
                      </p>

                      <div className="mt-2 flex max-w-[300px] flex-wrap gap-1">
                        {requirement.skills?.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}

                        {requirement.skills?.length > 3 && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                            +{requirement.skills.length - 3}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatStatus(requirement.trainingType)}
                      </p>
                    </td>

                    {/* Schedule */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <FiCalendar className="text-slate-400" />

                        {formatDate(requirement.startDate)}
                      </div>

                      <p className="mt-1 pl-6 text-xs text-slate-400">
                        to {formatDate(requirement.endDate)}
                      </p>
                    </td>

                    {/* Location */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <FiMapPin className="text-slate-400" />

                        {requirement.city ||
                          (requirement.mode === "ONLINE" ? "Online" : "—")}
                      </div>

                      <p className="mt-1 pl-6 text-xs text-slate-400">
                        {formatStatus(requirement.mode)}
                      </p>
                    </td>

                    {/* Budget */}

                    <td className="px-5 py-4">
                      {requirement.budget > 0 ? (
                        <>
                          <p className="font-semibold text-slate-800">
                            ₹
                            {Number(requirement.budget).toLocaleString("en-IN")}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatBudgetType(requirement.budgetType)}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Not specified
                        </span>
                      )}
                    </td>

                    {/* Status */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[requirement.status] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {formatStatus(requirement.status)}
                      </span>
                    </td>

                    {/* Action */}

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/vendor/requirements/${requirement._id}`)
                        }
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        <FiEye />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Stat Card
|--------------------------------------------------------------------------
*/

const StatCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm font-medium text-slate-500">{label}</p>

    <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

export default VendorRequirementsPage;
