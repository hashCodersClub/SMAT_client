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
    blue: "bg-blue-50 text-blue-600 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]",
    emerald:
      "bg-emerald-50 text-emerald-600 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]",
    amber:
      "bg-amber-50 text-amber-600 shadow-[0_0_0_1px_rgba(245,158,11,0.08)]",
    violet:
      "bg-violet-50 text-violet-600 shadow-[0_0_0_1px_rgba(139,92,246,0.08)]",
    red: "bg-red-50 text-red-600 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]",
  };

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_16px_32px_-8px_rgba(15,23,42,0.14)] ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 ${accents[accent]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-slate-900">
        {loading ? (
          <span className="inline-block h-7 w-16 animate-pulse rounded-md bg-slate-200/80 align-middle" />
        ) : (
          value
        )}
      </p>
      {trend !== undefined && (
        <p className="mt-1 text-xs text-slate-500">
          <span
            className={
              trend >= 0
                ? "font-medium text-emerald-600"
                : "font-medium text-red-600"
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
