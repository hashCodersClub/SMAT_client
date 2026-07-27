import api from "./axios";

/*
|--------------------------------------------------------------------------
| Trainer Availability API
|--------------------------------------------------------------------------
*/

const trainerAvailabilityApi = {
  /*
  |--------------------------------------------------------------------------
  | Get My Availability
  |--------------------------------------------------------------------------
  */

  getMyAvailability: async () => {
    const response = await api.get("/trainer-availability/me");

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Create
  |--------------------------------------------------------------------------
  */

  create: async (payload) => {
    const response = await api.post("/trainer-availability/me", payload);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update
  |--------------------------------------------------------------------------
  */

  update: async (id, payload) => {
    const response = await api.patch(`/trainer-availability/me/${id}`, payload);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  remove: async (id) => {
    const response = await api.delete(`/trainer-availability/me/${id}`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Overall Status
  |--------------------------------------------------------------------------
  */

  updateOverallStatus: async (status) => {
    const response = await api.patch("/trainer-availability/me/status", {
      status,
    });

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Admin - Trainer Availability
  |--------------------------------------------------------------------------
  */

  getTrainerAvailability: async (trainerId) => {
    const response = await api.get(
      `/trainer-availability/trainer/${trainerId}`,
    );

    return response.data;
  },
};

export default trainerAvailabilityApi;
