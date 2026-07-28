// features/notifications/utils/constants.js

export const NOTIFICATION_TYPES = {
  SYSTEM: "system",
  MESSAGE: "message",
  ALERT: "alert",
  REMINDER: "reminder",
  UPDATE: "update",
};

export const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

export const NOTIFICATION_CATEGORIES = {
  GENERAL: "general",
  ACADEMIC: "academic",
  ADMIN: "admin",
  TRAINING: "training",
  VENDOR: "vendor",
  STUDENT: "student",
};

export const TAB_OPTIONS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "archived", label: "Archived" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

export const FILTER_OPTIONS = {
  categories: Object.values(NOTIFICATION_CATEGORIES),
  priorities: Object.values(NOTIFICATION_PRIORITIES),
};

export const DEFAULT_PAGE_SIZE = 20;

// Helper: format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear}y ago`;
  if (diffMonth > 0) return `${diffMonth}mo ago`;
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  if (diffSec > 5) return `${diffSec}s ago`;
  return "Just now";
};
