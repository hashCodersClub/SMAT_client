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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={25}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">Loading requirement...</p>
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
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/admin/requirements")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <FiArrowLeft />
          Back to Requirements
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <FiAlertCircle size={28} className="mx-auto text-red-500" />

          <h2 className="mt-3 font-semibold text-red-900">
            Unable to load requirement
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error || "Requirement could not be found."}
          </p>

          <button
            type="button"
            onClick={loadData}
            className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back */}

      <button
        type="button"
        onClick={() => navigate(`/admin/requirements/${id}`)}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <FiArrowLeft />
        Back to Requirement
      </button>

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Requirement</h1>

        <p className="mt-1 text-sm text-slate-500">
          Update training, scheduling, commercial and operational information.
        </p>
      </div>

      {/* Save Error */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Form */}

      <RequirementForm
        initialData={initialData}
        vendors={vendors}
        vendorsLoading={false}
        onSubmit={handleSubmit}
        submitting={saving}
        isEdit
        submitLabel={saving ? "Saving..." : "Save Changes"}
      />
    </div>
  );
};

export default EditRequirementPage;
