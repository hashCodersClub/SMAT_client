import { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  experienceYears: "",
  trainingExperienceYears: "",
  onlineRate: "",
  offlineRate: "",
  availability: "AVAILABLE",
  status: "ACTIVE",
  trainingTypes: [],
  modes: [],
  preferredLocations: "",
  skills: [],
  cvUrl: "",
};

const TrainerForm = ({
  initialData = initialValues,
  onSubmit,
  submitLabel = "Save Trainer",
}) => {
  const [form, setForm] = useState({
    ...initialValues,
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

  const toggleArrayValue = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: previous[field].includes(value)
        ? previous[field].filter((item) => item !== value)
        : [...previous[field], value],
    }));
  };

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value) return;

    if (!form.skills.includes(value)) {
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

    onSubmit({
      ...form,
      experienceYears: Number(form.experienceYears),
      trainingExperienceYears: Number(form.trainingExperienceYears),
      onlineRate: Number(form.onlineRate),
      offlineRate: Number(form.offlineRate),

      preferredLocations:
        typeof form.preferredLocations === "string"
          ? form.preferredLocations
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : form.preferredLocations,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal information */}

      <FormSection
        title="Personal Information"
        description="Basic trainer and contact details."
      >
        <Input
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Rahul Sharma"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="rahul@example.com"
          required
        />

        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="9876543210"
          required
        />

        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Delhi"
        />

        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={handleChange}
          placeholder="Delhi"
        />
      </FormSection>

      {/* Skills */}

      <FormSection
        title="Skills & Experience"
        description="Technologies and professional experience."
      >
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Skills
          </label>

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
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white"
            >
              <FiPlus />
              Add
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700"
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
          label="Industry Experience"
          name="experienceYears"
          type="number"
          value={form.experienceYears}
          onChange={handleChange}
          placeholder="7"
          suffix="years"
        />

        <Input
          label="Training Experience"
          name="trainingExperienceYears"
          type="number"
          value={form.trainingExperienceYears}
          onChange={handleChange}
          placeholder="5"
          suffix="years"
        />
      </FormSection>

      {/* Training preferences */}

      <FormSection
        title="Training Preferences"
        description="Training formats and preferred locations."
      >
        <CheckboxGroup
          label="Training Types"
          options={["Corporate", "College", "Bootcamp"]}
          selected={form.trainingTypes}
          onToggle={(value) => toggleArrayValue("trainingTypes", value)}
        />

        <CheckboxGroup
          label="Training Modes"
          options={["Online", "Offline"]}
          selected={form.modes}
          onToggle={(value) => toggleArrayValue("modes", value)}
        />

        <div className="md:col-span-2">
          <Input
            label="Preferred Locations"
            name="preferredLocations"
            value={
              Array.isArray(form.preferredLocations)
                ? form.preferredLocations.join(", ")
                : form.preferredLocations
            }
            onChange={handleChange}
            placeholder="Delhi, Noida, Gurgaon"
          />
        </div>
      </FormSection>

      {/* Rates */}

      <FormSection
        title="Rates & Availability"
        description="Trainer commercial and availability information."
      >
        <Input
          label="Online Daily Rate"
          name="onlineRate"
          type="number"
          value={form.onlineRate}
          onChange={handleChange}
          placeholder="4000"
          prefix="₹"
        />

        <Input
          label="Offline Daily Rate"
          name="offlineRate"
          type="number"
          value={form.offlineRate}
          onChange={handleChange}
          placeholder="6000"
          prefix="₹"
        />

        <Select
          label="Availability"
          name="availability"
          value={form.availability}
          onChange={handleChange}
          options={[
            ["AVAILABLE", "Available"],
            ["BUSY", "Busy"],
            ["UNAVAILABLE", "Unavailable"],
          ]}
        />

        <Select
          label="Trainer Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={[
            ["ACTIVE", "Active"],
            ["INACTIVE", "Inactive"],
          ]}
        />
      </FormSection>

      {/* Document */}

      <FormSection
        title="Documents"
        description="Trainer CV and profile documents."
      >
        <div className="md:col-span-2">
          <Input
            label="CV / Resume URL"
            name="cvUrl"
            value={form.cvUrl}
            onChange={handleChange}
            placeholder="Google Drive URL"
          />

          <p className="mt-2 text-xs text-slate-400">
            For the MVP, we'll store a Google Drive URL instead of uploading
            files directly.
          </p>
        </div>
      </FormSection>

      {/* Actions */}

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
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

const FormSection = ({ title, description, children }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
};

const Input = ({ label, prefix, suffix, ...props }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {prefix}
          </span>
        )}

        <input
          {...props}
          className={`w-full rounded-xl border border-slate-200 py-2.5 text-sm outline-none transition focus:border-blue-500 ${
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
};

const Select = ({ label, options, ...props }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

const CheckboxGroup = ({ label, options, selected, onToggle }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TrainerForm;
