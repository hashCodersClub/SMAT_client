import api from "./axios";

const trainerInvitationApi = {
  /*
  |--------------------------------------------------------------------------
  | Send Invitation - Admin
  |--------------------------------------------------------------------------
  */

  invite: async (trainerId) => {
    const response = await api.post(
      `/trainer-invitations/trainer/${trainerId}`,
    );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Bulk Resend Expired - Admin
  |--------------------------------------------------------------------------
  */

  bulkResendExpired: async () => {
    const response = await api.post("/trainer-invitations/bulk-resend-expired");

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Validate Invitation - Public
  |--------------------------------------------------------------------------
  */

  validate: async (token) => {
    const response = await api.get("/trainer-invitations/validate", {
      params: {
        token,
      },
    });

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Accept Invitation - Public
  |--------------------------------------------------------------------------
  */

  accept: async ({ token, password }) => {
    const response = await api.post("/trainer-invitations/accept", {
      token,
      password,
    });

    return response.data;
  },
};

export default trainerInvitationApi;
