import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";
import assignmentsApi from "../../../api/assignmentsApi";

/*
|--------------------------------------------------------------------------
| Status Styles (mirrors VendorRequirementsPage so badges look identical
| wherever a requirement status shows up across the portal)
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

const formatStatus = (status = "") =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/*
|--------------------------------------------------------------------------
| Vendor Dashboard
|--------------------------------------------------------------------------
*/

const VendorDashboardPage = () => {
  const navigate = useNavigate();

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
    let ignore = false;
    const fetchDashboard = async () => {
      try {
        setError("");
        const [requirementsRes, assignmentsRes] = await Promise.all([
          requirementsApi.getAllMine(),
          assignmentsApi.getMine(),
        ]);
        if (!ignore) {
          setRequirements(requirementsRes.requirements || []);
          setAssignments(assignmentsRes?.data || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load dashboard:", err);
          setError(err.response?.data?.message || "Unable to load your dashboard.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Derived Data
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const inProgress = requirements.filter((requirement) =>
      ["SOURCING", "PROFILES_SENT", "SHORTLISTED"].includes(requirement.status),
    ).length;

    const confirmed = requirements.filter((requirement) =>
      ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(requirement.status),
    ).length;

    const activeAssignments = assignments.filter(
      (assignment) => !["COMPLETED", "CANCELLED"].includes(assignment.status),
    ).length;

    return {
      total: requirements.length,
      inProgress,
      confirmed,
      activeAssignments,
    };
  }, [requirements, assignments]);

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

          <p className="mt-3 text-sm text-slate-500">Loading dashboard...</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track your training requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/vendor/requirements/add")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlus />
          New Requirement
        </button>
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

      {/* ================================================================
          STATS
      ================================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Requirements"
          value={stats.total}
          icon={FiClipboard}
          onClick={() => navigate("/vendor/requirements")}
        />

        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={FiClock}
          onClick={() => navigate("/vendor/requirements")}
        />

        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          icon={FiCheckCircle}
          onClick={() => navigate("/vendor/requirements")}
        />

        <StatCard
          title="Active Assignments"
          value={stats.activeAssignments}
          icon={FiUser}
          onClick={() => navigate("/vendor/assignments")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ================================================================
            RECENT REQUIREMENTS
        ================================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Recent Requirements
            </h2>

            {!!recentRequirements.length && (
              <button
                type="button"
                onClick={() => navigate("/vendor/requirements")}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                View all
                <FiArrowRight size={14} />
              </button>
            )}
          </div>

          {recentRequirements.length ? (
            <div className="mt-4 divide-y divide-slate-100">
              {recentRequirements.map((requirement) => (
                <button
                  key={requirement._id}
                  type="button"
                  onClick={() =>
                    navigate(`/vendor/requirements/${requirement._id}`)
                  }
                  className="flex w-full flex-col gap-2 py-4 text-left transition first:pt-0 last:pb-0 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {requirement.title}
                    </p>

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

                  <span
                    className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusStyles[requirement.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatStatus(requirement.status)}
                  </span>
                </button>
              ))}
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
                className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Create Requirement
              </button>
            </div>
          )}
        </div>

        {/* ================================================================
            UPCOMING ASSIGNMENTS
        ================================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              Upcoming Assignments
            </h2>

            {!!upcomingAssignments.length && (
              <button
                type="button"
                onClick={() => navigate("/vendor/assignments")}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                View all
                <FiArrowRight size={14} />
              </button>
            )}
          </div>

          {upcomingAssignments.length ? (
            <div className="mt-4 space-y-4">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment._id}>
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {assignment.requirementId?.title || "Training Assignment"}
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
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

const StatCard = ({ title, value, icon: Icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Icon size={20} />
        </div>
      </div>
    </button>
  );
};

export default VendorDashboardPage;
