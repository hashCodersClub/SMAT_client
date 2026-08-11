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

  // Vendor — propose terms for a newly booked assignment.
  request: async (data) => {
    const response = await api.post("/purchase-orders/request", data);

    return response.data;
  },

  // Vendor / Admin — withdraw a request before it's issued.
  cancel: async (id) => {
    const response = await api.patch(`/purchase-orders/${id}/cancel`);

    return response.data;
  },

  // Admin — review the vendor's proposal and issue the real PO to the trainer.
  issue: async (id, data) => {
    const response = await api.patch(`/purchase-orders/${id}/issue`, data);

    return response.data;
  },

  // Trainer — confirm or reject an issued PO.
  respond: async (id, data) => {
    const response = await api.patch(`/purchase-orders/${id}/respond`, data);

    return response.data;
  },
};

export default purchaseOrdersApi;
