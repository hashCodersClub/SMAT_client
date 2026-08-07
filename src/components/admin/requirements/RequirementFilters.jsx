import { FiSearch, FiX } from "react-icons/fi";

const selectClasses =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

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

        <div className="group relative lg:col-span-2">
          <FiSearch
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-blue-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requirement, vendor, skill or city..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="press-scale animate-scale-in absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-700"
            >
              <FiX size={13} />
            </button>
          )}
        </div>

        {/* Status */}

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClasses}
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
          className={selectClasses}
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
          className={selectClasses}
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
          className="press-scale animate-rise-in mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800"
        >
          <FiX />
          Clear filters
        </button>
      )}
    </div>
  );
};

export default RequirementFilters;
