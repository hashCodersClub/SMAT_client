export const assignmentStatuses = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

export const paymentStatuses = ["PENDING", "PARTIALLY_PAID", "PAID"];

export const assignments = [
  {
    id: "ASN-001",

    requirementId: "REQ-002",

    trainerId: "TRN-003",
    trainerName: "Priya Verma",

    vendorId: "VND-002",
    vendorName: "TechEdge Learning",

    title: "Power BI Corporate Training",

    startDate: "2026-08-18",
    endDate: "2026-08-20",

    city: "Gurgaon",
    mode: "Offline",

    trainerRateType: "Per Day",
    trainerRate: 5000,

    vendorRateType: "Per Day",
    vendorRate: 8000,

    totalDays: 3,

    trainerCost: 15000,
    vendorBilling: 24000,
    expectedProfit: 9000,

    status: "UPCOMING",

    trainerPaymentStatus: "PENDING",
    vendorPaymentStatus: "PENDING",

    notes: "",

    createdAt: "2026-07-26",
  },
];
