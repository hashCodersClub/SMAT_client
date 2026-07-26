import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiPlus, FiRefreshCw } from "react-icons/fi";

import RequirementStats from "../../../components/admin/requirements/RequirementStats";
import RequirementFilters from "../../../components/admin/requirements/RequirementFilters";
import RequirementTable from "../../../components/admin/requirements/RequirementTable";

import requirementsApi from "../../../api/requirementsApi";

const RequirementsPage = () => {
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [priority, setPriority] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Requirements
  |--------------------------------------------------------------------------
  */

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await requirementsApi.getAll({
        limit: 100,
      });

      setRequirements(response.requirements || []);
    } catch (error) {
      console.error("Failed to load requirements:", error);

      setError(error.response?.data?.message || "Unable to load requirements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequirements();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const filteredRequirements = useMemo(() => {
    const query = search.toLowerCase().trim();

    return requirements.filter((requirement) => {
      const matchesSearch =
        !query ||
        requirement.title?.toLowerCase().includes(query) ||
        requirement.vendorId?.companyName?.toLowerCase().includes(query) ||
        requirement.city?.toLowerCase().includes(query) ||
        requirement.skills?.some((skill) =>
          skill.toLowerCase().includes(query),
        );

      const matchesStatus = !status || requirement.status === status;

      const matchesMode = !mode || requirement.mode === mode;

      const matchesPriority = !priority || requirement.priority === priority;

      return matchesSearch && matchesStatus && matchesMode && matchesPriority;
    });
  }, [requirements, search, status, mode, priority]);

  /*
  |--------------------------------------------------------------------------
  | Reset
  |--------------------------------------------------------------------------
  */

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setMode("");
    setPriority("");
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

          <p className="mt-3 text-sm text-slate-500">Loading requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requirements</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage vendor requirements and trainer sourcing operations.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadRequirements}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/requirements/add")}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiPlus />
            New Requirement
          </button>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Failed to load requirements
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}

      <RequirementStats requirements={requirements} />

      {/* Filters */}

      <RequirementFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        mode={mode}
        setMode={setMode}
        priority={priority}
        setPriority={setPriority}
        resetFilters={resetFilters}
      />

      {/* Count */}

      <div className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {filteredRequirements.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">
          {requirements.length}
        </span>{" "}
        requirements
      </div>

      {/* Table */}

      <RequirementTable requirements={filteredRequirements} />
    </div>
  );
};

export default RequirementsPage;
