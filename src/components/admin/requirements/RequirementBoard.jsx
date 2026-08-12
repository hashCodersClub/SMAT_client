import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiEdit2,
  FiMapPin,
  FiShoppingCart,
  FiUserCheck,
} from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| Pipeline Stages
|--------------------------------------------------------------------------
|
| Same stage groupings and colors as the vendor portal's pipeline board
| (pages/vendor/requirements/VendorRequirementsPage.jsx) — kept in sync
| deliberately so a requirement's stage looks the same regardless of
| which portal you're looking at it from.
|--------------------------------------------------------------------------
*/

const STAGES = [
  {
    key: "DRAFT",
    label: "Draft",
    statuses: ["DRAFT"],
    dot: "bg-slate-400",
    ring: "group-hover:border-slate-300",
    chip: "bg-slate-100 text-slate-600",
  },
  {
    key: "SUBMITTED",
    label: "Submitted",
    statuses: ["SUBMITTED", "OPEN"],
    dot: "bg-indigo-500",
    ring: "group-hover:border-indigo-200",
    chip: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "SOURCING",
    label: "Sourcing",
    statuses: ["SOURCING", "PROFILES_SENT"],
    dot: "bg-amber-500",
    ring: "group-hover:border-amber-200",
    chip: "bg-amber-50 text-amber-600",
  },
  {
    key: "SHORTLISTED",
    label: "Shortlisted",
    statuses: ["SHORTLISTED"],
    dot: "bg-cyan-500",
    ring: "group-hover:border-cyan-200",
    chip: "bg-cyan-50 text-cyan-600",
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    statuses: ["TRAINER_SELECTED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"],
    dot: "bg-emerald-500",
    ring: "group-hover:border-emerald-200",
    chip: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "CANCELLED",
    label: "Cancelled",
    statuses: ["CANCELLED"],
    dot: "bg-rose-400",
    ring: "group-hover:border-rose-200",
    chip: "bg-rose-50 text-rose-600",
  },
];

// Requirement has moved into (or past) the PO round-trip — same connector
// pill as the table view, so both views point to the same place.
const PO_LINKED_STATUSES = [
  "TRAINER_SELECTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const formatCompactBudget = (value) => {
  const num = Number(value);
  if (!num) return null;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
  return `₹${num}`;
};

const getVendorName = (requirement) => {
  if (requirement.vendorId && typeof requirement.vendorId === "object") {
    return (
      requirement.vendorId.companyName ||
      requirement.vendorId.name ||
      "Unknown Vendor"
    );
  }

  return requirement.vendorName || "Unknown Vendor";
};

/*
|--------------------------------------------------------------------------
| Requirement Board
|--------------------------------------------------------------------------
*/

const RequirementBoard = ({ requirements = [], assignTrainerId = "" }) => {
  const navigate = useNavigate();

  const columns = useMemo(
    () =>
      STAGES.map((stage) => ({
        ...stage,
        items: requirements.filter((requirement) =>
          stage.statuses.includes(requirement.status),
        ),
      })),
    [requirements],
  );

  if (!requirements.length) {
    return (
      <div className="animate-scale-in rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <h3 className="font-semibold text-slate-900">No requirements found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
      {columns.map((column) => (
        <div
          key={column.key}
          className="flex w-72 shrink-0 flex-col rounded-2xl bg-slate-100/60 p-3"
        >
          {/* Column header */}
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${column.dot}`} />
              <p className="text-sm font-semibold text-slate-700">
                {column.label}
              </p>
            </div>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm">
              {column.items.length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-1 flex-col gap-2.5">
            {column.items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300/80 px-3 py-6 text-center text-xs text-slate-400">
                No requirements
              </div>
            ) : (
              column.items.map((requirement) => {
                const requirementId = requirement._id || requirement.id;

                return (
                  <button
                    key={requirementId}
                    type="button"
                    onClick={() =>
                      navigate(`/admin/requirements/${requirementId}`)
                    }
                    className={`group rounded-xl border border-transparent bg-white p-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${column.ring}`}
                  >
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
                      {requirement.title || "Untitled Requirement"}
                    </p>

                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                      {getVendorName(requirement)}
                    </p>

                    {requirement.skills?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {requirement.skills.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${column.chip}`}
                          >
                            {skill}
                          </span>
                        ))}
                        {requirement.skills.length > 2 && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            +{requirement.skills.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={11} />
                        {formatDate(requirement.startDate)}
                      </span>

                      <span className="flex items-center gap-1 truncate">
                        <FiMapPin size={11} />
                        {requirement.city ||
                          (requirement.mode === "ONLINE" ? "Online" : "—")}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between">
                      {formatCompactBudget(requirement.budget) ? (
                        <p className="text-xs font-semibold text-slate-600">
                          {formatCompactBudget(requirement.budget)}
                        </p>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1">
                        {/* Connects into the PO/Invoice workflow, same as
                            the table view's pill */}
                        {PO_LINKED_STATUSES.includes(requirement.status) && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/admin/purchase-orders");
                            }}
                            className="press-scale inline-flex items-center gap-1 rounded-full bg-fuchsia-50 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-700 transition-colors duration-200 hover:bg-fuchsia-100"
                          >
                            <FiShoppingCart size={9} />
                            PO
                          </span>
                        )}

                        {assignTrainerId && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/admin/requirements/${requirementId}/create-assignment/${assignTrainerId}`,
                              );
                            }}
                            className="press-scale inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
                          >
                            <FiUserCheck size={9} />
                            Select
                          </span>
                        )}

                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/admin/requirements/${requirementId}/edit`,
                            );
                          }}
                          className="rounded-full p-1 text-slate-300 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <FiEdit2 size={11} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequirementBoard;
