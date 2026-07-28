// features/notifications/components/NotificationList.jsx

import React from "react";
import NotificationCard from "./NotificationCard";
import NotificationEmpty from "./NotificationEmpty";
import NotificationSkeleton from "./NotificationSkeleton";

const NotificationList = ({
  notifications,
  loading,
  error,
  hasMore,
  lastNotificationRef,
  onMarkRead,
  onArchive,
  onDelete,
  onMarkAllRead,
}) => {
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 dark:text-red-400">
          Failed to load notifications: {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && notifications.length === 0) {
    return <NotificationSkeleton count={5} />;
  }

  if (!loading && notifications.length === 0) {
    return <NotificationEmpty />;
  }

  return (
    <div className="space-y-2">
      {/* Mark all read button (visible if there are unread) */}
      {notifications.some((n) => !n.isRead) && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification cards */}
      {notifications.map((notification, index) => {
        const isLast = index === notifications.length - 1;
        return (
          <div key={notification.id} ref={isLast ? lastNotificationRef : null}>
            <NotificationCard
              notification={notification}
              onMarkRead={onMarkRead}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          </div>
        );
      })}

      {/* Loading more indicator */}
      {loading && notifications.length > 0 && (
        <div className="py-4 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Loading more...
          </span>
        </div>
      )}

      {/* End of list */}
      {!hasMore && notifications.length > 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
          No more notifications
        </p>
      )}
    </div>
  );
};

export default NotificationList;
