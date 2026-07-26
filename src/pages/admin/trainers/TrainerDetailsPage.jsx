import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiStar,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

import { trainers } from "../../../data/trainers";

const TrainerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const trainer = trainers.find((item) => item.id === id);

  if (!trainer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <h2 className="text-xl font-semibold">Trainer not found</h2>

        <button
          onClick={() => navigate("/trainers")}
          className="mt-4 text-sm font-medium text-blue-600"
        >
          Return to trainers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}

      <button
        onClick={() => navigate("/trainers")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Trainers
      </button>

      {/* Profile header */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-xl font-bold text-white">
              {trainer.name
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">
                  {trainer.name}
                </h1>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {trainer.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-400">{trainer.id}</p>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <FiMapPin />
                  {trainer.city}, {trainer.state}
                </span>

                <span className="flex items-center gap-1.5">
                  <FiBriefcase />
                  {trainer.experienceYears} years experience
                </span>

                <span className="flex items-center gap-1.5">
                  <FiStar className="text-amber-500" />
                  {trainer.rating}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/trainers/${trainer.id}/edit`)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FiEdit2 />
            Edit Trainer
          </button>
        </div>
      </div>

      {/* Main information */}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Skills">
            <div className="flex flex-wrap gap-2">
              {trainer.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Training Profile">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Industry Experience"
                value={`${trainer.experienceYears} years`}
              />

              <Info
                label="Training Experience"
                value={`${trainer.trainingExperienceYears} years`}
              />

              <Info
                label="Training Types"
                value={trainer.trainingTypes.join(", ")}
              />

              <Info label="Training Modes" value={trainer.modes.join(", ")} />

              <Info
                label="Assignments Completed"
                value={trainer.assignmentsCompleted}
              />

              <Info label="Availability" value={trainer.availability} />
            </div>
          </Section>

          <Section title="Preferred Locations">
            <div className="flex flex-wrap gap-2">
              {trainer.preferredLocations.map((location) => (
                <span
                  key={location}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                >
                  <FiMapPin className="mr-1 inline" />
                  {location}
                </span>
              ))}
            </div>
          </Section>
        </div>

        {/* Sidebar */}

        <div className="space-y-6">
          <Section title="Contact">
            <div className="space-y-4">
              <Contact icon={FiMail} value={trainer.email} />
              <Contact icon={FiPhone} value={trainer.phone} />
            </div>
          </Section>

          <Section title="Rates">
            <div className="space-y-4">
              <Info
                label="Online"
                value={`₹${trainer.onlineRate.toLocaleString("en-IN")}/day`}
              />

              <Info
                label="Offline"
                value={`₹${trainer.offlineRate.toLocaleString("en-IN")}/day`}
              />
            </div>
          </Section>

          <Section title="Documents">
            {trainer.cvUrl ? (
              <a
                href={trainer.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-blue-600"
              >
                <FiFileText />
                View CV
              </a>
            ) : (
              <p className="text-sm text-slate-400">No CV uploaded.</p>
            )}
          </Section>

          <Section title="Performance">
            <div className="flex items-center gap-3">
              <FiCheckCircle size={28} className="text-emerald-500" />

              <div>
                <p className="font-semibold text-slate-800">
                  {trainer.assignmentsCompleted} Trainings
                </p>

                <p className="text-sm text-slate-500">
                  Rating {trainer.rating}/5
                </p>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

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

    <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
  </div>
);

const Contact = ({ icon: Icon, value }) => (
  <div className="flex items-center gap-3">
    <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
      <Icon />
    </div>

    <span className="break-all text-sm text-slate-600">{value}</span>
  </div>
);

export default TrainerDetailsPage;
