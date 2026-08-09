import { useState } from "react";
import { FiCalendar, FiLink, FiFileText, FiX, FiCheck } from "react-icons/fi";

const ScheduleDemoModal = ({
  isOpen,
  onClose,
  onSubmit,
  candidate,
  initialData = {},
}) => {
  const [scheduledAt, setScheduledAt] = useState(
    initialData.scheduledAt
      ? new Date(initialData.scheduledAt).toISOString().slice(0, 16)
      : "",
  );
  const [meetingLink, setMeetingLink] = useState(initialData.meetingLink || "");
  const [notes, setNotes] = useState(initialData.notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledAt) {
      setError("Please select a date and time for the demo.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onSubmit({
        scheduledAt,
        meetingLink,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to schedule demo session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Schedule Demo / Technical Session
            </h3>
            {candidate && (
              <p className="text-xs font-medium text-slate-500">
                With {candidate.trainerName || candidate.name || "Trainer"}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
              {error}
            </div>
          )}

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Scheduled Date & Time *
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Meeting Link (Google Meet / Zoom / Teams)
            </label>
            <div className="relative">
              <FiLink className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="url"
                placeholder="https://meet.google.com/xyz-abc-def"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Notes / Agenda
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <textarea
                rows={3}
                placeholder="Topics to discuss, evaluation requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50"
            >
              <FiCheck size={16} />
              {submitting ? "Saving..." : "Confirm Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleDemoModal;
