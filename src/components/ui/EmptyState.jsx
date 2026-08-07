const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => (
  <div
    className={`animate-fade-in-up flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}
  >
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-slate-200/60">
        <Icon className="h-6 w-6" />
      </div>
    )}
    <h3 className="text-sm font-semibold tracking-tight text-slate-900">
      {title}
    </h3>
    {description && (
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
