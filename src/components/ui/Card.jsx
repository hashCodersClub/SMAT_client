const Card = ({
  children,
  className = "",
  padding = true,
  interactive = false,
}) => (
  <div
    className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
      interactive
        ? "cursor-pointer hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_2px_4px_rgba(15,23,42,0.04),0_12px_28px_-6px_rgba(15,23,42,0.12)]"
        : ""
    } ${padding ? "p-5 sm:p-6" : ""} ${className}`}
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
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
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
