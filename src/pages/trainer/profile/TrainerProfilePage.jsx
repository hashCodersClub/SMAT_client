import { useEffect, useState } from "react";

import {
  FiAlertCircle,
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiExternalLink,
  FiFile,
  FiGlobe,
  FiLinkedin,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiSave,
  FiShield,
  FiUpload,
  FiUser,
  FiX,
} from "react-icons/fi";

import trainersApi from "../../../api/trainersApi";
import SkillDetailsEditor from "../../../components/trainer/profile/SkillDetailsEditor";
import CertificationsEditor from "../../../components/trainer/profile/CertificationsEditor";
import EmploymentHistoryEditor from "../../../components/trainer/profile/EmploymentHistoryEditor";
import EducationEditor from "../../../components/trainer/profile/EducationEditor";
import LanguagesEditor from "../../../components/trainer/profile/LanguagesEditor";

/*
|--------------------------------------------------------------------------
| Initial Form
|--------------------------------------------------------------------------
*/

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  alternatePhone: "",

  city: "",
  state: "",
  country: "India",

  professionalHeadline: "",
  professionalSummary: "",

  currentDesignation: "",
  currentOrganization: "",

  skills: [],
  skillDetails: [],

  certifications: [],
  employmentHistory: [],
  education: [],
  languages: [],

  experience: 0,
  trainingExperience: 0,

  industries: [],

  trainingModes: [],

  preferredLocations: [],

  willingToTravel: true,

  availabilityStatus: "AVAILABLE",

  resumeUrl: "",
  profilePhotoUrl: "",
  linkedinUrl: "",
  portfolioUrl: "",
  githubUrl: "",

  profileCompletion: 0,
  profileVerified: false,
  vendorProfileCode: "",
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

  const [locationInput, setLocationInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Profile Photo / Resume Upload
  |--------------------------------------------------------------------------
  |
  | New files selected in this editing session - separate from
  | form.profilePhotoUrl / form.resumeUrl, which only ever reflect what's
  | already been uploaded to Cloudinary.
  |--------------------------------------------------------------------------
  */

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");

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
        alternatePhone: trainer.alternatePhone || "",

        city: trainer.city || "",
        state: trainer.state || "",
        country: trainer.country || "India",

        professionalHeadline: trainer.professionalHeadline || "",

        professionalSummary: trainer.professionalSummary || "",

        currentDesignation: trainer.currentDesignation || "",

        currentOrganization: trainer.currentOrganization || "",

        skills: Array.isArray(trainer.skills) ? trainer.skills : [],

        skillDetails: Array.isArray(trainer.skillDetails)
          ? trainer.skillDetails
          : [],

        certifications: Array.isArray(trainer.certifications)
          ? trainer.certifications
          : [],

        employmentHistory: Array.isArray(trainer.employmentHistory)
          ? trainer.employmentHistory
          : [],

        education: Array.isArray(trainer.education) ? trainer.education : [],

        languages: Array.isArray(trainer.languages) ? trainer.languages : [],

        experience: trainer.experience ?? 0,

        trainingExperience: trainer.trainingExperience ?? 0,

        industries: Array.isArray(trainer.industries) ? trainer.industries : [],

        trainingModes: Array.isArray(trainer.trainingModes)
          ? trainer.trainingModes
          : [],

        preferredLocations: Array.isArray(trainer.preferredLocations)
          ? trainer.preferredLocations
          : [],

        willingToTravel: trainer.willingToTravel ?? true,

        availabilityStatus: trainer.availabilityStatus || "AVAILABLE",

        resumeUrl: trainer.resumeUrl || "",

        profilePhotoUrl: trainer.profilePhotoUrl || "",

        linkedinUrl: trainer.linkedinUrl || "",

        portfolioUrl: trainer.portfolioUrl || "",

        githubUrl: trainer.githubUrl || "",

        profileCompletion: trainer.profileCompletion ?? 0,

        profileVerified: trainer.profileVerified ?? false,

        vendorProfileCode: trainer.vendorProfileCode || "",
      });

      setPhotoPreviewUrl(trainer.profilePhotoUrl || "");
      setProfilePhotoFile(null);
      setResumeFile(null);
      setFileError("");
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
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,

      [name]: type === "checkbox" ? checked : value,
    }));

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Generic Tag Helpers
  |--------------------------------------------------------------------------
  */

  const addUniqueItem = (field, value, clearInput) => {
    const item = value.trim();

    if (!item) {
      return;
    }

    setForm((current) => {
      const list = current[field] || [];

      const exists = list.some(
        (existing) => existing.toLowerCase() === item.toLowerCase(),
      );

      if (exists) {
        return current;
      }

      return {
        ...current,
        [field]: [...list, item],
      };
    });

    clearInput("");

    if (success) {
      setSuccess("");
    }
  };

  const removeItem = (field, value) => {
    setForm((current) => ({
      ...current,

      [field]: current[field].filter((item) => item !== value),
    }));

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Structured Skills
  |--------------------------------------------------------------------------
  */

  const handleSkillDetailsChange = (skillDetails) => {
    const legacySkills = [
      ...new Set(
        skillDetails
          .map((skill) => String(skill?.name || "").trim())
          .filter(Boolean),
      ),
    ];

    setForm((current) => ({
      ...current,

      skillDetails,

      skills: legacySkills,
    }));

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Certifications
  |--------------------------------------------------------------------------
  */

  const handleCertificationsChange = (certifications) => {
    setForm((current) => ({
      ...current,
      certifications,
    }));

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Employment History
  |--------------------------------------------------------------------------
  */

  const handleEmploymentHistoryChange = (employmentHistory) => {
    setForm((current) => ({
      ...current,
      employmentHistory,
    }));

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Education
  |--------------------------------------------------------------------------
  */

  const handleEducationChange = (education) => {
    setForm((current) => ({
      ...current,
      education,
    }));

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Languages
  |--------------------------------------------------------------------------
  */

  const handleLanguagesChange = (languages) => {
    setForm((current) => ({
      ...current,
      languages,
    }));

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Profile Photo / Resume Upload
  |--------------------------------------------------------------------------
  */

  const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB, matches backend limit
  const MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB, matches backend limit

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    setFileError("");

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFileError("Profile photo must be a JPEG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setFileError("Profile photo must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    setProfilePhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));

    if (success) {
      setSuccess("");
    }
  };

  const clearPhotoSelection = () => {
    setProfilePhotoFile(null);
    setPhotoPreviewUrl(form.profilePhotoUrl || "");
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];
    setFileError("");

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFileError("Resume must be a PDF or Word document.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setFileError("Resume must be smaller than 10MB.");
      event.target.value = "";
      return;
    }

    setResumeFile(file);

    if (success) {
      setSuccess("");
    }
  };

  const clearResumeSelection = () => {
    setResumeFile(null);
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

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const skillDetails = Array.isArray(form.skillDetails)
        ? form.skillDetails
            .filter((skill) => skill && String(skill.name || "").trim())
            .map((skill) => ({
              name: String(skill.name).trim(),

              proficiency: skill.proficiency || "INTERMEDIATE",

              yearsOfExperience: Number(skill.yearsOfExperience) || 0,

              trainingExperienceYears:
                Number(skill.trainingExperienceYears) || 0,

              isPrimary: Boolean(skill.isPrimary),
            }))
        : [];

      const skills = [
        ...new Set(skillDetails.map((skill) => skill.name).filter(Boolean)),
      ];

      const certifications = Array.isArray(form.certifications)
        ? form.certifications
            .filter((cert) => cert && String(cert.name || "").trim())
            .map((cert) => ({
              name: String(cert.name).trim(),
              issuingOrganization: String(
                cert.issuingOrganization || "",
              ).trim(),
              credentialId: String(cert.credentialId || "").trim(),
              credentialUrl: String(cert.credentialUrl || "").trim(),
              issueDate: cert.issueDate || null,
              expiryDate: cert.doesNotExpire ? null : cert.expiryDate || null,
              doesNotExpire: Boolean(cert.doesNotExpire),
            }))
        : [];

      const employmentHistory = Array.isArray(form.employmentHistory)
        ? form.employmentHistory
            .filter((job) => job && job.company && job.designation)
            .map((job) => ({
              company: String(job.company).trim(),
              designation: String(job.designation).trim(),
              location: String(job.location || "").trim(),
              startDate: job.startDate || null,
              endDate: job.currentlyWorking ? null : job.endDate || null,
              currentlyWorking: Boolean(job.currentlyWorking),
              description: String(job.description || "").trim(),
            }))
        : [];

      const education = Array.isArray(form.education)
        ? form.education
            .filter((item) => item && item.qualification && item.institution)
            .map((item) => ({
              qualification: String(item.qualification).trim(),
              institution: String(item.institution).trim(),
              fieldOfStudy: String(item.fieldOfStudy || "").trim(),
              startYear: item.startYear ? Number(item.startYear) : null,
              endYear: item.endYear ? Number(item.endYear) : null,
            }))
        : [];

      const payload = {
        name: form.name.trim(),

        phone: form.phone.trim(),

        alternatePhone: form.alternatePhone.trim(),

        city: form.city.trim(),

        state: form.state.trim(),

        country: form.country.trim(),

        professionalHeadline: form.professionalHeadline.trim(),

        professionalSummary: form.professionalSummary.trim(),

        currentDesignation: form.currentDesignation.trim(),

        currentOrganization: form.currentOrganization.trim(),

        skills,

        skillDetails,

        certifications,

        employmentHistory,

        education,

        languages: form.languages,

        experience: Number(form.experience) || 0,

        trainingExperience: Number(form.trainingExperience) || 0,

        industries: form.industries,

        trainingModes: form.trainingModes,

        preferredLocations: form.preferredLocations,

        willingToTravel: Boolean(form.willingToTravel),

        availabilityStatus: form.availabilityStatus,

        resumeUrl: form.resumeUrl.trim(),

        linkedinUrl: form.linkedinUrl.trim(),

        portfolioUrl: form.portfolioUrl.trim(),

        githubUrl: form.githubUrl.trim(),

        // Only included when a new file was actually chosen this session -
        // trainersApi automatically switches to a multipart request when
        // either is present, and leaves everything else (including the
        // existing photo/resume) untouched when neither is.
        ...(profilePhotoFile ? { profilePhotoFile } : {}),
        ...(resumeFile ? { resumeFile } : {}),
      };

      const response = await trainersApi.updateMyProfile(payload);

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
  | Cancel
  |--------------------------------------------------------------------------
  */

  const handleCancel = async () => {
    setEditing(false);

    setLocationInput("");
    setIndustryInput("");

    setError("");
    setSuccess("");

    await loadProfile();
  };

  /*
  |--------------------------------------------------------------------------
  | Completion Checklist
  |--------------------------------------------------------------------------
  */

  const checklist = [
    {
      id: "section-identity",
      label: "Add a professional summary",
      done: Boolean(form.professionalSummary.trim()),
    },
    {
      id: "section-skills",
      label: "Add your core skills",
      done: form.skillDetails.length > 0,
    },
    {
      id: "section-certifications",
      label: "Add a certification",
      done: form.certifications.length > 0,
    },
    {
      id: "section-employment",
      label: "Add your employment history",
      done: form.employmentHistory.length > 0,
    },
    {
      id: "section-languages",
      label: "Add a language you speak",
      done: form.languages.length > 0,
    },
    {
      id: "section-links",
      label: "Link your resume or LinkedIn",
      done: Boolean(form.resumeUrl.trim() || form.linkedinUrl.trim()),
    },
  ];

  const nextChecklistItems = checklist.filter((item) => !item.done);

  const goToSection = (id) => {
    setEditing(true);

    requestAnimationFrame(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl backdrop-blur-sm">
          <div className="h-28 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
          <div className="px-8 pb-8">
            <div className="-mt-12 h-24 w-24 animate-pulse rounded-2xl border-4 border-white bg-slate-300 shadow-lg" />
            <div className="mt-4 h-6 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl" />
          <div className="h-80 animate-pulse rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20 animate-fade-in">
      {/* ================================================================
          PAGE TITLE + STICKY ACTION BAR (Glassmorphism)
      ================================================================= */}

      <div className="sticky top-0 z-20 -mx-4 flex flex-col justify-between gap-3 border-b border-white/20 bg-white/70 px-6 py-4 backdrop-blur-xl shadow-xl shadow-slate-200/40 sm:flex-row sm:items-center rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            My Profile
          </h1>

          <p className="text-sm font-medium text-slate-500/80">
            This is what Nxthack sees when matching you to opportunities.
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
            className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/40 active:scale-95"
          >
            <FiEdit2
              size={16}
              className="transition-transform group-hover:rotate-6"
            />
            Edit profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:bg-slate-50/80 hover:shadow-md disabled:opacity-50"
            >
              <FiX size={15} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-600/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {saving ? (
                <FiLoader size={15} className="animate-spin" />
              ) : (
                <FiSave size={15} />
              )}

              {saving ? "Saving..." : "Save changes"}
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

      {fileError && (
        <Message type="error" icon={FiAlertCircle}>
          {fileError}
        </Message>
      )}

      {success && (
        <Message type="success" icon={FiCheckCircle}>
          {success}
        </Message>
      )}

      {/* ================================================================
          HERO -- banner + overlapping avatar, LinkedIn-style
      ================================================================= */}

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 shadow-2xl shadow-slate-200/40 backdrop-blur-sm transition-all hover:shadow-slate-300/50">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 sm:h-36">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="-mt-12 shrink-0">
                <div className="group relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-xl shadow-blue-600/30 ring-2 ring-white/50 transition-all hover:scale-105">
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt={form.name || "Profile photo"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white">
                      {getInitials(form.name)}
                    </div>
                  )}

                  {editing && (
                    <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 bg-slate-900/0 text-white opacity-0 transition-all hover:bg-slate-900/60 hover:opacity-100">
                      <FiUpload size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wide">
                        Change
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {editing && profilePhotoFile && (
                  <button
                    type="button"
                    onClick={clearPhotoSelection}
                    className="mt-2 w-full text-center text-[11px] font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Undo
                  </button>
                )}
              </div>

              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {form.name || "Trainer"}
                  </h2>

                  {form.profileVerified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-700 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
                      <FiShield size={12} />
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-base font-semibold text-slate-600">
                  {form.professionalHeadline ||
                    form.currentDesignation ||
                    "Professional Trainer"}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <FiMail size={14} className="text-slate-400" />
                    {form.email || "—"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <FiPhone size={14} className="text-slate-400" />
                    {form.phone || "—"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <FiMapPin size={14} className="text-slate-400" />
                    {[form.city, form.state, form.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 pt-1 sm:pt-0">
              <AvailabilityBadge value={form.availabilityStatus} />

              <ProfileStrengthRing value={form.profileCompletion} />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          COMPLETE-YOUR-PROFILE NUDGE
      ================================================================= */}

      {nextChecklistItems.length > 0 && (
        <section className="rounded-3xl border border-blue-100/80 bg-gradient-to-br from-blue-50/80 via-white/80 to-indigo-50/80 p-6 shadow-lg shadow-blue-100/40 backdrop-blur-sm transition-all hover:shadow-blue-200/50">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-800">
              ✨ Finish setting up your profile
            </p>

            <p className="text-xs font-semibold text-blue-600">
              {checklist.length - nextChecklistItems.length}/{checklist.length}{" "}
              complete
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {nextChecklistItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSection(item.id)}
                className="group flex items-center justify-between gap-2 rounded-xl border border-blue-200/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:border-blue-300 hover:bg-blue-50/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                {item.label}

                <FiArrowRight
                  size={15}
                  className="shrink-0 text-blue-400 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ================================================================
          PERSONAL INFORMATION
      ================================================================= */}

      <Section
        title="Personal Information"
        description="Your basic contact and location information."
        icon={FiUser}
      >
        <div className="grid gap-6 md:grid-cols-2">
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
          />

          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            editing={editing}
            onChange={handleChange}
          />

          <Field
            label="Alternate Phone"
            name="alternatePhone"
            value={form.alternatePhone}
            editing={editing}
            onChange={handleChange}
          />

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

          <Field
            label="Country"
            name="country"
            value={form.country}
            editing={editing}
            onChange={handleChange}
          />
        </div>

        {editing && (
          <p className="mt-5 text-xs font-medium text-slate-400/80">
            Your login email cannot be changed from your trainer profile.
          </p>
        )}
      </Section>

      {/* ================================================================
          PROFESSIONAL IDENTITY
      ================================================================= */}

      <Section
        id="section-identity"
        title="Professional Identity"
        description="This information forms the foundation of your Nxthack professional profile."
        icon={FiBriefcase}
      >
        <div className="space-y-6">
          <Field
            label="Professional Headline"
            name="professionalHeadline"
            value={form.professionalHeadline}
            editing={editing}
            onChange={handleChange}
            placeholder="e.g. AWS & DevOps Corporate Trainer"
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Field
              label="Current Designation"
              name="currentDesignation"
              value={form.currentDesignation}
              editing={editing}
              onChange={handleChange}
              placeholder="e.g. Senior Cloud Trainer"
            />

            <Field
              label="Current Organization"
              name="currentOrganization"
              value={form.currentOrganization}
              editing={editing}
              onChange={handleChange}
              placeholder="Organization name"
            />
          </div>

          <div>
            <Label>Professional Summary</Label>

            {editing ? (
              <>
                <textarea
                  name="professionalSummary"
                  value={form.professionalSummary}
                  onChange={handleChange}
                  rows={6}
                  maxLength={3000}
                  placeholder="Describe your technical expertise, corporate training experience, industries and the types of programs you deliver..."
                  className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none transition-all focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 focus:bg-white/80 backdrop-blur-sm"
                />

                <p className="mt-1 text-right text-xs font-medium text-slate-400">
                  {form.professionalSummary.length}
                  /3000
                </p>
              </>
            ) : (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {form.professionalSummary || "No professional summary added."}
              </p>
            )}
          </div>
        </div>
      </Section>

      {/* ================================================================
          EXPERIENCE
      ================================================================= */}

      <Section
        title="Experience"
        description="Your professional and corporate training experience."
        icon={FiBriefcase}
      >
        <div className="grid gap-6 md:grid-cols-2">
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
            name="trainingExperience"
            value={form.trainingExperience}
            type="number"
            suffix="years"
            editing={editing}
            onChange={handleChange}
          />
        </div>

        <div className="mt-6">
          <Label>Industries</Label>

          <div className="mt-2 flex flex-wrap gap-2">
            {form.industries.map((industry) => (
              <Tag
                key={industry}
                value={industry}
                removable={editing}
                onRemove={() => removeItem("industries", industry)}
              />
            ))}

            {!form.industries.length && (
              <EmptyText>No industries added.</EmptyText>
            )}
          </div>

          {editing && (
            <AddItem
              value={industryInput}
              onChange={setIndustryInput}
              onAdd={() =>
                addUniqueItem("industries", industryInput, setIndustryInput)
              }
              placeholder="e.g. IT Services, Banking, EdTech"
            />
          )}
        </div>
      </Section>

      {/* ================================================================
          STRUCTURED SKILLS
      ================================================================= */}

      <Section
        id="section-skills"
        title="Skills & Expertise"
        description="Add your core technologies and subjects with proficiency and experience. This information helps Nxthack match you with relevant training requirements."
        icon={FiBriefcase}
      >
        <SkillDetailsEditor
          skills={form.skillDetails}
          editing={editing}
          onChange={handleSkillDetailsChange}
        />

        {form.skillDetails.length > 0 && (
          <div className="mt-6 border-t border-slate-200/60 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400/80">
              Matching Skills
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {form.skillDetails.map((skill, index) => (
                <span
                  key={skill._id || `${skill.name}-${index}`}
                  className="rounded-xl bg-slate-100/80 px-3 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-400/80">
              These skills are synchronized with your trainer profile and can
              later be used by the requirement matching engine.
            </p>
          </div>
        )}
      </Section>

      {/* ================================================================
          CERTIFICATIONS
      ================================================================= */}

      <Section
        id="section-certifications"
        title="Certifications"
        description="Add professional certifications that validate your expertise."
        icon={FiAward}
      >
        <CertificationsEditor
          certifications={form.certifications}
          editing={editing}
          onChange={handleCertificationsChange}
        />
      </Section>

      {/* ================================================================
          EMPLOYMENT HISTORY
      ================================================================= */}

      <Section
        id="section-employment"
        title="Employment History"
        description="Add your past and current work experience."
        icon={FiBriefcase}
      >
        <EmploymentHistoryEditor
          employmentHistory={form.employmentHistory}
          editing={editing}
          onChange={handleEmploymentHistoryChange}
        />
      </Section>

      {/* ================================================================
          EDUCATION
      ================================================================= */}

      <Section
        title="Education"
        description="Add your academic qualifications."
        icon={FiBookOpen}
      >
        <EducationEditor
          education={form.education}
          editing={editing}
          onChange={handleEducationChange}
        />
      </Section>

      {/* ================================================================
          LANGUAGES
      ================================================================= */}

      <Section
        id="section-languages"
        title="Languages"
        description="Languages you're comfortable training in. This helps Nxthack match you to requirements with specific language needs."
        icon={FiGlobe}
      >
        <LanguagesEditor
          languages={form.languages}
          editing={editing}
          onChange={handleLanguagesChange}
        />
      </Section>

      {/* ================================================================
          TRAINING PREFERENCES
      ================================================================= */}

      <Section
        title="Training Preferences"
        description="Tell Nxthack how and where you prefer to deliver training."
        icon={FiGlobe}
      >
        <div>
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
                    className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      selected
                        ? "border-blue-500/80 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 shadow-sm shadow-blue-200/50 scale-[1.02]"
                        : "border-slate-200/80 bg-white/50 text-slate-600 hover:bg-slate-50/80 hover:shadow-md"
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
                <EmptyText>No training modes selected.</EmptyText>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Label>Preferred Locations</Label>

          <div className="mt-2 flex flex-wrap gap-2">
            {form.preferredLocations.map((location) => (
              <Tag
                key={location}
                value={location}
                removable={editing}
                onRemove={() => removeItem("preferredLocations", location)}
              />
            ))}

            {!form.preferredLocations.length && (
              <EmptyText>No preferred locations added.</EmptyText>
            )}
          </div>

          {editing && (
            <AddItem
              value={locationInput}
              onChange={setLocationInput}
              onAdd={() =>
                addUniqueItem(
                  "preferredLocations",
                  locationInput,
                  setLocationInput,
                )
              }
              placeholder="e.g. Delhi, Gurgaon, Bangalore"
            />
          )}
        </div>

        <div className="mt-6">
          <Label>Travel Preference</Label>

          {editing ? (
            <label className="mt-3 flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-slate-200/80 bg-white/50 px-5 py-3 backdrop-blur-sm transition-all hover:bg-slate-50/80 hover:shadow-md">
              <input
                type="checkbox"
                name="willingToTravel"
                checked={form.willingToTravel}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
              />

              <span className="text-sm font-semibold text-slate-700">
                I am willing to travel for classroom training.
              </span>
            </label>
          ) : (
            <p className="mt-2 text-sm font-semibold text-slate-700">
              {form.willingToTravel
                ? "Willing to travel"
                : "Not currently willing to travel"}
            </p>
          )}
        </div>
      </Section>

      {/* ================================================================
          AVAILABILITY
      ================================================================= */}

      <Section
        title="Current Availability"
        description="Your high-level availability. Detailed dates are managed from the Availability page."
        icon={FiCheck}
      >
        {editing ? (
          <select
            name="availabilityStatus"
            value={form.availabilityStatus}
            onChange={handleChange}
            className="w-full max-w-sm rounded-xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 focus:bg-white/80 backdrop-blur-sm"
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
          PROFESSIONAL LINKS
      ================================================================= */}

      <Section
        id="section-links"
        title="Professional Links"
        description="Links and documents Nxthack can use to review your professional background."
        icon={FiLinkedin}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Resume</Label>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              {editing && (
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white/50 px-4 py-2.5 text-sm font-semibold text-slate-700 backdrop-blur-sm transition-all hover:border-slate-300/80 hover:bg-white/80">
                  <FiUpload size={14} />
                  {resumeFile || form.resumeUrl
                    ? "Replace resume"
                    : "Upload resume"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeChange}
                    className="hidden"
                  />
                </label>
              )}

              {resumeFile && (
                <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <FiFile size={12} />
                  {resumeFile.name}

                  <button type="button" onClick={clearResumeSelection}>
                    <FiX size={12} />
                  </button>
                </span>
              )}

              {!resumeFile && form.resumeUrl && (
                <a
                  href={form.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm font-bold text-blue-600 transition-all hover:text-blue-700 hover:scale-105"
                >
                  <FiExternalLink size={14} />
                  View current resume
                </a>
              )}

              {!editing && !form.resumeUrl && (
                <p className="text-sm text-slate-400/60">No resume uploaded.</p>
              )}
            </div>

            {editing && (
              <p className="mt-2 text-xs text-slate-400">
                PDF or Word document. Max 10MB.
              </p>
            )}
          </div>

          <LinkField
            label="LinkedIn"
            name="linkedinUrl"
            value={form.linkedinUrl}
            editing={editing}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/..."
          />

          <LinkField
            label="Portfolio"
            name="portfolioUrl"
            value={form.portfolioUrl}
            editing={editing}
            onChange={handleChange}
            placeholder="https://..."
          />

          <LinkField
            label="GitHub"
            name="githubUrl"
            value={form.githubUrl}
            editing={editing}
            onChange={handleChange}
            placeholder="https://github.com/..."
          />
        </div>
      </Section>

      {/* ================================================================
          PROFILE INFORMATION
      ================================================================= */}

      <Section
        title="Nxthack Profile"
        description="Internal profile information used by the Nxthack platform."
        icon={FiUser}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <ReadOnlyStat
            label="Profile Completion"
            value={`${form.profileCompletion}%`}
          />

          <ReadOnlyStat
            label="Verification"
            value={form.profileVerified ? "Verified" : "Not Verified"}
          />

          <ReadOnlyStat
            label="Profile ID"
            value={form.vendorProfileCode || "Pending"}
          />
        </div>

        <p className="mt-5 text-xs leading-relaxed text-slate-400/80">
          Your private contact information is not intended to be included in the
          vendor-facing profile generated by Nxthack.
        </p>
      </Section>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Section
|--------------------------------------------------------------------------
*/

const Section = ({ id, title, description, icon: Icon, children }) => (
  <section
    id={id}
    className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-slate-300/50 hover:scale-[1.005]"
  >
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 shadow-inner">
        <Icon size={20} />
      </div>

      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-relaxed text-slate-500/80">
          {description}
        </p>
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
  suffix,
  placeholder,
}) => (
  <div>
    <Label>{label}</Label>

    {editing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.5" : undefined}
        className="mt-1.5 w-full rounded-xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400/60 hover:border-slate-300/80 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 focus:bg-white/80 backdrop-blur-sm"
      />
    ) : (
      <p className="mt-1.5 text-sm font-semibold text-slate-800">
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
| Link Field
|--------------------------------------------------------------------------
*/

const LinkField = ({ label, name, value, editing, onChange, placeholder }) => (
  <div>
    <Label>{label}</Label>

    {editing ? (
      <input
        type="url"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400/60 hover:border-slate-300/80 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 focus:bg-white/80 backdrop-blur-sm"
      />
    ) : value ? (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="mt-1.5 flex w-fit items-center gap-1.5 text-sm font-bold text-blue-600 transition-all hover:text-blue-700 hover:scale-105"
      >
        View
        <FiExternalLink size={14} />
      </a>
    ) : (
      <p className="mt-1.5 text-sm text-slate-400/60">—</p>
    )}
  </div>
);

/*
|--------------------------------------------------------------------------
| Label
|--------------------------------------------------------------------------
*/

const Label = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-wider text-slate-400/80">
    {children}
  </p>
);

/*
|--------------------------------------------------------------------------
| Tag
|--------------------------------------------------------------------------
*/

const Tag = ({ value, removable = false, onRemove }) => (
  <span className="group inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:scale-105">
    {value}

    {removable && (
      <button
        type="button"
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full text-blue-400 transition-all hover:bg-red-100/80 hover:text-red-600 hover:scale-110"
        aria-label={`Remove ${value}`}
      >
        <FiX size={12} />
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
  <div className="mt-3 flex max-w-lg items-center gap-2">
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
      className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400/60 hover:border-slate-300/80 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 focus:bg-white/80 backdrop-blur-sm"
    />

    <button
      type="button"
      onClick={onAdd}
      aria-label="Add"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 text-blue-700 shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95"
    >
      <FiPlus size={16} />
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
    AVAILABLE: {
      bg: "bg-emerald-50/90",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      glow: "shadow-emerald-200/50",
    },
    BUSY: {
      bg: "bg-amber-50/90",
      text: "text-amber-700",
      dot: "bg-amber-500",
      glow: "shadow-amber-200/50",
    },
    UNAVAILABLE: {
      bg: "bg-red-50/90",
      text: "text-red-700",
      dot: "bg-red-500",
      glow: "shadow-red-200/50",
    },
  };

  const meta = styles[value] || {
    bg: "bg-slate-100/90",
    text: "text-slate-600",
    dot: "bg-slate-400",
    glow: "shadow-slate-200/50",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-bold backdrop-blur-sm shadow-lg ${meta.bg} ${meta.text} ${meta.glow} transition-all hover:scale-105`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot} animate-pulse`} />
      {formatEnum(value)}
    </span>
  );
};

/*
|--------------------------------------------------------------------------
| Profile Strength Ring
|--------------------------------------------------------------------------
*/

const ProfileStrengthRing = ({ value }) => {
  const percentage = Math.min(Math.max(Number(value) || 0, 0), 100);

  const size = 64;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const tone =
    percentage >= 80 ? "#2563eb" : percentage >= 40 ? "#d97706" : "#dc2626";

  const strengthLabel =
    percentage >= 80 ? "Strong" : percentage >= 40 ? "Fair" : "Weak";

  return (
    <div className="flex flex-col items-center gap-1 transition-all hover:scale-105">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 drop-shadow-sm"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-slate-800">
          {percentage}%
        </div>
      </div>

      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500/80">
        {strengthLabel} profile
      </span>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Read Only Stat
|--------------------------------------------------------------------------
*/

const ReadOnlyStat = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white/80 p-5 shadow-inner transition-all hover:shadow-md hover:scale-[1.02]">
    <p className="text-xs font-bold uppercase tracking-wider text-slate-400/80">
      {label}
    </p>

    <p className="mt-1.5 break-words text-base font-extrabold text-slate-800">
      {value}
    </p>
  </div>
);

/*
|--------------------------------------------------------------------------
| Empty Text
|--------------------------------------------------------------------------
*/

const EmptyText = ({ children }) => (
  <span className="text-sm font-medium text-slate-400/70">{children}</span>
);

/*
|--------------------------------------------------------------------------
| Message
|--------------------------------------------------------------------------
*/

const Message = ({ type, icon: Icon, children }) => {
  const style =
    type === "success"
      ? "border-emerald-500/80 bg-gradient-to-r from-emerald-50/90 to-emerald-100/50 text-emerald-800 shadow-emerald-200/30"
      : "border-red-500/80 bg-gradient-to-r from-red-50/90 to-red-100/50 text-red-800 shadow-red-200/30";

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border-l-4 bg-white/80 px-5 py-4 text-sm font-semibold shadow-lg backdrop-blur-sm ${style}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />

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
