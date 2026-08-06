import { FiCheckCircle, FiCircle } from "react-icons/fi";

const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * @param {{ id?: string, title: string, description?: string, timestamp?: string|Date, completed?: boolean, active?: boolean }[]} events
 */
const ActivityTimeline = ({ events = [], emptyMessage = "No activity yet." }) => {
  if (!events.length) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const completed = event.completed ?? index < events.length - 1;
        const active = event.active ?? false;

        return (
          <li key={event.id || index} className="relative flex gap-3 pb-6">
            {!isLast && (
              <span
                className="absolute left-[11px] top-6 h-full w-px bg-slate-200"
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                completed
                  ? "bg-emerald-50 text-emerald-600"
                  : active
                    ? "bg-blue-50 text-blue-600 ring-2 ring-blue-100"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {completed ? (
                <FiCheckCircle className="h-3.5 w-3.5" />
              ) : (
                <FiCircle className="h-3 w-3" />
              )}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={`text-sm font-medium ${active ? "text-blue-700" : "text-slate-900"}`}
              >
                {event.title}
              </p>
              {event.description && (
                <p className="mt-0.5 text-sm text-slate-500">
                  {event.description}
                </p>
              )}
              {event.timestamp && (
                <time className="mt-1 block text-xs text-slate-400">
                  {formatTime(event.timestamp)}
                </time>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default ActivityTimeline;
