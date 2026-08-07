const Skeleton = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-md bg-slate-200/70 ${className}`}
    aria-hidden="true"
  >
    <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent bg-[length:200%_100%]" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="mt-3 h-8 w-16" />
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-4">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
    <Skeleton className="h-6 w-20 rounded-full" />
  </div>
);

export default Skeleton;
