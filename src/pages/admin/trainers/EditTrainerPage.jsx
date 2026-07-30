import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiRefreshCw,
  FiSave,
} from "react-icons/fi";

import TrainerForm from "../../../components/admin/trainers/TrainerForm";
import trainersApi from "../../../api/trainersApi";
import {
  mapTrainerFromApi,
  mapTrainerToApi,
} from "../../../utils/trainerAdapter";

const EditTrainerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchTrainer = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await trainersApi.getById(id);
      setTrainer(mapTrainerFromApi(response.trainer));
    } catch (err) {
      console.error("Failed to load trainer:", err);
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

  const handleSubmit = async (trainerData) => {
    try {
      setSubmitting(true);
      setError("");
      await trainersApi.update(id, mapTrainerToApi(trainerData));
      navigate(`/admin/trainers/${id}`, { replace: true });
    } catch (err) {
      console.error("Failed to update trainer:", err);
      setError(
        err.response?.data?.message ||
          "Unable to update trainer. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
        <div>
          <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
              </div>
            ))}
            <div className="h-12 w-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  // ---------- Error State (trainer not found) ----------
  if (error && !trainer) {
    return (
      <div className="mx-auto max-w-5xl animate-fade-in-up">
        <button
          onClick={() => navigate("/admin/trainers")}
          className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Trainers
        </button>

        <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center backdrop-blur-sm shadow-xl shadow-rose-500/5">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/10 blur-2xl" />
          <div className="relative">
            <FiAlertCircle className="mx-auto h-12 w-12 text-rose-500" />
            <h2 className="mt-3 text-xl font-bold text-rose-900 dark:text-rose-400">
              Trainer could not be loaded
            </h2>
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
            <button
              onClick={fetchTrainer}
              className="group mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-white/50 px-4 py-2.5 text-sm font-semibold text-rose-700 backdrop-blur-sm transition hover:bg-rose-500/10 hover:border-rose-500/50 dark:bg-white/5 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              <FiRefreshCw className="transition-transform duration-500 group-hover:rotate-180" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Not Found ----------
  if (!trainer) {
    return (
      <div className="mx-auto max-w-5xl animate-fade-in-up">
        <div className="rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-12 text-center shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <FiAlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Trainer not found.
          </p>
          <button
            onClick={() => navigate("/admin/trainers")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:scale-105 hover:shadow-blue-500/50"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Trainers
          </button>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in-up">
      {/* Back button */}
      <button
        onClick={() => navigate(`/admin/trainers/${id}`)}
        disabled={submitting}
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
        Back to Trainer
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Edit Trainer
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update {trainer.name}'s trainer profile.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 backdrop-blur-sm shadow-sm">
          <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-900 dark:text-rose-400">
              Unable to update trainer
            </p>
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          </div>
          <button
            onClick={() => setError("")}
            className="text-rose-500/70 transition hover:text-rose-500"
          >
            <FiAlertCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form Container – Glass */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5">
        {/* Decorative glow */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl opacity-50" />

        <div className="relative p-6 md:p-8">
          <TrainerForm
            initialData={trainer}
            onSubmit={handleSubmit}
            submitLabel={submitting ? "Updating..." : "Update Trainer"}
            isSubmitting={submitting}
          />
        </div>
      </div>

      {/* Optional: Add a save indicator or extra actions */}
      <div className="flex justify-end text-xs text-slate-400 dark:text-slate-500">
        <span>Trainer ID: {trainer.id}</span>
      </div>
    </div>
  );
};

export default EditTrainerPage;
