import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_STYLES = {
  AVAILABLE: {
    cell: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    dot: "bg-emerald-500",
  },
  BUSY: {
    cell: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    dot: "bg-amber-500",
  },
  UNAVAILABLE: {
    cell: "bg-red-50 text-red-700 hover:bg-red-100",
    dot: "bg-red-500",
  },
};

const LEGEND_ITEMS = [
  { status: "AVAILABLE", label: "Available" },
  { status: "BUSY", label: "Busy" },
  { status: "UNAVAILABLE", label: "Unavailable" },
];

/*
|--------------------------------------------------------------------------
| Date Helpers
|--------------------------------------------------------------------------
|
| Calendar cells are keyed as plain "YYYY-MM-DD" strings built from local
| year/month/day components — never via toISOString() — so a trainer in
| any timezone always sees (and selects) the calendar day they clicked,
| with no UTC-conversion day-shift.
|
*/

const pad = (value) => String(value).padStart(2, "0");

export const toDateKey = (year, month, day) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

export const todayKey = () => {
  const now = new Date();
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate());
};

/*
|--------------------------------------------------------------------------
| Availability Calendar
|--------------------------------------------------------------------------
*/

const AvailabilityCalendar = ({
  monthDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  getRecordForDate,
  pendingStart,
  onDayClick,
}) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // Leading days from the previous month (muted, not clickable)
  for (let i = leadingBlanks - 1; i >= 0; i -= 1) {
    cells.push({
      day: daysInPrevMonth - i,
      inCurrentMonth: false,
    });
  }

  // Days in the current month
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      inCurrentMonth: true,
      dateKey: toDateKey(year, month, day),
    });
  }

  // Trailing days from the next month, padded to a full 6-row grid
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const day = cells.length - (leadingBlanks + daysInMonth) + 1;
    cells.push({ day, inCurrentMonth: false });
  }

  const today = todayKey();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          {monthDate.toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="Previous month"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            aria-label="Next month"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {cells.map((cell, index) => {
          if (!cell.inCurrentMonth) {
            return (
              <div
                key={`blank-${index}`}
                className="aspect-square rounded-xl text-center text-xs text-slate-300"
              >
                <span className="flex h-full w-full items-center justify-center">
                  {cell.day}
                </span>
              </div>
            );
          }

          const record = getRecordForDate(cell.dateKey);
          const isToday = cell.dateKey === today;
          const isPending = cell.dateKey === pendingStart;
          const styles = record ? STATUS_STYLES[record.status] : null;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => onDayClick(cell.dateKey)}
              className={`relative aspect-square rounded-xl text-sm font-medium transition ${
                isPending
                  ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500"
                  : styles
                    ? styles.cell
                    : "text-slate-600 hover:bg-slate-50"
              } ${isToday && !isPending ? "ring-2 ring-indigo-400" : ""}`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${STATUS_STYLES[item.status].dot}`}
            />
            <span className="text-xs font-medium text-slate-500">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Helper Text / Pending Selection Banner */}
      {pendingStart ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-medium text-indigo-700">
          <span>
            Selected {pendingStart} as the start date — click another date to
            set the end date (or click it again for a single day).
          </span>
          <button
            type="button"
            onClick={() => onDayClick(null)}
            className="shrink-0 font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
          >
            Cancel
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-400">
          Click a date to start adding availability. Click a colored date to
          edit that entry.
        </p>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
