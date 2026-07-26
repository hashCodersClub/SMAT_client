import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

import RequirementStats from "../../../components/admin/requirements/RequirementStats";
import RequirementFilters from "../../../components/admin/requirements/RequirementFilters";
import RequirementTable from "../../../components/admin/requirements/RequirementTable";

import { requirements } from "../../../data/requirements";

const RequirementsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [mode, setMode] = useState("");
  const [priority, setPriority] = useState("");

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
          onClick={() => navigate("/requirements/add")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FiPlus />
          New Requirement
        </button>
      </div>

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

      <RequirementTable requirements={filteredRequirements} />
    </div>
  );
};

export default RequirementsPage;
