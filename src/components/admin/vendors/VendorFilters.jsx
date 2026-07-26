import { FiSearch, FiX } from "react-icons/fi";

const VendorFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  resetFilters,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, contact, email or city..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
        >
          <FiX />
          Clear
        </button>
      </div>
    </div>
  );
};

export default VendorFilters;
