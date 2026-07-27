import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiBriefcase,
  FiCalendar,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import assignmentsApi from "../../../api/assignmentsApi";

const statusStyles = {
  PROPOSED: "bg-violet-50 text-violet-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  ACTIVE: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to load assignments.";

const AssignmentsPage = () => {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Assignments
  |--------------------------------------------------------------------------
  */

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await assignmentsApi.getAll({
        limit: 100,
      });

      const records = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.assignments)
          ? response.assignments
          : [];

      setAssignments(records);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Filter
  |--------------------------------------------------------------------------
  */

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const requirement =
        assignment.requirementId && typeof assignment.requirementId === "object"
          ? assignment.requirementId
          : {};

      const trainer =
        assignment.trainerId && typeof assignment.trainerId === "object"
          ? assignment.trainerId
          : {};

      const vendor =
        assignment.vendorId && typeof assignment.vendorId === "object"
          ? assignment.vendorId
          : {};

      const searchableText = [
        requirement.title,
        trainer.name,
        trainer.email,
        vendor.companyName,
        assignment._id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesStatus = !status || assignment.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, status]);

  /*
  |--------------------------------------------------------------------------
  | Stats
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(
    () => ({
      total: assignments.length,

      proposed: assignments.filter(
        (assignment) => assignment.status === "PROPOSED",
      ).length,

      confirmed: assignments.filter(
        (assignment) => assignment.status === "CONFIRMED",
      ).length,

      active: assignments.filter((assignment) => assignment.status === "ACTIVE")
        .length,
    }),
    [assignments],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage trainer engagements from proposal through completion.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAssignments}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={FiBriefcase}
          label="Total Assignments"
          value={stats.total}
        />

        <Stat icon={FiUser} label="Proposed" value={stats.proposed} />

        <Stat icon={FiCalendar} label="Confirmed" value={stats.confirmed} />

        <Stat icon={FiCalendar} label="Active" value={stats.active} />
      </div>

      {/* ERROR */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle className="mt-0.5 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load assignments
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* FILTERS */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search requirement, trainer or vendor..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PROPOSED">Proposed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading assignments...
            </p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiBriefcase />
            </div>

            <p className="mt-4 font-semibold text-slate-700">
              No assignments found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {assignments.length === 0
                ? "Assignments will appear here after a trainer is assigned to a requirement."
                : "Try changing your search or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {[
                    "Requirement",
                    "Trainer",
                    "Vendor",
                    "Schedule",
                    "Rate",
                    "Status",
                    "Actions",
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
                {filteredAssignments.map((assignment) => {
                  const requirement =
                    assignment.requirementId &&
                    typeof assignment.requirementId === "object"
                      ? assignment.requirementId
                      : {};

                  const trainer =
                    assignment.trainerId &&
                    typeof assignment.trainerId === "object"
                      ? assignment.trainerId
                      : {};

                  const vendor =
                    assignment.vendorId &&
                    typeof assignment.vendorId === "object"
                      ? assignment.vendorId
                      : {};

                  return (
                    <tr key={assignment._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {requirement.title || "Requirement"}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                          {assignment._id}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FiUser className="shrink-0 text-slate-400" />

                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {trainer.name || "—"}
                            </p>

                            {trainer.email && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {trainer.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {vendor.companyName || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {formatDate(assignment.startDate)}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          to {formatDate(assignment.endDate)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          ₹
                          {Number(assignment.trainerRate || 0).toLocaleString(
                            "en-IN",
                          )}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {assignment.rateType
                            ?.replaceAll("_", " ")
                            .toLowerCase() || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[assignment.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/assignments/${assignment._id}`)
                          }
                          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <FiEye />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>

        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>

      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
        <Icon />
      </div>
    </div>
  </div>
);

export default AssignmentsPage;
