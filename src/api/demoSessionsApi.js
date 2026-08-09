import api from "./axios";

const demoSessionsApi = {
  /*
  |--------------------------------------------------------------------------
  | Vendor / Admin Endpoints
  |--------------------------------------------------------------------------
  */

  // Vendor shortlists a trainer's opportunity and requests a demo /
  // technical evaluation call. sessionType is "DEMO" (default) or
  // "TECHNICAL".
  requestDemo: async ({ opportunityId, sessionType, notes }) => {
    const response = await api.post("/demo-sessions/request", {
      opportunityId,
      sessionType,
      notes,
    });
    return response.data;
  },

  // Vendor sets the date/time and meeting details for a requested demo.
  scheduleDemo: async (
    demoSessionId,
    { scheduledAt, duration, meetingMode, meetingLink, notes },
  ) => {
    const response = await api.post(
      `/demo-sessions/${demoSessionId}/schedule`,
      {
        scheduledAt,
        duration,
        meetingMode,
        meetingLink,
        notes,
      },
    );
    return response.data;
  },

  // Vendor marks a scheduled demo as done (or as a no-show).
  completeDemo: async (
    demoSessionId,
    { vendorFeedback, notes, trainerNoShow } = {},
  ) => {
    const response = await api.post(
      `/demo-sessions/${demoSessionId}/complete`,
      {
        vendorFeedback,
        notes,
        trainerNoShow,
      },
    );
    return response.data;
  },

  // Vendor cancels a requested/scheduled demo.
  cancelDemo: async (demoSessionId, { notes } = {}) => {
    const response = await api.post(`/demo-sessions/${demoSessionId}/cancel`, {
      notes,
    });
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get("/demo-sessions", { params });
    return response.data;
  },

  getById: async (demoSessionId) => {
    const response = await api.get(`/demo-sessions/${demoSessionId}`);
    return response.data;
  },

  getByOpportunity: async (opportunityId) => {
    const response = await api.get(
      `/demo-sessions/opportunity/${opportunityId}`,
    );
    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Trainer Portal Endpoints
  |--------------------------------------------------------------------------
  */

  getMine: async (params = {}) => {
    const response = await api.get("/demo-sessions/mine", { params });
    return response.data;
  },

  getMineById: async (demoSessionId) => {
    const response = await api.get(`/demo-sessions/mine/${demoSessionId}`);
    return response.data;
  },

  acceptDemo: async (demoSessionId, { note } = {}) => {
    const response = await api.post(
      `/demo-sessions/mine/${demoSessionId}/accept`,
      { note },
    );
    return response.data;
  },

  rescheduleDemo: async (demoSessionId, { proposedAt, note } = {}) => {
    const response = await api.post(
      `/demo-sessions/mine/${demoSessionId}/reschedule`,
      {
        proposedAt,
        note,
      },
    );
    return response.data;
  },

  declineDemo: async (demoSessionId, { note } = {}) => {
    const response = await api.post(
      `/demo-sessions/mine/${demoSessionId}/decline`,
      { note },
    );
    return response.data;
  },
};

export default demoSessionsApi;
