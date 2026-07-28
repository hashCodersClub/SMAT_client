import api from "./axios";

const outreachApi = {
  getByRequirement: async (requirementId) => {
    const response = await api.get(`/outreach/requirement/${requirementId}`);

    return response.data;
  },

  upsert: async (data) => {
    const response = await api.post("/outreach", data);

    return response.data;
  },

  sendProfile: async (id) => {
    const response = await api.patch(`/outreach/${id}/send`);

    return response.data;
  },

  updateVendorStatus: async (id, data) => {
    const response = await api.patch(`/outreach/${id}/vendor-status`, data);

    return response.data;
  },
};

export default outreachApi;
