import { FiSearch, FiX } from "react-icons/fi";

const RequirementFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  mode,
  setMode,
  priority,
  setPriority,
  resetFilters,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 lg:grid-cols-5">
        {/* Search */}

        <div className="relative lg:col-span-2">
          <FiSearch
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requirement, vendor, skill or city..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Status */}

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>

          <option value="DRAFT">Draft</option>

          <option value="SUBMITTED">Submitted</option>

          <option value="OPEN">Open</option>

          <option value="SOURCING">Sourcing</option>

          <option value="PROFILES_SENT">Profiles Sent</option>

          <option value="SHORTLISTED">Shortlisted</option>

          <option value="CONFIRMED">Confirmed</option>

          <option value="IN_PROGRESS">In Progress</option>

          <option value="COMPLETED">Completed</option>

          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Mode */}

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="">All Modes</option>

          <option value="ONLINE">Online</option>

          <option value="OFFLINE">Offline</option>

          <option value="HYBRID">Hybrid</option>
        </select>

        {/* Priority */}

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="">All Priorities</option>

          <option value="HIGH">High</option>

          <option value="MEDIUM">Medium</option>

          <option value="LOW">Low</option>
        </select>
      </div>

      {(search || status || mode || priority) && (
        <button
          type="button"
          onClick={resetFilters}
          className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <FiX />
          Clear filters
        </button>
      )}
    </div>
  );
};

export default RequirementFilters;
