import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiMapPin,
  FiUser,
  FiZap,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";

import outreachApi from "../../../api/outreachApi";
import assignmentsApi from "../../../api/assignmentsApi";
import trainersApi from "../../../api/trainersApi";
import { useCountUp } from "../../../hooks/useCountUp";

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/*
|--------------------------------------------------------------------------
| Smart Next Action
|--------------------------------------------------------------------------
|
| The core "workflow, not CRUD" idea: instead of a flat menu the
| trainer has to interpret themselves, the dashboard looks at their
| actual state and tells them the single most useful thing to do next.
| Priority order: an incomplete profile costs them matches, so it
| outranks everything; then unanswered opportunities (time-sensitive);
| then nothing left to nudge — just reinforce that they're set.
|--------------------------------------------------------------------------
*/

const getNextAction = ({ profileCompletion, newOpportunitiesCount }) => {
  if (profileCompletion < 70) {
    return {
      tone: "amber",
      title: "Your profile is holding back your matches",
      description: `Your profile is ${profileCompletion}% complete. Vendors and our AI matching only see fully-built profiles first — finish yours to get matched with more opportunities.`,
      cta: "Complete Profile",
      path: "/trainer/profile",
    };
  }

  if (newOpportunitiesCount > 0) {
    return {
      tone: "blue",
      title: `You have ${newOpportunitiesCount} opportunit${
        newOpportunitiesCount === 1 ? "y" : "ies"
      } waiting on you`,
      description:
        "Vendors are waiting to hear back — confirming interest quickly improves your chances of being shortlisted.",
      cta: "Review Opportunities",
      path: "/trainer/opportunities",
    };
  }

  return {
    tone: "emerald",
    title: "You're all caught up",
    description:
      "No pending opportunities right now — we'll notify you the moment you're matched with a new one.",
    cta: "Browse Opportunities",
    path: "/trainer/opportunities",
  };
};

const TONE_STYLES = {
  amber: {
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white",
    icon: "bg-amber-500",
    button:
      "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 hover:shadow-amber-600/30",
  },
  blue: {
    card: "border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white",
    icon: "bg-blue-600",
    button:
      "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:shadow-blue-600/30",
  },
  emerald: {
    card: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white",
    icon: "bg-emerald-600",
    button:
      "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 hover:shadow-emerald-600/30",
  },
};

/*
|--------------------------------------------------------------------------
| Skeleton
|--------------------------------------------------------------------------
*/

const DashboardSkeleton = () => (
  <div className="mx-auto max-w-5xl animate-rise-in space-y-8 pb-12">
    <div className="space-y-2">
      <div className="skeleton h-8 w-72 rounded-lg" />
      <div className="skeleton h-4 w-96 rounded-full" />
    </div>
    <div className="skeleton h-28 w-full rounded-3xl" />
    <div className="grid gap-5 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 60}ms` }}
          className="skeleton animate-rise-in h-32 w-full rounded-2xl"
        />
      ))}
    </div>
    <div className="skeleton h-64 w-full rounded-3xl" />
  </div>
);

const TrainerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [outreachResponse, assignmentsResponse, profileResponse] =
          await Promise.all([
            outreachApi.getMine(),
            assignmentsApi.getMine(),
            trainersApi.getMyProfile().catch(() => null),
          ]);

        setOpportunities(outreachResponse?.outreach || []);
        setAssignments(assignmentsResponse?.data || []);
        setProfileCompletion(profileResponse?.trainer?.profileCompletion ?? 0);
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

  const nextAction = useMemo(
    () =>
      getNextAction({
        profileCompletion,
        newOpportunitiesCount: newOpportunities.length,
      }),
    [profileCompletion, newOpportunities.length],
  );

  const toneStyle = TONE_STYLES[nextAction.tone];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="animate-fade-in-up mx-auto max-w-5xl space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {getGreeting()}, {user?.name?.split(" ")[0] || "Trainer"}
        </h1>

        <p className="text-base font-medium text-slate-500/80">
          Here's what needs your attention today.
        </p>
      </div>

      {/* ================================================================
          SMART NEXT ACTION
      ================================================================= */}

      <div
        className={`hover-lift animate-rise-in relative overflow-hidden rounded-3xl border p-6 shadow-lg shadow-slate-200/40 sm:p-7 ${toneStyle.card}`}
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`animate-glow-pulse flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${toneStyle.icon}`}
            >
              <FiZap size={20} />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Next up for you
              </p>
              <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                {nextAction.title}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm text-slate-600">
                {nextAction.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(nextAction.path)}
            className={`press-scale group flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${toneStyle.button}`}
          >
            {nextAction.cta}
            <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Profile completion progress, only shown when it's the blocker */}
        {nextAction.tone === "amber" && (
          <div className="mt-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/70">
              <div
                className="animate-rise-in h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700 ease-out"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs font-semibold text-amber-700">
              {profileCompletion}% complete
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          index={0}
          icon={FiClipboard}
          label="New Opportunities"
          value={newOpportunities.length}
          onClick={() => navigate("/trainer/opportunities")}
          color="blue"
        />

        <StatCard
          index={1}
          icon={FiCalendar}
          label="Upcoming Assignments"
          value={upcomingAssignments.length}
          onClick={() => navigate("/trainer/assignments")}
          color="indigo"
        />

        <StatCard
          index={2}
          icon={FiCheckCircle}
          label="Completed Trainings"
          value={completedCount}
          onClick={() => navigate("/trainer/assignments")}
          color="emerald"
        />
      </div>

      {/* Latest Opportunities */}
      <div
        style={{ animationDelay: "180ms" }}
        className="hover-lift animate-rise-in rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Latest Opportunities
          </h2>

          <button
            type="button"
            onClick={() => navigate("/trainer/opportunities")}
            className="press-scale group flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-all duration-200 hover:text-blue-700"
          >
            View all
            <FiArrowUpRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {newOpportunities.length === 0 && (
            <p className="py-8 text-center text-sm font-medium text-slate-400/80">
              No new opportunities right now — we'll notify you as soon as
              you're matched with one.
            </p>
          )}

          {newOpportunities.slice(0, 3).map((record, index) => (
            <button
              key={record._id}
              type="button"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate("/trainer/opportunities")}
              className="press-scale animate-rise-in group flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-white/50 px-5 py-4 text-left shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/80 hover:bg-blue-50/70 hover:shadow-md"
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

              <span className="shrink-0 rounded-full border border-blue-200/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                {formatDate(record.requirementId?.startDate)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Assignments Preview */}
      <div
        style={{ animationDelay: "240ms" }}
        className="hover-lift animate-rise-in rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Upcoming Assignments
          </h2>

          <button
            type="button"
            onClick={() => navigate("/trainer/assignments")}
            className="press-scale group flex items-center gap-1.5 text-sm font-bold text-indigo-600 transition-all duration-200 hover:text-indigo-700"
          >
            View all
            <FiArrowUpRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {upcomingAssignments.length === 0 && (
            <p className="py-8 text-center text-sm font-medium text-slate-400/80">
              No confirmed assignments yet — accepted opportunities will show up
              here.
            </p>
          )}

          {upcomingAssignments.slice(0, 3).map((assignment, index) => (
            <button
              key={assignment._id}
              type="button"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => navigate("/trainer/assignments")}
              className="press-scale animate-rise-in group flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200/60 bg-white/50 px-5 py-4 text-left shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300/80 hover:bg-indigo-50/70 hover:shadow-md"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-800 group-hover:text-indigo-700">
                  {assignment.requirementId?.title || "Training Assignment"}
                </p>

                <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-slate-500">
                  <FiMapPin size={12} />
                  {assignment.requirementId?.city || "Online"}
                </p>
              </div>

              <span className="shrink-0 rounded-full border border-indigo-200/60 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-md">
                {formatDate(assignment.startDate)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile shortcut, only shown once profile is in good shape */}
      {profileCompletion >= 70 && (
        <button
          type="button"
          onClick={() => navigate("/trainer/profile")}
          style={{ animationDelay: "300ms" }}
          className="press-scale animate-rise-in flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/60 px-6 py-4 text-left shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FiUser size={16} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Your profile is {profileCompletion}% complete
            </p>
          </div>
          <span className="text-sm font-semibold text-slate-400">
            Keep it fresh &rarr;
          </span>
        </button>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, onClick, color, index = 0 }) => {
  const colorMap = {
    blue: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200/50",
    indigo:
      "from-indigo-500/10 to-purple-500/10 text-indigo-600 border-indigo-200/50",
    emerald:
      "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/50",
  };

  const iconBg = {
    blue: "from-blue-500 to-indigo-500",
    indigo: "from-indigo-500 to-purple-500",
    emerald: "from-emerald-500 to-teal-500",
  };

  const gradient = colorMap[color] || colorMap.blue;
  const animatedValue = useCountUp(value, { duration: 700 });

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ animationDelay: `${120 + index * 60}ms` }}
      className={`hover-lift press-scale animate-rise-in group relative overflow-hidden rounded-2xl border bg-white/80 p-6 text-left shadow-xl shadow-slate-200/40 backdrop-blur-sm ${gradient}`}
    >
      {/* Sheen sweep on hover */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

      <div className="relative flex items-center justify-between">
        <div
          className={`rounded-2xl bg-gradient-to-br p-3 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconBg[color] || iconBg.blue}`}
        >
          <Icon size={20} />
        </div>

        <FiArrowUpRight
          size={16}
          className="text-slate-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-500"
        />
      </div>

      <p
        key={animatedValue}
        className="animate-count-tick relative mt-5 text-3xl font-extrabold tracking-tight tabular-nums text-slate-900"
      >
        {animatedValue}
      </p>

      <p className="relative mt-1 text-sm font-medium text-slate-500/80">
        {label}
      </p>
    </button>
  );
};

export default TrainerDashboardPage;
