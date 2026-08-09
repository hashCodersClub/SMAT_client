import api from "./axios";

const assignmentsApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/assignments", {
      params,
    });

    return response.data;
  },

  getMine: async () => {
    const response = await api.get("/assignments/mine");

    return response.data;
  },

  // Trainer confirms a PROPOSED assignment — the final step of the flow.
  confirmMine: async (id) => {
    const response = await api.post(`/assignments/mine/${id}/confirm`);

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/assignments/${id}`);

    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/assignments", data);

    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/assignments/${id}`, data);

    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.patch(`/assignments/${id}/status`, data);

    return response.data;
  },

  submitFeedback: async (id, data) => {
    const response = await api.patch(`/assignments/${id}/feedback`, data);

    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/assignments/${id}`);

    return response.data;
  },
};

export default assignmentsApi;
