const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  loading = false,
  onClick,
  accent = "slate",
}) => {
  const accents = {
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    red: "bg-red-50 text-red-600",
  };

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${accents[accent]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
        {loading ? "—" : value}
      </p>
      {trend !== undefined && (
        <p className="mt-1 text-xs text-slate-500">
          <span
            className={
              trend >= 0 ? "font-medium text-emerald-600" : "font-medium text-red-600"
            }
          >
            {trend >= 0 ? "+" : ""}
            {trend}
          </span>{" "}
          {trendLabel}
        </p>
      )}
    </Wrapper>
  );
};

export default StatCard;
