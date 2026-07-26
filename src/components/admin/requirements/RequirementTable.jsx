import { FiCalendar, FiEdit2, FiEye, FiMapPin, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const statusStyles = {
  OPEN: "bg-blue-50 text-blue-700",
  SOURCING: "bg-amber-50 text-amber-700",
  PROFILES_SENT: "bg-purple-50 text-purple-700",
  SHORTLISTED: "bg-cyan-50 text-cyan-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const priorityStyles = {
  HIGH: "bg-red-50 text-red-600",
  MEDIUM: "bg-amber-50 text-amber-600",
  LOW: "bg-slate-100 text-slate-600",
};

const formatStatus = (status) =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const RequirementTable = ({ requirements }) => {
  const navigate = useNavigate();

  if (!requirements.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">
        <h3 className="font-semibold text-slate-800">No requirements found</h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {[
                "Requirement",
                "Vendor",
                "Schedule",
                "Location",
                "Budget",
                "Priority",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {requirements.map((requirement) => (
              <tr key={requirement.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">
                    {requirement.title}
                  </p>

                  <div className="mt-2 flex max-w-[280px] flex-wrap gap-1">
                    {requirement.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}

                    {requirement.skills.length > 3 && (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                        +{requirement.skills.length - 3}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {requirement.id}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {requirement.vendorName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {requirement.trainingType}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FiCalendar />
                    {requirement.startDate}
                  </div>

                  <p className="mt-1 pl-6 text-xs text-slate-400">
                    to {requirement.endDate}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <FiMapPin />
                    {requirement.city}
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {requirement.mode}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-700">
                    ₹{requirement.budget.toLocaleString("en-IN")}
                  </p>

                  <p className="text-xs text-slate-400">
                    {requirement.budgetType}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      priorityStyles[requirement.priority]
                    }`}
                  >
                    {requirement.priority}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusStyles[requirement.status]
                    }`}
                  >
                    {formatStatus(requirement.status)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      title="View requirement"
                      onClick={() =>
                        navigate(`/requirements/${requirement.id}`)
                      }
                      className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <FiEye />
                    </button>

                    <button
                      type="button"
                      title="Edit requirement"
                      onClick={() =>
                        navigate(`/requirements/${requirement.id}/edit`)
                      }
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequirementTable;
