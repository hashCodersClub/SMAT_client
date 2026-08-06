import { useState } from "react";
import {
  FiPlus,
  FiX,
  FiUpload,
  FiFile,
  FiExternalLink,
  FiFileText,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";

import AvatarCropModal from "../../shared/AvatarCropModal";
import ProjectsEditor from "../../trainer/profile/ProjectsEditor";
import trainersApi from "../../../api/trainersApi";

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
  projects: [],
  // Existing (already-uploaded) file URLs — populated when editing a
  // trainer that already has a photo/resume on Cloudinary.
  profilePhotoUrl: "",
  cvUrl: "",
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB, matches backend limit
const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB, matches backend limit

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

  // New files selected in this session — separate from form.profilePhotoUrl
  // / form.cvUrl, which only ever reflect what's already been uploaded.
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(
    initialData.profilePhotoUrl || "",
  );
  const [fileError, setFileError] = useState("");
  const [parsingDoc, setParsingDoc] = useState(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState("");

  // Raw file staged for cropping - the crop modal is open whenever this is
  // set. profilePhotoFile/photoPreviewUrl only get updated once the user
  // confirms a crop; canceling just discards this and changes nothing.
  const [photoToCrop, setPhotoToCrop] = useState(null);

  const handleDocumentAutoFill = async (e) => {
    const file = e.target.files?.[0];
    setFileError("");
    setParseSuccessMsg("");
    if (!file) return;

    try {
      setParsingDoc(true);
      const res = await trainersApi.parseDocument(file);
      const data = res.data || {};

      setForm((prev) => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email,
        phone: data.phone || prev.phone,
        city: data.city || prev.city,
        state: data.state || prev.state,
        experienceYears:
          data.experienceYears !== undefined && data.experienceYears !== 0
            ? String(data.experienceYears)
            : prev.experienceYears,
        trainingExperienceYears:
          data.trainingExperienceYears !== undefined &&
          data.trainingExperienceYears !== 0
            ? String(data.trainingExperienceYears)
            : prev.trainingExperienceYears,
        skills: Array.from(
          new Set([...(prev.skills || []), ...(data.skills || [])]),
        ),
        projects:
          Array.isArray(data.projects) && data.projects.length > 0
            ? data.projects
            : prev.projects || [],
      }));

      setResumeFile(file);

      let count = 0;
      if (data.name) count++;
      if (data.email) count++;
      if (data.phone) count++;
      if (data.city) count++;
      if (data.skills?.length) count++;
      if (data.projects?.length) count++;
      if (data.experienceYears) count++;

      setParseSuccessMsg(
        `Resume parsed successfully! ${count} field groups auto-filled. Please review and make any necessary adjustments.`,
      );
    } catch (err) {
      console.error("Failed to parse document:", err);
      setFileError(
        err.response?.data?.message ||
          "Unable to parse uploaded resume document.",
      );
    } finally {
      setParsingDoc(false);
      e.target.value = "";
    }
  };

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

  /*
  |--------------------------------------------------------------------------
  | File Handlers
  |--------------------------------------------------------------------------
  */

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    setFileError("");

    // Reset the input so choosing the same file again still fires onChange
    const inputEl = e.target;

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFileError("Profile photo must be a JPEG, PNG, or WEBP image.");
      inputEl.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setFileError("Profile photo must be smaller than 5MB.");
      inputEl.value = "";
      return;
    }

    setPhotoToCrop({
      src: URL.createObjectURL(file),
      name: file.name.replace(/\.[^.]+$/, "") + ".jpg",
    });

    inputEl.value = "";
  };

  const handleCropCancel = () => {
    if (photoToCrop) {
      URL.revokeObjectURL(photoToCrop.src);
    }
    setPhotoToCrop(null);
  };

  const handleCropComplete = (croppedFile) => {
    if (photoToCrop) {
      URL.revokeObjectURL(photoToCrop.src);
    }
    setPhotoToCrop(null);

    setProfilePhotoFile(croppedFile);
    setPhotoPreviewUrl(URL.createObjectURL(croppedFile));
  };

  const clearPhoto = () => {
    setProfilePhotoFile(null);
    setPhotoPreviewUrl(initialData.profilePhotoUrl || "");
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError("Resume must be a PDF or Word document.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setFileError("Resume must be smaller than 10MB.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
  };

  const clearResume = () => {
    setResumeFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { profilePhotoUrl, cvUrl, ...rest } = form;

    onSubmit({
      ...rest,

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

      projects: form.projects || [],

      // Only included when a new file was actually chosen this session.
      // trainersApi automatically switches to a multipart request when
      // either of these is present, and leaves everything else untouched
      // (including cvUrl) when neither is.
      ...(profilePhotoFile ? { profilePhotoFile } : {}),
      ...(resumeFile ? { resumeFile } : {}),
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Parsing Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <FiFileText size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Auto-fill from Resume (PDF / DOCX)
                </h3>
                <p className="mt-0.5 text-xs text-slate-600">
                  Upload a PDF or DOCX file to automatically parse name, contact details, skills, experience, and projects.
                </p>
              </div>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
              {parsingDoc ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  <span>Parsing Document...</span>
                </>
              ) : (
                <>
                  <FiUpload size={16} />
                  <span>Upload & Auto-fill</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleDocumentAutoFill}
                disabled={parsingDoc}
                className="hidden"
              />
            </label>
          </div>

          {parseSuccessMsg && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800">
              <FiCheckCircle size={15} className="shrink-0 text-emerald-600" />
              <span>{parseSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Personal information */}

        <FormSection
          title="Personal Information"
          description="Basic trainer and contact details."
        >
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Profile Photo
            </label>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                {photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-slate-300">
                    {form.name?.trim()?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  <FiUpload size={14} />
                  {photoPreviewUrl ? "Replace photo" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                {profilePhotoFile && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600"
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              JPEG, PNG, or WEBP. Max 5MB.
            </p>
          </div>

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

        {/* Projects Worked On */}

        <FormSection
          title="Projects Worked On"
          description="Projects and corporate assignments the trainer has delivered or worked on."
        >
          <div className="md:col-span-2">
            <ProjectsEditor
              projects={form.projects || []}
              editing={true}
              onChange={(projects) =>
                setForm((prev) => ({ ...prev, projects }))
              }
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
          description="Trainer resume, uploaded and stored securely."
        >
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Resume / CV
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <FiUpload size={14} />
                {resumeFile || form.cvUrl ? "Replace resume" : "Upload resume"}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </label>

              {resumeFile && (
                <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                  <FiFile size={12} />
                  {resumeFile.name}

                  <button type="button" onClick={clearResume}>
                    <FiX size={12} />
                  </button>
                </span>
              )}

              {!resumeFile && form.cvUrl && (
                <a
                  href={form.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
                >
                  <FiExternalLink size={12} />
                  View current resume
                </a>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-400">
              PDF or Word document. Max 10MB.
            </p>
          </div>
        </FormSection>

        {/* File errors */}

        {fileError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {fileError}
          </div>
        )}

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

      {photoToCrop && (
        <AvatarCropModal
          imageSrc={photoToCrop.src}
          fileName={photoToCrop.name}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      )}
    </>
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
