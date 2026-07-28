// features/notifications/components/NotificationSkeleton.jsx

import React from "react";

const NotificationSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
            </div>
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
