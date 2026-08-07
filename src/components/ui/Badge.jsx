const variants = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  primary: "bg-blue-50 text-blue-700 ring-blue-200/80",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/80",
  danger: "bg-red-50 text-red-700 ring-red-200/80",
  purple: "bg-purple-50 text-purple-700 ring-purple-200/80",
  gradient:
    "bg-gradient-to-r from-indigo-600 to-purple-600 text-white ring-transparent shadow-[0_2px_8px_-2px_rgba(99,102,241,0.5)]",
};

const dotColors = {
  default: "bg-slate-500",
  primary: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  purple: "bg-purple-500",
  gradient: "bg-white",
};

const Badge = ({
  children,
  variant = "default",
  dot = false,
  className = "",
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors duration-200 ${variants[variant] || variants.default} ${className}`}
  >
    {dot && (
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotColors[variant] || dotColors.default} ${variant !== "gradient" ? "animate-pulse" : ""}`}
      />
    )}
    {children}
  </span>
);

export default Badge;
