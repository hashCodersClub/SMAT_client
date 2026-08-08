/*
|--------------------------------------------------------------------------
| Requirement Timeline Builder
|--------------------------------------------------------------------------
|
| Requirement details pages (admin + vendor) both want to show "what has
| happened on this requirement" as a single chronological feed — matched
| trainers being notified, trainers accepting/declining, demos being
| requested/scheduled/completed, and final selection.
|
| That data already exists, just split across every Opportunity created
| for the requirement (each carries its own `auditTrail`). This flattens
| all of those into one sorted list the <ActivityTimeline /> component can
| render directly, newest first.
|
| Works from whatever shape the two list endpoints return:
| - opportunitiesApi.getByRequirementAdmin(id)  -> { candidates }
| - opportunitiesApi.getByRequirementVendor(id) -> { candidates }
|
| Each candidate is a populated Opportunity with `trainerId` populated to
| at least `{ name }` and an `auditTrail` array of
| `{ event, actorRole, timestamp, details }`.
|--------------------------------------------------------------------------
*/

const EVENT_LABELS = {
  OPPORTUNITY_CREATED: "matched and notified",
  NOTIFICATION_SENT: "notified via WhatsApp, email & in-app",
  OPPORTUNITY_VIEWED: "viewed the opportunity",
  TRAINER_RESPONDED: "responded to the opportunity",
  RESPONSE_UPDATED: "updated their response",
  TRAINER_SHORTLISTED: "was shortlisted",
  TRAINER_SELECTED: "was selected for this requirement",
  DEMO_REQUESTED: "had a demo requested",
  DEMO_SCHEDULED: "had a demo scheduled",
  DEMO_COMPLETED: "completed a demo",
  DEMO_NO_SHOW: "did not show up for the demo",
  DEMO_CANCELLED: "had their demo cancelled",
  DEMO_ACCEPTED_BY_TRAINER: "accepted the demo",
  DEMO_RESCHEDULE_REQUESTED: "requested to reschedule the demo",
  DEMO_DECLINED_BY_TRAINER: "declined the demo",
};

const RESPONSE_STATUS_LABEL = {
  INTERESTED: "accepted",
  DECLINED: "rejected",
  MAYBE: "responded \u201cmaybe\u201d to",
};

const trainerName = (candidate) =>
  candidate?.trainerId?.name || candidate?.trainerName || "A trainer";

const describeEvent = (candidate, entry) => {
  const name = trainerName(candidate);

  if (
    (entry.event === "TRAINER_RESPONDED" ||
      entry.event === "RESPONSE_UPDATED") &&
    entry.details?.status &&
    RESPONSE_STATUS_LABEL[entry.details.status]
  ) {
    return `${name} ${RESPONSE_STATUS_LABEL[entry.details.status]} the requirement`;
  }

  const verb =
    EVENT_LABELS[entry.event] ||
    entry.event?.toLowerCase().replaceAll("_", " ") ||
    "had an update";

  return `${name} ${verb}`;
};

const describeDetail = (entry) => {
  const details = entry.details || {};

  if (details.note) return `“${details.note}”`;
  if (details.trainerResponseNote) return `“${details.trainerResponseNote}”`;
  if (details.scheduledAt)
    return `Scheduled for ${new Date(details.scheduledAt).toLocaleString("en-IN")}`;
  if (details.quotedRate)
    return `Quoted rate: ₹${Number(details.quotedRate).toLocaleString("en-IN")}/day`;
  if (Array.isArray(details.channels) && details.channels.length) {
    return `Via ${details.channels.join(", ")}`;
  }
  return "";
};

/**
 * Flattens every candidate's auditTrail into one newest-first list shaped
 * for <ActivityTimeline events={...} />.
 *
 * @param {Array} candidates - Opportunities for a requirement, each with a
 *   populated trainerId and an auditTrail array.
 * @returns {{id: string, title: string, description: string, timestamp: string, completed: boolean}[]}
 */
export const buildRequirementTimeline = (candidates = []) => {
  const events = candidates.flatMap((candidate) =>
    (candidate.auditTrail || []).map((entry, index) => ({
      id: `${candidate._id}-${entry.event}-${index}-${entry.timestamp}`,
      title: describeEvent(candidate, entry),
      description: describeDetail(entry),
      timestamp: entry.timestamp,
      completed: true,
    })),
  );

  return events
    .filter((event) => event.timestamp)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export default buildRequirementTimeline;
