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

  /*
  |--------------------------------------------------------------------------
  | Get Vendor Portal Users
  |--------------------------------------------------------------------------
  */

  getUsers: async (vendorId) => {
    const response = await api.get(`/vendors/${vendorId}/users`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Create Vendor Portal User
  |--------------------------------------------------------------------------
  */

  createUser: async (vendorId, data) => {
    const response = await api.post(`/vendors/${vendorId}/users`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Vendor Portal User Status
  |--------------------------------------------------------------------------
  */

  updateUserStatus: async (vendorId, userId, isActive) => {
    const response = await api.patch(
      `/vendors/${vendorId}/users/${userId}/status`,
      { isActive },
    );

    return response.data;
  },
};

export default vendorsApi;
