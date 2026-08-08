import {
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiPlusCircle,
  FiSend,
  FiStar,
  FiVideo,
  FiXCircle,
} from "react-icons/fi";

const EVENT_CONFIG = {
  OPPORTUNITY_CREATED: {
    label: "Opportunity Created",
    icon: FiPlusCircle,
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  NOTIFICATION_SENT: {
    label: "Notification Sent to Trainer",
    icon: FiSend,
    color: "bg-indigo-100 text-indigo-600 border-indigo-200",
  },
  OPPORTUNITY_VIEWED: {
    label: "Opportunity Viewed by Trainer",
    icon: FiEye,
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
  TRAINER_RESPONDED: {
    label: "Trainer Responded",
    icon: FiCheckCircle,
    color: "bg-emerald-100 text-emerald-600 border-emerald-200",
  },
  RESPONSE_UPDATED: {
    label: "Trainer Updated Response",
    icon: FiClock,
    color: "bg-teal-100 text-teal-600 border-teal-200",
  },
  TRAINER_SHORTLISTED: {
    label: "Trainer Shortlisted by Operations",
    icon: FiStar,
    color: "bg-amber-100 text-amber-600 border-amber-200",
  },
  TRAINER_SELECTED: {
    label: "Trainer Selected for Requirement",
    icon: FiCheck,
    color: "bg-green-100 text-green-600 border-green-200",
  },
  DEMO_REQUESTED: {
    label: "Demo Requested by Vendor",
    icon: FiVideo,
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
  DEMO_SCHEDULED: {
    label: "Demo Scheduled",
    icon: FiCalendar,
    color: "bg-violet-100 text-violet-600 border-violet-200",
  },
  DEMO_COMPLETED: {
    label: "Demo Completed",
    icon: FiCheckCircle,
    color: "bg-teal-100 text-teal-600 border-teal-200",
  },
  DEMO_NO_SHOW: {
    label: "Demo Marked as No-Show",
    icon: FiAlertTriangle,
    color: "bg-orange-100 text-orange-600 border-orange-200",
  },
  DEMO_CANCELLED: {
    label: "Demo Cancelled by Vendor",
    icon: FiXCircle,
    color: "bg-red-100 text-red-600 border-red-200",
  },
  DEMO_ACCEPTED_BY_TRAINER: {
    label: "Demo Accepted by Trainer",
    icon: FiCheck,
    color: "bg-emerald-100 text-emerald-600 border-emerald-200",
  },
  DEMO_RESCHEDULE_REQUESTED: {
    label: "Trainer Requested Reschedule",
    icon: FiClock,
    color: "bg-amber-100 text-amber-600 border-amber-200",
  },
  DEMO_DECLINED_BY_TRAINER: {
    label: "Demo Declined by Trainer",
    icon: FiXCircle,
    color: "bg-red-100 text-red-600 border-red-200",
  },
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OpportunityAuditTrail = ({ auditTrail = [] }) => {
  if (!auditTrail || auditTrail.length === 0) {
    return (
      <div className="py-4 text-center text-xs font-medium text-slate-400">
        No audit history recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
        Audit Trail & Activity Log
      </h4>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {auditTrail.map((item, index) => {
          const config = EVENT_CONFIG[item.event] || {
            label: item.event,
            icon: FiClock,
            color: "bg-slate-100 text-slate-600 border-slate-200",
          };

          const IconComponent = config.icon;

          return (
            <div
              key={index}
              className="relative flex items-start gap-3 text-xs"
            >
              <div
                className={`absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full border shadow-xs ${config.color}`}
              >
                <IconComponent size={10} />
              </div>

              <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800">
                    {config.label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(item.timestamp)}
                  </span>
                </div>

                {item.actorRole && (
                  <span className="mt-0.5 inline-block text-[10px] font-semibold text-slate-500">
                    By: {item.actorRole}
                  </span>
                )}

                {item.details && (
                  <div className="mt-1 text-[11px] font-medium text-slate-600">
                    {item.details.status && (
                      <span className="mr-2">
                        Status: <strong>{item.details.status}</strong>
                      </span>
                    )}
                    {item.details.quotedRate > 0 && (
                      <span>
                        Rate:{" "}
                        <strong>
                          ₹{item.details.quotedRate.toLocaleString("en-IN")}/day
                        </strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OpportunityAuditTrail;
