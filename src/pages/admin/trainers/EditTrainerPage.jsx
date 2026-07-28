import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

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

      navigate(`/admin/trainers/${id}`, {
        replace: true,
      });
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

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (error && !trainer) {
    return (
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/admin/trainers")}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <FiArrowLeft />
          Back to Trainers
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <FiAlertCircle size={30} className="mx-auto text-red-500" />

          <h2 className="mt-3 font-bold text-red-900">
            Trainer could not be loaded
          </h2>

          <p className="mt-1 text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchTrainer}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Trainer not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate(`/admin/trainers/${id}`)}
        disabled={submitting}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiArrowLeft />
        Back to Trainer
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Trainer</h1>

        <p className="mt-1 text-sm text-slate-500">
          Update {trainer.name}'s trainer profile.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to update trainer
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <TrainerForm
        initialData={trainer}
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Updating..." : "Update Trainer"}
      />
    </div>
  );
};

export default EditTrainerPage;
