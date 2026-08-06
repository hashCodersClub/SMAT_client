const variants = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  primary: "bg-blue-50 text-blue-700 ring-blue-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

const Badge = ({ children, variant = "default", className = "" }) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant] || variants.default} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
