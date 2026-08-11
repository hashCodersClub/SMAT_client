import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiAward,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiStar,
  FiUser,
  FiVideo,
  FiXCircle,
} from "react-icons/fi";

import opportunitiesApi from "../../../api/opportunitiesApi";
import demoSessionsApi from "../../../api/demoSessionsApi";
import assignmentsApi from "../../../api/assignmentsApi";
import requirementsApi from "../../../api/requirementsApi";
import purchaseOrdersApi from "../../../api/purchaseOrdersApi";
import {
  OPPORTUNITY_STATUS_STYLES,
  formatStatusLabel,
} from "../../../constants/statuses";

const DEMO_MEETING_MODES = ["ZOOM", "MEET", "TEAMS"];

/*
|--------------------------------------------------------------------------
| Schedule Demo Form
|--------------------------------------------------------------------------
|
| Mirrors the admin Opportunity Pipeline's scheduling form so both sides
| of the platform behave the same way once a demo/technical session has
| been requested.
|--------------------------------------------------------------------------
*/

const ScheduleSessionForm = ({ onSubmit, submitting, onCancel }) => {
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(30);
  const [meetingMode, setMeetingMode] = useState("ZOOM");
  const [meetingLink, setMeetingLink] = useState("");

  return (
    <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {submitting ? "Scheduling…" : "Confirm Schedule"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Book Assignment Form
|--------------------------------------------------------------------------
*/

const BookAssignmentForm = ({
  requirement,
  defaultRate,
  onSubmit,
  submitting,
  onCancel,
}) => {
  const [startDate, setStartDate] = useState(requirement?.startDate || "");
  const [endDate, setEndDate] = useState(requirement?.endDate || "");
  const [trainerRate, setTrainerRate] = useState(defaultRate || "");
  const [rateType, setRateType] = useState("PER_DAY");
  const [notes, setNotes] = useState("");
  const [requestPo, setRequestPo] = useState(true);

  return (
    <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Start Date
          </label>
          <input
            type="date"
            value={startDate ? String(startDate).slice(0, 10) : ""}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            End Date
          </label>
          <input
            type="date"
            value={endDate ? String(endDate).slice(0, 10) : ""}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Trainer Rate (₹)
          </label>
          <input
            type="number"
            min="0"
            value={trainerRate}
            onChange={(e) => setTrainerRate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-500">
            Rate Type
          </label>
          <select
            value={rateType}
            onChange={(e) => setRateType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="PER_DAY">Per Day</option>
            <option value="PER_HOUR">Per Hour</option>
            <option value="PER_BATCH">Per Batch</option>
            <option value="FIXED">Fixed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-500">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={2000}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <label className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={requestPo}
          onChange={(e) => setRequestPo(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Also request a Purchase Order for this engagement (using the rate above). Admin will
          review and issue the official PO to the trainer.
        </span>
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={submitting || !startDate || !endDate}
          onClick={() =>
            onSubmit({ startDate, endDate, trainerRate, rateType, notes, requestPo })
          }
          className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Booking…" : "Confirm & Book Assignment"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Section
|--------------------------------------------------------------------------
*/

const Section = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="flex items-center gap-2 font-semibold text-slate-900">
      {Icon && <Icon className="text-slate-400" />}
      {title}
    </h2>
    <div className="mt-3">{children}</div>
  </div>
);

/*
|--------------------------------------------------------------------------
| Vendor Opportunity Detail Page
|--------------------------------------------------------------------------
|
| The vendor's view of a single matched trainer, once that trainer has
| responded: a sanitized profile (no contact info, no CV) plus the three
| actions available from here — book a demo call, book a technical
| evaluation, or book the trainer straight into an assignment.
|--------------------------------------------------------------------------
*/

const VendorOpportunityDetailPage = () => {
  const { id: requirementId, opportunityId } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [trainer, setTrainer] = useState(null);
  const [opportunityStatus, setOpportunityStatus] = useState("");
  const [demoSession, setDemoSession] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeForm, setActiveForm] = useState(""); // "", "schedule", "assignment"

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [profileResult, requirementResult, demoResult] = await Promise.all([
        opportunitiesApi.getTrainerProfile(opportunityId),
        requirementsApi.getById(requirementId),
        demoSessionsApi
          .getByOpportunity(opportunityId)
          .catch(() => ({ demoSessions: [] })),
      ]);

      setTrainer(profileResult.trainer);
      setOpportunityStatus(profileResult.opportunity?.status || "");
      setRequirement(requirementResult.requirement);

      const activeSession = (demoResult.demoSessions || []).find((session) =>
        ["REQUESTED", "SCHEDULED"].includes(session.status),
      );
      setDemoSession(activeSession || null);
    } catch (error) {
      console.error("Failed to load trainer profile:", error);
      setLoadError(
        error?.response?.data?.message ||
          "Unable to load this trainer's profile. It may not be available yet — profiles unlock once a trainer responds to the opportunity.",
      );
    } finally {
      setLoading(false);
    }
  }, [opportunityId, requirementId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runAction = async (action) => {
    setBusy(true);
    setActionError("");
    try {
      await action();
      await loadData();
      setActiveForm("");
    } catch (error) {
      console.error("Action failed:", error);
      setActionError(
        error?.response?.data?.message || "That action couldn't be completed.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-slate-500">
        Loading trainer profile…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <FiXCircle className="mx-auto text-red-400" size={32} />
        <p className="mt-3 text-sm font-medium text-red-700">{loadError}</p>
        <button
          type="button"
          onClick={() => navigate(`/vendor/requirements/${requirementId}`)}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <FiArrowLeft /> Back to Requirement
        </button>
      </div>
    );
  }

  // Once a demo/technical session exists and has been booked or requested,
  // "Book Assignment" is still available (a vendor can always skip
  // straight to an assignment) but the demo-request buttons make way for
  // the session's own next step instead.
  const canRequestSession = !demoSession;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <button
        type="button"
        onClick={() => navigate(`/vendor/requirements/${requirementId}`)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <FiArrowLeft /> Back to Requirement
      </button>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {/* Profile Header */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            {trainer.profilePhotoUrl ? (
              <img
                src={trainer.profilePhotoUrl}
                alt={trainer.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FiUser size={26} />
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {trainer.name}
              </h1>
              {trainer.professionalHeadline && (
                <p className="text-sm text-slate-500">
                  {trainer.professionalHeadline}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {trainer.city && (
                  <span className="flex items-center gap-1">
                    <FiMapPin size={13} />
                    {[trainer.city, trainer.state].filter(Boolean).join(", ")}
                  </span>
                )}
                {typeof trainer.experience === "number" && (
                  <span className="flex items-center gap-1">
                    <FiBriefcase size={13} />
                    {trainer.experience} yrs experience
                  </span>
                )}
                {trainer.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <FiStar size={13} />
                    {trainer.rating.toFixed
                      ? trainer.rating.toFixed(1)
                      : trainer.rating}
                  </span>
                )}
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${
              OPPORTUNITY_STATUS_STYLES[opportunityStatus] ||
              "bg-slate-100 text-slate-700 ring-slate-200"
            }`}
          >
            {formatStatusLabel(opportunityStatus)}
          </span>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          This is a platform profile — contact details and the trainer's CV
          aren't shared directly. Use the actions below to move forward.
        </p>
      </div>

      {/* Professional Summary */}

      {trainer.professionalSummary && (
        <Section title="About" icon={FiUser}>
          <p className="text-sm leading-6 text-slate-600">
            {trainer.professionalSummary}
          </p>
        </Section>
      )}

      {/* Skills */}

      {Array.isArray(trainer.skills) && trainer.skills.length > 0 && (
        <Section title="Skills" icon={FiAward}>
          <div className="flex flex-wrap gap-2">
            {trainer.skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}

      {Array.isArray(trainer.certifications) &&
        trainer.certifications.length > 0 && (
          <Section title="Certifications" icon={FiAward}>
            <div className="space-y-2">
              {trainer.certifications.map((cert, index) => (
                <div key={index} className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {cert.name}
                  </span>
                  {cert.issuingOrganization && (
                    <span> — {cert.issuingOrganization}</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

      {/* Employment History */}

      {Array.isArray(trainer.employmentHistory) &&
        trainer.employmentHistory.length > 0 && (
          <Section title="Employment History" icon={FiBriefcase}>
            <div className="space-y-3">
              {trainer.employmentHistory.map((job, index) => (
                <div key={index} className="text-sm">
                  <p className="font-semibold text-slate-800">
                    {job.designation}
                    {job.company ? ` at ${job.company}` : ""}
                  </p>
                  {job.description && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {job.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

      {/* Projects */}

      {Array.isArray(trainer.projects) && trainer.projects.length > 0 && (
        <Section title="Projects" icon={FiAward}>
          <div className="space-y-3">
            {trainer.projects.map((project, index) => (
              <div key={index} className="text-sm">
                <p className="font-semibold text-slate-800">{project.title}</p>
                {project.description && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Actions */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold text-slate-900">Next Steps</h2>
        <p className="mt-1 text-sm text-slate-500">
          Book a demo call, a technical evaluation, or move straight to an
          assignment.
        </p>

        {demoSession && (
          <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
              {demoSession.sessionType === "TECHNICAL"
                ? "Technical Evaluation"
                : "Demo Call"}{" "}
              — {formatStatusLabel(demoSession.status)}
            </p>

            {demoSession.status === "SCHEDULED" && (
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold">
                  <FiClock />{" "}
                  {new Date(demoSession.scheduledAt).toLocaleString("en-IN")}
                </span>
                <span className="font-semibold">{demoSession.meetingMode}</span>
                {demoSession.meetingLink && (
                  <a
                    href={demoSession.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-indigo-600 underline"
                  >
                    Join Link
                  </a>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {demoSession.status === "REQUESTED" &&
                (activeForm === "schedule" ? (
                  <ScheduleSessionForm
                    submitting={busy}
                    onCancel={() => setActiveForm("")}
                    onSubmit={(payload) =>
                      runAction(() =>
                        demoSessionsApi.scheduleDemo(demoSession._id, payload),
                      )
                    }
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveForm("schedule")}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    <FiCalendar /> Schedule
                  </button>
                ))}

              {["REQUESTED", "SCHEDULED"].includes(demoSession.status) &&
                activeForm !== "schedule" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      runAction(() =>
                        demoSessionsApi.cancelDemo(demoSession._id),
                      )
                    }
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <FiXCircle /> Cancel
                  </button>
                )}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {canRequestSession && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(() =>
                    demoSessionsApi.requestDemo({
                      opportunityId,
                      sessionType: "DEMO",
                    }),
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                <FiVideo /> Book Demo Call
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  runAction(() =>
                    demoSessionsApi.requestDemo({
                      opportunityId,
                      sessionType: "TECHNICAL",
                    }),
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
              >
                <FiVideo /> Book Technical Evaluation
              </button>
            </>
          )}

          {opportunityStatus !== "SELECTED" &&
            (activeForm === "assignment" ? null : (
              <button
                type="button"
                onClick={() => setActiveForm("assignment")}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <FiCheckCircle /> Book Trainer in Assignment
              </button>
            ))}

          {opportunityStatus === "SELECTED" && (
            <span className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <FiCheckCircle /> Trainer selected — see Assignments
            </span>
          )}
        </div>

        {activeForm === "assignment" && (
          <div className="mt-4">
            <BookAssignmentForm
              requirement={requirement}
              defaultRate={trainer.pricing?.dailyRate}
              submitting={busy}
              onCancel={() => setActiveForm("")}
              onSubmit={(payload) =>
                runAction(async () => {
                  const created = await assignmentsApi.create({
                    requirementId,
                    trainerId: trainer._id,
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                    trainerRate: payload.trainerRate
                      ? Number(payload.trainerRate)
                      : undefined,
                    rateType: payload.rateType,
                    notes: payload.notes,
                  });

                  const newAssignmentId = created?.data?._id;

                  if (payload.requestPo && newAssignmentId) {
                    try {
                      await purchaseOrdersApi.request({
                        assignmentId: newAssignmentId,
                        notes: payload.notes,
                      });
                    } catch (poError) {
                      // Don't block the assignment — it was created
                      // successfully. Vendor can still see the assignment
                      // and request a PO for it from there if this fails.
                      console.error("Failed to request purchase order:", poError);
                    }
                  }

                  navigate(`/vendor/assignments`);
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOpportunityDetailPage;
