import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

import VendorForm from "../../../components/admin/vendors/VendorForm";
import { vendors } from "../../../data/vendors";

const EditVendorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const vendor = vendors.find((item) => item.id === id);

  if (!vendor) {
    return <div>Vendor not found.</div>;
  }

  const handleSubmit = (data) => {
    console.log("Updated vendor:", data);

    // Later:
    // await vendorsApi.update(id, data);

    alert("Vendor updated.");

    navigate(`/vendors/${id}`);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        onClick={() => navigate(`/vendors/${id}`)}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500"
      >
        <FiArrowLeft />
        Back to Vendor
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Vendor</h1>

        <p className="mt-1 text-sm text-slate-500">
          Update {vendor.companyName}.
        </p>
      </div>

      <VendorForm
        initialData={vendor}
        onSubmit={handleSubmit}
        submitLabel="Update Vendor"
      />
    </div>
  );
};

export default EditVendorPage;
