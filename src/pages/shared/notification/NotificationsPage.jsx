import { useEffect, useState } from "react";
import { FiBell, FiCheck, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import useNotifications from "../../../hooks/useNotifications";

/*
|--------------------------------------------------------------------------
| Notifications Page
|--------------------------------------------------------------------------
|
| Full-page notification center, shared by every portal (mounted at
| /admin/notifications, /vendor/notifications, /trainer/notifications).
|
| NOTE: this intentionally only supports what the backend actually
| offers today — list (all/unread), mark one/all as read, delete.
| The previous version of this page referenced "archive" and per-user
| notification "settings" features that have no backend endpoints; if
| those are wanted, they need a Notification model change + new routes
| before the UI can do anything real with them.
|--------------------------------------------------------------------------
*/

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
];

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

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");

  const {
    notifications,
    loading,
    error,
    hasMore,
    totalUnread,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  /*
  |--------------------------------------------------------------------------
  | Load On Tab Change
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchNotifications({ unreadOnly: activeTab === "unread", reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /*
  |--------------------------------------------------------------------------
  | Handlers
  |--------------------------------------------------------------------------
  */

  const handleItemClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleLoadMore = () => {
    fetchNotifications({ unreadOnly: activeTab === "unread", reset: false });
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {totalUnread > 0
              ? `${totalUnread} unread notification${totalUnread === 1 ? "" : "s"}`
              : "You're all caught up."}
          </p>
        </div>

        {totalUnread > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiCheckCircle size={16} />
            Mark all read
          </button>
        )}
      </div>

      {/* Tabs */}

      <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading && notifications.length === 0 && (
          <div className="px-6 py-16 text-center text-sm font-medium text-slate-500">
            Loading notifications...
          </div>
        )}

        {error && notifications.length === 0 && !loading && (
          <div className="px-6 py-16 text-center text-sm font-medium text-red-600">
            Couldn't load notifications. Please try again.
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <FiBell size={22} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              {activeTab === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              You'll see updates about requirements, outreach, and assignments
              here.
            </p>
          </div>
        )}

        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`flex items-start gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 ${
              notification.isRead ? "bg-white" : "bg-blue-50/50"
            }`}
          >
            <button
              type="button"
              onClick={() => handleItemClick(notification)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                )}

                <span className="truncate text-sm font-semibold text-slate-900">
                  {notification.title}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-600">
                {notification.message}
              </p>

              <span className="mt-1.5 block text-xs font-medium text-slate-400">
                {formatRelativeTime(notification.createdAt)}
              </span>
            </button>

            <div className="flex shrink-0 items-center gap-1 pt-0.5">
              {!notification.isRead && (
                <button
                  type="button"
                  onClick={() => markAsRead(notification._id)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Mark as read"
                  title="Mark as read"
                >
                  <FiCheck size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={() => deleteNotification(notification._id)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Delete notification"
                title="Delete"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
