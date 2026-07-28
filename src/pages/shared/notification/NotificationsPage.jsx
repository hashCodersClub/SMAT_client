// features/notifications/pages/NotificationsPage.jsx

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import NotificationTabs from "../../../components/shared/notification/NotificationTabs";
import NotificationFilters from "../../../components/shared/notification/NotificationFilters";
import NotificationStats from "../../../components/shared/notification/NotificationStats";
import NotificationList from "../../../components/shared/notification/NotificationList";
import NotificationDrawer from "../../../components/shared/notification/NotificationDrawer";
import NotificationSettings from "../../../components/shared/notification/NotificationSettings";
import useNotifications from "../hooks/useNotifications";
import { TAB_OPTIONS } from "../utils/constants";

const NotificationsPage = () => {
  // Derive role from pathname (e.g., /admin/notifications -> 'admin')
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const role = pathSegments.length > 0 ? pathSegments[0] : "student"; // fallback

  // State for active tab, filters, search, sort
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Use custom hook
  const {
    notifications,
    loading,
    error,
    hasMore,
    totalUnread,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    updateSettings,
    settings,
  } = useNotifications(role);

  // Fetch initial data and when filters change
  useEffect(() => {
    fetchNotifications({
      tab: activeTab,
      search: searchQuery,
      category: categoryFilter,
      priority: priorityFilter,
      sort: sortOrder,
      reset: true, // reset pagination
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchQuery, categoryFilter, priorityFilter, sortOrder]);

  // Infinite scroll trigger
  const observerRef = useRef();
  const lastNotificationRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNotifications({
            tab: activeTab,
            search: searchQuery,
            category: categoryFilter,
            priority: priorityFilter,
            sort: sortOrder,
            reset: false, // append more
          });
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [
      loading,
      hasMore,
      activeTab,
      searchQuery,
      categoryFilter,
      priorityFilter,
      sortOrder,
    ],
  );

  // Handlers
  const handleMarkRead = (id) => markAsRead(id);
  const handleMarkAllRead = () => markAllAsRead(activeTab);
  const handleArchive = (id) => archiveNotification(id);
  const handleDelete = (id) => deleteNotification(id);

  // Drawer and Settings states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Notifications
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Open notification drawer"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Open notification settings"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <NotificationStats totalUnread={totalUnread} />

        {/* Tabs */}
        <NotificationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Filters */}
        <NotificationFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* List */}
        <NotificationList
          notifications={notifications}
          loading={loading}
          error={error}
          hasMore={hasMore}
          lastNotificationRef={lastNotificationRef}
          onMarkRead={handleMarkRead}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onMarkAllRead={handleMarkAllRead}
        />

        {/* Drawer & Settings */}
        <NotificationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
        <NotificationSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          updateSettings={updateSettings}
        />
      </div>
    </div>
  );
};

export default NotificationsPage;
