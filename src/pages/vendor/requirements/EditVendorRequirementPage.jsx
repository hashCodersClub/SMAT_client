import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { FiAlertCircle, FiArrowLeft, FiRefreshCw } from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";

const EditVendorRequirementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadRequirement = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await requirementsApi.getById(id);

        const requirement = data.requirement;

        setForm({
          title: requirement.title || "",

          trainingType: requirement.trainingType || "CORPORATE",

          skills: requirement.skills?.join(", ") || "",

          experienceRequired: requirement.experienceRequired ?? "",

          mode: requirement.mode || "ONLINE",

          city: requirement.city || "",
          state: requirement.state || "",

          startDate: requirement.startDate
            ? requirement.startDate.slice(0, 10)
            : "",

          endDate: requirement.endDate ? requirement.endDate.slice(0, 10) : "",

          durationValue: requirement.durationValue ?? "",

          durationUnit: requirement.durationUnit || "DAYS",

          participants: requirement.participants ?? "",

          budget: requirement.budget ?? "",

          budgetType: requirement.budgetType || "PER_DAY",

          description: requirement.description || "",

          vendorNotes: requirement.vendorNotes || "",
        });
      } catch (error) {
        console.error("Failed to load requirement:", error);

        setError(
          error.response?.data?.message || "Unable to load requirement.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequirement();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.title.trim()) {
      setError("Requirement title is required.");

      return;
    }

    if (!form.skills.trim()) {
      setError("Please enter at least one required skill.");

      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Start date and end date are required.");

      return;
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be earlier than the start date.");

      return;
    }

    if (["OFFLINE", "HYBRID"].includes(form.mode) && !form.city.trim()) {
      setError("City is required for offline and hybrid training.");

      return;
    }

    try {
      setSaving(true);

      /*
      |--------------------------------------------------------------------------
      | Editable vendor fields only
      |--------------------------------------------------------------------------
      */

      const payload = {
        title: form.title.trim(),

        trainingType: form.trainingType,

        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),

        mode: form.mode,

        startDate: form.startDate,
        endDate: form.endDate,

        durationUnit: form.durationUnit,

        description: form.description.trim(),

        vendorNotes: form.vendorNotes.trim(),
      };

      if (form.experienceRequired !== "") {
        payload.experienceRequired = Number(form.experienceRequired);
      }

      if (form.city.trim()) {
        payload.city = form.city.trim();
      } else {
        payload.city = "";
      }

      if (form.state.trim()) {
        payload.state = form.state.trim();
      } else {
        payload.state = "";
      }

      if (form.durationValue !== "") {
        payload.durationValue = Number(form.durationValue);
      }

      if (form.participants !== "") {
        payload.participants = Number(form.participants);
      }

      if (form.budget !== "") {
        payload.budget = Number(form.budget);

        payload.budgetType = form.budgetType;
      }

      await requirementsApi.update(id, payload);

      navigate(`/vendor/requirements/${id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Requirement update failed:", error);

      setError(
        error.response?.data?.message || "Unable to update requirement.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={24}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">Loading requirement...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <FiAlertCircle size={28} className="mx-auto text-red-500" />

        <p className="mt-3 text-sm text-red-700">
          {error || "Requirement not found."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/vendor/requirements")}
          className="mt-5 text-sm font-semibold text-red-700"
        >
          Back to Requirements
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back */}

      <button
        type="button"
        onClick={() => navigate(`/vendor/requirements/${id}`)}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <FiArrowLeft />
        Back to Requirement
      </button>

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Edit Requirement
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update your training requirement information.
        </p>
      </div>

      {/* Notice */}

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Requirement status is managed by Nxthack
        </p>

        <p className="mt-1 text-sm leading-6 text-amber-700">
          You can update the requirement information, but operational status and
          internal notes cannot be changed from the Vendor Portal.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Training */}

        <Section
          title="Training Information"
          description="Update the training requirement."
        >
          <div className="md:col-span-2">
            <Input
              label="Requirement Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <Select
            label="Training Type"
            name="trainingType"
            value={form.trainingType}
            onChange={handleChange}
            options={[
              ["CORPORATE", "Corporate"],
              ["COLLEGE", "College"],
              ["BOOTCAMP", "Bootcamp"],
              ["WORKSHOP", "Workshop"],
              ["OTHER", "Other"],
            ]}
          />

          <Input
            label="Trainer Experience Required"
            name="experienceRequired"
            type="number"
            min="0"
            value={form.experienceRequired}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <Input
              label="Required Skills"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              required
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Separate skills using commas.
            </p>
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
        </Section>

        {/* Delivery */}

        <Section
          title="Delivery & Location"
          description="Update delivery information."
        >
          <Select
            label="Training Mode"
            name="mode"
            value={form.mode}
            onChange={handleChange}
            options={[
              ["ONLINE", "Online"],
              ["OFFLINE", "Offline"],
              ["HYBRID", "Hybrid"],
            ]}
          />

          <Input
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            required={form.mode !== "ONLINE"}
          />

          <Input
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
          />

          <Input
            label="Participants"
            name="participants"
            type="number"
            min="1"
            value={form.participants}
            onChange={handleChange}
          />
        </Section>

        {/* Schedule */}

        <Section
          title="Schedule"
          description="Update expected dates and duration."
        >
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />

          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Duration"
            name="durationValue"
            type="number"
            min="1"
            value={form.durationValue}
            onChange={handleChange}
          />

          <Select
            label="Duration Unit"
            name="durationUnit"
            value={form.durationUnit}
            onChange={handleChange}
            options={[
              ["HOURS", "Hours"],
              ["DAYS", "Days"],
              ["WEEKS", "Weeks"],
              ["MONTHS", "Months"],
            ]}
          />
        </Section>

        {/* Commercial */}

        <Section
          title="Commercial Information"
          description="Update budget and additional information."
        >
          <Input
            label="Budget"
            name="budget"
            type="number"
            min="0"
            value={form.budget}
            onChange={handleChange}
          />

          <Select
            label="Budget Type"
            name="budgetType"
            value={form.budgetType}
            onChange={handleChange}
            options={[
              ["PER_HOUR", "Per Hour"],
              ["PER_DAY", "Per Day"],
              ["FIXED", "Fixed"],
            ]}
          />

          <div className="md:col-span-2">
            <Textarea
              label="Additional Notes"
              name="vendorNotes"
              value={form.vendorNotes}
              onChange={handleChange}
            />
          </div>
        </Section>

        {/* Actions */}

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
          <button
            type="button"
            disabled={saving}
            onClick={() => navigate(`/vendor/requirements/${id}`)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, description, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <h2 className="font-semibold text-slate-900">{title}</h2>

    <p className="mt-1 text-sm text-slate-500">{description}</p>

    <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
  </section>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}

      {props.required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>

    <select
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    >
      {options.map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>

    <textarea
      {...props}
      rows={5}
      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

export default EditVendorRequirementPage;
