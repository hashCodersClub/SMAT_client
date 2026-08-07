import api from "./axios";

const opportunitiesApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/opportunities", { params });
    return response.data;
  },
};

export default opportunitiesApi;
