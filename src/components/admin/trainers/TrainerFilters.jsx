import { FiSearch, FiX } from "react-icons/fi";

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
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-5">
        {/* Search */}

        <div className="relative lg:col-span-2">
          <FiSearch
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search name, email, phone or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Skill */}

        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Skills</option>

          {skills.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Location */}

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Locations</option>

          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {/* Availability */}

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Availability</option>
          <option value="AVAILABLE">Available</option>
          <option value="BUSY">Busy</option>
          <option value="UNAVAILABLE">Unavailable</option>
        </select>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <FiX />
          Clear filters
        </button>
      </div>
    </div>
  );
};

export default TrainerFilters;
