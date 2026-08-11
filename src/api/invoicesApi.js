import api from "./axios";

const invoicesApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/invoices", { params });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);

    return response.data;
  },

  // Trainer — bill the platform after a completed assignment.
  createTrainerInvoice: async (data) => {
    const response = await api.post("/invoices/trainer", data);

    return response.data;
  },

  // Admin — suggested draft (items + vendor party) built from a trainer
  // invoice, re-priced at the vendor rate. Doesn't save anything.
  prefillVendorInvoice: async (trainerInvoiceId) => {
    const response = await api.get(
      `/invoices/${trainerInvoiceId}/prefill-vendor-invoice`,
    );

    return response.data;
  },

  // Admin — bill the vendor (from prefill, or from scratch).
  createVendorInvoice: async (data) => {
    const response = await api.post("/invoices/vendor", data);

    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/invoices/${id}`, data);

    return response.data;
  },

  updateStatus: async (id, data) => {
    const response = await api.patch(`/invoices/${id}/status`, data);

    return response.data;
  },

  // Vendor — manual "I've paid this" stub; real gateway comes later.
  markPaid: async (id) => {
    const response = await api.patch(`/invoices/${id}/mark-paid`);

    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/invoices/${id}`);

    return response.data;
  },
};

export default invoicesApi;
