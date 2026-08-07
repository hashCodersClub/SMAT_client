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
        source: "ADMIN",
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
        navigate(`/admin/requirements/${requirementId}`, {
          replace: true,
        });

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | Fallback
      |--------------------------------------------------------------------------
      */

      navigate("/admin/requirements", {
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
    <div className="relative mx-auto max-w-6xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/admin/requirements")}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
      >
        <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back to Requirements</span>
      </button>

      {/* Header */}
      <div className="relative mb-8">
        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          New Requirement
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Create a training requirement on behalf of a vendor.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="animate-rise-in relative mb-8 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 backdrop-blur-sm shadow-lg shadow-red-100/30"
          role="alert"
        >
          <div className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
                <FiAlertCircle size={20} />
              </div>
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
                className="press-scale group/retry flex shrink-0 items-center gap-1.5 rounded-full bg-red-100/80 px-4 py-2 text-sm font-semibold text-red-700 transition-all duration-200 hover:bg-red-200/80 hover:shadow-md"
              >
                <FiRefreshCw
                  size={14}
                  className="transition-transform duration-500 group-hover/retry:rotate-180"
                />
                Retry
              </button>
            )}
          </div>
          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {/* Main Card */}
      <div
        style={{ animationDelay: "80ms" }}
        className="animate-rise-in relative rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 sm:p-8"
      >
        {vendorsLoading ? (
          <div className="space-y-6">
            {[0, 1, 2].map((section) => (
              <div
                key={section}
                style={{ animationDelay: `${section * 80}ms` }}
                className="animate-rise-in space-y-3"
              >
                <div className="skeleton h-3 w-32 rounded-full" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="skeleton h-11 w-full rounded-xl" />
                  <div className="skeleton h-11 w-full rounded-xl" />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2 text-sm font-medium text-slate-400">
              <FiRefreshCw size={14} className="animate-spin" />
              Loading vendors…
            </div>
          </div>
        ) : (
          <RequirementForm
            vendors={vendors}
            vendorsLoading={vendorsLoading}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={submitting ? "Creating…" : "Create Requirement"}
          />
        )}
      </div>
    </div>
  );
};

export default AddRequirementPage;
