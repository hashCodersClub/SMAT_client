/** Unified status labels, colors, and pipeline definitions */

export const formatStatusLabel = (status = "") =>
  status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const REQUIREMENT_STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-200",
  OPEN: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  SOURCING: "bg-amber-50 text-amber-700 ring-amber-200",
  PROFILES_SENT: "bg-purple-50 text-purple-700 ring-purple-200",
  SHORTLISTED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IN_PROGRESS: "bg-orange-50 text-orange-700 ring-orange-200",
  COMPLETED: "bg-green-50 text-green-700 ring-green-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

export const ASSIGNMENT_STATUS_STYLES = {
  PROPOSED: "bg-violet-50 text-violet-700 ring-violet-200",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-200",
  ACTIVE: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
};

/** Opportunity pipeline: Requirement -> Opportunity -> Demo -> Assignment */
export const OPPORTUNITY_STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  CREATED: "bg-slate-100 text-slate-700 ring-slate-200",
  PENDING_RESPONSE: "bg-blue-50 text-blue-700 ring-blue-200",
  NOTIFIED: "bg-blue-50 text-blue-700 ring-blue-200",
  VIEWED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  INTERESTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MAYBE: "bg-amber-50 text-amber-700 ring-amber-200",
  DECLINED: "bg-red-50 text-red-700 ring-red-200",
  EXPIRED: "bg-slate-100 text-slate-500 ring-slate-200",
  WITHDRAWN: "bg-slate-100 text-slate-500 ring-slate-200",
  SHORTLISTED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  DEMO_REQUESTED: "bg-purple-50 text-purple-700 ring-purple-200",
  DEMO_SCHEDULED: "bg-violet-50 text-violet-700 ring-violet-200",
  DEMO_COMPLETED: "bg-teal-50 text-teal-700 ring-teal-200",
  SELECTED: "bg-green-50 text-green-700 ring-green-200",
  NOT_SELECTED: "bg-red-50 text-red-700 ring-red-200",
};

/** DemoSession lifecycle */
export const DEMO_SESSION_STATUS_STYLES = {
  REQUESTED: "bg-purple-50 text-purple-700 ring-purple-200",
  SCHEDULED: "bg-violet-50 text-violet-700 ring-violet-200",
  COMPLETED: "bg-teal-50 text-teal-700 ring-teal-200",
  CANCELLED: "bg-red-50 text-red-700 ring-red-200",
  NO_SHOW: "bg-orange-50 text-orange-700 ring-orange-200",
};

export const PRIORITY_STYLES = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-50 text-blue-700",
  HIGH: "bg-orange-50 text-orange-700",
  URGENT: "bg-red-50 text-red-700",
};

/** CRM-style requirement pipeline stages */
export const REQUIREMENT_PIPELINE = [
  { key: "SUBMITTED", label: "New", description: "Awaiting review" },
  { key: "OPEN", label: "Qualified", description: "Ready for sourcing" },
  {
    key: "SOURCING",
    label: "Searching Trainers",
    description: "Active outreach",
  },
  {
    key: "PROFILES_SENT",
    label: "Trainer Shortlisted",
    description: "Profiles with vendor",
  },
  {
    key: "SHORTLISTED",
    label: "Vendor Discussion",
    description: "Vendor reviewing",
  },
  { key: "CONFIRMED", label: "Confirmed", description: "Trainer confirmed" },
  {
    key: "IN_PROGRESS",
    label: "Assignment Created",
    description: "Delivery in progress",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    description: "Successfully delivered",
  },
];

export const getNextAction = (status) => {
  const actions = {
    SUBMITTED: "Review and qualify requirement",
    OPEN: "Find matching trainers",
    SOURCING: "Follow up on outreach responses",
    PROFILES_SENT: "Await vendor feedback on profiles",
    SHORTLISTED: "Confirm trainer with vendor",
    CONFIRMED: "Create assignment",
    IN_PROGRESS: "Monitor delivery progress",
    COMPLETED: "Archive and collect feedback",
    CANCELLED: "No action required",
    DRAFT: "Complete and submit requirement",
  };
  return actions[status] || "Review requirement status";
};
