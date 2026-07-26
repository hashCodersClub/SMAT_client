import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import RequirementForm from "../../../components/admin/requirements/RequirementForm";
import { requirements } from "../../../data/requirements";

const EditRequirementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const requirement = requirements.find((item) => item.id === id);

  if (!requirement) {
    return <div>Requirement not found.</div>;
  }

  const handleSubmit = (data) => {
    console.log("Updated requirement:", data);

    // Later:
    // await requirementsApi.update(id, data);

    alert("Requirement updated.");

    navigate(`/requirements/${id}`);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate(`/requirements/${id}`)}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Requirement
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Requirement</h1>

        <p className="mt-1 text-sm text-slate-500">Update {requirement.id}.</p>
      </div>

      <RequirementForm
        initialData={requirement}
        onSubmit={handleSubmit}
        submitLabel="Update Requirement"
      />
    </div>
  );
};

export default EditRequirementPage;
