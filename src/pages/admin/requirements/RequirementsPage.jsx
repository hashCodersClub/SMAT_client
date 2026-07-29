import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPlus, FiUserCheck, FiX } from "react-icons/fi";

import RequirementStats from "../../../components/admin/requirements/RequirementStats";
import RequirementFilters from "../../../components/admin/requirements/RequirementFilters";
import RequirementTable from "../../../components/admin/requirements/RequirementTable";

import trainersApi from "../../../api/trainersApi";
import { mapTrainerFromApi } from "../../../utils/trainerAdapter";

import { requirements } from "../../../data/requirements";

const RequirementsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [priority, setPriority] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Assign-Trainer Hand-off
  |--------------------------------------------------------------------------
  |
  | The Trainer Directory sends ops execs here via
  | /admin/requirements?assignTrainerId=<id> once they've picked a trainer
  | to place. We load that trainer's real profile (via the existing,
  | already-live trainersApi) purely to show their name in context -- the
  | requirement list itself still comes from mock data below, which is a
  | pre-existing gap in this page unrelated to the trainer directory work.
  |
  */

  const [searchParams, setSearchParams] = useSearchParams();
  const assignTrainerId = searchParams.get("assignTrainerId") || "";
  const [assignTrainer, setAssignTrainer] = useState(null);

  useEffect(() => {
    if (!assignTrainerId) {
      setAssignTrainer(null);
      return;
    }

    let cancelled = false;

    const loadAssignTrainer = async () => {
      try {
        const data = await trainersApi.getById(assignTrainerId);

        if (!cancelled) {
          setAssignTrainer(mapTrainerFromApi(data?.trainer));
        }
      } catch (err) {
        console.error("Failed to load trainer for assignment:", err);

        if (!cancelled) {
          setAssignTrainer(null);
        }
      }
    };

    loadAssignTrainer();

    return () => {
      cancelled = true;
    };
  }, [assignTrainerId]);

  const clearAssignTrainer = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("assignTrainerId");
    setSearchParams(next);
  };

  const filteredRequirements = useMemo(() => {
    const query = search.toLowerCase().trim();

    return requirements.filter((requirement) => {
      const matchesSearch =
        !query ||
        requirement.title.toLowerCase().includes(query) ||
        requirement.vendorName.toLowerCase().includes(query) ||
        requirement.city.toLowerCase().includes(query) ||
        requirement.skills.some((skill) => skill.toLowerCase().includes(query));

      const matchesStatus = !status || requirement.status === status;

      const matchesMode = !mode || requirement.mode === mode;

      const matchesPriority = !priority || requirement.priority === priority;

      return matchesSearch && matchesStatus && matchesMode && matchesPriority;
    });
  }, [search, status, mode, priority]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setMode("");
    setPriority("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Requirements</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage incoming training requirements and trainer sourcing.
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/requirements/add")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FiPlus />
          New Requirement
        </button>
      </div>

      {assignTrainerId && (
        <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <FiUserCheck className="shrink-0" />
            <span>
              Assigning{" "}
              <span className="font-semibold">
                {assignTrainer?.name || "selected trainer"}
              </span>{" "}
              — pick a requirement below to continue.
            </span>
          </div>

          <button
            type="button"
            onClick={clearAssignTrainer}
            className="flex items-center gap-1 self-start rounded-lg px-2 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-100 sm:self-auto"
          >
            <FiX size={14} />
            Cancel
          </button>
        </div>
      )}

      <RequirementStats requirements={requirements} />

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

      <p className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {filteredRequirements.length}
        </span>{" "}
        requirements
      </p>

      <RequirementTable
        requirements={filteredRequirements}
        assignTrainerId={assignTrainerId}
      />
    </div>
  );
};

export default RequirementsPage;
