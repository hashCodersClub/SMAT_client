import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import TrainerForm from "../../../components/admin/trainers/TrainerForm";
import { trainers } from "../../../data/trainers";

const EditTrainerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const trainer = trainers.find((item) => item.id === id);

  if (!trainer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Trainer not found.
      </div>
    );
  }

  const handleSubmit = (trainerData) => {
    console.log("Updated trainer:", trainerData);

    // Later:
    // await trainersApi.update(id, trainerData);

    alert("Trainer updated.");

    navigate(`/trainers/${id}`);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate(`/trainers/${id}`)}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
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

      <TrainerForm
        initialData={trainer}
        onSubmit={handleSubmit}
        submitLabel="Update Trainer"
      />
    </div>
  );
};

export default EditTrainerPage;
