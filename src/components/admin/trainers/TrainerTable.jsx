import { useEffect, useRef, useState } from "react";
import {
  FiEye,
  FiCalendar,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiLoader,
  FiStar,
  FiUserPlus,
  FiMapPin,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| Availability Presentation
|--------------------------------------------------------------------------
*/

const availabilityConfig = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  BUSY: {
    label: "Busy",
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    dot: "bg-rose-500",
    text: "text-rose-700",
    bg: "bg-rose-50",
  },
};

/*
|--------------------------------------------------------------------------
| Reliability Presentation
|--------------------------------------------------------------------------
|
| Turns rating into a quick "can I trust this trainer with this
| requirement" signal instead of a bare number.
|
*/

const getReliabilityTone = (rating) => {
  if (rating >= 4.5) return "text-emerald-700";
  if (rating >= 3.5) return "text-slate-700";
  if (rating > 0) return "text-amber-700";
  return "text-slate-400";
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/*
|--------------------------------------------------------------------------
| Row Quick-Actions Menu (More)
|--------------------------------------------------------------------------
*/

const RowMenu = ({
  trainer,
  onDelete,
  deletingId,
  openId,
  setOpenId,
  navigate,
}) => {
  const isOpen = openId === trainer.id;

  return (
    <div className="relative" data-trainer-menu>
      <button
        type="button"
        title="More actions"
        onClick={() => setOpenId(isOpen ? null : trainer.id)}
        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <FiMoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpenId(null);
              navigate(`/admin/trainers/${trainer.id}/edit`);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-slate-50"
          >
            <FiEdit2 size={14} />
            Edit profile
          </button>

          <button
            type="button"
            disabled={deletingId === trainer.id}
            onClick={() => {
              setOpenId(null);
              onDelete?.(trainer.id);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingId === trainer.id ? (
              <FiLoader className="animate-spin" size={14} />
            ) : (
              <FiTrash2 size={14} />
            )}
            Delete trainer
          </button>
        </div>
      )}
    </div>
  );
};

const TrainerTable = ({ trainers, onDelete, deletingId, onAssign }) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const containerRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Close the "more" menu on outside click
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleClick = (event) => {
      if (!event.target.closest("[data-trainer-menu]")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (trainers.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">
          No trainers found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Trainer
              </th>

              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Primary Expertise
              </th>

              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Availability
              </th>

              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Reliability
              </th>

              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Quick Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {trainers.map((trainer) => {
              const availabilityMeta =
                availabilityConfig[trainer.availability] ||
                availabilityConfig.UNAVAILABLE;

              const canAssign =
                trainer.availability === "AVAILABLE" &&
                trainer.status === "ACTIVE";

              return (
                <tr
                  key={trainer.id}
                  className="align-top transition hover:bg-slate-50/80"
                >
                  {/* Trainer Identity (secondary info folded in) */}

                  <td className="px-4 py-2.5">
                    <div className="flex items-start gap-2.5">
                      {trainer.profilePhotoUrl ? (
                        <img
                          src={trainer.profilePhotoUrl}
                          alt={trainer.name}
                          className="h-9 w-9 shrink-0 rounded-xl object-cover ring-2 ring-indigo-500/20"
                        />
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-xs">
                          {getInitials(trainer.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {trainer.name}
                          </p>

                          {trainer.status === "INACTIVE" && (
                            <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                              Inactive
                            </span>
                          )}

                          {trainer.portalEnabled ? (
                            <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Portal Active
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              Invite Pending
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {trainer.email}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-slate-500">
                          {trainer.city && (
                            <span className="inline-flex items-center gap-1">
                              <FiMapPin size={11} />
                              {trainer.city}
                            </span>
                          )}

                          <span>{trainer.experienceYears} yrs exp</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Primary Expertise */}

                  <td className="px-4 py-2.5">
                    <div className="flex max-w-[240px] flex-wrap gap-1">
                      {trainer.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}

                      {trainer.skills.length > 2 && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                          +{trainer.skills.length - 2}
                        </span>
                      )}

                      {trainer.skills.length === 0 && (
                        <span className="text-xs text-slate-400">
                          No skills listed
                        </span>
                      )}
                    </div>

                    {trainer.modes.length > 0 && (
                      <p className="mt-1 text-xs text-slate-400">
                        {trainer.modes.join(" / ")}
                      </p>
                    )}
                  </td>

                  {/* Availability */}

                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${availabilityMeta.bg} ${availabilityMeta.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${availabilityMeta.dot}`}
                      />
                      {availabilityMeta.label}
                    </span>
                  </td>

                  {/* Reliability */}

                  <td className="px-4 py-2.5">
                    <div
                      className={`flex items-center gap-1 text-sm font-semibold ${getReliabilityTone(trainer.rating)}`}
                    >
                      <FiStar size={13} className="text-amber-500" />
                      {trainer.rating > 0 ? trainer.rating.toFixed(1) : "—"}
                    </div>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {trainer.assignmentsCompleted} assignments
                    </p>
                  </td>

                  {/* Quick Actions */}

                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title={
                          canAssign
                            ? "Assign to a requirement"
                            : "Trainer is not currently available for assignment"
                        }
                        disabled={!canAssign}
                        onClick={() => onAssign?.(trainer)}
                        className="flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                      >
                        <FiUserPlus size={13} />
                        Assign
                      </button>

                      <button
                        type="button"
                        title="View trainer"
                        onClick={() =>
                          navigate(`/admin/trainers/${trainer.id}`)
                        }
                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FiEye size={16} />
                      </button>

                      <button
                        type="button"
                        title="View availability"
                        onClick={() =>
                          navigate(`/admin/trainers/${trainer.id}/availability`)
                        }
                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                      >
                        <FiCalendar size={16} />
                      </button>

                      <RowMenu
                        trainer={trainer}
                        onDelete={onDelete}
                        deletingId={deletingId}
                        openId={openMenuId}
                        setOpenId={setOpenMenuId}
                        navigate={navigate}
                      />
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

export default TrainerTable;
