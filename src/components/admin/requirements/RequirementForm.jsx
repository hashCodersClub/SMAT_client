import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

import { vendors } from "../../../data/vendors";

const emptyRequirement = {
  title: "",
  vendorId: "",

  skills: [],

  trainingType: "Corporate",
  mode: "Offline",

  city: "",
  state: "",
  venue: "",

  startDate: "",
  endDate: "",

  startTime: "",
  endTime: "",

  numberOfTrainers: 1,
  batchSize: "",

  budgetType: "Per Day",
  budget: "",

  experienceRequired: "",

  priority: "MEDIUM",
  source: "WhatsApp",

  description: "",
  notes: "",
};

const RequirementForm = ({
  initialData = emptyRequirement,
  onSubmit,
  submitLabel = "Create Requirement",
}) => {
  const [form, setForm] = useState({
    ...emptyRequirement,
    ...initialData,
  });

  const [skillInput, setSkillInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value) return;

    if (
      !form.skills.some((skill) => skill.toLowerCase() === value.toLowerCase())
    ) {
      setForm((previous) => ({
        ...previous,
        skills: [...previous.skills, value],
      }));
    }

    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm((previous) => ({
      ...previous,
      skills: previous.skills.filter((item) => item !== skill),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const vendor = vendors.find((item) => item.id === form.vendorId);

    onSubmit({
      ...form,

      vendorName: vendor?.companyName || "",

      numberOfTrainers: Number(form.numberOfTrainers),
      batchSize: Number(form.batchSize),
      budget: Number(form.budget),
      experienceRequired: Number(form.experienceRequired),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section
        title="Requirement Information"
        description="Basic information about the incoming training requirement."
      >
        <div className="md:col-span-2">
          <Input
            label="Requirement Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Python + Data Analytics Trainer"
            required
          />
        </div>

        <Select
          label="Vendor"
          name="vendorId"
          value={form.vendorId}
          onChange={handleChange}
          required
        >
          <option value="">Select vendor</option>

          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.companyName}
            </option>
          ))}
        </Select>

        <Select
          label="Source"
          name="source"
          value={form.source}
          onChange={handleChange}
        >
          <option>WhatsApp</option>
          <option>Email</option>
          <option>Phone</option>
          <option>Referral</option>
          <option>Website</option>
          <option>Other</option>
        </Select>

        <Select
          label="Training Type"
          name="trainingType"
          value={form.trainingType}
          onChange={handleChange}
        >
          <option>Corporate</option>
          <option>College</option>
          <option>Bootcamp</option>
          <option>Workshop</option>
          <option>Faculty Development</option>
          <option>Other</option>
        </Select>

        <Select
          label="Training Mode"
          name="mode"
          value={form.mode}
          onChange={handleChange}
        >
          <option>Offline</option>
          <option>Online</option>
          <option>Hybrid</option>
        </Select>

        <Select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
      </Section>

      <Section
        title="Skills Required"
        description="Add technologies and competencies required from the trainer."
      >
        <div className="md:col-span-2">
          <div className="flex gap-2">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. Python"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={addSkill}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white"
            >
              <FiPlus />
              Add
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700"
              >
                {skill}

                <button type="button" onClick={() => removeSkill(skill)}>
                  <FiX />
                </button>
              </span>
            ))}
          </div>
        </div>

        <Input
          label="Minimum Experience"
          name="experienceRequired"
          type="number"
          min="0"
          value={form.experienceRequired}
          onChange={handleChange}
          placeholder="3"
          suffix="years"
        />

        <Input
          label="Number of Trainers"
          name="numberOfTrainers"
          type="number"
          min="1"
          value={form.numberOfTrainers}
          onChange={handleChange}
        />
      </Section>

      <Section title="Schedule" description="Training dates and daily timings.">
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
          label="Start Time"
          name="startTime"
          type="time"
          value={form.startTime}
          onChange={handleChange}
        />

        <Input
          label="End Time"
          name="endTime"
          type="time"
          value={form.endTime}
          onChange={handleChange}
        />

        <Input
          label="Batch Size"
          name="batchSize"
          type="number"
          min="0"
          value={form.batchSize}
          onChange={handleChange}
          placeholder="60"
        />
      </Section>

      <Section
        title="Location"
        description="Where the training will be delivered."
      >
        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Noida"
        />

        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={handleChange}
          placeholder="Uttar Pradesh"
        />

        <div className="md:col-span-2">
          <Input
            label="Venue / Client Location"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="College or client office"
          />
        </div>
      </Section>

      <Section title="Commercial" description="Vendor budget for the trainer.">
        <Select
          label="Budget Type"
          name="budgetType"
          value={form.budgetType}
          onChange={handleChange}
        >
          <option>Per Day</option>
          <option>Per Hour</option>
          <option>Fixed</option>
        </Select>

        <Input
          label="Maximum Budget"
          name="budget"
          type="number"
          min="0"
          value={form.budget}
          onChange={handleChange}
          placeholder="5000"
          prefix="₹"
        />
      </Section>

      <Section
        title="Additional Information"
        description="Requirement description and internal notes."
      >
        <div className="md:col-span-2">
          <Textarea
            label="Requirement Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Paste or summarize the vendor requirement..."
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Internal Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Anything your operations team should know..."
          />
        </div>
      </Section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

const Section = ({ title, description, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <h2 className="font-semibold text-slate-900">{title}</h2>

    <p className="mt-1 text-sm text-slate-500">{description}</p>

    <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
  </section>
);

const Input = ({ label, prefix, suffix, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {prefix}
        </span>
      )}

      <input
        {...props}
        className={`w-full rounded-xl border border-slate-200 py-2.5 text-sm outline-none focus:border-blue-500 ${
          prefix ? "pl-8" : "pl-3"
        } ${suffix ? "pr-14" : "pr-3"}`}
      />

      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <select
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    >
      {children}
    </select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <textarea
      {...props}
      rows={4}
      className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    />
  </div>
);

export default RequirementForm;
