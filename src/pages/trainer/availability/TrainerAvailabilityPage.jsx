import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit2,
  FiLoader,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
  FiUser,
  FiBriefcase,
  FiSlash,
} from "react-icons/fi";

import trainerAvailabilityApi from "../../../api/trainerAvailabilityApi";

/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

const EMPTY_FORM = {
  startDate: "",
  endDate: "",
  status: "AVAILABLE",
  reason: "",
  notes: "",
};

const STATUS_OPTIONS = [
  {
    value: "AVAILABLE",
    label: "Available",
    description: "You are available for training assignments.",
    icon: FiCheck,
    color: "emerald",
  },
  {
    value: "BUSY",
    label: "Busy",
    description: "You already have a commitment during this period.",
    icon: FiBriefcase,
    color: "amber",
  },
  {
    value: "UNAVAILABLE",
    label: "Unavailable",
    description: "You are not available for assignments during this period.",
    icon: FiSlash,
    color: "red",
  },
];

/*
|--------------------------------------------------------------------------
| Trainer Availability Page
|--------------------------------------------------------------------------
*/

const TrainerAvailabilityPage = () => {
  const [availability, setAvailability] = useState([]);
  const [overallStatus, setOverallStatus] = useState("AVAILABLE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  const loadAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await trainerAvailabilityApi.getMyAvailability();

      setAvailability(
        Array.isArray(response?.availability) ? response.availability : [],
      );

      setOverallStatus(response?.overallStatus || "AVAILABLE");
    } catch (error) {
      console.error("Failed to load availability:", error);
      setError(error.response?.data?.message || "Unable to load availability.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  /*
  |--------------------------------------------------------------------------
  | Upcoming Records
  |--------------------------------------------------------------------------
  */

  const sortedAvailability = useMemo(() => {
    return [...availability].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }, [availability]);

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEditForm = (record) => {
    setEditingId(record._id);

    setForm({
      startDate: toDateInput(record.startDate),
      endDate: toDateInput(record.endDate),
      status: record.status || "AVAILABLE",
      reason: record.reason || "",
      notes: record.notes || "",
    });

    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  /*
  |--------------------------------------------------------------------------
  | Save Record
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.startDate || !form.endDate) {
      setError("Start date and end date are required.");
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        reason: form.reason.trim(),
        notes: form.notes.trim(),
      };

      let response;

      if (editingId) {
        response = await trainerAvailabilityApi.update(editingId, payload);
      } else {
        response = await trainerAvailabilityApi.create(payload);
      }

      setSuccess(
        response?.message ||
          (editingId
            ? "Availability updated successfully."
            : "Availability added successfully."),
      );

      setFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadAvailability();

      setSuccess(response?.message || "Availability saved successfully.");
    } catch (error) {
      console.error("Failed to save availability:", error);
      setError(error.response?.data?.message || "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Remove this availability record?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await trainerAvailabilityApi.remove(id);

      setAvailability((current) =>
        current.filter((record) => record._id !== id),
      );

      setSuccess(response?.message || "Availability removed successfully.");
    } catch (error) {
      console.error("Failed to remove availability:", error);
      setError(
        error.response?.data?.message || "Unable to remove availability.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Overall Status
  |--------------------------------------------------------------------------
  */

  const handleOverallStatus = async (status) => {
    if (status === overallStatus) return;

    try {
      setStatusSaving(true);
      setError("");
      setSuccess("");

      const response = await trainerAvailabilityApi.updateOverallStatus(status);

      setOverallStatus(response?.overallStatus || status);

      setSuccess(response?.message || "Overall availability updated.");
    } catch (error) {
      console.error("Failed to update overall availability:", error);
      setError(
        error.response?.data?.message ||
          "Unable to update overall availability.",
      );
    } finally {
      setStatusSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-56 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Availability
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep your availability updated so Nxthack can match you with
            suitable training requirements.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FiPlus className="h-4 w-4" />
          Add Availability
        </button>
      </div>

      {/* Messages */}
      {error && (
        <Message type="error" icon={FiAlertCircle}>
          {error}
        </Message>
      )}
      {success && (
        <Message type="success" icon={FiCheck}>
          {success}
        </Message>
      )}

      {/* Overall Status */}
      <section className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm transition hover:shadow-md">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Overall Availability
          </h2>
          <p className="text-sm text-slate-500">
            Set your general availability for new training opportunities.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-3">
          {STATUS_OPTIONS.map((option) => {
            const selected = overallStatus === option.value;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                disabled={statusSaving}
                onClick={() => handleOverallStatus(option.value)}
                className={`group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200 ${
                  selected
                    ? "border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-lg p-1.5 ${
                        selected
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`font-semibold ${
                        selected ? "text-indigo-700" : "text-slate-800"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                  {selected && <FiCheck className="h-4 w-4 text-indigo-600" />}
                </div>
                <p className="text-xs leading-5 text-slate-500">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Availability Schedule */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm transition hover:shadow-md">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Availability Schedule
          </h2>
          <p className="text-sm text-slate-500">
            Add date ranges when you are available, busy, or unavailable.
          </p>
        </div>

        {sortedAvailability.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiCalendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No availability schedule yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Add date-specific availability to help Nxthack determine whether
              you are free for upcoming training requirements.
            </p>
            <button
              type="button"
              onClick={openCreateForm}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <FiPlus className="h-4 w-4" />
              Add Availability
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedAvailability.map((record) => (
              <AvailabilityRow
                key={record._id}
                record={record}
                deleting={deletingId === record._id}
                onEdit={() => openEditForm(record)}
                onDelete={() => handleDelete(record._id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {formOpen && (
        <AvailabilityModal
          form={form}
          editing={Boolean(editingId)}
          saving={saving}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Availability Row
|--------------------------------------------------------------------------
*/

const AvailabilityRow = ({ record, deleting, onEdit, onDelete }) => {
  return (
    <div className="flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/50 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
          <FiCalendar className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-800">
              {formatDate(record.startDate)}
              <span className="mx-1.5 text-slate-300">—</span>
              {formatDate(record.endDate)}
            </p>
            <StatusBadge status={record.status} />
          </div>
          {record.reason && (
            <p className="mt-1 text-sm font-medium text-slate-600">
              {record.reason}
            </p>
          )}
          {record.notes && (
            <p className="mt-0.5 text-sm text-slate-500">{record.notes}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <FiEdit2 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? (
            <FiLoader className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FiTrash2 className="h-3.5 w-3.5" />
          )}
          Remove
        </button>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Modal
|--------------------------------------------------------------------------
*/

const AvailabilityModal = ({
  form,
  editing,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {editing ? "Edit Availability" : "Add Availability"}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Define your availability for a specific date range.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Start Date" required>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </Field>
            <Field label="End Date" required>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={onChange}
                min={form.startDate || undefined}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </Field>
          </div>

          <Field label="Status" required>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </Field>

          <Field label="Reason" optional>
            <input
              name="reason"
              value={form.reason}
              onChange={onChange}
              placeholder="e.g. Available for online training"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>

          <Field label="Notes" optional>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              rows={4}
              placeholder="Add any additional availability information..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              {saving
                ? "Saving..."
                : editing
                  ? "Update Availability"
                  : "Add Availability"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Field
|--------------------------------------------------------------------------
*/

const Field = ({ label, optional, required, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
      {optional && (
        <span className="ml-1 font-normal text-slate-400">(optional)</span>
      )}
    </label>
    {children}
  </div>
);

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

const StatusBadge = ({ status }) => {
  const styles = {
    AVAILABLE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    BUSY: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    UNAVAILABLE: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatEnum(status)}
    </span>
  );
};

/*
|--------------------------------------------------------------------------
| Message
|--------------------------------------------------------------------------
*/

const Message = ({ type, icon: Icon, children }) => {
  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${styles}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatEnum = (value) => {
  if (!value) return "—";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default TrainerAvailabilityPage;
