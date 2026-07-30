import { FiCircle } from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| Relative Time
|--------------------------------------------------------------------------
*/

const formatRelativeTime = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();

  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString();
};

const NotificationItem = ({ notification, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
        notification.isRead ? "bg-white" : "bg-blue-50/60"
      }`}
    >
      <span className="mt-1.5 shrink-0">
        {!notification.isRead && (
          <FiCircle size={8} className="fill-blue-600 text-blue-600" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-slate-950">
          {notification.title}
        </span>

        <span className="mt-0.5 block line-clamp-2 text-xs font-medium text-slate-600">
          {notification.message}
        </span>

        <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>
    </button>
  );
};

export default NotificationItem;
