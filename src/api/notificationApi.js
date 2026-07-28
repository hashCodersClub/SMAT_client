// features/notifications/api/notificationApi.js

import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can add global error handling here (e.g., logout on 401)
    return Promise.reject(error);
  },
);

export const notificationApi = {
  // Get notifications with pagination, filters, search, sort
  getNotifications: (params) => {
    return apiClient.get("/notifications", { params });
  },

  // Mark a single notification as read
  markAsRead: (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  // Mark all notifications as read for a specific tab/role
  markAllAsRead: (data) => {
    return apiClient.patch("/notifications/read-all", data);
  },

  // Archive a notification
  archiveNotification: (id) => {
    return apiClient.patch(`/notifications/${id}/archive`);
  },

  // Delete a notification
  deleteNotification: (id) => {
    return apiClient.delete(`/notifications/${id}`);
  },

  // Get user settings
  getSettings: () => {
    return apiClient.get("/notifications/settings");
  },

  // Update user settings
  updateSettings: (settings) => {
    return apiClient.put("/notifications/settings", settings);
  },

  // (Optional) Socket.IO integration can be added here
  // For real-time updates, you might listen to 'new-notification' events.
};
