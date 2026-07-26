import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import TrainerForm from "../../../components/admin/trainers/TrainerForm";

const AddTrainerPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (trainerData) => {
    console.log("New trainer:", trainerData);

    // Later:
    // await trainersApi.create(trainerData);

    alert("Trainer data captured successfully.");

    navigate("/trainers");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={() => navigate("/trainers")}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
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

      <TrainerForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddTrainerPage;
