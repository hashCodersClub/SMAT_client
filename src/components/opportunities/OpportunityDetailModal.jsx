import { useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiRefreshCw,
  FiVideo,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import MatchInsight from "./MatchInsight";
import OpportunityAuditTrail from "./OpportunityAuditTrail";

const MODE_LABELS = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

const DEMO_STAGE_STATUSES = [
  "SHORTLISTED",
  "DEMO_REQUESTED",
  "DEMO_SCHEDULED",
  "DEMO_COMPLETED",
];

const DEMO_STATUS_LABELS = {
  SHORTLISTED:
    "You've been shortlisted — awaiting a demo request from the vendor.",
  DEMO_REQUESTED: "The vendor has requested a demo / technical discussion.",
  DEMO_SCHEDULED: "Your demo has been scheduled.",
  DEMO_COMPLETED:
    "Your demo is complete. Awaiting the vendor's final decision.",
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

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const OpportunityDetailModal = ({
  opportunity,
  isOpen,
  onClose,
  onRespond,
  responding = false,
  onAcceptDemo,
  onRescheduleDemo,
  onDeclineDemo,
  demoActionLoading = false,
}) => {
  const trainerRc = opportunity?.trainerId?.rateCard || opportunity?.trainerId || {};

  useEffect(() => {
    if (opportunity) {
      const existingRate = opportunity.trainerQuotedRate ?? opportunity.quotedRate;
      const existingType = opportunity.trainerQuotedRateType || "PER_DAY";
      setRateType(existingType);

      if (existingRate !== null && existingRate !== undefined && existingRate !== "") {
        setQuotedRate(existingRate);
      } else {
        // Auto-prefill from trainer rate card in profile
        let defaultRate = null;
        if (existingType === "PER_HOUR") defaultRate = trainerRc.hourlyRate;
        else if (existingType === "PER_DAY") defaultRate = trainerRc.dailyRate;
        else if (existingType === "PER_BATCH") defaultRate = trainerRc.batchRate;
        else if (existingType === "FIXED") defaultRate = trainerRc.fixedProjectRate;

        if (defaultRate !== null && defaultRate !== undefined) {
          setQuotedRate(defaultRate);
        }
      }
    }
  }, [opportunity]);

  const handleRateTypeChange = (newType) => {
    setRateType(newType);
    let autoRate = null;
    if (newType === "PER_HOUR") autoRate = trainerRc.hourlyRate;
    else if (newType === "PER_DAY") autoRate = trainerRc.dailyRate;
    else if (newType === "PER_BATCH") autoRate = trainerRc.batchRate;
    else if (newType === "FIXED") autoRate = trainerRc.fixedProjectRate;

    if (autoRate !== null && autoRate !== undefined) {
      setQuotedRate(autoRate);
    }
  };

  if (!isOpen || !opportunity) return null;

  const requirement =
    opportunity.requirementId || opportunity.requirementSnapshot || {};
  const isExpired = opportunity.status === "EXPIRED";

  const handleActionClick = (actionStatus) => {
    if (actionStatus === "INTERESTED") {
      setSelectedAction("INTERESTED");
      setShowConfirmation(true);
    } else {
      setSelectedAction(actionStatus);
      handleFinalSubmit(actionStatus);
    }
  };

  const handleFinalSubmit = async (statusToSubmit) => {
    const finalStatus = statusToSubmit || selectedAction;
    const numRate = quotedRate !== "" ? Number(quotedRate) : null;
    await onRespond(opportunity._id, {
      status: finalStatus,
      quotedRate: numRate,
      trainerQuotedRate: numRate,
      trainerQuotedRateType: rateType,
      trainerResponseNote: note,
    });
    setShowConfirmation(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur-md">
          <div>
            <span className="inline-block text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Training Opportunity
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              {requirement.title || "Training Requirement"}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Client:{" "}
              <span className="text-slate-800 font-bold">Corporate Client</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Phase B Match Insight */}
          <MatchInsight
            matchScore={opportunity.matchScore}
            breakdown={opportunity.matchBreakdown}
          />

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <FiMapPin size={14} /> Location
              </span>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {requirement.mode === "ONLINE"
                  ? "Online"
                  : requirement.city || "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <FiBriefcase size={14} /> Mode
              </span>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {MODE_LABELS[requirement.mode] || requirement.mode || "Online"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <FiCalendar size={14} /> Dates
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800">
                {formatDate(requirement.startDate)} –{" "}
                {formatDate(requirement.endDate)}
              </p>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {requirement.skills?.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Expired Banner — only ever shown for legacy records that
              were expired under the old time-based rule. New
              opportunities never get an expiry deadline; they stay open
              until the requirement is closed. */}
          {isExpired && (
            <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
              <span className="flex items-center gap-1.5">
                <FiClock size={15} />
                This opportunity is no longer open.
              </span>
            </div>
          )}

          {/* Phase C Response Form (if not expired & not selected/withdrawn/rejected/in demo stage) */}
          {!isExpired &&
            ![
              "SELECTED",
              "WITHDRAWN",
              "REJECTED",
              "NOT_SELECTED",
              ...DEMO_STAGE_STATUSES,
            ].includes(opportunity.status) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <h4 className="text-sm font-extrabold text-slate-900">
                  Your Response
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Rate Type
                    </label>
                    <select
                      value={rateType}
                      onChange={(e) => handleRateTypeChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    >
                      <option value="PER_DAY">Per Day Rate</option>
                      <option value="PER_HOUR">Per Hour Rate</option>
                      <option value="FIXED">Fixed Project Cost</option>
                      <option value="PER_BATCH">Per Batch Rate</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Expected Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={quotedRate}
                      onChange={(e) => setQuotedRate(e.target.value)}
                      placeholder="Enter your rate..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-500">
                      Availability / Note
                    </label>
                    <input
                      type="text"
                      maxLength="500"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="E.g. Available for full schedule"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    disabled={responding}
                    onClick={() => handleActionClick("INTERESTED")}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition disabled:opacity-50"
                  >
                    <FiCheck size={16} /> Interested
                  </button>

                  <button
                    type="button"
                    disabled={responding}
                    onClick={() => handleActionClick("MAYBE")}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:scale-[1.02] transition disabled:opacity-50"
                  >
                    <FiClock size={16} /> Maybe
                  </button>

                  <button
                    type="button"
                    disabled={responding}
                    onClick={() => handleActionClick("DECLINED")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

          {/* Demo Session Panel */}
          {DEMO_STAGE_STATUSES.includes(opportunity.status) && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <FiVideo className="text-violet-600" />
                <h4 className="text-sm font-extrabold text-slate-900">
                  Demo / Technical Discussion
                </h4>
              </div>

              <p className="text-xs font-medium text-slate-600">
                {DEMO_STATUS_LABELS[opportunity.status]}
              </p>

              {opportunity.currentDemoSessionId && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {opportunity.currentDemoSessionId.scheduledAt && (
                    <div className="rounded-xl bg-white border border-slate-100 p-3">
                      <span className="font-medium text-slate-400">
                        Scheduled For
                      </span>
                      <p className="mt-1 font-bold text-slate-800">
                        {formatDateTime(
                          opportunity.currentDemoSessionId.scheduledAt,
                        )}
                      </p>
                    </div>
                  )}

                  {opportunity.currentDemoSessionId.meetingMode && (
                    <div className="rounded-xl bg-white border border-slate-100 p-3">
                      <span className="font-medium text-slate-400">
                        Meeting Mode
                      </span>
                      <p className="mt-1 font-bold text-slate-800">
                        {opportunity.currentDemoSessionId.meetingMode}
                      </p>
                    </div>
                  )}

                  {opportunity.currentDemoSessionId.meetingLink && (
                    <div className="rounded-xl bg-white border border-slate-100 p-3 sm:col-span-2">
                      <span className="font-medium text-slate-400">
                        Meeting Link
                      </span>
                      <p className="mt-1 break-all font-bold text-indigo-600">
                        <a
                          href={opportunity.currentDemoSessionId.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {opportunity.currentDemoSessionId.meetingLink}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {opportunity.status === "DEMO_SCHEDULED" &&
                onAcceptDemo &&
                onRescheduleDemo &&
                onDeclineDemo && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={demoActionLoading}
                      onClick={() =>
                        onAcceptDemo(opportunity.currentDemoSessionId?._id)
                      }
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition disabled:opacity-50"
                    >
                      <FiCheck size={16} /> Accept
                    </button>

                    <button
                      type="button"
                      disabled={demoActionLoading}
                      onClick={() => setShowReschedule(true)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:scale-[1.02] transition disabled:opacity-50"
                    >
                      <FiRefreshCw size={16} /> Reschedule
                    </button>

                    <button
                      type="button"
                      disabled={demoActionLoading}
                      onClick={() =>
                        onDeclineDemo(opportunity.currentDemoSessionId?._id)
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      <FiXCircle size={16} /> Decline
                    </button>
                  </div>
                )}

              {showReschedule && (
                <div className="rounded-xl border border-amber-200 bg-white p-3 space-y-2">
                  <label className="block text-xs font-bold text-slate-500">
                    Reason / preferred time (optional)
                  </label>
                  <input
                    type="text"
                    maxLength="500"
                    value={rescheduleNote}
                    onChange={(e) => setRescheduleNote(e.target.value)}
                    placeholder="E.g. Prefer next Tuesday afternoon"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      disabled={demoActionLoading}
                      onClick={() => {
                        onRescheduleDemo(
                          opportunity.currentDemoSessionId?._id,
                          { note: rescheduleNote },
                        );
                        setShowReschedule(false);
                      }}
                      className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-bold text-white hover:bg-amber-600 transition disabled:opacity-50"
                    >
                      Send Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReschedule(false)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase H Audit Trail */}
          <OpportunityAuditTrail auditTrail={opportunity.auditTrail} />
        </div>
      </div>

      {/* Phase D Response UX Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <FiCheck size={24} />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">
              Confirm Interest
            </h3>

            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              You are expressing interest in this opportunity. The operations
              team will review your profile and may select you for assignment.
            </p>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 font-medium">
              Note: This action expresses your availability. It does not create
              an assignment or guarantee selection.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={responding}
                onClick={() => handleFinalSubmit("INTERESTED")}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition disabled:opacity-50"
              >
                {responding ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityDetailModal;
