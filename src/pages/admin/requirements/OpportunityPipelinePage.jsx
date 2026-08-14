import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiAward,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiMessageSquare,
  FiRefreshCw,
  FiSend,
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

const RATE_TYPE_LABELS = {
  PER_DAY: "/day",
  PER_HOUR: "/hr",
  FIXED: " fixed",
  PER_BATCH: "/batch",
};

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

/* Schedule Demo Form */
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

/* Complete Demo Form */
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

/* Internal Note / Action Form */
const ActionNoteForm = ({ actionName, onSubmit, submitting, onCancel }) => {
  const [note, setNote] = useState("");
  const [internalComments, setInternalComments] = useState("");

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
        Action Notes: {actionName}
      </h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Public / Status Note
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason or note..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Internal Comments (Admin Only)
          </label>
          <input
            type="text"
            value={internalComments}
            onChange={(e) => setInternalComments(e.target.value)}
            placeholder="Internal ops comment..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={submitting}
          onClick={() => onSubmit({ note, internalComments })}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Confirm Action"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/* Selection Timeline Drawer */
const StatusTimelineView = ({ history = [], auditTrail = [] }) => {
  const [activeTab, setActiveTab] = useState("timeline");

  const timelineItems = useMemo(() => {
    if (history.length > 0) {
      return history.map((item) => ({
        title: formatStatusLabel(item.status),
        subtitle: item.trainerQuotedRate
          ? `Quoted: ₹${Number(item.trainerQuotedRate).toLocaleString("en-IN")}${RATE_TYPE_LABELS[item.trainerQuotedRateType] || "/day"}`
          : null,
        note: item.note || item.internalComments || "",
        role: item.actorRole || "SYSTEM",
        timestamp: item.timestamp,
      }));
    }
    return (auditTrail || []).map((audit) => ({
      title: formatStatusLabel(audit.event),
      subtitle: audit.details?.quotedRate
        ? `Quoted: ₹${Number(audit.details.quotedRate).toLocaleString("en-IN")}/day`
        : null,
      note: audit.details?.trainerResponseNote || "",
      role: audit.actorRole || "SYSTEM",
      timestamp: audit.timestamp,
    }));
  }, [history, auditTrail]);

  if (timelineItems.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <FiClock size={14} className="text-indigo-600" /> Candidate Activity & Selection History
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          {timelineItems.length} record(s)
        </span>
      </div>

      <div className="relative pl-4 space-y-3 border-l-2 border-slate-200">
        {timelineItems.map((item, idx) => (
          <div key={idx} className="relative text-xs">
            <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="font-bold text-slate-900">{item.title}</span>
              <span className="text-[10px] font-semibold text-slate-400">
                {formatDateTime(item.timestamp)}
              </span>
            </div>
            {item.subtitle && (
              <p className="font-semibold text-indigo-700 mt-0.5">{item.subtitle}</p>
            )}
            {item.note && (
              <p className="text-slate-600 mt-0.5 italic">"{item.note}"</p>
            )}
            <span className="inline-block mt-0.5 rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
              By {item.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OpportunityPipelinePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeForm, setActiveForm] = useState({ id: "", type: "", actionName: "" });
  const [expandedTimelineId, setExpandedTimelineId] = useState("");

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
      setActiveForm({ id: "", type: "", actionName: "" });
    } catch (error) {
      console.error("Opportunity pipeline action failed:", error);
      setActionError(
        error?.response?.data?.message || "That action could not be completed.",
      );
    } finally {
      setBusyId("");
    }
  };

  const analytics = useMemo(() => {
    const stats = {
      total: candidates.length,
      sent: 0,
      interested: 0,
      shortlisted: 0,
      demo: 0,
      selected: 0,
      onboarded: 0,
      rejected: 0,
    };

    candidates.forEach((c) => {
      const st = c.selectionStatus || c.status;
      if (["OPPORTUNITY_SENT", "CREATED", "PENDING_RESPONSE", "NOTIFIED"].includes(st)) stats.sent++;
      if (["INTERESTED", "MAYBE"].includes(st)) stats.interested++;
      if (st === "SHORTLISTED") stats.shortlisted++;
      if (["DEMO_REQUESTED", "DEMO_SCHEDULED", "DEMO_COMPLETED"].includes(st)) stats.demo++;
      if (st === "SELECTED") stats.selected++;
      if (st === "ONBOARDED") stats.onboarded++;
      if (["REJECTED", "NOT_SELECTED", "DECLINED", "WITHDRAWN"].includes(st)) stats.rejected++;
    });

    return stats;
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    if (activeFilter === "ALL") return candidates;
    return candidates.filter((c) => {
      const st = c.selectionStatus || c.status;
      if (activeFilter === "SENT")
        return ["OPPORTUNITY_SENT", "CREATED", "PENDING_RESPONSE", "NOTIFIED"].includes(st);
      if (activeFilter === "INTERESTED")
        return ["INTERESTED", "MAYBE"].includes(st);
      if (activeFilter === "SHORTLISTED") return st === "SHORTLISTED";
      if (activeFilter === "DEMO")
        return ["DEMO_REQUESTED", "DEMO_SCHEDULED", "DEMO_COMPLETED"].includes(st);
      if (activeFilter === "SELECTED") return st === "SELECTED";
      if (activeFilter === "ONBOARDED") return st === "ONBOARDED";
      if (activeFilter === "REJECTED")
        return ["REJECTED", "NOT_SELECTED", "DECLINED"].includes(st);
      return true;
    });
  }, [candidates, activeFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <FiRefreshCw size={28} className="animate-spin text-indigo-600" />
        <p className="mt-3 text-sm font-bold text-slate-500">Loading selection pipeline…</p>
      </div>
    );
  }

  if (loadError || !requirement) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 font-medium">
        {loadError || "Requirement not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(`/admin/requirements/${id}`)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <FiArrowLeft />
        Back to Requirement
      </button>

      {/* Header Widget */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">
            Trainer Selection Pipeline
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            {requirement.title}
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Manage quotation rates, selection stages, demo evaluations, and trainer onboarding.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Pipeline
        </button>
      </div>

      {/* Selection Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Contacted</span>
          <p className="mt-1 text-xl font-black text-slate-800">{analytics.total}</p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-sky-600 uppercase">Sent</span>
          <p className="mt-1 text-xl font-black text-sky-800">{analytics.sent}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Interested</span>
          <p className="mt-1 text-xl font-black text-emerald-800">{analytics.interested}</p>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-cyan-600 uppercase">Shortlisted</span>
          <p className="mt-1 text-xl font-black text-cyan-800">{analytics.shortlisted}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-violet-600 uppercase">Demo Stage</span>
          <p className="mt-1 text-xl font-black text-violet-800">{analytics.demo}</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50/50 p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-green-600 uppercase">Selected</span>
          <p className="mt-1 text-xl font-black text-green-800">{analytics.selected}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-100/60 p-3.5 shadow-xs text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-emerald-900 uppercase">Onboarded</span>
          <p className="mt-1 text-xl font-black text-emerald-950">{analytics.onboarded}</p>
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
        {[
          { key: "ALL", label: "All Candidates" },
          { key: "SENT", label: "Opportunity Sent" },
          { key: "INTERESTED", label: "Interested" },
          { key: "SHORTLISTED", label: "Shortlisted" },
          { key: "DEMO", label: "Demo Stage" },
          { key: "SELECTED", label: "Selected" },
          { key: "ONBOARDED", label: "Onboarded" },
          { key: "REJECTED", label: "Rejected" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeFilter === tab.key
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          {actionError}
        </div>
      )}

      {filteredCandidates.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <FiUser size={32} className="mx-auto text-slate-300" />
          <h3 className="mt-3 text-base font-extrabold text-slate-800">
            No candidates in this stage
          </h3>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Select another filter tab or create new opportunities for this requirement.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCandidates.map((candidate) => {
            const trainer = candidate.trainerId || {};
            const demo = candidate.currentDemoSessionId;
            const isBusy = busyId === candidate._id;
            const formOpen = activeForm.id === candidate._id ? activeForm.type : "";
            const currentStatus = candidate.selectionStatus || candidate.status;
            const quotedRateVal = candidate.trainerQuotedRate ?? candidate.quotedRate;
            const rateTypeSuffix = RATE_TYPE_LABELS[candidate.trainerQuotedRateType] || "/day";

            return (
              <div
                key={candidate._id}
                className={`rounded-3xl border bg-white shadow-sm transition-all ${
                  currentStatus === "ONBOARDED"
                    ? "border-emerald-400 bg-emerald-50/20"
                    : currentStatus === "SELECTED"
                      ? "border-green-300"
                      : "border-slate-200"
                }`}
              >
                <div className="p-5 space-y-4">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 font-black text-lg">
                        {trainer.name ? trainer.name.charAt(0).toUpperCase() : <FiUser />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">
                            {trainer.name || "Trainer Candidate"}
                          </h3>
                          {typeof candidate.overallScore === "number" && (
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700 border border-blue-100">
                              {Math.round(candidate.overallScore)}% Compatibility
                            </span>
                          )}
                          <StatusBadge status={currentStatus} />
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                          {trainer.city && <span>📍 {trainer.city}</span>}
                          {trainer.rating && (
                            <span className="flex items-center gap-1 font-bold text-amber-600">
                              <FiStar size={12} className="fill-amber-400" />
                              {trainer.rating}
                            </span>
                          )}
                          {quotedRateVal != null ? (
                            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                              Quotation: ₹{Number(quotedRateVal).toLocaleString("en-IN")}{rateTypeSuffix}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">Rate: Not quoted yet</span>
                          )}
                        </div>

                        {candidate.trainerResponseNote && (
                          <p className="mt-1 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            💬 "{candidate.trainerResponseNote}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedTimelineId(
                          expandedTimelineId === candidate._id ? "" : candidate._id,
                        )
                      }
                      className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      <FiFileText size={13} />
                      {expandedTimelineId === candidate._id ? "Hide Timeline" : "Selection History"}
                    </button>
                  </div>

                  {/* Stage-specific Actions Bar */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    {/* Action Notes / Internal Comment Form */}
                    {formOpen === "action_note" && (
                      <ActionNoteForm
                        actionName={activeForm.actionName}
                        submitting={isBusy}
                        onCancel={() => setActiveForm({ id: "", type: "", actionName: "" })}
                        onSubmit={(payload) =>
                          runAction(candidate._id, () =>
                            opportunitiesApi.adminAction(candidate._id, {
                              action: activeForm.actionName,
                              ...payload,
                            }),
                          )
                        }
                      />
                    )}

                    {/* Action buttons based on current candidate stage */}
                    {["CREATED", "PENDING_RESPONSE", "NOTIFIED"].includes(currentStatus) && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            runAction(candidate._id, () =>
                              opportunitiesApi.adminAction(candidate._id, {
                                action: "MARK_SENT",
                              }),
                            )
                          }
                          className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-50"
                        >
                          <FiSend size={13} /> Mark Opportunity Sent
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            setActiveForm({
                              id: candidate._id,
                              type: "action_note",
                              actionName: "SHORTLIST",
                            })
                          }
                          className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-700 disabled:opacity-50"
                        >
                          <FiCheck size={13} /> Shortlist Candidate
                        </button>
                      </div>
                    )}

                    {["INTERESTED", "MAYBE", "OPPORTUNITY_SENT"].includes(currentStatus) && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            setActiveForm({
                              id: candidate._id,
                              type: "action_note",
                              actionName: "SHORTLIST",
                            })
                          }
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-600/20 hover:scale-[1.02] transition disabled:opacity-50"
                        >
                          <FiCheck size={14} /> Shortlist Trainer
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            setActiveForm({
                              id: candidate._id,
                              type: "action_note",
                              actionName: "REJECT",
                            })
                          }
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        >
                          <FiX size={14} /> Reject
                        </button>
                      </div>
                    )}

                    {currentStatus === "SHORTLISTED" && (
                      <div className="flex flex-wrap gap-2">
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
                          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/20 hover:scale-[1.02] transition disabled:opacity-50"
                        >
                          <FiVideo size={14} /> Request Demo Session
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            setActiveForm({
                              id: candidate._id,
                              type: "action_note",
                              actionName: "SELECT_TRAINER",
                            })
                          }
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition disabled:opacity-50"
                        >
                          <FiCheckCircle size={14} /> Directly Select Trainer
                        </button>
                      </div>
                    )}

                    {currentStatus === "DEMO_REQUESTED" && demo && (
                      <>
                        {formOpen === "schedule" ? (
                          <ScheduleDemoForm
                            submitting={isBusy}
                            onCancel={() => setActiveForm({ id: "", type: "", actionName: "" })}
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
                                  actionName: "SCHEDULE_DEMO",
                                })
                              }
                              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700"
                            >
                              <FiCalendar size={14} /> Schedule Demo
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                runAction(candidate._id, () =>
                                  demoSessionsApi.cancelDemo(demo._id),
                                )
                              }
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            >
                              <FiXCircle size={14} /> Cancel Demo Request
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {currentStatus === "DEMO_SCHEDULED" && demo && (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-3 text-xs text-slate-600 flex flex-wrap gap-4">
                          <span className="flex items-center gap-1.5 font-bold">
                            <FiClock size={13} /> {formatDateTime(demo.scheduledAt)}
                          </span>
                          <span className="font-bold">{demo.meetingMode}</span>
                          {demo.meetingLink && (
                            <a
                              href={demo.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-indigo-600 underline"
                            >
                              Join Meeting
                            </a>
                          )}
                        </div>

                        {formOpen === "complete" ? (
                          <CompleteDemoForm
                            submitting={isBusy}
                            onCancel={() => setActiveForm({ id: "", type: "", actionName: "" })}
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
                                  actionName: "COMPLETE_DEMO",
                                })
                              }
                              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
                            >
                              <FiCheckCircle size={14} /> Complete Demo Evaluation
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                runAction(candidate._id, () =>
                                  demoSessionsApi.cancelDemo(demo._id),
                                )
                              }
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                            >
                              <FiXCircle size={14} /> Cancel Demo
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {currentStatus === "DEMO_COMPLETED" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          setActiveForm({
                            id: candidate._id,
                            type: "action_note",
                            actionName: "SELECT_TRAINER",
                          })
                        }
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition disabled:opacity-50"
                      >
                        <FiCheck size={14} /> Select Trainer Candidate
                      </button>
                    )}

                    {currentStatus === "SELECTED" && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80">
                        <span className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                          <FiCheckCircle size={16} /> Candidate selected for this requirement!
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              runAction(candidate._id, () =>
                                opportunitiesApi.adminAction(candidate._id, {
                                  action: "ONBOARD",
                                }),
                              )
                            }
                            className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
                          >
                            Mark Onboarded
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/requirements/${id}/create-assignment/${trainer._id}`,
                              )
                            }
                            className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                          >
                            Create Assignment →
                          </button>
                        </div>
                      </div>
                    )}

                    {currentStatus === "ONBOARDED" && (
                      <div className="flex items-center justify-between gap-3 bg-emerald-100/70 p-3 rounded-2xl border border-emerald-300">
                        <span className="flex items-center gap-2 text-xs font-extrabold text-emerald-950">
                          <FiAward size={16} /> Trainer fully onboarded & confirmed.
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/requirements/${id}/create-assignment/${trainer._id}`,
                            )
                          }
                          className="rounded-xl bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-900 transition"
                        >
                          View / Edit Assignment
                        </button>
                      </div>
                    )}

                    {["REJECTED", "NOT_SELECTED", "DECLINED"].includes(currentStatus) && (
                      <span className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
                        <FiX size={14} /> Candidate not selected for this placement.
                      </span>
                    )}

                    {/* Timeline Expansion */}
                    {expandedTimelineId === candidate._id && (
                      <StatusTimelineView
                        history={candidate.selectionHistory}
                        auditTrail={candidate.auditTrail}
                      />
                    )}
                  </div>
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
