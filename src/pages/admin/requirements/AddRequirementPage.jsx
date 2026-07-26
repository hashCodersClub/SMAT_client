import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

import RequirementForm from "../../../components/admin/requirements/RequirementForm";

import requirementsApi from "../../../api/requirementsApi";
import vendorsApi from "../../../api/vendorsApi";

const AddRequirementPage = () => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Vendors
  |--------------------------------------------------------------------------
  */

  const loadVendors = async () => {
    try {
      setVendorsLoading(true);
      setError("");

      const response = await vendorsApi.getAll({
        limit: 100,
      });

      /*
      |--------------------------------------------------------------------------
      | Support common API response shapes
      |--------------------------------------------------------------------------
      */

      const vendorList =
        response?.vendors || response?.data?.vendors || response?.data || [];

      /*
      |--------------------------------------------------------------------------
      | Only allow usable vendors
      |--------------------------------------------------------------------------
      */

      const activeVendors = vendorList.filter(
        (vendor) => !vendor.status || vendor.status === "ACTIVE",
      );

      setVendors(activeVendors);
    } catch (error) {
      console.error("Failed to load vendors:", error);

      setError(error.response?.data?.message || "Unable to load vendors.");
    } finally {
      setVendorsLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Create Requirement
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      /*
      |--------------------------------------------------------------------------
      | Admin-created requirement
      |--------------------------------------------------------------------------
      |
      | Do NOT generate an ID on the frontend.
      | MongoDB will create _id.
      |
      */

      const payload = {
        ...data,
        source: "ADMIN_PORTAL",
      };

      const response = await requirementsApi.create(payload);

      const createdRequirement =
        response?.requirement || response?.data?.requirement || response?.data;

      const requirementId = createdRequirement?._id || createdRequirement?.id;

      /*
      |--------------------------------------------------------------------------
      | Redirect
      |--------------------------------------------------------------------------
      */

      if (requirementId) {
        navigate(`/requirements/${requirementId}`, {
          replace: true,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Fallback
      |--------------------------------------------------------------------------
      */

      navigate("/requirements", {
        replace: true,
      });
    } catch (error) {
      console.error("Requirement creation failed:", error);

      setError(
        error.response?.data?.message || "Unable to create requirement.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back */}

      <button
        type="button"
        onClick={() => navigate("/requirements")}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <FiArrowLeft />
        Back to Requirements
      </button>

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Requirement</h1>

        <p className="mt-1 text-sm text-slate-500">
          Create a training requirement on behalf of a vendor.
        </p>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>

          {!submitting && (
            <button
              type="button"
              onClick={loadVendors}
              className="shrink-0 text-sm font-semibold text-red-700 hover:text-red-900"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Vendor Loading */}

      {vendorsLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">
            <FiRefreshCw
              size={24}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">Loading vendors...</p>
          </div>
        </div>
      ) : (
        <RequirementForm
          vendors={vendors}
          vendorsLoading={vendorsLoading}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={submitting ? "Creating..." : "Create Requirement"}
        />
      )}
    </div>
  );
};

export default AddRequirementPage;
