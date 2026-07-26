export const requirements = [
  {
    id: "REQ-001",

    title: "Python + Data Analytics Trainer",
    vendorId: "VND-001",
    vendorName: "ABC Training Solutions",

    skills: ["Python", "Data Analytics", "SQL", "Power BI"],

    trainingType: "College",
    mode: "Offline",

    city: "Noida",
    state: "Uttar Pradesh",
    venue: "ABC Institute of Technology",

    startDate: "2026-08-10",
    endDate: "2026-08-15",

    startTime: "09:00",
    endTime: "16:00",

    numberOfTrainers: 1,
    batchSize: 60,

    budgetType: "Per Day",
    budget: 5000,

    experienceRequired: 3,

    status: "OPEN",
    priority: "HIGH",

    source: "WhatsApp",

    description:
      "Need an experienced Python and Data Analytics trainer for college students. Trainer should have hands-on project experience.",

    notes: "Vendor prefers trainer from Delhi NCR.",

    createdAt: "2026-07-25",
  },

  {
    id: "REQ-002",

    title: "Power BI Corporate Trainer",
    vendorId: "VND-002",
    vendorName: "TechEdge Learning",

    skills: ["Power BI", "Excel", "SQL"],

    trainingType: "Corporate",
    mode: "Offline",

    city: "Gurgaon",
    state: "Haryana",
    venue: "Client Office",

    startDate: "2026-08-18",
    endDate: "2026-08-20",

    startTime: "10:00",
    endTime: "17:00",

    numberOfTrainers: 1,
    batchSize: 25,

    budgetType: "Per Day",
    budget: 8000,

    experienceRequired: 5,

    status: "SOURCING",
    priority: "MEDIUM",

    source: "WhatsApp",

    description:
      "Power BI trainer required for an intermediate corporate training program.",

    notes: "",

    createdAt: "2026-07-24",
  },

  {
    id: "REQ-003",

    title: "Java Full Stack Trainer",
    vendorId: "VND-003",
    vendorName: "SkillBridge India",

    skills: ["Java", "Spring Boot", "React", "SQL"],

    trainingType: "College",
    mode: "Offline",

    city: "Delhi",
    state: "Delhi",
    venue: "Engineering College",

    startDate: "2026-08-05",
    endDate: "2026-08-12",

    startTime: "09:30",
    endTime: "16:30",

    numberOfTrainers: 2,
    batchSize: 100,

    budgetType: "Per Day",
    budget: 6500,

    experienceRequired: 4,

    status: "PROFILES_SENT",
    priority: "HIGH",

    source: "Referral",

    description:
      "Two Java Full Stack trainers required for placement-oriented college training.",

    notes: "",

    createdAt: "2026-07-22",
  },
];

export const requirementStatuses = [
  "OPEN",
  "SOURCING",
  "PROFILES_SENT",
  "SHORTLISTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];
