import { useCallback, useState } from "react";

import notificationApi from "../api/notificationApi";

/*
|--------------------------------------------------------------------------
| useNotifications
|--------------------------------------------------------------------------
|
| Matches the ACTUAL backend contract (GET/PATCH/DELETE /api/notifications)
| and the real notificationApi module — no assumptions about endpoints
| that don't exist (archive, per-category/priority filtering, settings).
| No third-party toast dependency; callers read `error` and show their
| own feedback.
|--------------------------------------------------------------------------
*/

const PAGE_SIZE = 20;

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Fetch Notifications
  |--------------------------------------------------------------------------
  |
  | { unreadOnly, reset } — reset=true replaces the list (new filter or
  | initial load), reset=false appends the next page ("Load more").
  |--------------------------------------------------------------------------
  */

  const fetchNotifications = useCallback(
    async ({ unreadOnly = false, reset = true } = {}) => {
      const targetPage = reset ? 1 : page + 1;

      setLoading(true);
      setError(null);

      try {
        const data = await notificationApi.getMine({
          page: targetPage,
          limit: PAGE_SIZE,
          unreadOnly,
        });

        setNotifications((previous) =>
          reset
            ? data.notifications || []
            : [...previous, ...(data.notifications || [])],
        );

        setTotalUnread(data.unreadCount || 0);
        setTotalCount(data.pagination?.total || 0);
        setHasMore(targetPage < (data.pagination?.pages || 0));
        setPage(targetPage);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  /*
  |--------------------------------------------------------------------------
  | Mark One As Read
  |--------------------------------------------------------------------------
  */

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationApi.markAsRead(id);

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id ? { ...item, isRead: true } : item,
        ),
      );

      setTotalUnread((previous) => Math.max(previous - 1, 0));
    } catch (err) {
      setError(err);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Mark All As Read
  |--------------------------------------------------------------------------
  */

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true })),
      );

      setTotalUnread(0);
    } catch (err) {
      setError(err);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationApi.remove(id);

      setNotifications((previous) => {
        const removed = previous.find((item) => item._id === id);

        if (removed && !removed.isRead) {
          setTotalUnread((count) => Math.max(count - 1, 0));
        }

        return previous.filter((item) => item._id !== id);
      });

      setTotalCount((previous) => Math.max(previous - 1, 0));
    } catch (err) {
      setError(err);
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    hasMore,
    totalUnread,
    totalCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

export default useNotifications;
