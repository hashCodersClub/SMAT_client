import api from "./axios";

const opportunitiesApi = {
  // Admin list all opportunities
  getAll: async (params = {}) => {
    const response = await api.get("/opportunities", { params });
    return response.data;
  },

  // Trainer portal endpoints
  getMine: async (params = {}) => {
    const response = await api.get("/opportunities/mine", { params });
    return response.data;
  },

  getMineStats: async () => {
    const response = await api.get("/opportunities/mine/stats");
    return response.data;
  },

  getMineById: async (id) => {
    const response = await api.get(`/opportunities/mine/${id}`);
    return response.data;
  },

  respondMine: async (id, data) => {
    const response = await api.post(`/opportunities/mine/${id}/respond`, data);
    return response.data;
  },

  // Admin response review & selection endpoints
  getByRequirementAdmin: async (requirementId) => {
    const response = await api.get(
      `/opportunities/requirement/${requirementId}`,
    );
    return response.data;
  },

  // Vendor portal: read-only sourcing status for a requirement they own
  getByRequirementVendor: async (requirementId) => {
    const response = await api.get(
      `/opportunities/requirement/${requirementId}/vendor-summary`,
    );
    return response.data;
  },

  adminAction: async (id, action) => {
    const response = await api.post(`/opportunities/${id}/admin-action`, {
      action,
    });
    return response.data;
  },
};

export default opportunitiesApi;
