import { useState } from "react";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import VendorForm from "../../../components/admin/vendors/VendorForm";
import vendorsApi from "../../../api/vendorsApi";

const AddVendorPage = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Create Vendor
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      const response = await vendorsApi.create(data);

      console.log("Vendor created:", response);

      navigate("/vendors", {
        replace: true,
      });
    } catch (err) {
      console.error("Failed to create vendor:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to create vendor. Please check the information and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* ================================================================
          BACK
      ================================================================= */}

      <button
        type="button"
        onClick={() => navigate("/vendors")}
        disabled={submitting}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiArrowLeft size={17} />
        Back to Vendors
      </button>

      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Add Vendor</h1>

        <p className="mt-1 text-sm font-medium text-slate-600">
          Add a training partner or client to Nxthack.
        </p>
      </div>

      {/* ================================================================
          ERROR
      ================================================================= */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to create vendor
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ================================================================
          FORM
      ================================================================= */}

      <VendorForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={submitting ? "Creating Vendor..." : "Create Vendor"}
      />
    </div>
  );
};

export default AddVendorPage;
