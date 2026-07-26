import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import VendorForm from "../../../components/admin/vendors/VendorForm";

const AddVendorPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log("New Vendor:", data);

    // Later:
    // await vendorsApi.create(data);

    alert("Vendor captured successfully.");

    navigate("/vendors");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate("/vendors")}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Vendors
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Vendor</h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a training partner or client to Nxthack.
        </p>
      </div>

      <VendorForm onSubmit={handleSubmit} />
    </div>
  );
};

export default AddVendorPage;
