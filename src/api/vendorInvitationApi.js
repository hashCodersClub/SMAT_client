import api from "./axios";

const vendorInvitationApi = {
  /*
  |--------------------------------------------------------------------------
  | Send Invitation - Admin
  |--------------------------------------------------------------------------
  |
  | POST /api/vendors/:vendorId/invitations
  |
  | Mirrors trainerInvitationApi.invite(trainerId). By default the backend
  | uses the vendor's primary contact (name + email) for the invitation, but
  | an explicit { name, email } can be passed to override it.
  |--------------------------------------------------------------------------
  */

  invite: async (vendorId, data = {}) => {
    const response = await api.post(`/vendors/${vendorId}/invitations`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Validate Invitation
  |--------------------------------------------------------------------------
  | Public
  |
  | GET /api/vendor-invitations/:token
  |--------------------------------------------------------------------------
  */

  validate: async (token) => {
    const response = await api.get(`/vendor-invitations/${token}`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Accept Invitation
  |--------------------------------------------------------------------------
  | Public
  |
  | POST /api/vendor-invitations/:token/accept
  |--------------------------------------------------------------------------
  */

  accept: async (token, data) => {
    const response = await api.post(
      `/vendor-invitations/${token}/accept`,
      data,
    );

    return response.data;
  },
};

export default vendorInvitationApi;
