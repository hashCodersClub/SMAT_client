import { FiClipboard, FiSearch, FiSend, FiCheckCircle } from "react-icons/fi";

const RequirementStats = ({ requirements }) => {
  const stats = [
    {
      label: "Total Requirements",
      value: requirements.length,
      icon: FiClipboard,
    },
    {
      label: "Open",
      value: requirements.filter((r) => r.status === "OPEN").length,
      icon: FiSearch,
    },
    {
      label: "In Sourcing",
      value: requirements.filter((r) =>
        ["SOURCING", "PROFILES_SENT", "SHORTLISTED"].includes(r.status),
      ).length,
      icon: FiSend,
    },
    {
      label: "Confirmed",
      value: requirements.filter((r) => r.status === "CONFIRMED").length,
      icon: FiCheckCircle,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>

              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {value}
              </h3>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequirementStats;
