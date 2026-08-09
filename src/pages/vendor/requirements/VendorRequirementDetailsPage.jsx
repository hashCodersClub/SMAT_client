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
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";
import opportunitiesApi from "../../../api/opportunitiesApi";
import {
  OPPORTUNITY_STATUS_STYLES,
  formatStatusLabel,
} from "../../../constants/statuses";
import ActivityTimeline from "../../../components/ui/ActivityTimeline";
import { buildRequirementTimeline } from "../../../utils/requirementTimeline";

// Trainer sourcing changes from outside this page (trainers responding,
// admin/ops moving demos forward), so re-poll instead of relying on the
// vendor to click "Refresh" to see the latest status.
const SOURCING_POLL_INTERVAL_MS = 15000;

// Opportunity statuses at which the trainer's sanitized profile becomes
// available to view (mirrors the backend's PROFILE_VISIBLE_OPPORTUNITY_STATUSES).
const PROFILE_VISIBLE_STATUSES = [
  "INTERESTED",
  "MAYBE",
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

  const [sourcing, setSourcing] = useState(null);
  const [sourcingLoading, setSourcingLoading] = useState(true);

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
      // A requirement that hasn't been sourced yet (still DRAFT, or
      // matching hasn't run) simply has nothing to show here — not an
      // error the vendor needs to see.
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

  const timelineEvents = buildRequirementTimeline(sourcing?.candidates || []);

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

  if (error || !requirement) {
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
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
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

      {/* Trainer Sourcing Status */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-900">Trainer Sourcing</h2>
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
          <p className="mt-3 text-sm text-slate-500">
            Loading sourcing status...
          </p>
        ) : !sourcing?.candidates?.length ? (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {["DRAFT", "SUBMITTED"].includes(requirement.status)
              ? "Trainers haven't been matched yet — this updates automatically once your requirement is picked up."
              : "No trainers have been contacted for this requirement yet."}
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <SourcingStat
                label="Contacted"
                value={sourcing.stats?.totalContacted ?? 0}
              />
              <SourcingStat
                label="Notified"
                value={sourcing.stats?.notified ?? 0}
              />
              <SourcingStat
                label="Viewed"
                value={sourcing.stats?.viewed ?? 0}
                icon={FiEye}
              />
              <SourcingStat
                label="Interested"
                value={sourcing.stats?.interested ?? 0}
                icon={FiCheck}
                tone="emerald"
              />
              <SourcingStat
                label="Declined"
                value={sourcing.stats?.declined ?? 0}
                icon={FiX}
                tone="slate"
              />
              <SourcingStat
                label="Shortlisted"
                value={sourcing.stats?.shortlisted ?? 0}
                icon={FiStar}
                tone="purple"
              />
            </div>

            <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {sourcing.candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <FiSend size={14} className="text-slate-400" />
                    <span className="font-semibold text-slate-800">
                      {candidate.trainerName}
                    </span>
                    {candidate.city && (
                      <span className="text-xs text-slate-400">
                        • {candidate.city}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {candidate.quotedRate ? (
                      <span className="text-xs font-medium text-slate-500">
                        ₹{Number(candidate.quotedRate).toLocaleString("en-IN")}
                        /day
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
                        OPPORTUNITY_STATUS_STYLES[candidate.status] ||
                        "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {formatStatusLabel(candidate.status)}
                    </span>
                    {PROFILE_VISIBLE_STATUSES.includes(candidate.status) && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/vendor/requirements/${requirement._id}/opportunities/${candidate._id}`,
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <FiEye size={13} />
                        View Profile
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Trainer Interaction Timeline */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold text-slate-900">Activity Timeline</h2>
        <p className="mt-1 text-sm text-slate-500">
          Live updates as trainers are notified and respond. Refreshes
          automatically.
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
            requirement.mode === "ONLINE" ? "Online" : requirement.city || "—"
          }
        />

        <QuickCard
          icon={FiUsers}
          label="Participants"
          value={requirement.participants || "—"}
        />
      </div>

      {/* Main content */}

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

          {requirement.vendorNotes && (
            <Section title="Additional Notes">
              <div className="md:col-span-2">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {requirement.vendorNotes}
                </p>
              </div>
            </Section>
          )}
        </div>

        {/* Right */}

        <div className="space-y-6">
          <Section title="Schedule">
            <div className="md:col-span-2 space-y-4">
              <SideDetail
                icon={FiCalendar}
                label="Start"
                value={formatDate(requirement.startDate)}
              />

              <SideDetail
                icon={FiCalendar}
                label="End"
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

          <Section title="Location">
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

const SideDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
      <Icon size={16} />
    </div>

    <div>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  </div>
);

export default VendorRequirementDetailsPage;
