import { useEffect, useState } from "react";
import { FiAlertCircle, FiPlus, FiX } from "react-icons/fi";

const emptyRequirement = {
  vendorId: "",

  title: "",
  trainingType: "CORPORATE",
  description: "",

  skills: [],

  mode: "ONLINE",

  city: "",
  state: "",

  startDate: "",
  endDate: "",

  durationValue: "",
  durationUnit: "DAYS",

  participants: "",
  experienceRequired: "",

  budget: "",
  budgetType: "PER_DAY",

  priority: "MEDIUM",

  vendorNotes: "",
  internalNotes: "",
};

/*
|--------------------------------------------------------------------------
| Requirement Form
|--------------------------------------------------------------------------
*/

const RequirementForm = ({
  initialData = emptyRequirement,
  vendors = [],
  vendorsLoading = false,
  onSubmit,
  submitLabel = "Save Requirement",
  submitting = false,
  isEdit = false,
}) => {
  const [form, setForm] = useState({
    ...emptyRequirement,
    ...initialData,

    skills: initialData?.skills || [],
  });

  const [skillInput, setSkillInput] = useState("");

  const [formError, setFormError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Sync Initial Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setForm({
      ...emptyRequirement,
      ...initialData,

      skills: initialData?.skills || [],
    });
  }, [initialData]);

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
  | Add Skill
  |--------------------------------------------------------------------------
  */

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const alreadyExists = form.skills.some(
      (existingSkill) => existingSkill.toLowerCase() === skill.toLowerCase(),
    );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setForm((current) => ({
      ...current,

      skills: [...current.skills, skill],
    }));

    setSkillInput("");
  };

  /*
  |--------------------------------------------------------------------------
  | Skill Keyboard
  |--------------------------------------------------------------------------
  */

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();

      addSkill();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Skill
  |--------------------------------------------------------------------------
  */

  const removeSkill = (skill) => {
    setForm((current) => ({
      ...current,

      skills: current.skills.filter((item) => item !== skill),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const validate = () => {
    if (!form.vendorId) {
      return "Please select a vendor.";
    }

    if (!form.title.trim()) {
      return "Requirement title is required.";
    }

    if (!form.skills.length) {
      return "Add at least one required skill.";
    }

    if (!form.startDate) {
      return "Start date is required.";
    }

    if (!form.endDate) {
      return "End date is required.";
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      return "End date cannot be before start date.";
    }

    if (form.mode !== "ONLINE" && !form.city.trim()) {
      return "City is required for offline or hybrid training.";
    }

    return "";
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    const validationError = validate();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize Payload
    |--------------------------------------------------------------------------
    */

    const payload = {
      vendorId: form.vendorId,

      title: form.title.trim(),

      trainingType: form.trainingType,

      description: form.description?.trim() || "",

      skills: form.skills,

      mode: form.mode,

      city: form.mode === "ONLINE" ? "" : form.city?.trim() || "",

      state: form.mode === "ONLINE" ? "" : form.state?.trim() || "",

      startDate: form.startDate,
      endDate: form.endDate,

      durationValue:
        form.durationValue === "" ? undefined : Number(form.durationValue),

      durationUnit: form.durationUnit,

      participants:
        form.participants === "" ? undefined : Number(form.participants),

      experienceRequired:
        form.experienceRequired === ""
          ? undefined
          : Number(form.experienceRequired),

      budget: form.budget === "" ? undefined : Number(form.budget),

      budgetType: form.budgetType,

      priority: form.priority,

      vendorNotes: form.vendorNotes?.trim() || "",

      internalNotes: form.internalNotes?.trim() || "",
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ================================================================
          FORM ERROR
      ================================================================= */}

      {formError && (
        <div className="animate-rise-in flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

          <p className="text-sm font-medium text-red-700">{formError}</p>
        </div>
      )}

      {/* ================================================================
          VENDOR
      ================================================================= */}

      <Section
        delay={0}
        title="Vendor"
        description="Select the company that provided this training requirement."
      >
        <div className="md:col-span-2">
          <Select
            label="Vendor"
            name="vendorId"
            value={form.vendorId}
            onChange={handleChange}
            disabled={vendorsLoading || submitting}
            required
          >
            <option value="">
              {vendorsLoading ? "Loading vendors..." : "Select vendor"}
            </option>

            {vendors.map((vendor) => (
              <option
                key={vendor._id || vendor.id}
                value={vendor._id || vendor.id}
              >
                {vendor.companyName}
                {vendor.city ? ` — ${vendor.city}` : ""}
              </option>
            ))}
          </Select>

          {!vendorsLoading && vendors.length === 0 && (
            <p className="mt-2 text-xs text-amber-600">
              No vendors are available. Add or invite a vendor first.
            </p>
          )}

          {isEdit && (
            <p className="mt-2 text-xs text-slate-400">
              Changing the vendor will transfer this requirement to another
              vendor account.
            </p>
          )}
        </div>
      </Section>

      {/* ================================================================
          TRAINING INFORMATION
      ================================================================= */}

      <Section
        delay={1}
        title="Training Information"
        description="Describe the training requirement and required trainer profile."
      >
        <div className="md:col-span-2">
          <Input
            label="Requirement Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: Azure Administrator Corporate Training"
            required
          />
        </div>

        <Select
          label="Training Type"
          name="trainingType"
          value={form.trainingType}
          onChange={handleChange}
        >
          <option value="CORPORATE">Corporate</option>

          <option value="COLLEGE">College</option>

          <option value="BOOTCAMP">Bootcamp</option>

          <option value="WORKSHOP">Workshop</option>

          <option value="OTHER">Other</option>
        </Select>

        <Input
          label="Participants"
          name="participants"
          type="number"
          min="1"
          value={form.participants}
          onChange={handleChange}
          placeholder="Example: 25"
        />

        <div className="md:col-span-2">
          <Textarea
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the training objectives, audience, expected coverage and any important requirements..."
            rows={5}
          />
        </div>

        {/* Skills */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Required Skills
            <span className="ml-1 text-red-500">*</span>
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="Example: Azure, AZ-104, PowerShell"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <button
              type="button"
              onClick={addSkill}
              className="press-scale flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
            >
              <FiPlus />
              Add
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            Press Enter or comma after each skill.
          </p>

          {form.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.skills.map((skill) => (
                <span
                  key={skill}
                  className="animate-scale-in group/chip flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition-colors duration-200 hover:bg-blue-100"
                >
                  {skill}

                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-blue-400 transition-all duration-200 hover:scale-125 hover:text-red-500"
                  >
                    <FiX size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Trainer Experience Required"
          name="experienceRequired"
          type="number"
          min="0"
          value={form.experienceRequired}
          onChange={handleChange}
          placeholder="Years"
        />
      </Section>

      {/* ================================================================
          DELIVERY
      ================================================================= */}

      <Section
        delay={2}
        title="Delivery & Location"
        description="Define how and where the training will be delivered."
      >
        <Select
          label="Training Mode"
          name="mode"
          value={form.mode}
          onChange={handleChange}
        >
          <option value="ONLINE">Online</option>

          <option value="OFFLINE">Offline</option>

          <option value="HYBRID">Hybrid</option>
        </Select>

        <div />

        {form.mode !== "ONLINE" && (
          <>
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Example: Bengaluru"
              required
            />

            <Input
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Example: Karnataka"
            />
          </>
        )}
      </Section>

      {/* ================================================================
          SCHEDULE
      ================================================================= */}

      <Section
        delay={3}
        title="Schedule"
        description="Define expected training dates and duration."
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
          min={form.startDate || undefined}
          required
        />

        <Input
          label="Duration"
          name="durationValue"
          type="number"
          min="1"
          value={form.durationValue}
          onChange={handleChange}
          placeholder="Example: 5"
        />

        <Select
          label="Duration Unit"
          name="durationUnit"
          value={form.durationUnit}
          onChange={handleChange}
        >
          <option value="HOURS">Hours</option>

          <option value="DAYS">Days</option>

          <option value="WEEKS">Weeks</option>

          <option value="MONTHS">Months</option>
        </Select>
      </Section>

      {/* ================================================================
          COMMERCIAL
      ================================================================= */}

      <Section
        delay={4}
        title="Commercial Information"
        description="Record the vendor budget and requirement priority."
      >
        <Input
          label="Budget"
          name="budget"
          type="number"
          min="0"
          value={form.budget}
          onChange={handleChange}
          placeholder="Example: 15000"
        />

        <Select
          label="Budget Type"
          name="budgetType"
          value={form.budgetType}
          onChange={handleChange}
        >
          <option value="PER_HOUR">Per Hour</option>

          <option value="PER_DAY">Per Day</option>

          <option value="PER_BATCH">Per Batch</option>

          <option value="FIXED">Fixed</option>
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

      {/* ================================================================
          NOTES
      ================================================================= */}

      <Section
        delay={5}
        title="Notes"
        description="Record vendor instructions and internal operational information."
      >
        <Textarea
          label="Vendor Notes"
          name="vendorNotes"
          value={form.vendorNotes}
          onChange={handleChange}
          placeholder="Instructions or notes received from the vendor..."
          rows={4}
        />

        <div>
          <Textarea
            label="Internal Notes"
            name="internalNotes"
            value={form.internalNotes}
            onChange={handleChange}
            placeholder="Internal notes for the Nxthack operations team..."
            rows={4}
          />

          <p className="mt-2 text-xs text-amber-600">
            Internal notes must never be shown in the Vendor Portal.
          </p>
        </div>
      </Section>

      {/* ================================================================
          ACTIONS
      ================================================================= */}

      <div
        style={{ animationDelay: "420ms" }}
        className="animate-rise-in sticky bottom-4 z-10 flex flex-col-reverse justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row"
      >
        <button
          type="button"
          disabled={submitting}
          onClick={() => window.history.back()}
          className="press-scale rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || vendorsLoading || vendors.length === 0}
          className="press-scale rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-blue-300 disabled:shadow-none"
        >
          {submitting && (
            <span className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-2px]" />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

/*
|--------------------------------------------------------------------------
| Section
|--------------------------------------------------------------------------
*/

const Section = ({ title, description, delay = 0, children }) => (
  <section
    style={{ animationDelay: `${delay * 70}ms` }}
    className="hover-lift animate-rise-in rounded-2xl border border-slate-200 bg-white p-5 transition-colors duration-200 hover:border-slate-300 sm:p-6"
  >
    <div>
      <h2 className="font-semibold text-slate-900">{title}</h2>

      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>

    <div className="mt-5 grid gap-5 md:grid-cols-2">{children}</div>
  </section>
);

/*
|--------------------------------------------------------------------------
| Input
|--------------------------------------------------------------------------
*/

const Input = ({ label, required, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}

      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      {...props}
      required={required}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

/*
|--------------------------------------------------------------------------
| Select
|--------------------------------------------------------------------------
*/

const Select = ({ label, required, children, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}

      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <select
      {...props}
      required={required}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      {children}
    </select>
  </div>
);

/*
|--------------------------------------------------------------------------
| Textarea
|--------------------------------------------------------------------------
*/

const Textarea = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <textarea
      {...props}
      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />
  </div>
);

export default RequirementForm;
