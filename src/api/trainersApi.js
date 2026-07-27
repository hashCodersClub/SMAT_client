import api from "./axios";

const trainersApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/trainers", {
      params,
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trainers/${id}`);

    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/trainers", data);

    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/trainers/${id}`, data);

    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/trainers/${id}`);

    return response.data;
  },
  /*
|--------------------------------------------------------------------------
| Trainer Self Profile
|--------------------------------------------------------------------------
*/

  getMyProfile: async () => {
    const response = await api.get("/trainers/me");

    return response.data;
  },

  updateMyProfile: async (payload) => {
    const response = await api.patch("/trainers/me", payload);

    return response.data;
  },
};

export default trainersApi;
