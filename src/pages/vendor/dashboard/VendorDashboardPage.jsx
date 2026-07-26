import { FiCheckCircle, FiClock, FiClipboard, FiPlus } from "react-icons/fi";

import { useNavigate } from "react-router-dom";

const VendorDashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track your training requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/vendor/requirements/add")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlus />
          New Requirement
        </button>
      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Requirements" value="0" icon={FiClipboard} />

        <StatCard title="In Progress" value="0" icon={FiClock} />

        <StatCard title="Confirmed" value="0" icon={FiCheckCircle} />
      </div>

      {/* Empty state */}

      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="font-semibold text-slate-900">Recent Requirements</h2>

        <div className="py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <FiClipboard size={21} />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            No requirements yet
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Submit your first training requirement and Nxthack will start
            sourcing suitable trainers.
          </p>

          <button
            type="button"
            onClick={() => navigate("/vendor/requirements/add")}
            className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Create Requirement
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
