import { useEffect, useState } from "react";
import { FiArrowLeft, FiCalendar, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import trainersApi from "../../../api/trainersApi";
import { mapTrainerFromApi } from "../../../utils/trainerAdapter";

// NOTE: There is no backend model for availability blocks yet, so blocked
// periods below are kept in local component state only (same as before)
// and will not persist across a reload. The trainer's identity, however,
// is now loaded from the real API.

const TrainerAvailabilityPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [blocks, setBlocks] = useState([]);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadTrainer = async () => {
      try {
        setLoading(true);

        const response = await trainersApi.getById(id);

        setTrainer(mapTrainerFromApi(response.trainer));
      } catch (err) {
        console.error("Failed to load trainer:", err);

        setTrainer(null);
      } finally {
        setLoading(false);
      }
    };

    loadTrainer();
  }, [id]);

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    type: "UNAVAILABLE",
    title: "",
    notes: "",
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Trainer not found.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addBlock = (e) => {
    e.preventDefault();

    if (!form.startDate || !form.endDate) {
      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      alert("End date cannot be before start date.");

      return;
    }

    const block = {
      id: `AVL-${Date.now()}`,

      trainerId: trainer.id,

      ...form,

      assignmentId: null,
    };

    setBlocks((previous) => [...previous, block]);

    setForm({
      startDate: "",
      endDate: "",
      type: "UNAVAILABLE",
      title: "",
      notes: "",
    });

    setShowForm(false);
  };

  const removeBlock = (blockId) => {
    setBlocks((previous) => previous.filter((item) => item.id !== blockId));
  };

  const sortedBlocks = [...blocks].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/trainers/${trainer.id}`)}
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
            Manage bookings and blocked dates for this trainer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((previous) => !previous)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FiPlus />
          Block Dates
        </button>
      </div>

      {/* Add Block */}

      {showForm && (
        <form
          onSubmit={addBlock}
          className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5"
        >
          <h2 className="font-bold text-slate-900">Add Unavailable Period</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              required
            />

            <div>
              <Label>Type</Label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="UNAVAILABLE">Unavailable</option>

                <option value="BOOKED">Booked</option>
              </select>
            </div>

            <Field
              label="Reason / Title"
              name="title"
              value={form.title}
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
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="Optional notes..."
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Save Block
            </button>
          </div>
        </form>
      )}

      {/* Summary */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Blocked Periods" value={blocks.length} />

        <Stat
          label="Assignments"
          value={blocks.filter((block) => block.type === "BOOKED").length}
        />

        <Stat
          label="Unavailable"
          value={blocks.filter((block) => block.type === "UNAVAILABLE").length}
        />
      </div>

      {/* Timeline */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-blue-600" />

            <h2 className="font-bold text-slate-900">Availability Timeline</h2>
          </div>
        </div>

        {sortedBlocks.length === 0 ? (
          <div className="p-12 text-center">
            <FiCalendar size={28} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-700">
              No blocked dates
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              This trainer currently has no recorded conflicts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedBlocks.map((block) => (
              <div
                key={block.id}
                className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      block.type === "BOOKED"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <FiCalendar />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">
                        {block.title ||
                          (block.type === "BOOKED"
                            ? "Training Assignment"
                            : "Unavailable")}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          block.type === "BOOKED"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {block.type}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(block.startDate)}
                      {" → "}
                      {formatDate(block.endDate)}
                    </p>

                    {block.notes && (
                      <p className="mt-1 text-xs text-slate-400">
                        {block.notes}
                      </p>
                    )}
                  </div>
                </div>

                {!block.assignmentId && (
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="self-start rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 sm:self-auto"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    />
  </div>
);

const Stat = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>

    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default TrainerAvailabilityPage;
