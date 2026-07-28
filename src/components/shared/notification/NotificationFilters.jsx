// features/notifications/components/NotificationFilters.jsx

import React from "react";
import { FILTER_OPTIONS, SORT_OPTIONS } from "../utils/constants";

const NotificationFilters = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Search */}
      <div className="flex-1 min-w-[180px]">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full py-1.5 pl-9 pr-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 transition"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="min-w-[120px]">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full py-1.5 px-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition"
        >
          <option value="">All Categories</option>
          {FILTER_OPTIONS.categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div className="min-w-[120px]">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full py-1.5 px-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition"
        >
          <option value="">All Priorities</option>
          {FILTER_OPTIONS.priorities.map((pri) => (
            <option key={pri} value={pri}>
              {pri.charAt(0).toUpperCase() + pri.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="min-w-[120px]">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-full py-1.5 px-3 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white transition"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NotificationFilters;
