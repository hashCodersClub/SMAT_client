import { FiCheckCircle, FiClock, FiSlash, FiUsers } from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| Operational KPI Bar
|--------------------------------------------------------------------------
|
| Replaces the previous decorative stat cards. Every KPI here maps to a
| real operational question an ops executive asks while triaging the
| trainer bench, and every card is clickable -- clicking applies (or
| clears) the matching filter on the table below.
|
| No new backend fields are required: these are derived entirely from
| the trainer list already loaded by TrainersPage, and they drive the
| exact same `availability` / `status` filter state that TrainerFilters
| already exposes.
|
*/

const TrainerStats = ({
  trainers,
  availability,
  status,
  onSelectAvailability,
  onSelectStatus,
  onShowAll,
}) => {
  const total = trainers.length;

  const available = trainers.filter(
    (t) => t.availability === "AVAILABLE" && t.status === "ACTIVE",
  ).length;

  const busy = trainers.filter((t) => t.availability === "BUSY").length;

  const inactive = trainers.filter((t) => t.status === "INACTIVE").length;

  const isAllActive = !availability && !status;

  const cards = [
    {
      key: "all",
      label: "Total Trainers",
      value: total,
      description: "In your bench",
      icon: FiUsers,
      accent: "text-slate-500",
      iconBg: "bg-slate-100 text-slate-500",
      active: isAllActive,
      onClick: onShowAll,
    },
    {
      key: "available",
      label: "Available Now",
      value: available,
      description: "Ready to assign",
      icon: FiCheckCircle,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-600",
      active: availability === "AVAILABLE",
      onClick: () => onSelectAvailability("AVAILABLE"),
    },
    {
      key: "busy",
      label: "On Assignment",
      value: busy,
      description: "Currently busy",
      icon: FiClock,
      accent: "text-amber-600",
      iconBg: "bg-amber-50 text-amber-600",
      active: availability === "BUSY",
      onClick: () => onSelectAvailability("BUSY"),
    },
    {
      key: "inactive",
      label: "Needs Attention",
      value: inactive,
      description: "Inactive profiles",
      icon: FiSlash,
      accent: "text-rose-600",
      iconBg: "bg-rose-50 text-rose-600",
      active: status === "INACTIVE",
      onClick: () => onSelectStatus("INACTIVE"),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <button
            key={card.key}
            type="button"
            onClick={card.onClick}
            aria-pressed={card.active}
            className={`group flex items-center gap-3 rounded-lg border bg-white px-3.5 py-3 text-left shadow-sm transition ${
              card.active
                ? "border-blue-300 ring-1 ring-blue-100"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${card.iconBg}`}
            >
              <Icon size={16} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {card.label}
              </p>

              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold leading-none text-slate-800">
                  {card.value}
                </span>

                <span className="truncate text-[11px] text-slate-400">
                  {card.description}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TrainerStats;
