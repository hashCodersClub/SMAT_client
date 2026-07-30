import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import requirementsApi from "../../../api/requirementsApi";
import trainersApi from "../../../api/trainersApi";
import assignmentsApi from "../../../api/assignmentsApi";

import {
  getVendorName,
  normalizeRequirement,
} from "../../../utils/requirementDisplay";

const RATE_TYPES = [
  { value: "PER_DAY", label: "Per Day" },
  { value: "PER_HOUR", label: "Per Hour" },
  { value: "PER_BATCH", label: "Per Batch" },
  { value: "FIXED", label: "Fixed" },
];

const daysBetween = (start, end) => {
  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const diff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  return diff > 0 ? diff : 0;
};

const CreateAssignmentPage = () => {
  const { id: requirementId, trainerId } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    trainerRate: "",
    rateType: "PER_DAY",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [{ requirement: req }, { trainer: trainerData }] =
          await Promise.all([
            requirementsApi.getById(requirementId),
            trainersApi.getById(trainerId),
          ]);

        if (isCancelled) return;

        setRequirement(normalizeRequirement(req));
        setTrainer(trainerData);

        setForm((previous) => ({
          ...previous,
          trainerRate: trainerData.dailyRate || "",
        }));
      } catch (error) {
        console.error("Failed to load assignment details:", error);

        if (!isCancelled) {
          setLoadError(
            error?.response?.data?.message ||
              "Failed to load requirement or trainer details.",
          );
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [requirementId, trainerId]);

  const totalDays = useMemo(
    () => daysBetween(form.startDate, form.endDate),
    [form.startDate, form.endDate],
  );

  const trainerCost = useMemo(() => {
    const rate = Number(form.trainerRate) || 0;

    if (form.rateType === "PER_DAY") return rate * totalDays;
    if (form.rateType === "FIXED") return rate;

    return rate;
  }, [form.trainerRate, form.rateType, totalDays]);

  const handleChange = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.startDate || !form.endDate) {
      setSubmitError("Start date and end date are required.");

      return;
    }

    if (!form.trainerRate) {
      setSubmitError("Trainer rate is required.");

      return;
    }

    setSubmitting(true);

    try {
      const { data: assignment } = await assignmentsApi.create({
        requirementId,
        trainerId,
        startDate: form.startDate,
        endDate: form.endDate,
        trainerRate: Number(form.trainerRate),
        rateType: form.rateType,
        notes: form.notes,
      });

      navigate(`/admin/assignments/${assignment._id}`);
    } catch (error) {
      console.error("Failed to create assignment:", error);

      setSubmitError(
        error?.response?.data?.message ||
          "Could not create the assignment. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading assignment details…
      </div>
    );
  }

  if (loadError || !requirement || !trainer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        {loadError || "Requirement or trainer not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() =>
          navigate(`/admin/requirements/${requirementId}/vendor-selection`)
        }
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Vendor Selection
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Create Assignment
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {trainer.name} → {requirement.title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          {getVendorName(requirement)} • {requirement.city} • {requirement.mode}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              End Date
            </label>

            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Trainer Rate (₹)
            </label>

            <input
              type="number"
              min="0"
              value={form.trainerRate}
              onChange={(e) => handleChange("trainerRate", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Rate Type
            </label>

            <select
              value={form.rateType}
              onChange={(e) => handleChange("rateType", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {RATE_TYPES.map((rateType) => (
                <option key={rateType.value} value={rateType.value}>
                  {rateType.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Notes (optional)
          </label>

          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {totalDays > 0 && form.rateType === "PER_DAY" && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            {totalDays} day(s) × ₹{form.trainerRate || 0} ={" "}
            <span className="font-semibold text-slate-900">
              ₹{trainerCost.toLocaleString("en-IN")}
            </span>{" "}
            estimated trainer cost
          </div>
        )}

        {submitError && (
          <p className="text-sm font-medium text-red-600">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <FiCheckCircle />
          {submitting ? "Creating assignment…" : "Create Assignment"}
        </button>
      </form>
    </div>
  );
};

export default CreateAssignmentPage;
