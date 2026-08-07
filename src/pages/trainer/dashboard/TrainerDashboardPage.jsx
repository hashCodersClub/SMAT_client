import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiStar,
  FiZap,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import opportunitiesApi from "../../../api/opportunitiesApi";
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
  const [stats, setStats] = useState({
    pendingOpportunities: 0,
    interestedOpportunities: 0,
    selectedOpportunities: 0,
    expiredOpportunities: 0,
    averageMatchScore: 0,
  });
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [oppResponse, statsResponse, assignmentsResponse] = await Promise.all([
          opportunitiesApi.getMine({ page: 1, limit: 5 }),
          opportunitiesApi.getMineStats().catch(() => ({ stats: null })),
          assignmentsApi.getMine().catch(() => ({ data: [] })),
        ]);

        setOpportunities(oppResponse?.opportunities || []);
        if (statsResponse?.stats) setStats(statsResponse.stats);
        setAssignments(assignmentsResponse?.data || []);
      } catch (err) {
        console.error("Failed to load trainer dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const upcomingAssignments = assignments.filter(
    (assignment) => !["COMPLETED", "CANCELLED"].includes(assignment.status),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome, {user?.name || "Trainer"}
        </h1>

        <p className="text-base font-medium text-slate-500/80">
          Manage your training opportunities, assignments, and profile.
        </p>
      </div>

      {/* Phase E Stats Widgets */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FiClock}
          label="Pending Opportunities"
          value={loading ? "—" : stats.pendingOpportunities}
          onClick={() => navigate("/trainer/opportunities")}
          color="blue"
        />

        <StatCard
          icon={FiClipboard}
          label="Interested Opportunities"
          value={loading ? "—" : stats.interestedOpportunities}
          onClick={() => navigate("/trainer/opportunities")}
          color="emerald"
        />

        <StatCard
          icon={FiStar}
          label="Selected Opportunities"
          value={loading ? "—" : stats.selectedOpportunities}
          onClick={() => navigate("/trainer/opportunities")}
          color="indigo"
        />

        <StatCard
          icon={FiZap}
          label="Average Match Score"
          value={loading ? "—" : `${stats.averageMatchScore}%`}
          onClick={() => navigate("/trainer/opportunities")}
          color="purple"
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
            className="group flex items-center gap-1.5 text-sm font-bold text-indigo-600 transition-all hover:text-indigo-700"
          >
            View all portal
            <FiArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {!loading && opportunities.length === 0 && (
            <p className="py-8 text-center text-sm font-medium text-slate-400">
              No new opportunities right now — we'll notify you as soon as you're matched with one.
            </p>
          )}

          {opportunities.slice(0, 4).map((record) => {
            const requirement = record.requirementId || record.requirementSnapshot || {};
            return (
              <button
                key={record._id}
                type="button"
                onClick={() => navigate("/trainer/opportunities")}
                className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 text-left shadow-xs transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-md hover:scale-[1.005]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-extrabold text-slate-800 group-hover:text-indigo-600">
                      {requirement.title || "Training Requirement"}
                    </p>
                    {record.matchScore && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                        {record.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                    Client: Corporate Client • {requirement.city || "Online"} • Mode: {requirement.mode || "Online"}
                  </p>
                </div>

                <span className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
                  {formatDate(requirement.startDate)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, onClick, color }) => {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
    indigo: "bg-indigo-500/10 text-indigo-600 border-indigo-200/50",
    purple: "bg-purple-500/10 text-purple-600 border-purple-200/50",
  };

  const badgeStyle = colorMap[color] || colorMap.blue;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="relative flex items-center justify-between">
        <div className={`rounded-xl p-2.5 shadow-xs ${badgeStyle}`}>
          <Icon size={18} />
        </div>

        <FiArrowUpRight
          size={16}
          className="text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-500"
        />
      </div>

      <p className="relative mt-4 text-2xl font-black tracking-tight text-slate-900">
        {value}
      </p>

      <p className="relative mt-1 text-xs font-bold text-slate-400">
        {label}
      </p>
    </button>
  );
};

export default TrainerDashboardPage;
