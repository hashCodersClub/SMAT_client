// features/notifications/components/NotificationStats.jsx

import React from "react";

const NotificationStats = ({ totalUnread = 0, totalCount = 0 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Unread
          </span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {totalUnread}
          </span>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total
          </span>
          <span className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {totalCount}
          </span>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 col-span-2 md:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Status
          </span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {totalUnread === 0 ? "All read ✅" : `${totalUnread} unread`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationStats;
