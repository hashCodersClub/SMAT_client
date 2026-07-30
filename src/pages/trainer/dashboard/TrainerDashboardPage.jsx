import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";

import outreachApi from "../../../api/outreachApi";
import assignmentsApi from "../../../api/assignmentsApi";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const TrainerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [outreachResponse, assignmentsResponse] = await Promise.all([
          outreachApi.getMine(),
          assignmentsApi.getMine(),
        ]);

        setOpportunities(outreachResponse?.outreach || []);
        setAssignments(assignmentsResponse?.data || []);
      } catch (err) {
        console.error("Failed to load trainer dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const newOpportunities = opportunities.filter((record) =>
    ["NOT_CONTACTED", "CONTACTED"].includes(record.outreachStatus),
  );

  const upcomingAssignments = assignments.filter(
    (assignment) => !["COMPLETED", "CANCELLED"].includes(assignment.status),
  );

  const completedCount = assignments.filter(
    (assignment) => assignment.status === "COMPLETED",
  ).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome, {user?.name || "Trainer"}
        </h1>

        <p className="text-base font-medium text-slate-500/80">
          Manage your training opportunities, assignments and profile.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          icon={FiClipboard}
          label="New Opportunities"
          value={loading ? "—" : newOpportunities.length}
          onClick={() => navigate("/trainer/opportunities")}
          color="blue"
        />

        <StatCard
          icon={FiCalendar}
          label="Upcoming Assignments"
          value={loading ? "—" : upcomingAssignments.length}
          onClick={() => navigate("/trainer/assignments")}
          color="indigo"
        />

        <StatCard
          icon={FiCheckCircle}
          label="Completed Trainings"
          value={loading ? "—" : completedCount}
          onClick={() => navigate("/trainer/assignments")}
          color="emerald"
        />
      </div>

      {/* Latest Opportunities */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-slate-300/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Latest Opportunities
          </h2>

          <button
            type="button"
            onClick={() => navigate("/trainer/opportunities")}
            className="group flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-all hover:text-blue-700"
          >
            View all
            <FiArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {!loading && newOpportunities.length === 0 && (
            <p className="py-8 text-center text-sm font-medium text-slate-400/80">
              No new opportunities right now — we'll notify you as soon as
              you're matched with one.
            </p>
          )}

          {newOpportunities.slice(0, 3).map((record) => (
            <button
              key={record._id}
              type="button"
              onClick={() => navigate("/trainer/opportunities")}
              className="group flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-white/50 px-5 py-4 text-left shadow-sm backdrop-blur-sm transition-all hover:border-blue-300/80 hover:bg-blue-50/70 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-800 group-hover:text-blue-700">
                  {record.requirementId?.title || "Training Requirement"}
                </p>

                <p className="mt-1 truncate text-sm font-medium text-slate-500">
                  {record.requirementId?.vendorId?.companyName || "Vendor"} •{" "}
                  {record.requirementId?.city || "Online"}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-blue-200/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm backdrop-blur-sm transition-all group-hover:shadow-md group-hover:scale-105">
                {formatDate(record.requirementId?.startDate)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, onClick, color }) => {
  const colorMap = {
    blue: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200/50",
    indigo:
      "from-indigo-500/10 to-purple-500/10 text-indigo-600 border-indigo-200/50",
    emerald:
      "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/50",
  };

  const gradient = colorMap[color] || colorMap.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border bg-white/80 p-6 text-left shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] ${gradient}`}
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-center justify-between">
        <div className="rounded-2xl bg-gradient-to-br p-3 text-white shadow-md shadow-current/20">
          <Icon size={20} />
        </div>

        <FiArrowUpRight
          size={16}
          className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-500"
        />
      </div>

      <p className="relative mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="relative mt-1 text-sm font-medium text-slate-500/80">
        {label}
      </p>
    </button>
  );
};

export default TrainerDashboardPage;
