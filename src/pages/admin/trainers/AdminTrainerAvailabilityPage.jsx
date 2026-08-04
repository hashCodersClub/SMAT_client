import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useNavigate, useParams } from "react-router-dom";

import trainersApi from "../../../api/trainersApi";
import trainerAvailabilityApi from "../../../api/trainerAvailabilityApi";

import { mapTrainerFromApi } from "../../../utils/trainerAdapter";

const EMPTY_FORM = {
  startDate: "",
  endDate: "",
  status: "UNAVAILABLE",
  reason: "",
  notes: "",
};

const TrainerAvailabilityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [trainer, setTrainer] = useState(null);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  /*
  |--------------------------------------------------------------------------
  | Load Trainer + Availability
  |--------------------------------------------------------------------------
  */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [trainerResponse, availabilityResponse] = await Promise.all([
        trainersApi.getById(id),

        trainerAvailabilityApi.getTrainerAvailability(id),
      ]);

      setTrainer(mapTrainerFromApi(trainerResponse?.trainer || {}));

      setRecords(
        Array.isArray(availabilityResponse?.availability)
          ? availabilityResponse.availability
          : [],
      );
    } catch (err) {
      console.error("Failed to load trainer availability:", err);

      setError(
        err.response?.data?.message || "Unable to load trainer availability.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Sorted Records
  |--------------------------------------------------------------------------
  */

  const sortedRecords = useMemo(() => {
    return [...records].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }, [records]);

  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    return {
      total: records.length,

      available: records.filter((record) => record.status === "AVAILABLE")
        .length,

      busy: records.filter((record) => record.status === "BUSY").length,

      unavailable: records.filter((record) => record.status === "UNAVAILABLE")
        .length,
    };
  }, [records]);

  /*
  |--------------------------------------------------------------------------
  | Form Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | Add
  |--------------------------------------------------------------------------
  */

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);

    setError("");
    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | Edit
  |--------------------------------------------------------------------------
  */

  const openEditForm = (record) => {
    setEditingId(record._id);

    setForm({
      startDate: toDateInput(record.startDate),
      endDate: toDateInput(record.endDate),

      status: record.status || "UNAVAILABLE",

      reason: record.reason || "",

      notes: record.notes || "",
    });

    setShowForm(true);

    setError("");
    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | Close Form
  |--------------------------------------------------------------------------
  */

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Admin cannot use /me because /me refers to the currently logged-in
  | trainer.
  |
  | Therefore the admin API needs trainer-specific create/update/delete
  | endpoints.
  |
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
        response = await trainerAvailabilityApi.updateForTrainer(
          id,
          editingId,
          payload,
        );
      } else {
        response = await trainerAvailabilityApi.createForTrainer(id, payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadData();

      setSuccess(
        response?.message || "Trainer availability saved successfully.",
      );
    } catch (err) {
      console.error("Failed to save trainer availability:", err);

      setError(
        err.response?.data?.message || "Unable to save trainer availability.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (recordId) => {
    const confirmed = window.confirm("Remove this availability record?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(recordId);

      setError("");
      setSuccess("");

      const response = await trainerAvailabilityApi.removeForTrainer(
        id,
        recordId,
      );

      setRecords((previous) =>
        previous.filter((record) => record._id !== recordId),
      );

      setSuccess(response?.message || "Availability removed successfully.");
    } catch (err) {
      console.error("Failed to remove availability:", err);

      setError(err.response?.data?.message || "Unable to remove availability.");
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />

        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Trainer Missing
  |--------------------------------------------------------------------------
  */

  if (!trainer) {
    return (
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/admin/trainers")}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <FiArrowLeft />
          Back to Trainers
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <FiAlertCircle size={30} className="mx-auto text-red-500" />

          <h2 className="mt-3 font-bold text-red-900">
            Trainer could not be loaded
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error || "Trainer not found."}
          </p>

          <button
            type="button"
            onClick={loadData}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-700"
          >
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Back */}

      <button
        type="button"
        onClick={() => navigate(`/admin/trainers/${trainer.id}`)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Trainer
      </button>

      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Trainer Availability
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {trainer.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage availability periods for this trainer.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <FiPlus />
          Add Availability
        </button>
      </div>

      {/* Messages */}

      {error && <Message type="error">{error}</Message>}

      {success && <Message type="success">{success}</Message>}

      {/* Trainer Overall Status */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Overall Availability
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Trainer's current general availability status.
            </p>
          </div>

          <StatusBadge status={trainer.availability} />
        </div>
      </section>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Periods" value={stats.total} />

        <Stat label="Available" value={stats.available} />

        <Stat label="Busy" value={stats.busy} />

        <Stat label="Unavailable" value={stats.unavailable} />
      </div>

      {/* Form */}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900">
                {editingId ? "Edit Availability" : "Add Availability Period"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add a date range and specify whether the trainer is available,
                busy or unavailable.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-700"
            >
              <FiX />
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
            />

            <Field
              label="End Date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              min={form.startDate || undefined}
              required
            />

            <div>
              <Label>Status</Label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="AVAILABLE">Available</option>

                <option value="BUSY">Busy</option>

                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>

            <Field
              label="Reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Personal leave"
            />
          </div>

          <div className="mt-4">
            <Label>Notes</Label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              placeholder="Optional notes..."
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? <FiLoader className="animate-spin" /> : <FiSave />}

              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-blue-600" />

            <h2 className="font-bold text-slate-900">Availability Timeline</h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Persistent availability periods recorded for this trainer.
          </p>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="p-12 text-center">
            <FiCalendar size={28} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-700">
              No availability records
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No date-specific availability has been recorded yet.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <FiPlus />
              Add Availability
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedRecords.map((record) => (
              <div
                key={record._id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <FiCalendar />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">
                        {record.reason || formatStatus(record.status)}
                      </p>

                      <StatusBadge status={record.status} />
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(record.startDate)}

                      {" → "}

                      {formatDate(record.endDate)}
                    </p>

                    {record.notes && (
                      <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-400">
                        {record.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 self-end sm:self-auto">
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => openEditForm(record)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    type="button"
                    title="Delete"
                    disabled={deletingId === record._id}
                    onClick={() => handleDelete(record._id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === record._id ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiTrash2 />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

const Label = ({ children }) => (
  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </label>
);

const Field = ({ label, ...props }) => (
  <div>
    <Label>{label}</Label>

    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

const Stat = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>

    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    AVAILABLE: "bg-emerald-50 text-emerald-700",

    BUSY: "bg-amber-50 text-amber-700",

    UNAVAILABLE: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
};

const Message = ({ type, children }) => {
  const success = type === "success";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {success ? (
        <FiCheckCircle className="mt-0.5 shrink-0" />
      ) : (
        <FiAlertCircle className="mt-0.5 shrink-0" />
      )}

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
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const toDateInput = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const formatStatus = (value) => {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export default TrainerAvailabilityPage;
