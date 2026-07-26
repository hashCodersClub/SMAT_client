import api from "./axios";

/*
|--------------------------------------------------------------------------
| Requirements API
|--------------------------------------------------------------------------
|
| Backend:
|
| GET    /requirements
| POST   /requirements
| GET    /requirements/:id
| PATCH  /requirements/:id
| PATCH  /requirements/:id/status
| DELETE /requirements/:id
|
| Vendor security is handled by the backend.
|--------------------------------------------------------------------------
*/

const requirementsApi = {
  /*
  |--------------------------------------------------------------------------
  | Get Requirements
  |--------------------------------------------------------------------------
  */

  getAll: async (params = {}) => {
    const response = await api.get("/requirements", {
      params,
    });

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Get Requirement
  |--------------------------------------------------------------------------
  */

  getById: async (id) => {
    const response = await api.get(`/requirements/${id}`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Create Requirement
  |--------------------------------------------------------------------------
  */

  create: async (data) => {
    const response = await api.post("/requirements", data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Requirement
  |--------------------------------------------------------------------------
  */

  update: async (id, data) => {
    const response = await api.patch(`/requirements/${id}`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Status
  |--------------------------------------------------------------------------
  |
  | Internal roles only.
  |--------------------------------------------------------------------------
  */

  updateStatus: async (id, data) => {
    const response = await api.patch(`/requirements/${id}/status`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Requirement
  |--------------------------------------------------------------------------
  |
  | ADMIN / SUPER_ADMIN only.
  |--------------------------------------------------------------------------
  */

  delete: async (id) => {
    const response = await api.delete(`/requirements/${id}`);

    return response.data;
  },
};

export default requirementsApi;
