import { useCallback, useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiMail,
  FiMapPin,
  FiPlay,
  FiRefreshCw,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import assignmentsApi from "../../../api/assignmentsApi";
import AssignmentFeedbackCard from "../../../components/admin/assignments/AssignmentFeedbackCard";

const statusStyles = {
  PROPOSED: "bg-violet-50 text-violet-700 border-violet-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  ACTIVE: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRateType = (value) => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

const AssignmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Assignment
  |--------------------------------------------------------------------------
  */

  const loadAssignment = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await assignmentsApi.getById(id);

      const data = response?.data || response?.assignment || response;

      setAssignment(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  /*
  |--------------------------------------------------------------------------
  | Status Change
  |--------------------------------------------------------------------------
  */

  const changeStatus = async (status, extraData = {}) => {
    if (updating) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await assignmentsApi.updateStatus(id, {
        status,
        ...extraData,
      });

      const updatedAssignment =
        response?.data || response?.assignment || response;

      setAssignment(updatedAssignment);

      const messages = {
        CONFIRMED: "Assignment confirmed successfully.",
        ACTIVE: "Assignment started successfully.",
        COMPLETED: "Assignment completed successfully.",
        CANCELLED: "Assignment cancelled successfully.",
      };

      setSuccess(messages[status] || "Assignment updated successfully.");

      if (status === "CANCELLED") {
        setShowCancelModal(false);
        setCancellationReason("");
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel
  |--------------------------------------------------------------------------
  */

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      setError("Cancellation reason is required.");
      return;
    }

    await changeStatus("CANCELLED", {
      cancellationReason: cancellationReason.trim(),
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">Loading assignment...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Not Found / Error
  |--------------------------------------------------------------------------
  */

  if (!assignment) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <button
          type="button"
          onClick={() => navigate("/admin/assignments")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <FiArrowLeft />
          Back to Assignments
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <FiAlertCircle className="mx-auto text-3xl text-red-500" />

          <p className="mt-3 font-semibold text-red-700">
            Unable to load assignment
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error || "Assignment not found."}
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Related Objects
  |--------------------------------------------------------------------------
  */

  const requirement =
    assignment.requirementId && typeof assignment.requirementId === "object"
      ? assignment.requirementId
      : {};

  const trainer =
    assignment.trainerId && typeof assignment.trainerId === "object"
      ? assignment.trainerId
      : {};

  const vendor =
    assignment.vendorId && typeof assignment.vendorId === "object"
      ? assignment.vendorId
      : {};

  const createdBy =
    assignment.createdBy && typeof assignment.createdBy === "object"
      ? assignment.createdBy
      : {};

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */

  const canCancel = ["PROPOSED", "CONFIRMED", "ACTIVE"].includes(
    assignment.status,
  );

  return (
    <>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =============================================================
            BACK
        ============================================================= */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => navigate("/admin/assignments")}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <FiArrowLeft />
            Back to Assignments
          </button>

          <button
            type="button"
            onClick={loadAssignment}
            disabled={loading || updating}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {/* =============================================================
            HEADER
        ============================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Assignment
              </p>

              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                {requirement.title || "Training Assignment"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Assignment ID: {assignment._id}
              </p>
            </div>

            <span
              className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${
                statusStyles[assignment.status] ||
                "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              {assignment.status}
            </span>
          </div>

          {/* ===========================================================
              LIFECYCLE ACTIONS
          =========================================================== */}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            {assignment.status === "PROPOSED" && (
              <ActionButton
                icon={FiCheckCircle}
                disabled={updating}
                onClick={() => changeStatus("CONFIRMED")}
              >
                {updating ? "Updating..." : "Confirm Assignment"}
              </ActionButton>
            )}

            {assignment.status === "CONFIRMED" && (
              <ActionButton
                icon={FiPlay}
                disabled={updating}
                onClick={() => changeStatus("ACTIVE")}
              >
                {updating ? "Updating..." : "Start Assignment"}
              </ActionButton>
            )}

            {assignment.status === "ACTIVE" && (
              <ActionButton
                icon={FiCheckCircle}
                disabled={updating}
                onClick={() => changeStatus("COMPLETED")}
              >
                {updating ? "Updating..." : "Complete Assignment"}
              </ActionButton>
            )}

            {canCancel && (
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setError("");
                  setShowCancelModal(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiXCircle />
                Cancel Assignment
              </button>
            )}
          </div>
        </div>

        {/* =============================================================
            MESSAGES
        ============================================================= */}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" />

            <p className="text-sm font-medium text-emerald-700">{success}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <FiAlertCircle className="mt-0.5 shrink-0 text-red-500" />

            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* =============================================================
            MAIN INFORMATION
        ============================================================= */}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Requirement */}

            <Card title="Requirement">
              <Detail
                icon={FiBriefcase}
                label="Requirement"
                value={requirement.title}
              />

              <Detail
                icon={FiMapPin}
                label="Delivery"
                value={[requirement.city, requirement.state, requirement.mode]
                  .filter(Boolean)
                  .join(" • ")}
              />

              <Detail
                icon={FiCalendar}
                label="Requirement Start"
                value={formatDate(requirement.startDate)}
              />

              <Detail
                icon={FiCalendar}
                label="Requirement End"
                value={formatDate(requirement.endDate)}
              />
            </Card>

            {/* Trainer */}

            <Card title="Trainer">
              <Detail icon={FiUser} label="Trainer Name" value={trainer.name} />

              <Detail icon={FiMail} label="Email" value={trainer.email} />

              <Detail
                icon={FiMapPin}
                label="Location"
                value={[trainer.city, trainer.state, trainer.country]
                  .filter(Boolean)
                  .join(", ")}
              />

              <Detail
                icon={FiBriefcase}
                label="Experience"
                value={
                  trainer.experience !== undefined &&
                  trainer.experience !== null
                    ? `${trainer.experience} years`
                    : "—"
                }
              />
            </Card>

            {/* Vendor */}

            <Card title="Vendor">
              <Detail
                icon={FiBriefcase}
                label="Company"
                value={vendor.companyName}
              />

              <Detail
                icon={FiMapPin}
                label="Location"
                value={[vendor.city, vendor.state, vendor.country]
                  .filter(Boolean)
                  .join(", ")}
              />
            </Card>

            {/* Schedule */}

            <Card title="Assignment Schedule">
              <Detail
                icon={FiCalendar}
                label="Start Date"
                value={formatDate(assignment.startDate)}
              />

              <Detail
                icon={FiCalendar}
                label="End Date"
                value={formatDate(assignment.endDate)}
              />

              <Detail
                icon={FiClock}
                label="Start Time"
                value={assignment.startTime}
              />

              <Detail
                icon={FiClock}
                label="End Time"
                value={assignment.endTime}
              />
            </Card>

            {/* Notes */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Internal Notes</h2>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {assignment.notes || "No notes added."}
              </p>
            </section>

            {/* Feedback */}

            <AssignmentFeedbackCard
              assignment={assignment}
              onSubmitted={(updatedAssignment) => {
                setAssignment(updatedAssignment);
                setSuccess("Feedback submitted successfully.");
                setError("");
              }}
            />

            {/* Cancellation */}

            {assignment.status === "CANCELLED" && (
              <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-2">
                  <FiXCircle className="text-red-600" />

                  <h2 className="font-bold text-red-800">Cancellation</h2>
                </div>

                <p className="mt-4 text-sm text-red-700">
                  {assignment.cancellationReason ||
                    "No cancellation reason recorded."}
                </p>

                <p className="mt-3 text-xs text-red-500">
                  Cancelled {formatDateTime(assignment.cancelledAt)}
                </p>
              </section>
            )}
          </div>

          {/* ===========================================================
              SIDEBAR
          =========================================================== */}

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <FiDollarSign className="text-blue-600" />

                <h2 className="font-bold text-slate-900">Commercial</h2>
              </div>

              <div className="mt-5 space-y-4">
                <SummaryRow
                  label="Trainer Rate"
                  value={`₹${Number(assignment.trainerRate || 0).toLocaleString(
                    "en-IN",
                  )}`}
                />

                <SummaryRow
                  label="Rate Type"
                  value={formatRateType(assignment.rateType)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-900">Activity</h2>

              <div className="mt-5 space-y-5">
                <Activity
                  label="Created"
                  value={formatDateTime(assignment.createdAt)}
                  person={createdBy.name}
                />

                {assignment.confirmedAt && (
                  <Activity
                    label="Confirmed"
                    value={formatDateTime(assignment.confirmedAt)}
                    person={assignment.confirmedBy?.name}
                  />
                )}

                {assignment.activatedAt && (
                  <Activity
                    label="Started"
                    value={formatDateTime(assignment.activatedAt)}
                    person={assignment.activatedBy?.name}
                  />
                )}

                {assignment.completedAt && (
                  <Activity
                    label="Completed"
                    value={formatDateTime(assignment.completedAt)}
                    person={assignment.completedBy?.name}
                  />
                )}

                {assignment.cancelledAt && (
                  <Activity
                    label="Cancelled"
                    value={formatDateTime(assignment.cancelledAt)}
                    person={assignment.cancelledBy?.name}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ===============================================================
          CANCEL MODAL
      ================================================================ */}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <FiXCircle />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Cancel Assignment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record why this assignment is being cancelled.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Cancellation Reason
              </label>

              <textarea
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                rows={4}
                maxLength={1000}
                autoFocus
                placeholder="Enter cancellation reason..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Keep Assignment
              </button>

              <button
                type="button"
                disabled={updating || !cancellationReason.trim()}
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FiXCircle />

                {updating ? "Cancelling..." : "Cancel Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ActionButton = ({ icon: Icon, children, ...props }) => (
  <button
    type="button"
    {...props}
    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
  >
    <Icon />
    {children}
  </button>
);

const Card = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="font-bold text-slate-900">{title}</h2>

    <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
  </section>
);

const Detail = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      <Icon />
      {label}
    </div>

    <p className="mt-2 text-sm font-semibold text-slate-700">{value || "—"}</p>
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-slate-500">{label}</span>

    <span className="text-sm font-bold text-slate-800">{value}</span>
  </div>
);

const Activity = ({ label, value, person }) => (
  <div className="relative border-l-2 border-slate-100 pl-4">
    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-500" />

    <p className="text-sm font-semibold text-slate-700">{label}</p>

    <p className="mt-1 text-xs text-slate-500">{value}</p>

    {person && <p className="mt-1 text-xs text-slate-400">by {person}</p>}
  </div>
);

export default AssignmentDetailsPage;
