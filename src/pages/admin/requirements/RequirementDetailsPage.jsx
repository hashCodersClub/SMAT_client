import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiMapPin,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

import { requirements } from "../../../data/requirements";

const statusStyles = {
  OPEN: "bg-blue-50 text-blue-700",
  SOURCING: "bg-amber-50 text-amber-700",
  PROFILES_SENT: "bg-purple-50 text-purple-700",
  SHORTLISTED: "bg-cyan-50 text-cyan-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const RequirementDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const requirement = requirements.find((item) => item.id === id);

  if (!requirement) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Requirement not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/requirements")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Requirements
      </button>

      {/* Header */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {requirement.title}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusStyles[requirement.status]
                }`}
              >
                {requirement.status.replaceAll("_", " ")}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {requirement.id} • {requirement.vendorName}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/requirements/${requirement.id}/edit`)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FiEdit2 />
              Edit
            </button>

            <button
              onClick={() =>
                navigate(`/requirements/${requirement.id}/matches`)
              }
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FiSearch />
              Find Trainers
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary
          icon={FiCalendar}
          label="Training Dates"
          value={`${requirement.startDate} → ${requirement.endDate}`}
        />

        <Summary
          icon={FiMapPin}
          label="Location"
          value={`${requirement.city} • ${requirement.mode}`}
        />

        <Summary
          icon={FiUsers}
          label="Trainers Required"
          value={requirement.numberOfTrainers}
        />

        <Summary
          icon={FiClock}
          label="Timing"
          value={`${requirement.startTime} - ${requirement.endTime}`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Required Skills">
            <div className="flex flex-wrap gap-2">
              {requirement.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Requirement Description">
            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
              {requirement.description || "No description provided."}
            </p>
          </Section>

          <Section title="Location & Schedule">
            <div className="grid gap-5 sm:grid-cols-2">
              <Info label="City" value={requirement.city} />
              <Info label="State" value={requirement.state} />
              <Info label="Venue" value={requirement.venue} />
              <Info label="Mode" value={requirement.mode} />
              <Info
                label="Batch Size"
                value={`${requirement.batchSize} learners`}
              />
              <Info label="Training Type" value={requirement.trainingType} />
            </div>
          </Section>

          <Section title="Internal Notes">
            <p className="text-sm leading-6 text-slate-600">
              {requirement.notes || "No internal notes."}
            </p>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Commercial">
            <Info
              label="Vendor Budget"
              value={`₹${requirement.budget.toLocaleString("en-IN")} ${
                requirement.budgetType
              }`}
            />

            <div className="mt-5">
              <Info
                label="Minimum Experience"
                value={`${requirement.experienceRequired} years`}
              />
            </div>
          </Section>

          <Section title="Requirement">
            <div className="space-y-5">
              <Info label="Vendor" value={requirement.vendorName} />
              <Info label="Source" value={requirement.source} />
              <Info label="Priority" value={requirement.priority} />
              <Info label="Created" value={requirement.createdAt} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Summary = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Icon />
    </div>

    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 font-semibold text-slate-800">{value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 font-semibold text-slate-900">{title}</h2>
    {children}
  </section>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-sm font-medium text-slate-700">
      {value || "Not provided"}
    </p>
  </div>
);

export default RequirementDetailsPage;
