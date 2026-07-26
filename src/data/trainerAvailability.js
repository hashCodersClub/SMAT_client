export const trainerAvailability = [
  {
    id: "AVL-001",
    trainerId: "TRN-001",
    startDate: "2026-08-10",
    endDate: "2026-08-15",
    type: "BOOKED",
    assignmentId: "ASN-001",
    title: "Python Corporate Training",
    notes: "",
  },

  {
    id: "AVL-002",
    trainerId: "TRN-001",
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    type: "UNAVAILABLE",
    assignmentId: null,
    title: "Personal Unavailability",
    notes: "",
  },

  {
    id: "AVL-003",
    trainerId: "TRN-002",
    startDate: "2026-08-18",
    endDate: "2026-08-20",
    type: "BOOKED",
    assignmentId: "ASN-002",
    title: "Data Analytics Training",
    notes: "",
  },
];

export const availabilityTypes = ["BOOKED", "UNAVAILABLE"];
