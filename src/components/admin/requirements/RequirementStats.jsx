import { FiCheckCircle, FiClipboard, FiSearch, FiSend } from "react-icons/fi";

const RequirementStats = ({ requirements = [] }) => {
  const stats = [
    {
      label: "Total Requirements",
      value: requirements.length,
      icon: FiClipboard,
      style: "bg-slate-100 text-slate-700",
    },
    {
      label: "New / Open",
      value: requirements.filter((r) =>
        ["SUBMITTED", "OPEN"].includes(r.status),
      ).length,
      icon: FiSearch,
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "In Sourcing",
      value: requirements.filter((r) =>
        ["SOURCING", "PROFILES_SENT", "SHORTLISTED"].includes(r.status),
      ).length,
      icon: FiSend,
      style: "bg-amber-50 text-amber-600",
    },
    {
      label: "Confirmed",
      value: requirements.filter((r) =>
        ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(r.status),
      ).length,
      icon: FiCheckCircle,
      style: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, style }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>

              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {value}
              </h3>
            </div>

            <div className={`rounded-xl p-3 ${style}`}>
              <Icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequirementStats;
