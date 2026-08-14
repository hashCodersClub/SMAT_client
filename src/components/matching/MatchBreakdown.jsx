import { FiCheck, FiX } from "react-icons/fi";

const MatchBreakdown = ({ match }) => {
  const { breakdown } = match;

  const items = [
    {
      label: "Skills",
      score: breakdown.skills.score,
      max: breakdown.skills.max,
    },
    {
      label: "Location",
      score: breakdown.location.score,
      max: breakdown.location.max,
    },
    {
      label: "Experience",
      score: breakdown.experience?.score,
      max: breakdown.experience?.max,
    },
    ...(breakdown.budget ? [{
      label: "Budget",
      score: breakdown.budget.score,
      max: breakdown.budget.max,
    }] : []),
    {
      label: "Mode",
      score: breakdown.mode?.score,
      max: breakdown.mode?.max,
    },
    {
      label: "Availability",
      score: breakdown.availability.score,
      max: breakdown.availability.max,
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const percentage = (item.score / item.max) * 100;

        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">{item.label}</span>

              <span className="text-slate-400">
                {item.score}/{item.max}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}

      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Skill Analysis
        </p>

        <div className="flex flex-wrap gap-2">
          {breakdown.skills.matched.map((skill) => (
            <span
              key={`matched-${skill}`}
              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
            >
              <FiCheck />
              {skill}
            </span>
          ))}

          {breakdown.skills.missing.map((skill) => (
            <span
              key={`missing-${skill}`}
              className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600"
            >
              <FiX />
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchBreakdown;
