import { useState } from "react";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import TrainerForm from "../../../components/admin/trainers/TrainerForm";
import trainersApi from "../../../api/trainersApi";
import { mapTrainerToApi } from "../../../utils/trainerAdapter";

const AddTrainerPage = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (trainerData) => {
    try {
      setSubmitting(true);
      setError("");

      await trainersApi.create(mapTrainerToApi(trainerData));

      navigate("/trainers", {
        replace: true,
      });
    } catch (err) {
      console.error("Failed to create trainer:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create trainer. Please check the information and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={() => navigate("/trainers")}
        disabled={submitting}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiArrowLeft />
        Back to Trainers
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Trainer</h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new trainer to the Nxthack trainer network.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to create trainer
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <TrainerForm
        onSubmit={handleSubmit}
        submitLabel={submitting ? "Saving..." : "Save Trainer"}
      />
    </div>
  );
};

export default AddTrainerPage;
