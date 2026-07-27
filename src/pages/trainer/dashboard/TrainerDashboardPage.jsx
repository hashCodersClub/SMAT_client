import { useAuth } from "../../../context/AuthContext";

const TrainerDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Welcome, {user?.name || "Trainer"}
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Manage your training opportunities, assignments and profile.
        </p>
      </div>

      {/* ================================================================
          PLACEHOLDER
      ================================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-lg font-bold text-slate-900">Trainer Dashboard</h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Your trainer dashboard is ready. We will connect your opportunities,
          assignments, schedule and profile information here next.
        </p>
      </div>
    </div>
  );
};

export default TrainerDashboardPage;
