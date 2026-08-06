import { FiMapPin, FiStar, FiBriefcase, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const TrainerCard = ({ trainer }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {trainer.profilePhotoUrl ? (
            <img
              src={trainer.profilePhotoUrl}
              alt={trainer.name}
              className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-indigo-500/20 shadow-md"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-semibold text-white shadow-md">
              {trainer.name
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")}
            </div>
          )}

          <div>
            <h3 className="font-semibold text-slate-800">{trainer.name}</h3>

            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-slate-400">{trainer.id}</p>
              {trainer.portalEnabled ? (
                <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                  Portal Active
                </span>
              ) : (
                <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                  Invite Pending
                </span>
              )}
            </div>
          </div>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            trainer.availability === "AVAILABLE"
              ? "bg-emerald-50 text-emerald-700"
              : trainer.availability === "BUSY"
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {trainer.availability}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {trainer.skills.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <FiMapPin />
          {trainer.city}
        </div>

        <div className="flex items-center gap-2">
          <FiBriefcase />
          {trainer.experienceYears} yrs
        </div>

        <div className="flex items-center gap-2">
          <FiStar className="text-amber-500" />
          {trainer.rating}
        </div>

        <div>₹{trainer.offlineRate.toLocaleString("en-IN")}/day</div>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/admin/trainers/${trainer.id}`)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <FiEye />
        View Profile
      </button>
    </div>
  );
};

export default TrainerCard;
