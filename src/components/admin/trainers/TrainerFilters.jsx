import { FiSearch, FiX } from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| Compact Trainer Toolbar
|--------------------------------------------------------------------------
|
| Merges search, all filter dropdowns and the result count into a single
| dense row so the trainer table starts higher on the page. All existing
| filter state, setters and options passed down from TrainersPage are
| unchanged -- this is a pure layout/visual pass.
|
*/

const TrainerFilters = ({
  search,
  setSearch,
  skill,
  setSkill,
  location,
  setLocation,
  availability,
  setAvailability,
  status,
  setStatus,
  skills,
  locations,
  resetFilters,
  resultCount,
  totalCount,
}) => {
  const hasActiveFilters =
    Boolean(search) ||
    Boolean(skill) ||
    Boolean(location) ||
    Boolean(availability) ||
    Boolean(status);

  const selectClass =
    "rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-600 outline-none transition focus:border-blue-500";

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}

        <div className="relative min-w-[220px] flex-1">
          <FiSearch
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search by name, email, phone or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className={selectClass}
        >
          <option value="">All Skills</option>

          {skills.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={selectClass}
        >
          <option value="">All Locations</option>

          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className={selectClass}
        >
          <option value="">All Availability</option>
          <option value="AVAILABLE">Available</option>
          <option value="BUSY">Busy</option>
          <option value="UNAVAILABLE">Unavailable</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={selectClass}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <FiX size={14} />
            Clear
          </button>
        )}

        {/* Result count -- pinned to the end of the toolbar row */}

        <div className="ml-auto whitespace-nowrap pl-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{resultCount}</span>
          {" of "}
          <span className="font-semibold text-slate-700">{totalCount}</span>
          {" trainers"}
        </div>
      </div>
    </div>
  );
};

export default TrainerFilters;
