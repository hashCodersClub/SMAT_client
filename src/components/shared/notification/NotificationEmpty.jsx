// features/notifications/components/NotificationEmpty.jsx

import React from "react";

const NotificationEmpty = ({ message = "No notifications yet" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <svg
        className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
        {message}
      </h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        We'll let you know when something arrives.
      </p>
    </div>
  );
};

export default NotificationEmpty;
