// features/notifications/components/NotificationCard.jsx

import React, { useState } from "react";
import { formatRelativeTime } from "../utils/helpers"; // We'll define this later

const NotificationCard = ({
  notification,
  onMarkRead,
  onArchive,
  onDelete,
}) => {
  const {
    id,
    title,
    message,
    createdAt,
    isRead,
    isArchived,
    priority,
    category,
    type,
  } = notification;

  const [isLoading, setIsLoading] = useState(false);

  const handleMarkRead = async () => {
    if (isRead) return;
    setIsLoading(true);
    await onMarkRead(id);
    setIsLoading(false);
  };

  const handleArchive = async () => {
    if (isArchived) return;
    setIsLoading(true);
    await onArchive(id);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this notification?")) {
      setIsLoading(true);
      await onDelete(id);
      setIsLoading(false);
    }
  };

  // Priority badge colors
  const priorityColorMap = {
    low: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const priorityClass = priorityColorMap[priority] || priorityColorMap.low;

  return (
    <div
      className={`
        relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
        rounded-lg p-4 mb-2 shadow-sm hover:shadow-md transition-shadow
        ${!isRead ? "border-l-4 border-l-blue-500 dark:border-l-blue-400" : ""}
        ${isArchived ? "opacity-75 bg-gray-50 dark:bg-gray-900" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Title */}
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {title}
            </h4>

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${priorityClass}`}
            >
              {priority}
            </span>

            {/* Category Badge */}
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full">
              {category}
            </span>

            {/* Unread dot */}
            {!isRead && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {message}
          </p>

          {/* Time */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatRelativeTime(createdAt)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {!isRead && (
            <button
              onClick={handleMarkRead}
              disabled={isLoading}
              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition"
              title="Mark as read"
              aria-label="Mark as read"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </button>
          )}
          {!isArchived && (
            <button
              onClick={handleArchive}
              disabled={isLoading}
              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-md transition"
              title="Archive"
              aria-label="Archive"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition"
            title="Delete"
            aria-label="Delete"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
