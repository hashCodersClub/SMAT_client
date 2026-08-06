const PageHeader = ({
  title,
  description,
  action,
  breadcrumbs,
  className = "",
}) => (
  <div
    className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}
  >
    <div>
      {breadcrumbs && (
        <nav className="mb-2 text-sm text-slate-500">{breadcrumbs}</nav>
      )}
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
    {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
  </div>
);

export default PageHeader;
