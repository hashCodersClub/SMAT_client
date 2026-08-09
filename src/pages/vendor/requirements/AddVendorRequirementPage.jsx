import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";
import {
  SearchableSelect,
  SearchableMultiSelect,
} from "../../../components/ui/SearchableSelect";
import {
  INDIAN_STATES,
  INDIAN_CITIES,
  IT_SKILLS,
} from "../../../constants/trainerOptions";

const initialForm = {
  title: "",
  trainingType: "CORPORATE",

  skills: [],
  experienceRequired: "",

  mode: "ONLINE",
  city: "",
  state: "",

  startDate: "",
  endDate: "",

  durationValue: "",
  durationUnit: "DAYS",

  participants: "",

  budget: "",
  budgetType: "PER_DAY",

  description: "",
  vendorNotes: "",
};

const AddVendorRequirementPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    /*
    |--------------------------------------------------------------------------
    | Basic Validation
    |--------------------------------------------------------------------------
    */

    if (!form.title.trim()) {
      setError("Requirement title is required.");
      return;
    }

    if (!form.skills.length) {
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
      setSubmitting(true);

      /*
      |--------------------------------------------------------------------------
      | Build Payload
      |--------------------------------------------------------------------------
      |
      | IMPORTANT:
      |
      | We DO NOT send:
      |
      | vendorId
      | createdBy
      | source
      | status
      |
      | Backend determines these from authenticated Vendor user.
      |--------------------------------------------------------------------------
      */

      const payload = {
        title: form.title.trim(),

        trainingType: form.trainingType,

        skills: form.skills,

        mode: form.mode,

        startDate: form.startDate,
        endDate: form.endDate,

        durationUnit: form.durationUnit,

        description: form.description.trim(),

        vendorNotes: form.vendorNotes.trim(),
      };

      /*
      |--------------------------------------------------------------------------
      | Optional Fields
      |--------------------------------------------------------------------------
      */

      if (form.experienceRequired !== "") {
        payload.experienceRequired = Number(form.experienceRequired);
      }

      if (form.city.trim()) {
        payload.city = form.city.trim();
      }

      if (form.state.trim()) {
        payload.state = form.state.trim();
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

      /*
      |--------------------------------------------------------------------------
      | API
      |--------------------------------------------------------------------------
      */

      const response = await requirementsApi.create(payload);

      const requirement = response.requirement;

      /*
      |--------------------------------------------------------------------------
      | Navigate
      |--------------------------------------------------------------------------
      */

      if (requirement?._id) {
        navigate(`/vendor/requirements/${requirement._id}`, {
          replace: true,
        });

        return;
      }

      navigate("/vendor/requirements", {
        replace: true,
      });
    } catch (error) {
      console.error("Requirement creation failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to submit requirement. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back */}

      <button
        type="button"
        onClick={() => navigate("/vendor/requirements")}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <FiArrowLeft />
        Back to Requirements
      </button>

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New Training Requirement
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Share your training requirement with Nxthack. Our operations team will
          review it and begin trainer sourcing.
        </p>
      </div>

      {/* Information */}

      <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <FiCheckCircle size={19} className="mt-0.5 shrink-0 text-blue-600" />

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Your company is automatically linked
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">
            You don't need to select a vendor. This requirement will
            automatically be associated with your company account.
          </p>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================================================================
            TRAINING
        ================================================================= */}

        <Section
          title="Training Information"
          description="Tell us what training you need."
        >
          <div className="md:col-span-2">
            <Input
              label="Requirement Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Azure DevOps Corporate Training"
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
            placeholder="e.g. 5 years"
          />

          <div className="md:col-span-2">
            <SearchableMultiSelect
              label="Required Skills"
              values={form.skills}
              onChange={(skills) =>
                setForm((current) => ({ ...current, skills }))
              }
              options={IT_SKILLS}
              placeholder="Search skills (e.g. Azure, DevOps)..."
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Requirement Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the training objectives, expected topics, audience and any trainer preferences..."
            />
          </div>
        </Section>

        {/* ================================================================
            DELIVERY
        ================================================================= */}

        <Section
          title="Delivery & Location"
          description="Where and how should the training be delivered?"
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

          <SearchableSelect
            label={form.mode === "ONLINE" ? "City (Optional)" : "City"}
            value={form.city}
            onChange={(value) =>
              setForm((current) => ({ ...current, city: value }))
            }
            options={INDIAN_CITIES}
            placeholder="Search or select a city..."
            required={form.mode !== "ONLINE"}
          />

          <SearchableSelect
            label="State"
            value={form.state}
            onChange={(value) =>
              setForm((current) => ({ ...current, state: value }))
            }
            options={INDIAN_STATES}
            placeholder="Search or select a state..."
          />

          <Input
            label="Number of Participants"
            name="participants"
            type="number"
            min="1"
            value={form.participants}
            onChange={handleChange}
            placeholder="e.g. 25"
          />
        </Section>

        {/* ================================================================
            SCHEDULE
        ================================================================= */}

        <Section
          title="Schedule"
          description="Provide the expected training dates and duration."
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
            placeholder="e.g. 5"
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

        {/* ================================================================
            COMMERCIAL
        ================================================================= */}

        <Section
          title="Commercial Information"
          description="Budget information is optional but helps us source trainers faster."
        >
          <Input
            label="Budget"
            name="budget"
            type="number"
            min="0"
            value={form.budget}
            onChange={handleChange}
            placeholder="e.g. 50000"
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
              placeholder="Add any additional information for the Nxthack operations team..."
            />
          </div>
        </Section>

        {/* ================================================================
            ACTIONS
        ================================================================= */}

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate("/vendor/requirements")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Requirement"}
          </button>
        </div>
      </form>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Components
|--------------------------------------------------------------------------
*/

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
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

export default AddVendorRequirementPage;
