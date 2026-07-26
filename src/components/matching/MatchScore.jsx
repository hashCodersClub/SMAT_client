const MatchScore = ({ score }) => {
  let style = "bg-red-50 text-red-700 border-red-100";

  let label = "Low Match";

  if (score >= 80) {
    style = "bg-emerald-50 text-emerald-700 border-emerald-100";

    label = "Excellent";
  } else if (score >= 65) {
    style = "bg-blue-50 text-blue-700 border-blue-100";

    label = "Good Match";
  } else if (score >= 45) {
    style = "bg-amber-50 text-amber-700 border-amber-100";

    label = "Partial Match";
  }

  return (
    <div
      className={`flex h-20 w-20 flex-col items-center justify-center rounded-2xl border ${style}`}
    >
      <span className="text-xl font-bold">{score}%</span>

      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
};

export default MatchScore;
