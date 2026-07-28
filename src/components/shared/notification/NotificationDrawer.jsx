// features/notifications/components/NotificationDrawer.jsx

import React, { useEffect, useRef } from "react";
import NotificationList from "./NotificationList";
import useNotifications from "../hooks/useNotifications";

const NotificationDrawer = ({ isOpen, onClose }) => {
  const drawerRef = useRef();
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    archiveNotification,
    deleteNotification,
  } = useNotifications();

  // Close on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // prevent scroll
      // Fetch latest notifications for drawer
      fetchNotifications({ tab: "all", limit: 10, reset: true });
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, fetchNotifications]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40 transition-opacity" />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 right-0 h-full w-80 md:w-96 bg-white dark:bg-gray-800 shadow-xl z-50 
          transition-transform duration-300 ease-in-out
          ${isOpen ? "transform translate-x-0" : "transform translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Notifications
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <NotificationList
              notifications={notifications}
              loading={loading}
              error={null}
              hasMore={false}
              lastNotificationRef={() => {}}
              onMarkRead={markAsRead}
              onArchive={archiveNotification}
              onDelete={deleteNotification}
              onMarkAllRead={() => {}}
            />
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={onClose}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all notifications
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
