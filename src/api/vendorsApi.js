import api from "./axios";

const vendorsApi = {
  /*
  |--------------------------------------------------------------------------
  | Get Vendors
  |--------------------------------------------------------------------------
  */

  getAll: async (params = {}) => {
    const response = await api.get("/vendors", {
      params,
    });

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Get Vendor By ID
  |--------------------------------------------------------------------------
  */

  getById: async (id) => {
    const response = await api.get(`/vendors/${id}`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Create Vendor
  |--------------------------------------------------------------------------
  */

  create: async (data) => {
    const response = await api.post("/vendors", data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Vendor
  |--------------------------------------------------------------------------
  */

  update: async (id, data) => {
    const response = await api.patch(`/vendors/${id}`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Vendor
  |--------------------------------------------------------------------------
  */

  delete: async (id) => {
    const response = await api.delete(`/vendors/${id}`);

    return response.data;
  },
};

export default vendorsApi;
