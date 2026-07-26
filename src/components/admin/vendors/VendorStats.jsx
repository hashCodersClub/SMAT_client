import {
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiUserCheck,
} from "react-icons/fi";

const VendorStats = ({ vendors }) => {
  const stats = [
    {
      label: "Total Vendors",
      value: vendors.length,
      icon: FiBriefcase,
    },
    {
      label: "Active Vendors",
      value: vendors.filter((v) => v.status === "ACTIVE").length,
      icon: FiCheckCircle,
    },
    {
      label: "Active Requirements",
      value: vendors.reduce(
        (total, vendor) => total + vendor.activeRequirements,
        0,
      ),
      icon: FiClipboard,
    },
    {
      label: "Completed Assignments",
      value: vendors.reduce(
        (total, vendor) => total + vendor.completedAssignments,
        0,
      ),
      icon: FiUserCheck,
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

export default VendorStats;
