import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiEdit2,
  FiLoader,
  FiMapPin,
  FiRefreshCw,
  FiTrash2,
  FiUser,
  FiUsers,
  FiVideo,
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";
import opportunitiesApi from "../../../api/opportunitiesApi";
import ActivityTimeline from "../../../components/ui/ActivityTimeline";
import { buildRequirementTimeline } from "../../../utils/requirementTimeline";

/*
|--------------------------------------------------------------------------
| Timeline Auto-Refresh
|--------------------------------------------------------------------------
|
| The requirement's opportunity pool changes from outside this page —
| trainers accept/reject and vendors move demos forward from their own
| screens. Polling keeps the "Trainer Interaction Timeline" section below
| current without the admin needing to hit refresh manually.
|--------------------------------------------------------------------------
*/
const TIMELINE_POLL_INTERVAL_MS = 15000;

const STATUSES = [
  "SUBMITTED",
  "OPEN",
  "SOURCING",
  "PROFILES_SENT",
  "SHORTLISTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

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

const formatLabel = (value = "") => {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getVendorName = (requirement) => {
  if (requirement?.vendorId && typeof requirement.vendorId === "object") {
    return (
      requirement.vendorId.companyName ||
      requirement.vendorId.name ||
      "Unknown Vendor"
    );
  }

  return requirement?.vendorName || "Unknown Vendor";
};

const RequirementDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);

  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Trainer Interaction Timeline
  |--------------------------------------------------------------------------
  */

  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [timelineError, setTimelineError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Requirement
  |--------------------------------------------------------------------------
  */

  const loadRequirement = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await requirementsApi.getById(id);

      setRequirement(response.requirement);
    } catch (error) {
      console.error("Failed to load requirement:", error);

      setError(error.response?.data?.message || "Unable to load requirement.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequirement();
  }, [loadRequirement]);

  /*
  |--------------------------------------------------------------------------
  | Load & Poll Timeline
  |--------------------------------------------------------------------------
  |
  | Opportunities (and their per-trainer auditTrail) are what actually
  | change as the top-matched trainers get notified and respond, so the
  | timeline is derived from the same admin pipeline endpoint the
  | Opportunity Pipeline page uses — just flattened into one feed here.
  |--------------------------------------------------------------------------
  */

  const loadTimeline = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setTimelineLoading(true);
        setTimelineError("");

        const response = await opportunitiesApi.getByRequirementAdmin(id);

        setTimelineEvents(buildRequirementTimeline(response.candidates || []));
      } catch (error) {
        console.error("Failed to load requirement timeline:", error);

        // A requirement with no opportunities generated yet isn't an
        // error the admin needs to see — just an empty timeline.
        setTimelineEvents([]);

        if (!silent) {
          setTimelineError(
            error.response?.data?.message ||
              "Unable to load trainer interaction history.",
          );
        }
      } finally {
        if (!silent) setTimelineLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadTimeline();

    const interval = setInterval(
      () => loadTimeline({ silent: true }),
      TIMELINE_POLL_INTERVAL_MS,
    );

    return () => clearInterval(interval);
  }, [loadTimeline]);

  /*
  |--------------------------------------------------------------------------
  | Status Update
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    if (!newStatus) return;

    if (newStatus === requirement.status) return;

    try {
      setStatusUpdating(true);
      setStatusError("");

      const response = await requirementsApi.updateStatus(id, {
        status: newStatus,
      });

      setRequirement((current) => ({
        ...current,
        ...(response.requirement || {}),
        status: response.requirement?.status || newStatus,
      }));
    } catch (error) {
      console.error("Status update failed:", error);

      setStatusError(
        error.response?.data?.message || "Unable to update requirement status.",
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Requirement
  |--------------------------------------------------------------------------
  */

  const handleDeleteRequirement = async () => {
    const confirmed = window.confirm(
      "Delete this requirement? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await requirementsApi.delete(id);

      navigate("/admin/requirements");
    } catch (error) {
      console.error("Failed to delete requirement:", error);

      setDeleteError(
        error.response?.data?.message || "Unable to delete requirement.",
      );

      setDeleting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="skeleton h-5 w-40 rounded-full" />
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="skeleton h-8 w-72 rounded-lg" />
            <div className="skeleton h-4 w-48 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-10 w-24 rounded-xl" />
            <div className="skeleton h-10 w-24 rounded-xl" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{ animationDelay: `${i * 60}ms` }}
              className="skeleton animate-rise-in h-24 w-full rounded-2xl"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 80}ms` }}
                className="skeleton animate-rise-in h-40 w-full rounded-2xl"
              />
            ))}
          </div>
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 80}ms` }}
                className="skeleton animate-rise-in h-32 w-full rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !requirement) {
    return (
      <div className="animate-fade-in-up mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/admin/requirements")}
          className="press-scale mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition-all duration-200 hover:-translate-x-0.5 hover:text-slate-900"
        >
          <FiArrowLeft />
          Back to Requirements
        </button>

        <div className="animate-rise-in rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <FiAlertCircle size={30} className="mx-auto text-red-500" />

          <h2 className="mt-3 font-semibold text-red-900">
            Unable to load requirement
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error || "Requirement could not be found."}
          </p>

          <button
            type="button"
            onClick={loadRequirement}
            className="press-scale group mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/30"
          >
            <FiRefreshCw
              size={14}
              className="transition-transform duration-500 group-hover:rotate-180"
            />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const vendorName = getVendorName(requirement);

  const vendor =
    requirement.vendorId && typeof requirement.vendorId === "object"
      ? requirement.vendorId
      : null;

  return (
    <div className="animate-fade-in-up mx-auto max-w-7xl space-y-6">
      {/* ================================================================
          BACK
      ================================================================= */}

      <button
        type="button"
        onClick={() => navigate("/admin/requirements")}
        className="press-scale flex items-center gap-2 text-sm font-semibold text-slate-500 transition-all duration-200 hover:-translate-x-0.5 hover:text-slate-900"
      >
        <FiArrowLeft />
        Back to Requirements
      </button>

      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {requirement.title}
            </h1>

            <span
              key={requirement.status}
              className={`animate-scale-in rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[requirement.status] ||
                "bg-slate-100 text-slate-700"
              }`}
            >
              {formatLabel(requirement.status)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>{formatLabel(requirement.trainingType)}</span>

            <span>•</span>

            <span>{formatLabel(requirement.mode)}</span>

            <span>•</span>

            <span>
              Source:{" "}
              {requirement.source === "VENDOR_PORTAL"
                ? "Vendor Portal"
                : "Admin"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Edit */}

          <button
            type="button"
            onClick={() => navigate(`/admin/requirements/${id}/edit`)}
            className="press-scale flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
          >
            <FiEdit2 />
            Edit
          </button>

          {/* Delete */}

          <button
            type="button"
            onClick={handleDeleteRequirement}
            disabled={deleting}
            className="press-scale flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
          >
            {deleting ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
            {deleting ? "Deleting…" : "Delete"}
          </button>

          {/* Start Sourcing */}

          {!["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
            requirement.status,
          ) && (
            <button
              type="button"
              onClick={() => navigate(`/admin/requirements/${id}/matches`)}
              className="press-scale flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-600/30"
            >
              <FiCpu />✨ AI Match Trainers
            </button>
          )}

          {/* Opportunity Pipeline — Demo Workflow */}

          <button
            type="button"
            onClick={() => navigate(`/admin/requirements/${id}/opportunities`)}
            className="press-scale flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-semibold text-purple-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-50 hover:shadow-sm"
          >
            <FiVideo /> Opportunity Pipeline
          </button>
        </div>
      </div>

      {/* Delete Error */}
      {deleteError && (
        <div
          className="animate-rise-in rounded-2xl border border-red-200 bg-red-50 p-5"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-800">Delete failed</p>
          <p className="mt-1 text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      {/* ================================================================
          AI SMART MATCH HIGHLIGHT
      ================================================================= */}

      <section
        style={{ animationDelay: "60ms" }}
        className="hover-lift animate-rise-in rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white p-5 sm:p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="animate-glow-pulse flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <FiCpu size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900">
                  AI Trainer Recommendation Engine
                </h2>
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  Automated
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Scans available trainer network against skills, location (
                {requirement.city || "Remote"}), experience (
                {requirement.experienceRequired || 0} yrs), and budget.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/admin/requirements/${id}/matches`)}
            className="press-scale inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md shrink-0"
          >
            Run AI Match Analysis &rarr;
          </button>
        </div>
      </section>

      {/* ================================================================
          STATUS MANAGEMENT
      ================================================================= */}

      <section
        style={{ animationDelay: "120ms" }}
        className="hover-lift animate-rise-in rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Requirement Status</h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage the operational lifecycle of this requirement.
            </p>
          </div>

          <div className="w-full lg:w-64">
            <select
              value={requirement.status}
              onChange={handleStatusChange}
              disabled={statusUpdating}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>

            {statusUpdating && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                <FiLoader size={12} className="animate-spin" />
                Updating status...
              </p>
            )}
          </div>
        </div>

        {statusError && (
          <div className="animate-rise-in mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <FiAlertCircle size={17} className="mt-0.5 shrink-0" />

            {statusError}
          </div>
        )}

        {/* Progress */}

        <StatusProgress currentStatus={requirement.status} />
      </section>

      {/* ================================================================
          TRAINER INTERACTION TIMELINE
          Auto-refreshing feed of every notification sent and every
          trainer/vendor action taken on this requirement's opportunities.
      ================================================================= */}

      <section
        style={{ animationDelay: "150ms" }}
        className="hover-lift animate-rise-in rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">
              Trainer Interaction Timeline
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Live activity as matched trainers are notified and respond.
              Updates automatically — no need to refresh.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadTimeline()}
            className="press-scale flex items-center gap-1.5 self-start text-xs font-semibold text-slate-500 hover:text-slate-900 sm:self-auto"
          >
            <FiRefreshCw
              size={13}
              className={timelineLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {timelineError && (
          <div className="animate-rise-in mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <FiAlertCircle size={17} className="mt-0.5 shrink-0" />
            {timelineError}
          </div>
        )}

        <div className="mt-4">
          {timelineLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Loading activity…
            </p>
          ) : (
            <ActivityTimeline
              events={timelineEvents}
              emptyMessage="No trainer activity yet. Once opportunities are generated for this requirement, notifications and responses will appear here."
            />
          )}
        </div>
      </section>

      {/* ================================================================
          QUICK STATS
      ================================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard
          index={0}
          icon={FiCalendar}
          label="Start Date"
          value={formatDate(requirement.startDate)}
        />

        <QuickCard
          index={1}
          icon={FiCalendar}
          label="End Date"
          value={formatDate(requirement.endDate)}
        />

        <QuickCard
          index={2}
          icon={FiMapPin}
          label="Location"
          value={
            requirement.mode === "ONLINE" ? "Online" : requirement.city || "—"
          }
        />

        <QuickCard
          index={3}
          icon={FiUsers}
          label="Participants"
          value={requirement.participants || "—"}
        />
      </div>

      {/* ================================================================
          CONTENT
      ================================================================= */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* LEFT */}

        <div className="space-y-6 xl:col-span-2">
          {/* Training */}

          <Section title="Training Information" delay={0}>
            <Detail
              label="Training Type"
              value={formatLabel(requirement.trainingType)}
            />

            <Detail
              label="Delivery Mode"
              value={formatLabel(requirement.mode)}
            />

            <Detail
              label="Trainer Experience"
              value={
                requirement.experienceRequired !== undefined &&
                requirement.experienceRequired !== null
                  ? `${requirement.experienceRequired} years`
                  : "—"
              }
            />

            <Detail
              label="Participants"
              value={requirement.participants || "—"}
            />

            {/* Skills */}

            <div className="md:col-span-2">
              <Label>Required Skills</Label>

              <div className="mt-2 flex flex-wrap gap-2">
                {requirement.skills?.length ? (
                  requirement.skills.map((skill) => (
                    <span
                      key={skill}
                      className="animate-scale-in rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition-colors duration-200 hover:bg-blue-100"
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

          {/* Description */}

          <Section title="Requirement Description" delay={1}>
            <div className="md:col-span-2">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {requirement.description || "No description provided."}
              </p>
            </div>
          </Section>

          {/* Vendor Notes */}

          <Section title="Vendor Notes" delay={2}>
            <div className="md:col-span-2">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {requirement.vendorNotes ||
                  "No additional notes from the vendor."}
              </p>
            </div>
          </Section>

          {/* Internal Notes */}

          <Section title="Internal Notes" delay={3}>
            <div className="md:col-span-2">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm leading-7 text-amber-900">
                  {requirement.internalNotes || "No internal notes added yet."}
                </p>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Internal notes are not visible to vendors.
              </p>
            </div>
          </Section>
        </div>

        {/* ================================================================
            RIGHT
        ================================================================= */}

        <div className="space-y-6">
          {/* Vendor */}

          <Section title="Vendor" delay={0}>
            <div className="md:col-span-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUser size={19} />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{vendorName}</p>

                  {vendor?.primaryContact?.name && (
                    <p className="mt-1 text-sm text-slate-500">
                      {vendor.primaryContact.name}
                    </p>
                  )}

                  {vendor?.primaryContact?.email && (
                    <p className="mt-1 break-all text-xs text-slate-400">
                      {vendor.primaryContact.email}
                    </p>
                  )}

                  {vendor?.primaryContact?.phone && (
                    <p className="mt-1 text-xs text-slate-400">
                      {vendor.primaryContact.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Schedule */}

          <Section title="Schedule" delay={1}>
            <div className="space-y-4 md:col-span-2">
              <SideDetail
                icon={FiCalendar}
                label="Start Date"
                value={formatDate(requirement.startDate)}
              />

              <SideDetail
                icon={FiCalendar}
                label="End Date"
                value={formatDate(requirement.endDate)}
              />

              <SideDetail
                icon={FiClock}
                label="Duration"
                value={
                  requirement.durationValue
                    ? `${requirement.durationValue} ${formatLabel(
                        requirement.durationUnit,
                      )}`
                    : "—"
                }
              />
            </div>
          </Section>

          {/* Location */}

          <Section title="Location" delay={2}>
            <div className="md:col-span-2">
              <Detail label="Mode" value={formatLabel(requirement.mode)} />

              <div className="mt-4">
                <Detail label="City" value={requirement.city || "—"} />
              </div>

              <div className="mt-4">
                <Detail label="State" value={requirement.state || "—"} />
              </div>
            </div>
          </Section>

          {/* Commercial */}

          <Section title="Commercial" delay={3}>
            <div className="md:col-span-2">
              <Detail
                label="Budget"
                value={
                  Number(requirement.budget) > 0
                    ? `₹${Number(requirement.budget).toLocaleString("en-IN")}`
                    : "Not specified"
                }
              />

              <div className="mt-4">
                <Detail
                  label="Budget Type"
                  value={
                    Number(requirement.budget) > 0
                      ? formatLabel(requirement.budgetType)
                      : "—"
                  }
                />
              </div>

              <div className="mt-4">
                <Detail
                  label="Priority"
                  value={formatLabel(requirement.priority || "MEDIUM")}
                />
              </div>
            </div>
          </Section>

          {/* Metadata */}

          <Section title="Record Information" delay={4}>
            <div className="md:col-span-2">
              <Detail
                label="Source"
                value={
                  requirement.source === "VENDOR_PORTAL"
                    ? "Vendor Portal"
                    : "Admin Portal"
                }
              />

              <div className="mt-4">
                <Detail
                  label="Created"
                  value={formatDate(requirement.createdAt)}
                />
              </div>

              <div className="mt-4">
                <Detail
                  label="Last Updated"
                  value={formatDate(requirement.updatedAt)}
                />
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Status Progress
|--------------------------------------------------------------------------
*/

const StatusProgress = ({ currentStatus }) => {
  const flow = [
    "SUBMITTED",
    "OPEN",
    "SOURCING",
    "PROFILES_SENT",
    "SHORTLISTED",
    "CONFIRMED",
    "IN_PROGRESS",
    "COMPLETED",
  ];

  if (currentStatus === "CANCELLED") {
    return (
      <div className="animate-rise-in mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-semibold text-red-700">
          This requirement has been cancelled.
        </p>
      </div>
    );
  }

  const currentIndex = flow.indexOf(currentStatus);

  return (
    <div className="mt-6 overflow-x-auto pb-2">
      <div className="flex min-w-[850px] items-center">
        {flow.map((status, index) => {
          const completed = index <= currentIndex;

          const active = index === currentIndex;

          return (
            <div key={status} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500 ease-out ${
                    active ? "scale-110 shadow-md shadow-blue-200" : ""
                  } ${
                    completed
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {completed ? (
                    <FiCheckCircle size={16} className="animate-scale-in" />
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>

                <p
                  className={`mt-2 whitespace-nowrap text-[11px] font-semibold transition-colors duration-300 ${
                    active
                      ? "text-blue-600"
                      : completed
                        ? "text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {formatLabel(status)}
                </p>
              </div>

              {index < flow.length - 1 && (
                <div
                  className={`mx-2 mb-5 h-0.5 flex-1 transition-colors duration-500 ${
                    index < currentIndex ? "bg-blue-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| UI Components
|--------------------------------------------------------------------------
*/

const Section = ({ title, delay = 0, children }) => (
  <section
    style={{ animationDelay: `${180 + delay * 70}ms` }}
    className="hover-lift animate-rise-in rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-200 hover:border-slate-300 sm:p-6"
  >
    <h2 className="font-semibold text-slate-900">{title}</h2>

    <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
  </section>
);

const Label = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
    {children}
  </p>
);

const Detail = ({ label, value }) => (
  <div>
    <Label>{label}</Label>

    <p className="mt-1.5 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

const QuickCard = ({ icon: Icon, label, value, index = 0 }) => (
  <div
    style={{ animationDelay: `${index * 60}ms` }}
    className="hover-lift animate-rise-in rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-200 hover:border-slate-300"
  >
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-blue-50 p-3 text-blue-600 transition-transform duration-300 group-hover:scale-110">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>

        <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const SideDetail = ({ icon: Icon, label, value }) => (
  <div className="group flex items-center gap-3">
    <div className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
      <Icon size={16} />
    </div>

    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  </div>
);

export default RequirementDetailsPage;
