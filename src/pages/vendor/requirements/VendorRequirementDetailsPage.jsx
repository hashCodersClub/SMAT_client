import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit2,
  FiEye,
  FiMapPin,
  FiRefreshCw,
  FiSend,
  FiStar,
  FiUsers,
  FiX,
  FiVideo,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiBriefcase,
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";
import opportunitiesApi from "../../../api/opportunitiesApi";
import demoSessionsApi from "../../../api/demoSessionsApi";
import {
  OPPORTUNITY_STATUS_STYLES,
  formatStatusLabel,
} from "../../../constants/statuses";
import ActivityTimeline from "../../../components/ui/ActivityTimeline";
import { buildRequirementTimeline } from "../../../utils/requirementTimeline";
import ScheduleDemoModal from "../../../components/demo/ScheduleDemoModal";
import RequirementStatusTimeline from "../../../components/vendor/RequirementStatusTimeline";

const SOURCING_POLL_INTERVAL_MS = 15000;

// A trainer only becomes visible to the vendor once an admin has approved
// their rate-card response (opportunity.profileVisible from the API).
// This list is kept in sync as a fallback for older cached responses that
// may not include the profileVisible flag yet.
const PROFILE_VISIBLE_STATUSES = [
  "SHORTLISTED",
  "DEMO_REQUESTED",
  "DEMO_SCHEDULED",
  "DEMO_COMPLETED",
  "SELECTED",
];

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-indigo-50 text-indigo-700",
  OPEN: "bg-indigo-50 text-indigo-700",
  SOURCING: "bg-amber-50 text-amber-700",
  PROFILES_SENT: "bg-purple-50 text-purple-700",
  SHORTLISTED: "bg-cyan-50 text-cyan-700",
  TRAINER_SELECTED:
    "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/30",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const formatLabel = (value = "") =>
  value
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

const VendorRequirementDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [sourcing, setSourcing] = useState(null);
  const [sourcingLoading, setSourcingLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("INTERESTED"); // "INTERESTED" | "OVERVIEW"

  // Modal State
  const [demoModalCandidate, setDemoModalCandidate] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadRequirement = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await requirementsApi.getById(id);
      setRequirement(data.requirement);
    } catch (error) {
      console.error("Failed to load requirement:", error);
      setError(
        error.response?.data?.message || "Unable to load this requirement.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequirement();
  }, [loadRequirement]);

  const loadSourcing = useCallback(async () => {
    try {
      setSourcingLoading(true);
      const response = await opportunitiesApi.getByRequirementVendor(id);
      setSourcing({
        candidates: response.candidates || [],
        stats: response.stats || null,
      });
    } catch (error) {
      console.error("Failed to load sourcing status:", error);
      setSourcing({ candidates: [], stats: null });
    } finally {
      setSourcingLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSourcing();
    const interval = setInterval(loadSourcing, SOURCING_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadSourcing]);

  // Handle Schedule Demo Submit
  const handleScheduleDemoSubmit = async ({
    scheduledAt,
    meetingLink,
    notes,
  }) => {
    if (!demoModalCandidate) return;
    try {
      await demoSessionsApi.scheduleVendorDemo({
        opportunityId:
          demoModalCandidate._id || demoModalCandidate.opportunityId,
        demoSessionId: demoModalCandidate.currentDemoSessionId,
        scheduledAt,
        meetingLink,
        notes,
      });
      setActionSuccess(`Demo scheduled with ${demoModalCandidate.trainerName}`);
      setTimeout(() => setActionSuccess(""), 4000);
      await loadSourcing();
      await loadRequirement();
    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Failed to schedule demo.",
      );
    }
  };

  // Handle Select Trainer
  const handleSelectTrainer = async (candidate) => {
    if (
      !window.confirm(
        `Are you sure you want to select ${candidate.trainerName}? This will lock the requirement and automatically create an assignment pending trainer confirmation.`,
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(candidate._id);
      setError("");
      await opportunitiesApi.selectTrainer(candidate._id);
      setActionSuccess(
        `Selected ${candidate.trainerName}! Requirement status updated to TRAINER_SELECTED and Assignment created.`,
      );
      setTimeout(() => setActionSuccess(""), 5000);
      await loadRequirement();
      await loadSourcing();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to select trainer.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject Trainer
  const handleRejectTrainer = async (candidate) => {
    if (
      !window.confirm(
        `Are you sure you want to reject ${candidate.trainerName}?`,
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(candidate._id);
      setError("");
      await opportunitiesApi.rejectTrainer(candidate._id);
      setActionSuccess(`Trainer ${candidate.trainerName} marked as rejected.`);
      setTimeout(() => setActionSuccess(""), 4000);
      await loadSourcing();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to reject trainer.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const timelineEvents = buildRequirementTimeline(sourcing?.candidates || []);

  const interestedCandidates = (sourcing?.candidates || []).filter((c) =>
    [
      "INTERESTED",
      "MAYBE",
      "SHORTLISTED",
      "DEMO_REQUESTED",
      "DEMO_SCHEDULED",
      "DEMO_COMPLETED",
      "SELECTED",
    ].includes(c.status),
  );

  // Trainers who have been matched and sent the shortlist notification but
  // haven't responded yet. These never show up in interestedCandidates, so
  // without this list the vendor has no visibility into "who did we notify"
  // beyond the noisy per-trainer activity timeline entries.
  const notifiedCandidates = (sourcing?.candidates || []).filter(
    (c) => c.status === "PENDING_RESPONSE",
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={24}
            className="mx-auto animate-spin text-indigo-600"
          />
          <p className="mt-3 text-sm text-slate-500">Loading requirement...</p>
        </div>
      </div>
    );
  }

  if (error && !requirement) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/vendor/requirements")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <FiArrowLeft />
          Requirements
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <FiAlertCircle size={28} className="mx-auto text-red-500" />
          <h2 className="mt-3 font-semibold text-red-900">
            Unable to load requirement
          </h2>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadRequirement}
            className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isLocked =
    requirement?.status === "TRAINER_SELECTED" ||
    ["COMPLETED", "CANCELLED"].includes(requirement?.status);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/vendor/requirements")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <FiArrowLeft />
          Back to Requirements
        </button>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {requirement.title}
              </h1>

              <span
                className={`rounded-full px-3.5 py-1 text-xs font-bold ${
                  statusStyles[requirement.status] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {formatLabel(requirement.status)}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {formatLabel(requirement.trainingType)}
              {" • "}
              {formatLabel(requirement.mode)}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(`/vendor/requirements/${requirement._id}/edit`)
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiEdit2 />
            Edit Requirement
          </button>
        </div>
      </div>

      {/* Action Notification Messages */}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <FiCheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 flex items-center gap-2">
          <FiAlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("INTERESTED")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            activeTab === "INTERESTED"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FiUsers size={16} />
          Interested Trainers
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
            {interestedCandidates.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("OVERVIEW")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
            activeTab === "OVERVIEW"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FiBriefcase size={16} />
          Requirement Overview & Activity
        </button>
      </div>

      {/* INTERESTED TRAINERS TAB */}
      {activeTab === "INTERESTED" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Interested Trainers & Rate Cards
                </h2>
                <p className="text-sm text-slate-500">
                  Review trainers who expressed interest, compare rate cards,
                  schedule demos, or select your trainer.
                </p>
              </div>
              <button
                type="button"
                onClick={loadSourcing}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                <FiRefreshCw
                  size={13}
                  className={sourcingLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {sourcingLoading && !sourcing ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading interested trainers...
              </p>
            ) : !interestedCandidates.length ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                <FiUsers size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  No interested trainers yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Trainers matched with your requirement will appear here once
                  they express interest and submit rate cards.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {interestedCandidates.map((candidate) => {
                  const isSelected = candidate.status === "SELECTED";
                  const isRejected =
                    candidate.status === "REJECTED" ||
                    candidate.status === "NOT_SELECTED";
                  const isProfileVisible =
                    candidate.profileVisible ??
                    PROFILE_VISIBLE_STATUSES.includes(candidate.status);

                  // Trainer responded (submitted a rate card) but admin
                  // hasn't reviewed/approved them yet — don't reveal who
                  // they are or let the vendor act on them.
                  if (!isProfileVisible && !isRejected) {
                    return (
                      <div
                        key={candidate._id}
                        className="relative flex flex-col justify-between rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-slate-700 text-base flex items-center gap-2">
                                <FiClock className="text-amber-500" size={16} />
                                Trainer candidate
                              </h3>
                              <p className="mt-1 text-xs text-slate-500">
                                A trainer has responded to this requirement and
                                submitted their rate card. Our team is reviewing
                                it — their profile and rate card will appear
                                here once approved.
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700">
                              Pending Admin Review
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Current Status:
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-bold ${
                              OPPORTUNITY_STATUS_STYLES[candidate.status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {formatStatusLabel(candidate.status)}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={candidate._id}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20"
                          : isRejected
                            ? "border-slate-200 bg-slate-50/50 opacity-60"
                            : "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md"
                      }`}
                    >
                      <div>
                        {/* Top Bar: Name, Score & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 text-base">
                                {candidate.trainerName}
                              </h3>
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                                  <FiCheckCircle size={12} />
                                  Selected
                                </span>
                              )}
                            </div>
                            {candidate.city && (
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <FiMapPin size={12} />
                                {candidate.city}
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                              <FiAward size={12} />
                              {candidate.compatibilityScore ||
                                candidate.matchScore ||
                                85}
                              % Match
                            </span>
                          </div>
                        </div>

                        {/* Trainer Info Grid */}
                        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
                          <div>
                            <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                              Experience
                            </p>
                            <p className="font-bold text-slate-800 mt-0.5">
                              {candidate.experience
                                ? `${candidate.experience} Yrs`
                                : "5+ Yrs"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                              Rating
                            </p>
                            <p className="font-bold text-amber-600 mt-0.5 flex items-center justify-center gap-0.5">
                              <FiStar size={12} fill="currentColor" />
                              {candidate.rating ? candidate.rating : "4.8"}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                              Rate Card
                            </p>
                            <p className="font-bold text-emerald-700 mt-0.5">
                              {candidate.quotedRate
                                ? `₹${Number(candidate.quotedRate).toLocaleString("en-IN")}/day`
                                : "Standard"}
                            </p>
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-3">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                            Skills
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {candidate.skills?.length ? (
                              candidate.skills.slice(0, 4).map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">
                                Technical Trainer
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Opportunity Status Badge */}
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Current Status:
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 font-bold ${
                              OPPORTUNITY_STATUS_STYLES[candidate.status] ||
                              "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {formatStatusLabel(candidate.status)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-5 border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2">
                        {PROFILE_VISIBLE_STATUSES.includes(
                          candidate.status,
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/vendor/requirements/${requirement._id}/opportunities/${candidate._id}`,
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <FiEye size={13} />
                            View Profile
                          </button>
                        )}

                        <div className="flex items-center gap-2 ml-auto">
                          {/* Schedule Demo */}
                          {!isRejected && (
                            <button
                              type="button"
                              disabled={
                                isLocked || actionLoadingId === candidate._id
                              }
                              onClick={() => setDemoModalCandidate(candidate)}
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
                            >
                              <FiVideo size={13} />
                              {candidate.status === "DEMO_SCHEDULED"
                                ? "Reschedule Demo"
                                : "Schedule Demo"}
                            </button>
                          )}

                          {/* Select Trainer */}
                          {!isSelected && !isRejected && (
                            <button
                              type="button"
                              disabled={
                                isLocked || actionLoadingId === candidate._id
                              }
                              onClick={() => handleSelectTrainer(candidate)}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <FiCheckCircle size={13} />
                              Select Trainer
                            </button>
                          )}

                          {/* Reject Trainer */}
                          {!isSelected && !isRejected && (
                            <button
                              type="button"
                              disabled={
                                isLocked || actionLoadingId === candidate._id
                              }
                              onClick={() => handleRejectTrainer(candidate)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              <FiXCircle size={13} />
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OVERVIEW & ACTIVITY TAB */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Trainer Sourcing Stats Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">
                Sourcing Overview
              </h2>
              <button
                type="button"
                onClick={loadSourcing}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                <FiRefreshCw
                  size={13}
                  className={sourcingLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <SourcingStat
                label="Contacted"
                value={sourcing?.stats?.totalContacted ?? 0}
              />
              <SourcingStat
                label="Notified"
                value={sourcing?.stats?.notified ?? 0}
              />
              <SourcingStat
                label="Viewed"
                value={sourcing?.stats?.viewed ?? 0}
                icon={FiEye}
              />
              <SourcingStat
                label="Interested"
                value={sourcing?.stats?.interested ?? 0}
                icon={FiCheck}
                tone="emerald"
              />
              <SourcingStat
                label="Declined"
                value={sourcing?.stats?.declined ?? 0}
                icon={FiX}
                tone="slate"
              />
              <SourcingStat
                label="Shortlisted"
                value={sourcing?.stats?.shortlisted ?? 0}
                icon={FiStar}
                tone="purple"
              />
            </div>
          </div>

          {/* Notified Trainers — who was sent the shortlist mail/WhatsApp/in-app notification */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold text-slate-900">Notified Trainers</h2>
            <p className="mt-1 text-sm text-slate-500">
              Trainers matched and sent the shortlist notification, awaiting a
              response. Identities stay hidden until our team approves their
              rate card.
            </p>

            {!notifiedCandidates.length ? (
              <p className="mt-4 py-6 text-center text-sm text-slate-500">
                No trainers currently awaiting a response.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {notifiedCandidates.map((candidate, index) => (
                  <div
                    key={candidate._id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <FiSend size={14} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Trainer candidate #{index + 1}
                        </p>
                        <p className="text-xs text-slate-500">
                          {candidate.invitedAt
                            ? `Notified ${new Date(candidate.invitedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                            : "Notified"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {typeof candidate.matchScore === "number" && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                          {candidate.matchScore}% match
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${
                          OPPORTUNITY_STATUS_STYLES[candidate.status] ||
                          "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <FiClock size={11} />
                        Awaiting response
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trainer Interaction Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold text-slate-900">Activity Timeline</h2>
            <p className="mt-1 text-sm text-slate-500">
              Live updates as trainers are notified and respond.
            </p>
            <div className="mt-4">
              <ActivityTimeline
                events={timelineEvents}
                emptyMessage="No trainer activity yet."
              />
            </div>
          </div>

          {/* Quick details */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <QuickCard
              icon={FiCalendar}
              label="Start Date"
              value={formatDate(requirement.startDate)}
            />
            <QuickCard
              icon={FiCalendar}
              label="End Date"
              value={formatDate(requirement.endDate)}
            />
            <QuickCard
              icon={FiMapPin}
              label="Location"
              value={
                requirement.mode === "ONLINE"
                  ? "Online"
                  : requirement.city || "—"
              }
            />
            <QuickCard
              icon={FiUsers}
              label="Participants"
              value={requirement.participants || "—"}
            />
          </div>

          {/* Main details */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Section title="Training Information">
                <Detail
                  label="Training Type"
                  value={formatLabel(requirement.trainingType)}
                />
                <Detail label="Mode" value={formatLabel(requirement.mode)} />
                <Detail
                  label="Experience Required"
                  value={
                    requirement.experienceRequired !== undefined
                      ? `${requirement.experienceRequired} years`
                      : "—"
                  }
                />
                <Detail
                  label="Participants"
                  value={requirement.participants || "—"}
                />

                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Required Skills
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {requirement.skills?.length ? (
                      requirement.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">—</span>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Description">
                <div className="md:col-span-2">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {requirement.description || "No description provided."}
                  </p>
                </div>
              </Section>
            </div>

            <div className="space-y-6">
              <Section title="Commercial">
                <div className="md:col-span-2">
                  <Detail
                    label="Budget"
                    value={
                      requirement.budget > 0
                        ? `₹${Number(requirement.budget).toLocaleString("en-IN")}`
                        : "Not specified"
                    }
                  />
                  <div className="mt-4">
                    <Detail
                      label="Budget Type"
                      value={
                        requirement.budget > 0
                          ? formatLabel(requirement.budgetType)
                          : "—"
                      }
                    />
                  </div>
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Demo Modal */}
      <ScheduleDemoModal
        isOpen={Boolean(demoModalCandidate)}
        onClose={() => setDemoModalCandidate(null)}
        candidate={demoModalCandidate}
        onSubmit={handleScheduleDemoSubmit}
      />
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="font-semibold text-slate-900">{title}</h2>
    <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
  </section>
);

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <p className="mt-1.5 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

const QuickCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const SourcingStat = ({ label, value, icon: Icon, tone = "indigo" }) => {
  const toneStyles = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div
      className={`rounded-xl p-3 text-center ${toneStyles[tone] || toneStyles.indigo}`}
    >
      {Icon ? <Icon size={14} className="mx-auto mb-1" /> : null}
      <p className="text-lg font-extrabold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  );
};

export default VendorRequirementDetailsPage;
