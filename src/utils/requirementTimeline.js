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

// These two events fire once per matched trainer, every time a generation
// run happens (initial match, re-match on requirement edit, manual retry).
// With N trainers matched, that's 2N near-identical rows — "matched and
// notified" / "notified via WhatsApp, email & in-app" — that all render
// under the same anonymized "Trainer candidate" label pre-response, so they
// read as noise/duplicates rather than N distinct trainers. We collapse each
// batch (same event, fired within the same generation run) into one row.
const BATCHABLE_EVENTS = new Set(["OPPORTUNITY_CREATED", "NOTIFICATION_SENT"]);

// Opportunities created in the same generate() run are written back-to-back
// in a tight loop, so their timestamps land within a few seconds of each
// other. 2 minutes is a generous window that still won't merge two separate
// generation runs (e.g. initial match vs. a later manual retry) into one row.
const BATCH_WINDOW_MS = 2 * 60 * 1000;

const batchTitle = (event, count) => {
  const noun = count === 1 ? "trainer candidate" : "trainer candidates";
  return `${count} ${noun} ${EVENT_LABELS[event]}`;
};

/**
 * Flattens every candidate's auditTrail into one newest-first list shaped
 * for <ActivityTimeline events={...} />. Per-trainer match/notify events
 * from the same generation run are collapsed into a single summary row;
 * everything else (views, responses, demo lifecycle, selection) stays
 * one row per trainer since those are genuinely distinct events.
 *
 * @param {Array} candidates - Opportunities for a requirement, each with a
 *   populated trainerId and an auditTrail array.
 * @returns {{id: string, title: string, description: string, timestamp: string, completed: boolean}[]}
 */
export const buildRequirementTimeline = (candidates = []) => {
  const rawEvents = candidates
    .flatMap((candidate) =>
      (candidate.auditTrail || []).map((entry, index) => ({
        candidateId: candidate._id,
        event: entry.event,
        details: entry.details,
        timestamp: entry.timestamp,
        candidate,
        index,
      })),
    )
    .filter((event) => event.timestamp);

  const batchable = rawEvents.filter((e) => BATCHABLE_EVENTS.has(e.event));
  const individual = rawEvents.filter((e) => !BATCHABLE_EVENTS.has(e.event));

  // Cluster batchable events: same event type, timestamps within
  // BATCH_WINDOW_MS of the running batch's most recent member.
  const batches = [];
  batchable
    .slice()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .forEach((entry) => {
      const openBatch = batches.find(
        (batch) =>
          batch.event === entry.event &&
          Math.abs(new Date(entry.timestamp) - new Date(batch.lastTimestamp)) <=
            BATCH_WINDOW_MS,
      );
      if (openBatch) {
        openBatch.count += 1;
        openBatch.lastTimestamp = entry.timestamp;
      } else {
        batches.push({
          event: entry.event,
          count: 1,
          firstTimestamp: entry.timestamp,
          lastTimestamp: entry.timestamp,
        });
      }
    });

  const batchEvents = batches.map((batch, index) => ({
    id: `batch-${batch.event}-${index}-${batch.firstTimestamp}`,
    title: batchTitle(batch.event, batch.count),
    description:
      batch.event === "NOTIFICATION_SENT" ? "Via IN_APP, EMAIL, WHATSAPP" : "",
    timestamp: batch.lastTimestamp,
    completed: true,
  }));

  const individualEvents = individual.map((entry) => ({
    id: `${entry.candidateId}-${entry.event}-${entry.index}-${entry.timestamp}`,
    title: describeEvent(entry.candidate, entry),
    description: describeDetail(entry),
    timestamp: entry.timestamp,
    completed: true,
  }));

  return [...batchEvents, ...individualEvents].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );
};

export default buildRequirementTimeline;
