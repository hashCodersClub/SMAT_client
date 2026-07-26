import api from "./axios";

const vendorInvitationApi = {
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
