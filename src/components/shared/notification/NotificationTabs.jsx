// features/notifications/components/NotificationTabs.jsx

import React from "react";
import { TAB_OPTIONS } from "../utils/constants";

const NotificationTabs = ({ activeTab, setActiveTab, unreadCounts = {} }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
      <nav className="flex flex-wrap -mb-px" aria-label="Notification tabs">
        {TAB_OPTIONS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = unreadCounts[tab.key] || 0;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                inline-flex items-center py-2 px-4 text-sm font-medium border-b-2 
                transition-colors duration-200 focus:outline-none
                ${
                  isActive
                    ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`
                    ml-2 px-2 py-0.5 text-xs rounded-full
                    ${
                      isActive
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default NotificationTabs;
