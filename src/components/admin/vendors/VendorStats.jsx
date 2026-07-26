import {
  FiBriefcase,
  FiCheckCircle,
  FiPauseCircle,
  FiSlash,
} from "react-icons/fi";

const VendorStats = ({ vendors = [] }) => {
  const stats = [
    {
      label: "Loaded Vendors",
      value: vendors.length,
      icon: FiBriefcase,
    },
    {
      label: "Active",
      value: vendors.filter((vendor) => vendor.status === "ACTIVE").length,
      icon: FiCheckCircle,
    },
    {
      label: "Inactive",
      value: vendors.filter((vendor) => vendor.status === "INACTIVE").length,
      icon: FiPauseCircle,
    },
    {
      label: "Blocked",
      value: vendors.filter((vendor) => vendor.status === "BLOCKED").length,
      icon: FiSlash,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">{label}</p>

              <h3 className="mt-2 text-3xl font-bold text-slate-950">
                {value}
              </h3>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <Icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorStats;
