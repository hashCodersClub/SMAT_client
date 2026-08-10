import api from "./axios";

const invoicesApi = {
  /*
  |--------------------------------------------------------------------------
  | Get Invoices
  |--------------------------------------------------------------------------
  */

  getAll: async (params = {}) => {
    const response = await api.get("/invoices", { params });

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Get Invoice By ID
  |--------------------------------------------------------------------------
  */

  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Preview Next Invoice Number
  |--------------------------------------------------------------------------
  */

  previewNextNumber: async () => {
    const response = await api.get("/invoices/next-number");

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Create Invoice
  |--------------------------------------------------------------------------
  */

  create: async (data) => {
    const response = await api.post("/invoices", data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Invoice
  |--------------------------------------------------------------------------
  */

  update: async (id, data) => {
    const response = await api.patch(`/invoices/${id}`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Invoice Status
  |--------------------------------------------------------------------------
  */

  updateStatus: async (id, data) => {
    const response = await api.patch(`/invoices/${id}/status`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Invoice
  |--------------------------------------------------------------------------
  */

  delete: async (id) => {
    const response = await api.delete(`/invoices/${id}`);

    return response.data;
  },
};

export default invoicesApi;
