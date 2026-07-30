import { useEffect, useState } from "react";
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
  FiAlertCircle,
  FiRefreshCw,
  FiSend,
  FiLoader,
  FiUserCheck,
  FiClock,
  FiTrash2,
} from "react-icons/fi";

import trainersApi from "../../../api/trainersApi";
import { mapTrainerFromApi } from "../../../utils/trainerAdapter";

const TrainerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Trainer
  |--------------------------------------------------------------------------
  */

  const fetchTrainer = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await trainersApi.getById(id);

      setTrainer(mapTrainerFromApi(response.trainer));
    } catch (err) {
      console.error("Failed to fetch trainer:", err);

      setError(
        err.response?.data?.message || "Unable to load trainer information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainer();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Resend Portal Invitation
  |--------------------------------------------------------------------------
  */

  const handleSendInvitation = async () => {
    if (!trainer?.id) {
      return;
    }

    try {
      setInviting(true);

      setInviteSuccess("");
      setInviteError("");

      const response = await trainersApi.inviteToPortal(trainer.id);

      setInviteSuccess(
        response?.message || "Trainer portal invitation sent successfully.",
      );

      await fetchTrainer();
    } catch (err) {
      console.error("Failed to send trainer invitation:", err);

      setInviteError(
        err.response?.data?.message ||
          "Unable to send trainer portal invitation.",
      );
    } finally {
      setInviting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Trainer
  |--------------------------------------------------------------------------
  */

  const handleDeleteTrainer = async () => {
    const confirmed = window.confirm(
      "Delete this trainer? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await trainersApi.remove(id);

      navigate("/admin/trainers");
    } catch (err) {
      console.error("Failed to delete trainer:", err);

      setDeleteError(
        err.response?.data?.message || "Unable to delete trainer.",
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
    return <TrainerDetailsSkeleton />;
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !trainer) {
    return (
      <div className="relative mx-auto max-w-3xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

        <button
          type="button"
          onClick={() => navigate("/admin/trainers")}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Trainers</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-red-200/80 bg-white/80 p-8 text-center backdrop-blur-sm shadow-lg shadow-red-100/20">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-red-100/70 p-2.5">
              <FiAlertCircle size={28} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-red-800">
                {error ? "Trainer could not be loaded" : "Trainer not found"}
              </h2>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/trainers")}
                className="rounded-full bg-slate-100/80 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200/80 hover:shadow-md active:scale-95"
              >
                Return to trainers
              </button>
              {error && (
                <button
                  type="button"
                  onClick={fetchTrainer}
                  className="rounded-full bg-red-100/80 px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200/80 hover:shadow-md active:scale-95"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Portal Status
  |--------------------------------------------------------------------------
  */

  const portalActive = Boolean(trainer.portalEnabled);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative mx-auto max-w-7xl animate-fade-in-up px-4 py-6 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/20 to-pink-100/20 blur-3xl" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/admin/trainers")}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
      >
        <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back to Trainers</span>
      </button>

      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 backdrop-blur-xl shadow-2xl shadow-slate-200/40 transition-all duration-300 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
              {trainer.name
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")}
            </div>

            {/* Identity */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 sm:text-3xl">
                  {trainer.name}
                </h1>

                <StatusBadge status={trainer.status} />

                {portalActive ? (
                  <span className="rounded-full border border-blue-200/80 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-700 backdrop-blur-sm dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-300">
                    Portal Active
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-700 backdrop-blur-sm dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-300">
                    Invitation Pending
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {trainer.id}
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FiMapPin className="h-4 w-4" />
                  {trainer.city || "—"}
                  {trainer.state ? `, ${trainer.state}` : ""}
                </span>

                <span className="flex items-center gap-1.5">
                  <FiBriefcase className="h-4 w-4" />
                  {trainer.experienceYears || 0} years experience
                </span>

                <span className="flex items-center gap-1.5">
                  <FiStar className="h-4 w-4 text-amber-500" />
                  {trainer.rating ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!portalActive && (
              <button
                type="button"
                onClick={handleSendInvitation}
                disabled={inviting || !trainer.email}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/80 px-4 py-2.5 text-sm font-medium text-blue-700 backdrop-blur-sm transition hover:bg-blue-100/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
              >
                {inviting ? <FiLoader className="animate-spin" /> : <FiSend />}
                {inviting ? "Sending…" : "Resend Invitation"}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/admin/trainers/${trainer.id}/edit`)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit Trainer
            </button>

            <button
              type="button"
              onClick={handleDeleteTrainer}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200/80 bg-white/70 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              {deleting ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
              {deleting ? "Deleting…" : "Delete Trainer"}
            </button>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
      </div>

      {deleteError && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-red-100/30"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
              <FiAlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Delete failed
              </p>
              <p className="mt-1 text-sm text-red-700">{deleteError}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {inviteSuccess && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border border-emerald-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-emerald-100/30"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-600 shadow-inner">
              <FiCheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Invitation sent
              </p>
              <p className="mt-1 text-sm text-emerald-700">{inviteSuccess}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-300 to-emerald-500/60" />
        </div>
      )}

      {inviteError && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-red-100/30"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
              <FiAlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Invitation failed
              </p>
              <p className="mt-1 text-sm text-red-700">{inviteError}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {/* Portal Access Section */}
      <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-5 backdrop-blur-sm shadow-xl shadow-slate-200/30 transition-all duration-300 dark:bg-slate-800/30">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                portalActive
                  ? "bg-emerald-50/80 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300"
                  : "bg-amber-50/80 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
              }`}
            >
              {portalActive ? <FiUserCheck size={20} /> : <FiClock size={20} />}
            </div>

            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Trainer Portal Access
              </h2>

              {portalActive ? (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  This trainer has activated their account and can sign in to
                  the Nxthack Trainer Portal.
                </p>
              ) : (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Portal activation is pending. The trainer must open their
                  invitation email and create a password.
                </p>
              )}
            </div>
          </div>

          <div
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-sm ${
              portalActive
                ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-300"
                : "border-amber-200/80 bg-amber-50/80 text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-300"
            }`}
          >
            {portalActive ? "ACTIVE" : "PENDING"}
          </div>
        </div>

        {!portalActive && trainer.email && (
          <div className="mt-4 border-t border-slate-200/60 pt-4 dark:border-white/10">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <FiMail className="h-4 w-4" />
              Invitation email:
              <span className="font-semibold text-slate-800 dark:text-white">
                {trainer.email}
              </span>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20" />
      </section>

      {/* Main Information Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Skills */}
          <Section title="Skills">
            {trainer.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {trainer.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1.5 text-sm font-medium text-blue-700 backdrop-blur-sm dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyText>No skills added.</EmptyText>
            )}
          </Section>

          {/* Training Profile */}
          <Section title="Training Profile">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info
                label="Industry Experience"
                value={`${trainer.experienceYears || 0} years`}
              />
              <Info
                label="Training Experience"
                value={`${trainer.trainingExperienceYears || 0} years`}
              />
              <Info
                label="Training Types"
                value={
                  trainer.trainingTypes?.length
                    ? trainer.trainingTypes.join(", ")
                    : "—"
                }
              />
              <Info
                label="Training Modes"
                value={trainer.modes?.length ? trainer.modes.join(", ") : "—"}
              />
              <Info
                label="Assignments Completed"
                value={trainer.assignmentsCompleted ?? 0}
              />
              <Info label="Availability" value={trainer.availability || "—"} />
            </div>
          </Section>

          {/* Preferred Locations */}
          <Section title="Preferred Locations">
            {trainer.preferredLocations?.length ? (
              <div className="flex flex-wrap gap-2">
                {trainer.preferredLocations.map((location) => (
                  <span
                    key={location}
                    className="rounded-full border border-slate-200/60 bg-slate-50/80 px-3 py-1.5 text-sm text-slate-700 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-300"
                  >
                    <FiMapPin className="mr-1 inline h-3.5 w-3.5" />
                    {location}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyText>No preferred locations added.</EmptyText>
            )}
          </Section>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Contact */}
          <Section title="Contact">
            <div className="space-y-4">
              <Contact icon={FiMail} value={trainer.email} />
              <Contact icon={FiPhone} value={trainer.phone} />
            </div>
          </Section>

          {/* Rates */}
          <Section title="Rates">
            <div className="space-y-4">
              <Info
                label="Online"
                value={
                  trainer.onlineRate != null
                    ? `₹${Number(trainer.onlineRate).toLocaleString(
                        "en-IN",
                      )}/day`
                    : "—"
                }
              />
              <Info
                label="Offline"
                value={
                  trainer.offlineRate != null
                    ? `₹${Number(trainer.offlineRate).toLocaleString(
                        "en-IN",
                      )}/day`
                    : "—"
                }
              />
            </div>
          </Section>

          {/* Documents */}
          <Section title="Documents">
            {trainer.cvUrl ? (
              <a
                href={trainer.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-blue-50/80 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100/80 hover:shadow-md dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
              >
                <FiFileText className="h-4 w-4" />
                View CV
              </a>
            ) : (
              <EmptyText>No CV uploaded.</EmptyText>
            )}
          </Section>

          {/* Performance */}
          <Section title="Performance">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50/80 p-2.5 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
                <FiCheckCircle size={20} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {trainer.assignmentsCompleted ?? 0} Trainings
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Rating {trainer.rating ?? 0}/5
                </p>
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
| Status Badge
|--------------------------------------------------------------------------
*/

const StatusBadge = ({ status }) => {
  const colors = {
    Available:
      "border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-300",
    Busy: "border-amber-200/80 bg-amber-50/80 text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-300",
    "On Leave":
      "border-rose-200/80 bg-rose-50/80 text-rose-700 dark:border-rose-800/30 dark:bg-rose-900/20 dark:text-rose-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${
        colors[status] ||
        "border-slate-200/80 bg-slate-50/80 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-400"
      }`}
    >
      {status}
    </span>
  );
};

/*
|--------------------------------------------------------------------------
| Section (Glass Card)
|--------------------------------------------------------------------------
*/

const Section = ({ title, children }) => (
  <section className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-5 backdrop-blur-sm shadow-xl shadow-slate-200/30 transition-all duration-300 dark:bg-slate-800/30">
    <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
      {title}
    </h2>
    {children}
    <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20" />
  </section>
);

/*
|--------------------------------------------------------------------------
| Info
|--------------------------------------------------------------------------
*/

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
      {value || "—"}
    </p>
  </div>
);

/*
|--------------------------------------------------------------------------
| Contact
|--------------------------------------------------------------------------
*/

const Contact = ({ icon: Icon, value }) => (
  <div className="flex items-center gap-3">
    <div className="rounded-lg bg-slate-100/80 p-2 text-slate-500 backdrop-blur-sm dark:bg-slate-700/50 dark:text-slate-400">
      <Icon className="h-4 w-4" />
    </div>
    <span className="break-all text-sm text-slate-600 dark:text-slate-300">
      {value || "—"}
    </span>
  </div>
);

/*
|--------------------------------------------------------------------------
| Empty Text
|--------------------------------------------------------------------------
*/

const EmptyText = ({ children }) => (
  <p className="text-sm text-slate-400 dark:text-slate-500">{children}</p>
);

/*
|--------------------------------------------------------------------------
| Skeleton (Glass style)
|--------------------------------------------------------------------------
*/

const TrainerDetailsSkeleton = () => (
  <div className="relative mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
    <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/20 to-pink-100/20 blur-3xl" />

    <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700" />

    <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 backdrop-blur-xl shadow-2xl shadow-slate-200/40">
      <div className="flex gap-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1">
          <div className="h-7 w-64 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-40 rounded bg-slate-100 dark:bg-slate-700" />
          <div className="mt-3 flex gap-4">
            <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-700" />
            <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="relative h-32 rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
        <div className="relative h-48 rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
        <div className="relative h-32 rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
      </div>
      <div className="space-y-6">
        <div className="relative h-40 rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
        <div className="relative h-32 rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
        <div className="relative h-24 rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
        <div className="relative h-28 rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
      </div>
    </div>
  </div>
);

export default TrainerDetailsPage;
