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
  FiGlobe,
  FiLinkedin,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiSave,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";

import trainersApi from "../../../api/trainersApi";
import SkillDetailsEditor from "../../../components/trainer/profile/SkillDetailsEditor";
import CertificationsEditor from "../../../components/trainer/profile/CertificationsEditor";
import EmploymentHistoryEditor from "../../../components/trainer/profile/EmploymentHistoryEditor";
import EducationEditor from "../../../components/trainer/profile/EducationEditor";

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

  // Legacy + structured skills
  skills: [],
  skillDetails: [],

  certifications: [],
  employmentHistory: [],
  education: [],

  experience: 0,
  trainingExperience: 0,

  industries: [],

  trainingModes: [],

  preferredLocations: [],

  willingToTravel: true,

  availabilityStatus: "AVAILABLE",

  resumeUrl: "",
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

        linkedinUrl: trainer.linkedinUrl || "",

        portfolioUrl: trainer.portfolioUrl || "",

        githubUrl: trainer.githubUrl || "",

        profileCompletion: trainer.profileCompletion ?? 0,

        profileVerified: trainer.profileVerified ?? false,

        vendorProfileCode: trainer.vendorProfileCode || "",
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
    /*
    |--------------------------------------------------------------------------
    | Synchronize Legacy Skills
    |--------------------------------------------------------------------------
    |
    | Existing requirement matching / admin UI may still read trainer.skills.
    | We therefore maintain both representations.
    |
    */

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

      /*
      |--------------------------------------------------------------------------
      | Normalize Skills Before Sending
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Normalize Certifications Before Sending
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Normalize Employment History Before Sending
      |--------------------------------------------------------------------------
      */

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

      /*
      |--------------------------------------------------------------------------
      | Normalize Education Before Sending
      |--------------------------------------------------------------------------
      */

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

        /*
        |--------------------------------------------------------------------------
        | Skills
        |--------------------------------------------------------------------------
        */

        skills,

        skillDetails,

        certifications,

        employmentHistory,

        education,

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
  |
  | Purely derived from form state already loaded above -- does not touch
  | the save/load logic. Powers the LinkedIn-style "finish your profile"
  | nudge on the hero card.
  |
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
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-24 animate-pulse bg-slate-200" />
          <div className="px-6 pb-6">
            <div className="-mt-10 h-20 w-20 animate-pulse rounded-2xl border-4 border-white bg-slate-300" />
            <div className="mt-4 h-5 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* ================================================================
          PAGE TITLE + STICKY ACTION BAR
      ================================================================= */}

      <div className="sticky top-0 z-20 -mx-4 flex flex-col justify-between gap-3 border-b border-transparent bg-slate-50/95 px-4 py-3 backdrop-blur sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Profile</h1>

          <p className="text-sm text-slate-500">
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
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FiEdit2 size={15} />
            Edit profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <FiX size={15} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

      {success && (
        <Message type="success" icon={FiCheckCircle}>
          {success}
        </Message>
      )}

      {/* ================================================================
          HERO -- banner + overlapping avatar, LinkedIn-style
      ================================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-500 sm:h-28" />

        <div className="px-6 pb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-2xl font-bold text-white shadow-sm sm:h-24 sm:w-24">
                {getInitials(form.name)}
              </div>

              <div className="min-w-0 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {form.name || "Trainer"}
                  </h2>

                  {form.profileVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      <FiShield size={11} />
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-sm font-medium text-slate-600">
                  {form.professionalHeadline ||
                    form.currentDesignation ||
                    "Professional Trainer"}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <FiMail size={12} />
                    {form.email || "—"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <FiPhone size={12} />
                    {form.phone || "—"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <FiMapPin size={12} />
                    {[form.city, form.state, form.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1 sm:pt-0">
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
        <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-blue-900">
              Finish setting up your profile
            </p>

            <p className="text-xs font-medium text-blue-700">
              {checklist.length - nextChecklistItems.length}/{checklist.length}{" "}
              complete
            </p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {nextChecklistItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSection(item.id)}
                className="group flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-white px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
              >
                {item.label}

                <FiArrowRight
                  size={14}
                  className="shrink-0 text-blue-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
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
          <p className="mt-4 text-xs text-slate-400">
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
        <div className="space-y-5">
          <Field
            label="Professional Headline"
            name="professionalHeadline"
            value={form.professionalHeadline}
            editing={editing}
            onChange={handleChange}
            placeholder="e.g. AWS & DevOps Corporate Trainer"
          />

          <div className="grid gap-5 md:grid-cols-2">
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
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.professionalSummary.length}
                  /3000
                </p>
              </>
            ) : (
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
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
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Matching Skills
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {form.skillDetails.map((skill, index) => (
                <span
                  key={skill._id || `${skill.name}-${index}`}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600"
                >
                  {skill.name}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-400">
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
            <label className="mt-3 flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
              <input
                type="checkbox"
                name="willingToTravel"
                checked={form.willingToTravel}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600"
              />

              <span className="text-sm font-medium text-slate-700">
                I am willing to travel for classroom training.
              </span>
            </label>
          ) : (
            <p className="mt-2 text-sm font-medium text-slate-700">
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
          PROFESSIONAL LINKS
      ================================================================= */}

      <Section
        id="section-links"
        title="Professional Links"
        description="Links and documents Nxthack can use to review your professional background."
        icon={FiLinkedin}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <LinkField
            label="Resume URL"
            name="resumeUrl"
            value={form.resumeUrl}
            editing={editing}
            onChange={handleChange}
            placeholder="https://..."
          />

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

        <p className="mt-5 text-xs leading-5 text-slate-400">
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
    className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300"
  >
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>

      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
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
        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    ) : (
      <p className="mt-1.5 text-sm font-medium text-slate-800">
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
        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    ) : value ? (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="mt-1.5 flex w-fit items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
      >
        View
        <FiExternalLink size={13} />
      </a>
    ) : (
      <p className="mt-1.5 text-sm text-slate-400">—</p>
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
  <span className="group inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 py-1.5 pl-3 pr-1.5 text-sm font-medium text-blue-700 transition hover:border-blue-200">
    {value}

    {removable && (
      <button
        type="button"
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full text-blue-400 transition hover:bg-red-100 hover:text-red-600"
        aria-label={`Remove ${value}`}
      >
        <FiX size={11} />
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
      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
    />

    <button
      type="button"
      onClick={onAdd}
      aria-label="Add"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
    >
      <FiPlus size={15} />
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
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    BUSY: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    UNAVAILABLE: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };

  const meta = styles[value] || {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${meta.bg} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
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

  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const tone =
    percentage >= 80 ? "#2563eb" : percentage >= 40 ? "#d97706" : "#dc2626";

  const strengthLabel =
    percentage >= 80 ? "Strong" : percentage >= 40 ? "Fair" : "Weak";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
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
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800">
          {percentage}%
        </div>
      </div>

      <span className="text-[11px] font-medium text-slate-500">
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
  <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1.5 break-words text-sm font-bold text-slate-800">
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
  <span className="text-sm text-slate-400">{children}</span>
);

/*
|--------------------------------------------------------------------------
| Message
|--------------------------------------------------------------------------
*/

const Message = ({ type, icon: Icon, children }) => {
  const style =
    type === "success"
      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
      : "border-red-500 bg-red-50 text-red-800";

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border-l-4 bg-white px-4 py-3 text-sm shadow-sm ${style}`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />

      <span className="font-medium">{children}</span>
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
