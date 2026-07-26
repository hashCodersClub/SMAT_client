import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import RequirementForm from "../../../components/admin/requirements/RequirementForm";

const AddRequirementPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    const requirement = {
      ...data,
      id: `REQ-${Date.now()}`,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    console.log("New requirement:", requirement);

    // Later:
    // await requirementsApi.create(requirement);

    alert("Requirement captured successfully.");

    navigate("/requirements");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate("/requirements")}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Requirements
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Requirement</h1>

        <p className="mt-1 text-sm text-slate-500">
          Capture a training requirement received from a vendor.
        </p>
      </div>

      <RequirementForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddRequirementPage;
