import api from "./axios";

const purchaseOrdersApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/purchase-orders", { params });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/purchase-orders/${id}`);

    return response.data;
  },

  previewNextNumber: async () => {
    const response = await api.get("/purchase-orders/next-number");

    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/purchase-orders", data);

    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/purchase-orders/${id}`, data);

    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.patch(`/purchase-orders/${id}/status`, data);

    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/purchase-orders/${id}`);

    return response.data;
  },
};

export default purchaseOrdersApi;
