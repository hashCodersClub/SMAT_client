import { useState } from "react";
import { FiAlertCircle, FiLoader, FiStar } from "react-icons/fi";

import assignmentsApi from "../../../api/assignmentsApi";

/* ==========================================================================
   ASSIGNMENT FEEDBACK CARD
============================================================================ */

const AssignmentFeedbackCard = ({ assignment, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const existingFeedback = assignment.feedback?.rating
    ? assignment.feedback
    : null;

  /*
  |--------------------------------------------------------------------------
  | Handle Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rating) {
      setError("Please select a rating before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await assignmentsApi.submitFeedback(assignment._id, {
        rating,
        comments: comments.trim(),
      });

      const updatedAssignment =
        response?.data || response?.assignment || response;

      onSubmitted?.(updatedAssignment);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to submit feedback right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Not Yet Completed
  |--------------------------------------------------------------------------
  */

  if (assignment.status !== "COMPLETED") {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Already Submitted
  |--------------------------------------------------------------------------
  */

  if (existingFeedback) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Trainer Feedback</h2>

        <div className="mt-4 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <FiStar
              key={value}
              size={18}
              className={
                value <= existingFeedback.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200"
              }
            />
          ))}

          <span className="ml-2 text-sm font-bold text-slate-700">
            {existingFeedback.rating}/5
          </span>
        </div>

        {existingFeedback.comments && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {existingFeedback.comments}
          </p>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Recorded — this has already been rolled into the trainer's overall
          rating.
        </p>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Feedback Form
  |--------------------------------------------------------------------------
  */

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-bold text-slate-900">Trainer Feedback</h2>

      <p className="mt-1 text-sm text-slate-500">
        Rate how this training went. This updates the trainer's overall rating
        and training stats.
      </p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= (hoverRating || rating);

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
                aria-label={`Rate ${value} out of 5`}
              >
                <FiStar
                  size={24}
                  className={
                    active ? "fill-amber-400 text-amber-400" : "text-slate-200"
                  }
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Optional comments about the trainer's delivery..."
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
        />

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <FiLoader className="animate-spin" />}
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </section>
  );
};

export default AssignmentFeedbackCard;
