import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FiAlertCircle, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

import RequirementForm from "../../../components/admin/requirements/RequirementForm";

import requirementsApi from "../../../api/requirementsApi";
import vendorsApi from "../../../api/vendorsApi";

const EditRequirementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [vendors, setVendors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Data
  |--------------------------------------------------------------------------
  */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      /*
      |--------------------------------------------------------------------------
      | Load requirement + vendors together
      |--------------------------------------------------------------------------
      */

      const [requirementResponse, vendorsResponse] = await Promise.all([
        requirementsApi.getById(id),

        vendorsApi.getAll({
          limit: 100,
        }),
      ]);

      /*
      |--------------------------------------------------------------------------
      | Requirement
      |--------------------------------------------------------------------------
      */

      const requirementData =
        requirementResponse?.requirement ||
        requirementResponse?.data?.requirement ||
        requirementResponse?.data;

      setRequirement(requirementData);

      /*
      |--------------------------------------------------------------------------
      | Vendors
      |--------------------------------------------------------------------------
      */

      const vendorList =
        vendorsResponse?.vendors ||
        vendorsResponse?.data?.vendors ||
        vendorsResponse?.data ||
        [];

      setVendors(vendorList);
    } catch (error) {
      console.error("Failed to load requirement:", error);

      setError(error.response?.data?.message || "Unable to load requirement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Normalize Requirement
  |--------------------------------------------------------------------------
  */

  const initialData = useMemo(() => {
    if (!requirement) return null;

    return {
      ...requirement,

      /*
      |--------------------------------------------------------------------------
      | vendorId may be populated
      |--------------------------------------------------------------------------
      */

      vendorId:
        typeof requirement.vendorId === "object"
          ? requirement.vendorId?._id
          : requirement.vendorId || "",

      /*
      |--------------------------------------------------------------------------
      | HTML date input requires YYYY-MM-DD
      |--------------------------------------------------------------------------
      */

      startDate: requirement.startDate
        ? new Date(requirement.startDate).toISOString().slice(0, 10)
        : "",

      endDate: requirement.endDate
        ? new Date(requirement.endDate).toISOString().slice(0, 10)
        : "",

      skills: requirement.skills || [],
    };
  }, [requirement]);

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (data) => {
    try {
      setSaving(true);
      setError("");

      const response = await requirementsApi.update(id, data);

      const updatedRequirement =
        response?.requirement || response?.data?.requirement || response?.data;

      const requirementId =
        updatedRequirement?._id || updatedRequirement?.id || id;

      navigate(`/admin/requirements/${requirementId}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Requirement update failed:", error);

      setError(
        error.response?.data?.message || "Unable to update requirement.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="relative mx-auto max-w-5xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

        <button
          type="button"
          onClick={() => navigate("/admin/requirements")}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Requirements</span>
        </button>

        <div className="relative flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-xl shadow-2xl shadow-slate-200/40">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-30 animate-pulse" />
            <FiRefreshCw className="relative h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
            Loading requirement…
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Not Found / Error
  |--------------------------------------------------------------------------
  */

  if (!requirement || !initialData) {
    return (
      <div className="relative mx-auto max-w-3xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

        <button
          type="button"
          onClick={() => navigate("/admin/requirements")}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Requirements</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-red-200/80 bg-white/80 p-8 text-center backdrop-blur-sm shadow-lg shadow-red-100/20">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-red-100/70 p-2.5">
              <FiAlertCircle size={28} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load requirement
              </h2>
              <p className="mt-1 text-sm text-red-700">
                {error || "Requirement could not be found."}
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="rounded-full bg-red-100/80 px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200/80 hover:shadow-md active:scale-95"
            >
              Try Again
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-5xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(`/admin/requirements/${id}`)}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
      >
        <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back to Requirement</span>
      </button>

      {/* Header */}
      <div className="relative mb-8">
        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 sm:text-4xl">
          Edit Requirement
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Update training, scheduling, commercial and operational information.
        </p>
      </div>

      {/* Save Error */}
      {error && (
        <div
          className="relative mb-8 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-red-100/30 transition-all duration-300"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
              <FiAlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Update failed
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {/* Main Card */}
      <div className="relative rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 sm:p-8">
        <RequirementForm
          initialData={initialData}
          vendors={vendors}
          vendorsLoading={false}
          onSubmit={handleSubmit}
          submitting={saving}
          isEdit
          submitLabel={saving ? "Saving…" : "Save Changes"}
        />
      </div>
    </div>
  );
};

export default EditRequirementPage;
