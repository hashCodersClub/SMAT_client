import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiMapPin,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";

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
    let ignore = false;
    const fetchRequirement = async () => {
      try {
        setError("");
        const response = await requirementsApi.getMineById(id);
        if (!ignore) {
          setRequirement(response.requirement);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load requirement:", error);
          setError(
            error.response?.data?.message || "Unable to load this requirement.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchRequirement();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={24}
            className="mx-auto animate-spin text-blue-600"
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

      {/* Status information */}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          Current status: {formatLabel(requirement.status)}
        </p>

        <p className="mt-1 text-sm leading-6 text-blue-700">
          Nxthack's operations team manages the sourcing and fulfillment status
          of your requirement.
        </p>
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
                      className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700"
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
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
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
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
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
