import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiStar,
  FiUser,
  FiVideo,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import opportunitiesApi from "../../../api/opportunitiesApi";
import demoSessionsApi from "../../../api/demoSessionsApi";

import {
  OPPORTUNITY_STATUS_STYLES,
  formatStatusLabel,
} from "../../../constants/statuses";

const DEMO_MEETING_MODES = ["ZOOM", "MEET", "TEAMS"];

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
      OPPORTUNITY_STATUS_STYLES[status] ||
      "bg-slate-100 text-slate-700 ring-slate-200"
    }`}
  >
    {formatStatusLabel(status)}
  </span>
);

/*
|--------------------------------------------------------------------------
| Schedule Demo Form
|--------------------------------------------------------------------------
*/
const ScheduleDemoForm = ({ onSubmit, submitting, onCancel }) => {
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(30);
  const [meetingMode, setMeetingMode] = useState("ZOOM");
  const [meetingLink, setMeetingLink] = useState("");

  return (
    <div className="rounded-xl border border-violet-200 bg-white p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Duration (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="480"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Meeting Mode
          </label>
          <select
            value={meetingMode}
            onChange={(e) => setMeetingMode(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
          >
            {DEMO_MEETING_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Meeting Link
          </label>
          <input
            type="url"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={submitting || !scheduledAt || !meetingLink}
          onClick={() =>
            onSubmit({
              scheduledAt,
              duration: Number(duration),
              meetingMode,
              meetingLink,
            })
          }
          className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-bold text-white hover:bg-violet-700 transition disabled:opacity-50"
        >
          {submitting ? "Scheduling…" : "Confirm Schedule"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Complete Demo Form
|--------------------------------------------------------------------------
*/
const CompleteDemoForm = ({ onSubmit, submitting, onCancel }) => {
  const [vendorFeedback, setVendorFeedback] = useState("");
  const [trainerNoShow, setTrainerNoShow] = useState(false);

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-4 space-y-3">
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-500">
          Vendor Feedback
        </label>
        <textarea
          value={vendorFeedback}
          onChange={(e) => setVendorFeedback(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="How did the demo go?"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={trainerNoShow}
          onChange={(e) => setTrainerNoShow(e.target.checked)}
          className="rounded border-slate-300"
        />
        Trainer did not show up
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={submitting}
          onClick={() => onSubmit({ vendorFeedback, trainerNoShow })}
          className="flex-1 rounded-lg bg-teal-600 py-2 text-xs font-bold text-white hover:bg-teal-700 transition disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : trainerNoShow
              ? "Mark as No-Show"
              : "Mark Complete"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Opportunity Pipeline Page
|--------------------------------------------------------------------------
|
| Admin view of every Opportunity raised for a requirement — trainer
| interest, rate, demo workflow, and final selection — driving:
|
| Opportunity -> Trainer Interested -> Rate Submitted -> Vendor Shortlists
| -> Demo Requested -> Demo Scheduled -> Demo Completed -> Vendor Selects
| -> Assignment
|--------------------------------------------------------------------------
*/
const OpportunityPipelinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [activeForm, setActiveForm] = useState({ id: "", type: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await opportunitiesApi.getByRequirementAdmin(id);
      setRequirement(result.requirement);
      setCandidates(result.candidates || []);
    } catch (error) {
      console.error("Failed to load opportunity pipeline:", error);
      setLoadError(
        error?.response?.data?.message ||
          "Failed to load the opportunity pipeline for this requirement.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runAction = async (candidateId, fn) => {
    setActionError("");
    setBusyId(candidateId);
    try {
      await fn();
      await loadData();
      setActiveForm({ id: "", type: "" });
    } catch (error) {
      console.error("Opportunity pipeline action failed:", error);
      setActionError(
        error?.response?.data?.message || "That action could not be completed.",
      );
    } finally {
      setBusyId("");
    }
  };

  const stageCounts = useMemo(() => {
    const counts = {};
    candidates.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [candidates]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading opportunity pipeline…
      </div>
    );
  }

  if (loadError || !requirement) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        {loadError || "Requirement not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/admin/requirements/${id}`)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Requirement
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Opportunity Pipeline
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {requirement.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Track trainer interest, vendor shortlisting, demo scheduling, and
          final selection for this requirement.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(stageCounts).map(([status, count]) => (
          <span
            key={status}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
              OPPORTUNITY_STATUS_STYLES[status] ||
              "bg-slate-100 text-slate-700 ring-slate-200"
            }`}
          >
            {formatStatusLabel(status)}: {count}
          </span>
        ))}
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FiUser size={28} className="mx-auto text-slate-300" />
          <h3 className="mt-3 font-semibold text-slate-800">
            No opportunities yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Trainers matched to this requirement will appear here once
            opportunities are created.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => {
            const trainer = candidate.trainerId || {};
            const demo = candidate.currentDemoSessionId;
            const isBusy = busyId === candidate._id;
            const formOpen =
              activeForm.id === candidate._id ? activeForm.type : "";

            return (
              <div
                key={candidate._id}
                className={`rounded-2xl border bg-white shadow-sm ${
                  candidate.status === "SELECTED"
                    ? "border-emerald-300"
                    : "border-slate-200"
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                        <FiUser />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {trainer.name || "Trainer"}
                          </h3>
                          {typeof candidate.overallScore === "number" && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              {Math.round(candidate.overallScore)}% Match
                            </span>
                          )}
                          <StatusBadge status={candidate.status} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                          {trainer.city && <span>{trainer.city}</span>}
                          {trainer.rating && (
                            <span className="flex items-center gap-1">
                              <FiStar />
                              {trainer.rating}
                            </span>
                          )}
                          {candidate.quotedRate != null && (
                            <span>
                              Quoted: ₹
                              {Number(candidate.quotedRate).toLocaleString(
                                "en-IN",
                              )}
                              /day
                            </span>
                          )}
                        </div>
                        {candidate.trainerResponseNote && (
                          <p className="mt-2 text-xs text-slate-500">
                            "{candidate.trainerResponseNote}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage-specific actions */}
                <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                  {["INTERESTED", "MAYBE"].includes(candidate.status) && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          runAction(candidate._id, () =>
                            opportunitiesApi.adminAction(
                              candidate._id,
                              "SHORTLIST",
                            ),
                          )
                        }
                        className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
                      >
                        <FiCheck /> Shortlist Trainer
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          runAction(candidate._id, () =>
                            opportunitiesApi.adminAction(
                              candidate._id,
                              "REJECT",
                            ),
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <FiX /> Reject
                      </button>
                    </div>
                  )}

                  {candidate.status === "SHORTLISTED" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        runAction(candidate._id, () =>
                          demoSessionsApi.requestDemo({
                            opportunityId: candidate._id,
                          }),
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      <FiVideo /> Request Demo
                    </button>
                  )}

                  {candidate.status === "DEMO_REQUESTED" && demo && (
                    <>
                      {formOpen === "schedule" ? (
                        <ScheduleDemoForm
                          submitting={isBusy}
                          onCancel={() => setActiveForm({ id: "", type: "" })}
                          onSubmit={(payload) =>
                            runAction(candidate._id, () =>
                              demoSessionsApi.scheduleDemo(demo._id, payload),
                            )
                          }
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveForm({
                                id: candidate._id,
                                type: "schedule",
                              })
                            }
                            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                          >
                            <FiCalendar /> Schedule Demo
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              runAction(candidate._id, () =>
                                demoSessionsApi.cancelDemo(demo._id),
                              )
                            }
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          >
                            <FiXCircle /> Cancel Demo
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {candidate.status === "DEMO_SCHEDULED" && demo && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-3 text-xs text-slate-600 flex flex-wrap gap-4">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <FiClock /> {formatDateTime(demo.scheduledAt)}
                        </span>
                        <span className="font-semibold">
                          {demo.meetingMode}
                        </span>
                        {demo.meetingLink && (
                          <a
                            href={demo.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-indigo-600 underline"
                          >
                            Join Link
                          </a>
                        )}
                      </div>

                      {formOpen === "complete" ? (
                        <CompleteDemoForm
                          submitting={isBusy}
                          onCancel={() => setActiveForm({ id: "", type: "" })}
                          onSubmit={(payload) =>
                            runAction(candidate._id, () =>
                              demoSessionsApi.completeDemo(demo._id, payload),
                            )
                          }
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveForm({
                                id: candidate._id,
                                type: "complete",
                              })
                            }
                            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                          >
                            <FiCheckCircle /> Complete Demo
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              runAction(candidate._id, () =>
                                demoSessionsApi.cancelDemo(demo._id),
                              )
                            }
                            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          >
                            <FiXCircle /> Cancel Demo
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {candidate.status === "DEMO_COMPLETED" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        runAction(candidate._id, () =>
                          opportunitiesApi.adminAction(
                            candidate._id,
                            "SELECT_TRAINER",
                          ),
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <FiCheck /> Select Trainer
                    </button>
                  )}

                  {candidate.status === "SELECTED" && (
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <FiCheckCircle /> Trainer selected.
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/requirements/${id}/create-assignment/${trainer._id}`,
                          )
                        }
                        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Create Assignment →
                      </button>
                    </div>
                  )}

                  {candidate.status === "NOT_SELECTED" && (
                    <span className="flex items-center gap-2 text-sm font-medium text-red-600">
                      <FiX /> Not selected for this requirement.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunityPipelinePage;
