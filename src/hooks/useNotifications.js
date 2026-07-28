// features/notifications/hooks/useNotifications.js

import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "../api/notificationApi";
import { DEFAULT_PAGE_SIZE } from "../utils/constants";
import { toast } from "react-toastify"; // optional, but you can replace with your own toast

const useNotifications = (role = "student") => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalUnread, setTotalUnread] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [settings, setSettings] = useState({});

  // Build query params
  const buildParams = (filters) => {
    const params = {
      page: filters.reset ? 1 : page,
      limit: DEFAULT_PAGE_SIZE,
      tab: filters.tab || "all",
      search: filters.search || "",
      category: filters.category || "",
      priority: filters.priority || "",
      sort: filters.sort || "newest",
      role, // pass role to API
    };
    if (filters.reset) {
      params.page = 1;
    }
    return params;
  };

  const fetchNotifications = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);
        const params = buildParams(filters);
        const response = await notificationApi.getNotifications(params);
        const { data, pagination, stats } = response.data;

        // Update state
        if (filters.reset) {
          setNotifications(data);
          setPage(1);
        } else {
          setNotifications((prev) => [...prev, ...data]);
        }
        setHasMore(pagination.hasMore);
        setPage((prev) => (filters.reset ? 1 : prev + 1));
        setTotalUnread(stats.unreadCount);
        setTotalCount(stats.totalCount);
      } catch (err) {
        setError(err);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [role, page],
  );

  // Mark as read
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setTotalUnread((prev) => Math.max(prev - 1, 0));
      toast.success("Marked as read");
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  }, []);

  // Mark all read
  const markAllAsRead = useCallback(
    async (tab = "all") => {
      try {
        await notificationApi.markAllAsRead({ tab, role });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setTotalUnread(0);
        toast.success("All notifications marked as read");
      } catch (err) {
        toast.error("Failed to mark all as read");
      }
    },
    [role],
  );

  // Archive
  const archiveNotification = useCallback(async (id) => {
    try {
      await notificationApi.archiveNotification(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isArchived: true } : n)),
      );
      toast.info("Archived");
    } catch (err) {
      toast.error("Failed to archive");
    }
  }, []);

  // Delete
  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  }, []);

  // Settings
  const updateSettings = useCallback(async (newSettings) => {
    try {
      await notificationApi.updateSettings(newSettings);
      setSettings(newSettings);
      toast.success("Settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await notificationApi.getSettings();
        setSettings(res.data);
      } catch (err) {
        // ignore
      }
    };
    loadSettings();
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
    archiveNotification,
    deleteNotification,
    updateSettings,
    settings,
  };
};

export default useNotifications;
