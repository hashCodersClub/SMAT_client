import React from "react";
import {
  FiFileText,
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiCalendar,
  FiAward,
} from "react-icons/fi";

const STAGES = [
  {
    key: "SUBMITTED",
    title: "Submitted",
    description: "Requirement submitted by vendor",
    icon: FiFileText,
    statuses: ["SUBMITTED", "DRAFT"],
  },
  {
    key: "SOURCING",
    title: "Sourcing & Shortlisting",
    description: "Top trainers matched & notified (Email, WhatsApp, In-App)",
    icon: FiSearch,
    statuses: ["SOURCING", "OPEN"],
  },
  {
    key: "PROFILES_SENT",
    title: "Rate Cards & Profiles",
    description: "Trainers responding with rate cards & availability",
    icon: FiUsers,
    statuses: ["PROFILES_SENT", "SHORTLISTED"],
  },
  {
    key: "TRAINER_SELECTED",
    title: "Trainer Selected",
    description: "Trainer selected for requirement assignment",
    icon: FiAward,
    statuses: ["TRAINER_SELECTED"],
  },
  {
    key: "CONFIRMED",
    title: "Confirmed & In Progress",
    description: "Schedule confirmed & training underway",
    icon: FiCalendar,
    statuses: ["CONFIRMED", "IN_PROGRESS"],
  },
  {
    key: "COMPLETED",
    title: "Completed",
    description: "Training successfully delivered",
    icon: FiCheckCircle,
    statuses: ["COMPLETED"],
  },
];

const STAGE_ORDER = [
  "DRAFT",
  "SUBMITTED",
  "OPEN",
  "SOURCING",
  "PROFILES_SENT",
  "SHORTLISTED",
  "TRAINER_SELECTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

export const RequirementStatusTimeline = ({ currentStatus = "SUBMITTED" }) => {
  if (currentStatus === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5 text-center">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold mb-2">
          ✕
        </div>
        <h3 className="text-base font-bold text-red-900">Requirement Cancelled</h3>
        <p className="text-xs text-red-700 mt-1">
          This requirement has been marked as cancelled.
        </p>
      </div>
    );
  }

  const currentIndex = STAGE_ORDER.indexOf(currentStatus);

  const getStageState = (stage) => {
    const isCurrent = stage.statuses.includes(currentStatus);
    const stageMaxIndex = Math.max(
      ...stage.statuses.map((s) => STAGE_ORDER.indexOf(s)),
    );
    const isCompleted = currentIndex > stageMaxIndex;

    if (isCurrent) return "CURRENT";
    if (isCompleted) return "COMPLETED";
    return "UPCOMING";
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Requirement Timeline & Lifecycle
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time status tracking from submission to completion
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
          Current Status: {currentStatus.replace(/_/g, " ")}
        </span>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const state = getStageState(stage);

            return (
              <div
                key={stage.key}
                className={`relative flex flex-col items-center rounded-2xl p-4 text-center transition-all ${
                  state === "CURRENT"
                    ? "bg-indigo-50/80 border-2 border-indigo-500 shadow-md ring-4 ring-indigo-500/10"
                    : state === "COMPLETED"
                    ? "bg-emerald-50/40 border border-emerald-200"
                    : "bg-slate-50/60 border border-slate-200/60 opacity-60"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 font-bold transition ${
                    state === "CURRENT"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : state === "COMPLETED"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <h3 className="text-xs font-extrabold text-slate-900 leading-tight">
                  {stage.title}
                </h3>

                <p className="mt-1 text-[11px] font-medium text-slate-500 leading-snug">
                  {stage.description}
                </p>

                {state === "CURRENT" && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    In Progress
                  </span>
                )}

                {state === "COMPLETED" && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    ✓ Done
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RequirementStatusTimeline;
