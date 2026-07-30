import { useEffect, useRef, useState, useCallback } from "react";

import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import notificationApi from "../../api/notificationApi";

import NotificationItem from "./NotificationItem";

const POLL_INTERVAL_MS = 30000;

const NotificationBell = () => {
  const navigate = useNavigate();

  const containerRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetchers
  |--------------------------------------------------------------------------
  */

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationApi.getUnreadCount();

      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silent — badge just stays at its last known value.
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const data = await notificationApi.getMine({ limit: 10 });

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silent — dropdown just shows whatever it last had.
    } finally {
      setLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Poll Unread Count
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  /*
  |--------------------------------------------------------------------------
  | Close On Outside Click
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !open;

    setOpen(next);

    if (next) {
      fetchNotifications();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  const handleItemClick = async (notification) => {
    setOpen(false);

    if (!notification.isRead) {
      setUnreadCount((current) => Math.max(current - 1, 0));

      notificationApi.markAsRead(notification._id).catch(() => {});
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAllRead = async (event) => {
    event.stopPropagation();

    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));

    setUnreadCount(0);

    try {
      await notificationApi.markAllAsRead();
    } catch {
      // Best effort — a stale badge will correct on next poll.
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-lg border border-transparent p-2.5 text-slate-700 transition hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950"
        aria-label="Notifications"
      >
        <FiBell size={20} />

        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-bold text-slate-950">Notifications</span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-xs font-medium text-slate-500">
                Loading...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-xs font-medium text-slate-500">
                You're all caught up.
              </div>
            )}

            {!loading &&
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={handleItemClick}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
