import { useEffect, useState } from "react";

import {
  FiAlertCircle,
  FiBriefcase,
  FiCheck,
  FiDollarSign,
  FiEdit2,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

import trainersApi from "../../../api/trainersApi";

/*
|--------------------------------------------------------------------------
| Initial Form
|--------------------------------------------------------------------------
*/

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",

  city: "",
  state: "",

  skills: [],

  experience: 0,
  trainingExperienceYears: 0,

  hourlyRate: 0,
  dailyRate: 0,

  trainingModes: [],

  preferredLocations: [],

  availabilityStatus: "AVAILABLE",

  resumeUrl: "",
  linkedinUrl: "",

  bio: "",
};

/*
|--------------------------------------------------------------------------
| Trainer Profile
|--------------------------------------------------------------------------
*/

const TrainerProfilePage = () => {
  const [form, setForm] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [skillInput, setSkillInput] = useState("");

  const [locationInput, setLocationInput] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Profile
  |--------------------------------------------------------------------------
  */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await trainersApi.getMyProfile();

      const trainer = response?.trainer || {};

      setForm({
        name: trainer.name || "",

        email: trainer.email || "",

        phone: trainer.phone || "",

        city: trainer.city || "",

        state: trainer.state || "",

        skills: Array.isArray(trainer.skills) ? trainer.skills : [],

        experience: trainer.experience ?? 0,

        trainingExperienceYears: trainer.trainingExperienceYears ?? 0,

        hourlyRate: trainer.hourlyRate ?? 0,

        dailyRate: trainer.dailyRate ?? 0,

        trainingModes: Array.isArray(trainer.trainingModes)
          ? trainer.trainingModes
          : [],

        preferredLocations: Array.isArray(trainer.preferredLocations)
          ? trainer.preferredLocations
          : [],

        availabilityStatus: trainer.availabilityStatus || "AVAILABLE",

        resumeUrl: trainer.resumeUrl || "",

        linkedinUrl: trainer.linkedinUrl || "",

        bio: trainer.bio || "",
      });
    } catch (error) {
      console.error("Failed to load trainer profile:", error);

      setError(
        error.response?.data?.message || "Unable to load your trainer profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Generic Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,

      [name]: value,
    }));

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Skills
  |--------------------------------------------------------------------------
  */

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) {
      return;
    }

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

  const removeSkill = (skill) => {
    setForm((current) => ({
      ...current,

      skills: current.skills.filter((item) => item !== skill),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Preferred Locations
  |--------------------------------------------------------------------------
  */

  const addLocation = () => {
    const location = locationInput.trim();

    if (!location) {
      return;
    }

    const alreadyExists = form.preferredLocations.some(
      (existingLocation) =>
        existingLocation.toLowerCase() === location.toLowerCase(),
    );

    if (alreadyExists) {
      setLocationInput("");
      return;
    }

    setForm((current) => ({
      ...current,

      preferredLocations: [...current.preferredLocations, location],
    }));

    setLocationInput("");
  };

  const removeLocation = (location) => {
    setForm((current) => ({
      ...current,

      preferredLocations: current.preferredLocations.filter(
        (item) => item !== location,
      ),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Training Modes
  |--------------------------------------------------------------------------
  */

  const toggleMode = (mode) => {
    setForm((current) => {
      const exists = current.trainingModes.includes(mode);

      return {
        ...current,

        trainingModes: exists
          ? current.trainingModes.filter((item) => item !== mode)
          : [...current.trainingModes, mode],
      };
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Save Profile
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),

        phone: form.phone.trim(),

        city: form.city.trim(),

        state: form.state.trim(),

        skills: form.skills,

        experience: Number(form.experience) || 0,

        trainingExperienceYears: Number(form.trainingExperienceYears) || 0,

        hourlyRate: Number(form.hourlyRate) || 0,

        dailyRate: Number(form.dailyRate) || 0,

        trainingModes: form.trainingModes,

        preferredLocations: form.preferredLocations,

        availabilityStatus: form.availabilityStatus,

        resumeUrl: form.resumeUrl.trim(),

        linkedinUrl: form.linkedinUrl.trim(),

        bio: form.bio.trim(),
      };

      const response = await trainersApi.updateMyProfile(payload);

      setSuccess(response?.message || "Profile updated successfully.");

      setEditing(false);

      await loadProfile();

      setSuccess(response?.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update trainer profile:", error);

      setError(
        error.response?.data?.message || "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Cancel Editing
  |--------------------------------------------------------------------------
  */

  const handleCancel = async () => {
    setEditing(false);

    setSkillInput("");
    setLocationInput("");

    setError("");
    setSuccess("");

    await loadProfile();
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
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
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

          <p className="mt-1 text-sm text-slate-500">
            Keep your professional information accurate so Nxthack can match you
            with relevant training opportunities.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setSuccess("");
              setError("");
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiEdit2 />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <FiX />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <FiLoader className="animate-spin" /> : <FiSave />}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* ================================================================
          MESSAGES
      ================================================================= */}

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

      {/* ================================================================
          PROFILE SUMMARY
      ================================================================= */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-bold text-white">
            {getInitials(form.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900">
              {form.name || "Trainer"}
            </h2>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <FiMail />

                {form.email || "—"}
              </span>

              <span className="flex items-center gap-2">
                <FiPhone />

                {form.phone || "—"}
              </span>

              <span className="flex items-center gap-2">
                <FiMapPin />

                {[form.city, form.state].filter(Boolean).join(", ") || "—"}
              </span>
            </div>
          </div>

          <AvailabilityBadge value={form.availabilityStatus} />
        </div>
      </section>

      {/* ================================================================
          PERSONAL INFORMATION
      ================================================================= */}

      <Section
        title="Personal Information"
        description="Basic contact and location information."
        icon={FiUser}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Full Name"
            name="name"
            value={form.name}
            editing={editing}
            onChange={handleChange}
          />

          <Field
            label="Email Address"
            name="email"
            value={form.email}
            editing={false}
            icon={FiMail}
          />

          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            editing={editing}
            onChange={handleChange}
          />

          <div />

          <Field
            label="City"
            name="city"
            value={form.city}
            editing={editing}
            onChange={handleChange}
          />

          <Field
            label="State"
            name="state"
            value={form.state}
            editing={editing}
            onChange={handleChange}
          />
        </div>

        {editing && (
          <p className="mt-4 text-xs text-slate-400">
            Your login email cannot be changed from this page.
          </p>
        )}
      </Section>

      {/* ================================================================
          PROFESSIONAL INFORMATION
      ================================================================= */}

      <Section
        title="Professional Profile"
        description="Your skills and training experience are used for requirement matching."
        icon={FiBriefcase}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Industry Experience"
            name="experience"
            value={form.experience}
            type="number"
            suffix="years"
            editing={editing}
            onChange={handleChange}
          />

          <Field
            label="Training Experience"
            name="trainingExperienceYears"
            value={form.trainingExperienceYears}
            type="number"
            suffix="years"
            editing={editing}
            onChange={handleChange}
          />
        </div>

        {/* Skills */}

        <div className="mt-6">
          <Label>Skills</Label>

          <div className="mt-2 flex flex-wrap gap-2">
            {form.skills.map((skill) => (
              <Tag
                key={skill}
                value={skill}
                removable={editing}
                onRemove={() => removeSkill(skill)}
              />
            ))}

            {!form.skills.length && (
              <span className="text-sm text-slate-400">No skills added.</span>
            )}
          </div>

          {editing && (
            <AddItem
              value={skillInput}
              onChange={setSkillInput}
              onAdd={addSkill}
              placeholder="e.g. AWS, Python, React"
            />
          )}
        </div>

        {/* Training Modes */}

        <div className="mt-6">
          <Label>Training Modes</Label>

          {editing ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {["ONLINE", "OFFLINE", "HYBRID"].map((mode) => {
                const selected = form.trainingModes.includes(mode);

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => toggleMode(mode)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {formatEnum(mode)}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {form.trainingModes.length ? (
                form.trainingModes.map((mode) => (
                  <Tag key={mode} value={formatEnum(mode)} />
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  No training modes selected.
                </span>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* ================================================================
          COMMERCIAL INFORMATION
      ================================================================= */}

      <Section
        title="Commercial Information"
        description="Maintain your expected training rates."
        icon={FiDollarSign}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Online Rate"
            name="hourlyRate"
            value={form.hourlyRate}
            type="number"
            prefix="₹"
            editing={editing}
            onChange={handleChange}
          />

          <Field
            label="Offline Rate"
            name="dailyRate"
            value={form.dailyRate}
            type="number"
            prefix="₹"
            editing={editing}
            onChange={handleChange}
          />
        </div>
      </Section>

      {/* ================================================================
          AVAILABILITY
      ================================================================= */}

      <Section
        title="Availability"
        description="Tell Nxthack whether you are currently available for new requirements."
        icon={FiCheck}
      >
        {editing ? (
          <select
            name="availabilityStatus"
            value={form.availabilityStatus}
            onChange={handleChange}
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            <option value="AVAILABLE">Available</option>

            <option value="BUSY">Busy</option>

            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        ) : (
          <AvailabilityBadge value={form.availabilityStatus} />
        )}
      </Section>

      {/* ================================================================
          PREFERRED LOCATIONS
      ================================================================= */}

      <Section
        title="Preferred Locations"
        description="Locations where you are willing to deliver training."
        icon={FiMapPin}
      >
        <div className="flex flex-wrap gap-2">
          {form.preferredLocations.map((location) => (
            <Tag
              key={location}
              value={location}
              removable={editing}
              onRemove={() => removeLocation(location)}
            />
          ))}

          {!form.preferredLocations.length && (
            <span className="text-sm text-slate-400">
              No preferred locations added.
            </span>
          )}
        </div>

        {editing && (
          <AddItem
            value={locationInput}
            onChange={setLocationInput}
            onAdd={addLocation}
            placeholder="e.g. Delhi, Gurgaon, Bangalore"
          />
        )}
      </Section>

      {/* ================================================================
          PROFESSIONAL LINKS
      ================================================================= */}

      <Section
        title="Professional Links"
        description="Add links that help Nxthack review your professional profile."
        icon={FiBriefcase}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Resume URL"
            name="resumeUrl"
            value={form.resumeUrl}
            editing={editing}
            onChange={handleChange}
            placeholder="https://..."
          />

          <Field
            label="LinkedIn URL"
            name="linkedinUrl"
            value={form.linkedinUrl}
            editing={editing}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </Section>

      {/* ================================================================
          BIO
      ================================================================= */}

      <Section
        title="Professional Summary"
        description="Provide a short summary of your expertise and training background."
        icon={FiUser}
      >
        {editing ? (
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={5}
            placeholder="Describe your technical expertise, training experience and industries you have worked with..."
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        ) : (
          <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
            {form.bio || "No professional summary added."}
          </p>
        )}
      </Section>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Section
|--------------------------------------------------------------------------
*/

const Section = ({ title, description, icon: Icon, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon />
      </div>

      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>

    {children}
  </section>
);

/*
|--------------------------------------------------------------------------
| Field
|--------------------------------------------------------------------------
*/

const Field = ({
  label,
  name,
  value,
  editing,
  onChange,
  type = "text",
  prefix,
  suffix,
  placeholder,
}) => (
  <div>
    <Label>{label}</Label>

    {editing ? (
      <div className="relative mt-2">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {prefix}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={type === "number" ? "0" : undefined}
          className={`w-full rounded-xl border border-slate-200 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
            prefix ? "pl-8 pr-3" : "px-3"
          }`}
        />
      </div>
    ) : (
      <p className="mt-2 text-sm font-medium text-slate-700">
        {prefix}
        {value !== "" && value !== null && value !== undefined ? value : "—"}

        {suffix && value !== "" && value !== null && value !== undefined
          ? ` ${suffix}`
          : ""}
      </p>
    )}
  </div>
);

/*
|--------------------------------------------------------------------------
| Label
|--------------------------------------------------------------------------
*/

const Label = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
    {children}
  </p>
);

/*
|--------------------------------------------------------------------------
| Tag
|--------------------------------------------------------------------------
*/

const Tag = ({ value, removable = false, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
    {value}

    {removable && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 text-blue-400 hover:text-red-500"
      >
        <FiTrash2 size={13} />
      </button>
    )}
  </span>
);

/*
|--------------------------------------------------------------------------
| Add Item
|--------------------------------------------------------------------------
*/

const AddItem = ({ value, onChange, onAdd, placeholder }) => (
  <div className="mt-3 flex max-w-lg gap-2">
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();

          onAdd();
        }
      }}
      placeholder={placeholder}
      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />

    <button
      type="button"
      onClick={onAdd}
      className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
    >
      <FiPlus />
      Add
    </button>
  </div>
);

/*
|--------------------------------------------------------------------------
| Availability Badge
|--------------------------------------------------------------------------
*/

const AvailabilityBadge = ({ value }) => {
  const styles = {
    AVAILABLE: "bg-emerald-50 text-emerald-700",

    BUSY: "bg-amber-50 text-amber-700",

    UNAVAILABLE: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
        styles[value] || "bg-slate-100 text-slate-600"
      }`}
    >
      {formatEnum(value)}
    </span>
  );
};

/*
|--------------------------------------------------------------------------
| Message
|--------------------------------------------------------------------------
*/

const Message = ({ type, icon: Icon, children }) => {
  const style =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${style}`}
    >
      <Icon className="mt-0.5 shrink-0" />

      <span>{children}</span>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

const formatEnum = (value) => {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getInitials = (name) => {
  if (!name) {
    return "TR";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default TrainerProfilePage;
