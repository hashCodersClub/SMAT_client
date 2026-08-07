import {
  FiCalendar,
  FiEdit2,
  FiEye,
  FiMapPin,
  FiUserCheck,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| Status Styles
|--------------------------------------------------------------------------
*/

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-50 text-blue-700",
  OPEN: "bg-indigo-50 text-indigo-700",
  SOURCING: "bg-amber-50 text-amber-700",
  PROFILES_SENT: "bg-purple-50 text-purple-700",
  SHORTLISTED: "bg-cyan-50 text-cyan-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

/*
|--------------------------------------------------------------------------
| Priority Styles
|--------------------------------------------------------------------------
*/

const priorityStyles = {
  HIGH: "bg-red-50 text-red-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

/*
|--------------------------------------------------------------------------
| Source Styles
|--------------------------------------------------------------------------
*/

const sourceStyles = {
  ADMIN: "bg-slate-100 text-slate-600",
  ADMIN_PORTAL: "bg-slate-100 text-slate-600",
  VENDOR_PORTAL: "bg-violet-50 text-violet-700",
  MANUAL: "bg-slate-100 text-slate-600",
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatLabel = (value = "") => {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getVendorName = (requirement) => {
  /*
  |--------------------------------------------------------------------------
  | Populated vendor
  |--------------------------------------------------------------------------
  |
  | Backend may return:
  |
  | vendorId: {
  |   _id: "...",
  |   companyName: "ABC Training"
  | }
  |--------------------------------------------------------------------------
  */

  if (requirement.vendorId && typeof requirement.vendorId === "object") {
    return (
      requirement.vendorId.companyName ||
      requirement.vendorId.name ||
      "Unknown Vendor"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Fallback
  |--------------------------------------------------------------------------
  */

  return requirement.vendorName || "Unknown Vendor";
};

/*
|--------------------------------------------------------------------------
| Requirement Table
|--------------------------------------------------------------------------
*/

const RequirementTable = ({ requirements = [], assignTrainerId = "" }) => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  if (!requirements.length) {
    return (
      <div className="animate-scale-in rounded-2xl border border-slate-200 bg-white p-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <FiEye size={20} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No requirements found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px]">
          {/* ================================================================
              HEADER
          ================================================================= */}

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {[
                "Requirement",
                "Vendor",
                "Schedule",
                "Location",
                "Budget",
                "Priority",
                "Source",
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

          {/* ================================================================
              BODY
          ================================================================= */}

          <tbody className="divide-y divide-slate-100">
            {requirements.map((requirement, index) => {
              const requirementId = requirement._id || requirement.id;

              const vendorName = getVendorName(requirement);

              return (
                <tr
                  key={requirementId}
                  style={{ animationDelay: `${Math.min(index, 10) * 35}ms` }}
                  className="animate-rise-in group transition-colors duration-200 hover:bg-slate-50/80"
                >
                  {/* ====================================================
                        REQUIREMENT
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <div className="max-w-[300px]">
                      <p className="font-semibold text-slate-900">
                        {requirement.title || "Untitled Requirement"}
                      </p>

                      {/* Skills */}

                      <div className="mt-2 flex flex-wrap gap-1">
                        {requirement.skills?.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}

                        {requirement.skills?.length > 3 && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                            +{requirement.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Type */}

                      <p className="mt-2 text-xs text-slate-400">
                        {formatLabel(requirement.trainingType)}
                      </p>
                    </div>
                  </td>

                  {/* ====================================================
                        VENDOR
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <p className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
                      {vendorName}
                    </p>

                    {requirement.vendorId?.primaryContact?.name && (
                      <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                        {requirement.vendorId.primaryContact.name}
                      </p>
                    )}
                  </td>

                  {/* ====================================================
                        SCHEDULE
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FiCalendar
                        size={15}
                        className="shrink-0 text-slate-400"
                      />

                      {formatDate(requirement.startDate)}
                    </div>

                    <p className="mt-1 pl-[23px] text-xs text-slate-400">
                      to {formatDate(requirement.endDate)}
                    </p>
                  </td>

                  {/* ====================================================
                        LOCATION
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <FiMapPin size={15} className="shrink-0 text-slate-400" />

                      <span>
                        {requirement.mode === "ONLINE"
                          ? "Online"
                          : requirement.city || "—"}
                      </span>
                    </div>

                    <p className="mt-1 pl-[23px] text-xs text-slate-400">
                      {formatLabel(requirement.mode)}
                    </p>
                  </td>

                  {/* ====================================================
                        BUDGET
                    ===================================================== */}

                  <td className="px-5 py-4">
                    {Number(requirement.budget) > 0 ? (
                      <>
                        <p className="font-semibold text-slate-800">
                          ₹{Number(requirement.budget).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatLabel(requirement.budgetType)}
                        </p>
                      </>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Not specified
                      </span>
                    )}
                  </td>

                  {/* ====================================================
                        PRIORITY
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        priorityStyles[requirement.priority] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {formatLabel(requirement.priority || "MEDIUM")}
                    </span>
                  </td>

                  {/* ====================================================
                        SOURCE
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        sourceStyles[requirement.source] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {requirement.source === "VENDOR_PORTAL"
                        ? "Vendor"
                        : "Admin"}
                    </span>
                  </td>

                  {/* ====================================================
                        STATUS
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition-transform duration-200 group-hover:scale-105 ${
                        statusStyles[requirement.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                      {formatLabel(requirement.status)}
                    </span>
                  </td>

                  {/* ====================================================
                        ACTIONS
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {/* Select for assignment -- only shown when the page
                          was reached from the Trainer Directory's Assign
                          action */}

                      {assignTrainerId && (
                        <button
                          type="button"
                          title="Assign this requirement to the selected trainer"
                          onClick={() =>
                            navigate(
                              `/admin/requirements/${requirementId}/create-assignment/${assignTrainerId}`,
                            )
                          }
                          className="press-scale flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                        >
                          <FiUserCheck size={14} />
                          Select
                        </button>
                      )}

                      {/* View */}

                      <button
                        type="button"
                        title="View requirement"
                        onClick={() =>
                          navigate(`/admin/requirements/${requirementId}`)
                        }
                        className="press-scale rounded-lg p-2 text-slate-500 transition-all duration-200 hover:scale-110 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FiEye size={17} />
                      </button>

                      {/* Edit */}

                      <button
                        type="button"
                        title="Edit requirement"
                        onClick={() =>
                          navigate(`/admin/requirements/${requirementId}/edit`)
                        }
                        className="press-scale rounded-lg p-2 text-slate-500 transition-all duration-200 hover:scale-110 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequirementTable;
