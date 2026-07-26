export const outreachStatuses = [
  "NOT_CONTACTED",
  "CONTACTED",
  "INTERESTED",
  "DECLINED",
  "NO_RESPONSE",
  "UNAVAILABLE",
];

export const vendorStatuses = [
  "NOT_SENT",
  "PROFILE_SENT",
  "SHORTLISTED",
  "REJECTED",
  "SELECTED",
];

export const outreachRecords = [
  {
    id: "OUT-001",
    requirementId: "REQ-001",
    trainerId: "TRN-001",

    outreachStatus: "INTERESTED",

    quotedRate: 4500,
    negotiatedRate: 4200,

    vendorStatus: "PROFILE_SENT",

    contactedAt: "2026-07-25T11:30:00",
    respondedAt: "2026-07-25T12:10:00",

    notes: "Trainer is available for all dates.",
  },

  {
    id: "OUT-002",
    requirementId: "REQ-001",
    trainerId: "TRN-002",

    outreachStatus: "NO_RESPONSE",

    quotedRate: 5500,
    negotiatedRate: null,

    vendorStatus: "NOT_SENT",

    contactedAt: "2026-07-25T11:45:00",
    respondedAt: null,

    notes: "",
  },
];
