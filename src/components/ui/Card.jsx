const Card = ({ children, className = "", padding = true }) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white shadow-sm ${padding ? "p-5 sm:p-6" : ""} ${className}`}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, description, action, className = "" }) => (
  <div
    className={`flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
  >
    <div>
      {title && (
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      )}
      {description && (
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`${className}`}>{children}</div>
);

export default Card;
