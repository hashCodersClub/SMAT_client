import api from "./axios";

const notificationApi = {
  getMine: async ({ page = 1, limit = 20, unreadOnly = false } = {}) => {
    const response = await api.get("/notifications", {
      params: {
        page,
        limit,
        ...(unreadOnly && { unreadOnly: "true" }),
      },
    });

    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");

    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);

    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");

    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/notifications/${id}`);

    return response.data;
  },
};

export default notificationApi;
