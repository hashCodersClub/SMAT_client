import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FiArrowLeft, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import VendorForm from "../../../components/admin/vendors/VendorForm";
import vendorsApi from "../../../api/vendorsApi";

const EditVendorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [vendor, setVendor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Vendor
  |--------------------------------------------------------------------------
  */

  const fetchVendor = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await vendorsApi.getById(id);

      setVendor(response.vendor);
    } catch (err) {
      console.error("Failed to load vendor:", err);

      setError(
        err?.response?.data?.message || "Unable to load vendor information.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchVendor();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Update Vendor
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      await vendorsApi.update(id, data);

      navigate(`/vendors/${id}`, {
        replace: true,
      });
    } catch (err) {
      console.error("Failed to update vendor:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to update vendor. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />

          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error / Not Found
  |--------------------------------------------------------------------------
  */

  if (error || !vendor) {
    return (
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/vendors")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600"
        >
          <FiArrowLeft />
          Vendors
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <FiAlertCircle size={30} className="mx-auto text-red-500" />

          <h2 className="mt-3 font-bold text-red-900">
            Vendor could not be loaded
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {error || "Vendor not found."}
          </p>

          <button
            type="button"
            onClick={fetchVendor}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* ================================================================
          BACK
      ================================================================= */}

      <button
        type="button"
        disabled={submitting}
        onClick={() => navigate(`/vendors/${id}`)}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 disabled:opacity-50"
      >
        <FiArrowLeft />
        Back to Vendor
      </button>

      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-950">Edit Vendor</h1>

        <p className="mt-1 text-sm font-medium text-slate-600">
          Update {vendor.companyName}.
        </p>
      </div>

      {/* ================================================================
          UPDATE ERROR
      ================================================================= */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to update vendor
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ================================================================
          FORM
      ================================================================= */}

      <VendorForm
        initialData={vendor}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Update Vendor"
      />
    </div>
  );
};

export default EditVendorPage;
