import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiCreditCard,
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
  FiFolder,
  FiExternalLink,
  FiCode,
  FiX,
} from "react-icons/fi";

import trainersApi from "../../../api/trainersApi";
import trainerInvitationApi from "../../../api/trainerInvitationApi"; // <-- added import
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

  const [editingRateCard, setEditingRateCard] = useState(false);
  const [rateCardForm, setRateCardForm] = useState({
    hourlyRate: "",
    dailyRate: "",
    batchRate: "",
    fixedProjectRate: "",
    currency: "INR",
  });
  const [savingRates, setSavingRates] = useState(false);

  const handleOpenRateModal = () => {
    const rc = trainer?.rateCard || trainer || {};
    setRateCardForm({
      hourlyRate: rc.hourlyRate ?? trainer?.hourlyRate ?? "",
      dailyRate: rc.dailyRate ?? trainer?.dailyRate ?? "",
      batchRate: rc.batchRate ?? trainer?.batchRate ?? "",
      fixedProjectRate: rc.fixedProjectRate ?? trainer?.fixedProjectRate ?? "",
      currency: rc.currency || trainer?.currency || "INR",
    });
    setEditingRateCard(true);
  };

  const handleSaveRateCard = async () => {
    try {
      setSavingRates(true);
      const payload = {
        hourlyRate: rateCardForm.hourlyRate !== "" ? Number(rateCardForm.hourlyRate) : null,
        dailyRate: rateCardForm.dailyRate !== "" ? Number(rateCardForm.dailyRate) : null,
        batchRate: rateCardForm.batchRate !== "" ? Number(rateCardForm.batchRate) : null,
        fixedProjectRate: rateCardForm.fixedProjectRate !== "" ? Number(rateCardForm.fixedProjectRate) : null,
        currency: rateCardForm.currency || "INR",
        rateCard: {
          hourlyRate: rateCardForm.hourlyRate !== "" ? Number(rateCardForm.hourlyRate) : null,
          dailyRate: rateCardForm.dailyRate !== "" ? Number(rateCardForm.dailyRate) : null,
          batchRate: rateCardForm.batchRate !== "" ? Number(rateCardForm.batchRate) : null,
          fixedProjectRate: rateCardForm.fixedProjectRate !== "" ? Number(rateCardForm.fixedProjectRate) : null,
          currency: rateCardForm.currency || "INR",
        },
      };

      await trainersApi.update(trainer.id || trainer._id || id, payload);
      setEditingRateCard(false);
      await fetchTrainer();
    } catch (err) {
      console.error("Failed to update rate card:", err);
    } finally {
      setSavingRates(false);
    }
  };

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
    const trainerId = trainer?.id || trainer?._id || id;

    if (!trainerId) {
      setInviteError("Trainer ID is missing.");
      return;
    }

    try {
      setInviting(true);
      setInviteSuccess("");
      setInviteError("");

      const response = await trainerInvitationApi.invite(trainerId);

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

      {/* Invitation Alert Banners */}
      {inviteSuccess && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
          <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600 h-5 w-5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Portal Invitation Sent</p>
            <p className="text-sm text-emerald-700">{inviteSuccess}</p>
          </div>
          <button
            type="button"
            onClick={() => setInviteSuccess("")}
            className="text-emerald-500 hover:text-emerald-800"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {inviteError && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
          <FiAlertCircle className="mt-0.5 shrink-0 text-red-600 h-5 w-5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Invitation Error</p>
            <p className="text-sm text-red-700">{inviteError}</p>
          </div>
          <button
            type="button"
            onClick={() => setInviteError("")}
            className="text-red-500 hover:text-red-800"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 backdrop-blur-xl shadow-2xl shadow-slate-200/40 transition-all duration-300 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-lg shadow-blue-500/30">
              {trainer.profilePhotoUrl ? (
                <img
                  src={trainer.profilePhotoUrl}
                  alt={trainer.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-xl font-bold text-white">
                  {trainer.name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                </div>
              )}
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

      {/* Commercial Rate Card & Commercial Analysis Section */}
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 p-6 backdrop-blur-xl shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold">
              <FiDollarSign size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Commercial Rate Card</h2>
              <p className="text-xs font-medium text-slate-500">Standard rates registered by this trainer across delivery models.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenRateModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-xs hover:bg-indigo-50 transition"
          >
            <FiEdit2 size={13} />
            Edit Rate Card
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hourly Rate</span>
            <p className="mt-1 text-lg font-black text-slate-900">
              {trainer.hourlyRate || trainer.rateCard?.hourlyRate ? `₹${Number(trainer.hourlyRate || trainer.rateCard?.hourlyRate).toLocaleString("en-IN")}` : "—"}
              <span className="text-xs font-bold text-slate-400"> / hr</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Rate</span>
            <p className="mt-1 text-lg font-black text-slate-900">
              {trainer.dailyRate || trainer.rateCard?.dailyRate ? `₹${Number(trainer.dailyRate || trainer.rateCard?.dailyRate).toLocaleString("en-IN")}` : "—"}
              <span className="text-xs font-bold text-slate-400"> / day</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch Rate</span>
            <p className="mt-1 text-lg font-black text-slate-900">
              {trainer.batchRate || trainer.rateCard?.batchRate ? `₹${Number(trainer.batchRate || trainer.rateCard?.batchRate).toLocaleString("en-IN")}` : "—"}
              <span className="text-xs font-bold text-slate-400"> / batch</span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fixed Project Cost</span>
            <p className="mt-1 text-lg font-black text-slate-900">
              {trainer.fixedProjectRate || trainer.rateCard?.fixedProjectRate ? `₹${Number(trainer.fixedProjectRate || trainer.rateCard?.fixedProjectRate).toLocaleString("en-IN")}` : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Banking & Payout Details Section */}
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl shadow-xl shadow-slate-200/40 transition-all duration-300 dark:bg-slate-800/40">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold">
              <FiCreditCard size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Banking & Payout Details</h2>
              <p className="text-xs font-medium text-slate-500">Bank account and tax information registered for disbursement.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Holder Name</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {trainer.bankDetails?.accountHolderName || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank & Branch</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {trainer.bankDetails?.bankName ? (
                <>
                  {trainer.bankDetails.bankName}
                  {trainer.bankDetails.branchName && (
                    <span className="text-xs font-normal text-slate-500"> ({trainer.bankDetails.branchName})</span>
                  )}
                </>
              ) : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number</span>
            <p className="mt-1 font-mono text-sm font-bold tracking-wider text-slate-900">
              {trainer.bankDetails?.accountNumber || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IFSC Code</span>
            <p className="mt-1 font-mono text-sm font-bold uppercase text-slate-900">
              {trainer.bankDetails?.ifscCode || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN Number (Tax ID)</span>
            <p className="mt-1 font-mono text-sm font-bold uppercase text-slate-900">
              {trainer.bankDetails?.panNumber || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI ID</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {trainer.bankDetails?.upiId || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Document</span>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {trainer.bankDetails?.cancelledChequeUrl ? (
                <a
                  href={trainer.bankDetails.cancelledChequeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline"
                >
                  <FiExternalLink size={14} />
                  View Cancelled Cheque / Passbook
                </a>
              ) : (
                <span className="font-normal text-slate-400">No document attached</span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Portal Access & Automated Workflow Lifecycle Section */}
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl shadow-xl shadow-slate-200/40 transition-all duration-300 dark:bg-slate-800/40">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                portalActive
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-500/20"
                  : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/20"
              }`}
            >
              {portalActive ? <FiUserCheck size={22} /> : <FiClock size={22} />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Trainer Portal Access
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    portalActive
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  }`}
                >
                  {portalActive ? "ACTIVE" : "PENDING"}
                </span>
              </div>

              {portalActive ? (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Account activated for <span className="font-semibold text-slate-900 dark:text-white">{trainer.email}</span>. The trainer can sign in to manage profile, view requirement matches, and accept assignments.
                </p>
              ) : (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Portal invitation email sent to <span className="font-semibold text-slate-900 dark:text-white">{trainer.email || "trainer"}</span>. Awaiting trainer to set up their password.
                </p>
              )}
            </div>
          </div>

          {!portalActive && trainer.email && (
            <button
              type="button"
              onClick={handleSendInvitation}
              disabled={inviting}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {inviting ? <FiLoader className="animate-spin" /> : <FiSend />}
              {inviting ? "Sending..." : "Resend Invitation Email"}
            </button>
          )}
        </div>

        {/* Automated Workflow Lifecycle Stepper */}
        <div className="mt-6 border-t border-slate-200/60 pt-5 dark:border-white/10">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Automated Onboarding Workflow
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-xs">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">1. Profile Added</p>
                <p className="text-[10px] text-slate-500">By Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${trainer.email ? "bg-emerald-500" : "bg-amber-500"}`}>
                {trainer.email ? "✓" : "2"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">2. Email Dispatched</p>
                <p className="text-[10px] text-slate-500">{trainer.email ? "Activation Link Sent" : "Email Required"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${portalActive ? "bg-emerald-500" : "bg-amber-400"}`}>
                {portalActive ? "✓" : "3"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">3. Password Setup</p>
                <p className="text-[10px] text-slate-500">{portalActive ? "Completed by Trainer" : "Pending Action"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${portalActive ? "bg-emerald-500" : "bg-slate-300"}`}>
                {portalActive ? "✓" : "4"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">4. Portal Activated</p>
                <p className="text-[10px] text-slate-500">{portalActive ? "Ready for Login" : "Awaiting Setup"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 opacity-30" />
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
          {/* Languages */}
          <Section title="Languages">
            {trainer.languages?.length ? (
              <>
                <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Speaks {trainer.languages.length}{" "}
                  {trainer.languages.length === 1 ? "language" : "languages"}
                </p>

                <div className="flex flex-wrap gap-2">
                  {trainer.languages.map((language) => (
                    <span
                      key={language.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-3 py-1.5 text-sm font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/30 dark:bg-indigo-900/20 dark:text-indigo-300"
                    >
                      {language.name}
                      <span className="text-xs font-normal opacity-70">
                        {formatProficiency(language.proficiency)}
                      </span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <EmptyText>No languages added.</EmptyText>
            )}
          </Section>

          {/* Projects Worked On */}
          <Section title="Projects Worked On">
            {trainer.projects?.length ? (
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                {trainer.projects.map((project, index) => (
                  <div
                    key={project._id || index}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/70 p-4 backdrop-blur-sm shadow-xs transition hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FiFolder className="text-blue-600 dark:text-blue-400" size={16} />
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {project.title}
                          </h3>
                        </div>
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                          >
                            <FiExternalLink size={12} className="inline mr-1" />
                            Link
                          </a>
                        )}
                      </div>
                      {project.description && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
                          {project.description}
                        </p>
                      )}
                    </div>
                    {project.technologies?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1 border-t border-slate-100 pt-2 dark:border-slate-700/50">
                        {project.technologies.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          >
                            <FiCode size={9} className="text-slate-400" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyText>No projects added.</EmptyText>
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

      {/* Admin Edit Rate Card Modal */}
      {editingRateCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FiDollarSign className="text-indigo-600" /> Edit Commercial Rate Card
              </h3>
              <button
                type="button"
                onClick={() => setEditingRateCard(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Hourly Rate (₹/hr)</label>
                <input
                  type="number"
                  value={rateCardForm.hourlyRate}
                  onChange={(e) => setRateCardForm({ ...rateCardForm, hourlyRate: e.target.value })}
                  placeholder="e.g. 600"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Daily Rate (₹/day)</label>
                <input
                  type="number"
                  value={rateCardForm.dailyRate}
                  onChange={(e) => setRateCardForm({ ...rateCardForm, dailyRate: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Batch Rate (₹/batch)</label>
                <input
                  type="number"
                  value={rateCardForm.batchRate}
                  onChange={(e) => setRateCardForm({ ...rateCardForm, batchRate: e.target.value })}
                  placeholder="e.g. 45000"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fixed Project Cost (₹)</label>
                <input
                  type="number"
                  value={rateCardForm.fixedProjectRate}
                  onChange={(e) => setRateCardForm({ ...rateCardForm, fixedProjectRate: e.target.value })}
                  placeholder="e.g. 75000"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={savingRates}
                onClick={handleSaveRateCard}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {savingRates ? "Saving…" : "Save Rate Card"}
              </button>
              <button
                type="button"
                onClick={() => setEditingRateCard(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
| Format Proficiency
|--------------------------------------------------------------------------
*/

const PROFICIENCY_LABELS = {
  BASIC: "Basic",
  CONVERSATIONAL: "Conversational",
  PROFESSIONAL: "Professional",
  NATIVE: "Native",
};

const formatProficiency = (value) =>
  PROFICIENCY_LABELS[value] || "Professional";

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
