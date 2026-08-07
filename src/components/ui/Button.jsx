const variants = {
  primary:
    "bg-gradient-to-b from-slate-800 to-slate-950 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_8px_20px_-6px_rgba(15,23,42,0.45)] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_10px_28px_-6px_rgba(15,23,42,0.55)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none",
  gradient:
    "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] hover:shadow-[0_10px_28px_-6px_rgba(99,102,241,0.65)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98] bg-[length:150%_auto] hover:bg-right disabled:opacity-60 disabled:shadow-none",
  secondary:
    "bg-white text-slate-700 ring-1 ring-inset ring-slate-200 shadow-xs hover:ring-slate-300 hover:bg-slate-50 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  loading = false,
  disabled,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:translate-y-0 disabled:scale-100 disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
    {...props}
  >
    {loading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {Icon && !loading && (
      <Icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
    )}
    {children}
  </button>
);

export default Button;
