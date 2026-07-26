import { FiCheck, FiEye, FiMapPin, FiStar, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import MatchScore from "./MatchScore";
import MatchBreakdown from "./MatchBreakdown";

const TrainerMatchCard = ({ trainer, shortlisted, onShortlist }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        <div className="flex flex-col justify-between gap-5 md:flex-row">
          <div className="flex min-w-0 gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FiUser size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900">
                {trainer.name}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <FiMapPin />
                  {trainer.city}
                </span>

                <span>{trainer.experience} years</span>

                {trainer.rating && (
                  <span className="flex items-center gap-1">
                    <FiStar />
                    {trainer.rating}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {trainer.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <MatchScore score={trainer.match.score} />
        </div>

        <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Match Breakdown
            </p>

            <MatchBreakdown match={trainer.match} />
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Commercial
            </p>

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Trainer Rate</p>

                <p className="mt-1 font-semibold text-slate-800">
                  ₹{Number(trainer.dailyRate || 0).toLocaleString("en-IN")}
                  /day
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Availability</p>

                <p
                  className={`mt-1 font-semibold ${
                    trainer.match.breakdown.availability.available
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {trainer.availability || "Available"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-400">Training Modes</p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {trainer.trainingModes?.join(", ") || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate(`/trainers/${trainer.id}`)}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <FiEye />
          View Profile
        </button>

        <button
          type="button"
          onClick={() => onShortlist(trainer.id)}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            shortlisted
              ? "bg-emerald-50 text-emerald-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {shortlisted && <FiCheck />}

          {shortlisted ? "Shortlisted" : "Shortlist Trainer"}
        </button>
      </div>
    </div>
  );
};

export default TrainerMatchCard;
