import {
  FiCalendar,
  FiEdit2,
  FiEye,
  FiMapPin,
  FiUserCheck,
  FiShoppingCart,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| Status Styles — gradient pills, most visually important column
|--------------------------------------------------------------------------
*/

const statusStyles = {
  DRAFT: "from-slate-400 to-slate-500",
  SUBMITTED: "from-blue-500 to-cyan-400",
  OPEN: "from-indigo-500 to-blue-400",
  SOURCING: "from-amber-500 to-orange-400",
  PROFILES_SENT: "from-purple-500 to-fuchsia-400",
  SHORTLISTED: "from-cyan-500 to-teal-400",
  CONFIRMED: "from-emerald-500 to-teal-400",
  IN_PROGRESS: "from-orange-500 to-amber-400",
  COMPLETED: "from-green-500 to-emerald-400",
  CANCELLED: "from-rose-500 to-red-400",
};

/*
|--------------------------------------------------------------------------
| Priority Styles
|--------------------------------------------------------------------------
*/

const priorityStyles = {
  HIGH: "bg-red-50 text-red-700 ring-1 ring-red-100",
  MEDIUM: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  LOW: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
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
| Vendor Avatar Colors
|--------------------------------------------------------------------------
|
| A stable color is picked per vendor by hashing the name, so the same
| vendor always gets the same avatar color across renders/sessions
| without needing to store one.
|--------------------------------------------------------------------------
*/

const AVATAR_GRADIENTS = [
  "from-blue-500 to-cyan-400",
  "from-violet-500 to-purple-400",
  "from-amber-500 to-orange-400",
  "from-emerald-500 to-teal-400",
  "from-rose-500 to-pink-400",
  "from-indigo-500 to-blue-400",
  "from-fuchsia-500 to-pink-400",
];

const getAvatarGradient = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
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
| Time Ago
|--------------------------------------------------------------------------
|
| Real, computed-from-data "posted X ago" label — deliberately not a
| fabricated trend number, just a plain read of requirement.createdAt.
|--------------------------------------------------------------------------
*/

const timeAgo = (date) => {
  if (!date) return null;

  const diffMs = Date.now() - new Date(date).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
};

// Requirement has moved into (or past) the PO round-trip — worth a quick
// link over to Purchase Orders so admin doesn't have to hunt for it.
const PO_LINKED_STATUSES = [
  "TRAINER_SELECTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

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
      <div className="animate-scale-in relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-14 text-center backdrop-blur-xl shadow-xl shadow-slate-200/40">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 shadow-inner">
          <FiEye size={22} />
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
    <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-xl shadow-xl shadow-slate-200/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] border-separate border-spacing-0">
          {/* ================================================================
              HEADER
          ================================================================= */}

          <thead className="bg-gradient-to-b from-slate-50 to-slate-50/80">
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
                  className="border-b border-slate-200/80 px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          {/* ================================================================
              BODY
          ================================================================= */}

          <tbody className="divide-y divide-slate-100/70">
            {requirements.map((requirement, index) => {
              const requirementId = requirement._id || requirement.id;

              const vendorName = getVendorName(requirement);

              return (
                <tr
                  key={requirementId}
                  style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
                  onClick={() =>
                    navigate(`/admin/requirements/${requirementId}`)
                  }
                  className="animate-rise-in group relative cursor-pointer transition-all duration-200 hover:bg-blue-50/40 hover:shadow-[inset_3px_0_0_0_theme(colors.blue.500)]"
                >
                  {/* ====================================================
                        REQUIREMENT
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <div className="max-w-[300px]">
                      <p className="font-semibold text-slate-900 transition-colors duration-200 group-hover:text-blue-700">
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

                      {/* Type + real "posted X ago" (from createdAt, not a
                          fabricated trend number) */}

                      <p className="mt-2 text-xs text-slate-400">
                        {formatLabel(requirement.trainingType)}
                        {timeAgo(requirement.createdAt) && (
                          <> · Posted {timeAgo(requirement.createdAt)}</>
                        )}
                      </p>
                    </div>
                  </td>

                  {/* ====================================================
                        VENDOR
                    ===================================================== */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white shadow-sm ${getAvatarGradient(vendorName)}`}
                      >
                        {vendorName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
                          {vendorName}
                        </p>

                        {requirement.vendorId?.primaryContact?.name && (
                          <p className="max-w-[150px] truncate text-xs text-slate-400">
                            {requirement.vendorId.primaryContact.name}
                          </p>
                        )}
                      </div>
                    </div>
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
                    <div className="flex flex-col items-start gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-transform duration-200 group-hover:scale-105 ${
                          statusStyles[requirement.status] ||
                          "from-slate-400 to-slate-500"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                        {formatLabel(requirement.status)}
                      </span>

                      {/* Connects into the PO/Invoice workflow — once a
                          trainer is selected, the real booking status
                          lives on the Purchase Order, not here. */}
                      {PO_LINKED_STATUSES.includes(requirement.status) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/admin/purchase-orders");
                          }}
                          className="press-scale inline-flex items-center gap-1 rounded-full bg-fuchsia-50 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-700 transition-colors duration-200 hover:bg-fuchsia-100"
                        >
                          <FiShoppingCart size={10} />
                          View PO
                        </button>
                      )}
                    </div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/admin/requirements/${requirementId}/create-assignment/${assignTrainerId}`,
                            );
                          }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/requirements/${requirementId}`);
                        }}
                        className="press-scale rounded-lg p-2 text-slate-500 transition-all duration-200 hover:scale-110 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FiEye size={17} />
                      </button>

                      {/* Edit */}

                      <button
                        type="button"
                        title="Edit requirement"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/requirements/${requirementId}/edit`);
                        }}
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

      {/* Subtle accent line, matching the motif used on dashboard cards */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
    </div>
  );
};

export default RequirementTable;
