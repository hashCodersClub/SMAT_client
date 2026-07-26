import {
  FiEye,
  FiEdit2,
  FiMapPin,
  FiStar,
  FiMoreVertical,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const availabilityStyles = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  BUSY: "bg-amber-50 text-amber-700",
  UNAVAILABLE: "bg-red-50 text-red-700",
};

const TrainerTable = ({ trainers }) => {
  const navigate = useNavigate();

  if (trainers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">
          No trainers found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Trainer
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Skills
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Experience
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rating
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Availability
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {trainers.map((trainer) => (
              <tr key={trainer.id} className="transition hover:bg-slate-50">
                {/* Trainer */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 font-semibold text-white">
                      {trainer.name
                        .split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800">
                        {trainer.name}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {trainer.id} • {trainer.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Skills */}

                <td className="px-5 py-4">
                  <div className="flex max-w-[260px] flex-wrap gap-1.5">
                    {trainer.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}

                    {trainer.skills.length > 3 && (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        +{trainer.skills.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Location */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <FiMapPin size={14} />
                    {trainer.city}
                  </div>
                </td>

                {/* Experience */}

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {trainer.experienceYears} years
                  </p>

                  <p className="text-xs text-slate-400">
                    {trainer.trainingExperienceYears} yrs training
                  </p>
                </td>

                {/* Rating */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <FiStar className="text-amber-500" />

                    <span className="text-sm font-semibold text-slate-700">
                      {trainer.rating}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {trainer.assignmentsCompleted} assignments
                  </p>
                </td>

                {/* Availability */}

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      availabilityStyles[trainer.availability]
                    }`}
                  >
                    {trainer.availability}
                  </span>
                </td>

                {/* Actions */}

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      title="View trainer"
                      onClick={() => navigate(`/trainers/${trainer.id}`)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <FiEye />
                    </button>

                    <button
                      type="button"
                      title="Edit trainer"
                      onClick={() => navigate(`/trainers/${trainer.id}/edit`)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
                    >
                      <FiMoreVertical />
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

export default TrainerTable;
