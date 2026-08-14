/*
|--------------------------------------------------------------------------
| Trainer Adapter
|--------------------------------------------------------------------------
|
| Converts:
|
| Backend Trainer
|       ↕
| Frontend Trainer
|
| This allows the existing UI components to use their current field names
| without forcing the backend schema to match the UI exactly.
|
*/

/*
|--------------------------------------------------------------------------
| Training Mode Mapping
|--------------------------------------------------------------------------
*/

const TRAINING_MODE_TO_API = {
  Online: "ONLINE",
  Offline: "OFFLINE",
};

const TRAINING_MODE_FROM_API = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Online",
};

/*
|--------------------------------------------------------------------------
| API Trainer -> Frontend Trainer
|--------------------------------------------------------------------------
*/

export const mapTrainerFromApi = (trainer = {}) => {
  return {
    /*
    |--------------------------------------------------------------------------
    | Identity
    |--------------------------------------------------------------------------
    */

    id: trainer._id || trainer.id || "",

    name: trainer.name || "",

    email: trainer.email || "",

    phone: trainer.phone || "",

    /*
    |--------------------------------------------------------------------------
    | Location
    |--------------------------------------------------------------------------
    */

    city: trainer.city || "",

    state: trainer.state || "",

    /*
    |--------------------------------------------------------------------------
    | Skills
    |--------------------------------------------------------------------------
    */

    skills: Array.isArray(trainer.skills) ? trainer.skills : [],

    /*
    |--------------------------------------------------------------------------
    | Experience
    |--------------------------------------------------------------------------
    */

    experienceYears: trainer.experience ?? 0,

    trainingExperienceYears: trainer.trainingExperienceYears ?? 0,

    /*
    |--------------------------------------------------------------------------
    | Rates
    |--------------------------------------------------------------------------
    */

    rateCard: trainer.rateCard || {
      hourlyRate: trainer.hourlyRate ?? null,
      dailyRate: trainer.dailyRate ?? null,
      batchRate: trainer.batchRate ?? null,
      fixedProjectRate: trainer.fixedProjectRate ?? null,
      currency: trainer.currency || "INR",
    },

    hourlyRate: trainer.rateCard?.hourlyRate ?? trainer.hourlyRate ?? null,

    dailyRate: trainer.rateCard?.dailyRate ?? trainer.dailyRate ?? null,

    batchRate: trainer.rateCard?.batchRate ?? trainer.batchRate ?? null,

    fixedProjectRate: trainer.rateCard?.fixedProjectRate ?? trainer.fixedProjectRate ?? null,

    currency: trainer.rateCard?.currency || trainer.currency || "INR",

    onlineRate: trainer.rateCard?.hourlyRate ?? trainer.hourlyRate ?? 0,

    offlineRate: trainer.rateCard?.dailyRate ?? trainer.dailyRate ?? 0,

    /*
    |--------------------------------------------------------------------------
    | Availability
    |--------------------------------------------------------------------------
    */

    availability: trainer.availabilityStatus || "AVAILABLE",

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    status: trainer.status || "ACTIVE",

    /*
    |--------------------------------------------------------------------------
    | Training Types
    |--------------------------------------------------------------------------
    */

    trainingTypes: Array.isArray(trainer.trainingTypes)
      ? trainer.trainingTypes
      : [],

    /*
    |--------------------------------------------------------------------------
    | Training Modes
    |--------------------------------------------------------------------------
    */

    modes: Array.isArray(trainer.trainingModes)
      ? trainer.trainingModes.map(
          (mode) => TRAINING_MODE_FROM_API[mode] || mode,
        )
      : [],

    /*
    |--------------------------------------------------------------------------
    | Preferred Locations
    |--------------------------------------------------------------------------
    */

    preferredLocations: Array.isArray(trainer.preferredLocations)
      ? trainer.preferredLocations
      : [],

    /*
    |--------------------------------------------------------------------------
    | Resume
    |--------------------------------------------------------------------------
    */

    cvUrl: trainer.resumeUrl || "",

    /*
    |--------------------------------------------------------------------------
    | Profile Photo
    |--------------------------------------------------------------------------
    */

    profilePhotoUrl: trainer.profilePhotoUrl || "",

    /*
    |--------------------------------------------------------------------------
    | Languages
    |--------------------------------------------------------------------------
    */

    languages: Array.isArray(trainer.languages) ? trainer.languages : [],

    professionalHeadline: trainer.professionalHeadline || "",

    professionalSummary: trainer.professionalSummary || "",

    currentDesignation: trainer.currentDesignation || "",

    currentOrganization: trainer.currentOrganization || "",

    projects: Array.isArray(trainer.projects) ? trainer.projects : [],

    /*
    |--------------------------------------------------------------------------
    | Performance
    |--------------------------------------------------------------------------
    */

    rating: trainer.rating ?? 0,

    assignmentsCompleted: trainer.totalTrainings ?? 0,

    /*
    |--------------------------------------------------------------------------
    | Portal Access
    |--------------------------------------------------------------------------
    |
    | These fields are required by TrainerDetailsPage to determine whether
    | the trainer has accepted the invitation and activated portal access.
    |
    */

    portalEnabled: Boolean(
      trainer.userId ||
      trainer.portalEnabled ||
      (trainer.onboardingStatus && trainer.onboardingStatus !== "INVITED"),
    ),

    invitationStatus: trainer.invitationStatus || "NOT_INVITED",

    invitationExpiresAt: trainer.invitationExpiresAt || null,

    invitationRemindersSentCount: trainer.invitationRemindersSentCount || 0,

    userId: trainer.userId || null,

    onboardingStatus: trainer.onboardingStatus || "INVITED",

    accountActivatedAt: trainer.accountActivatedAt || null,

    invitedAt: trainer.invitedAt || null,

    /*
    |--------------------------------------------------------------------------
    | Metadata
    |--------------------------------------------------------------------------
    */

    createdAt: trainer.createdAt || null,

    updatedAt: trainer.updatedAt || null,
  };
};

/*
|--------------------------------------------------------------------------
| Frontend Trainer -> API Payload
|--------------------------------------------------------------------------
*/

export const mapTrainerToApi = (form = {}) => {
  return {
    /*
    |--------------------------------------------------------------------------
    | Identity
    |--------------------------------------------------------------------------
    */

    name: form.name?.trim() || "",

    email: form.email?.trim().toLowerCase() || "",

    phone: form.phone?.trim() || "",

    /*
    |--------------------------------------------------------------------------
    | Location
    |--------------------------------------------------------------------------
    */

    city: form.city?.trim() || "",

    state: form.state?.trim() || "",

    /*
    |--------------------------------------------------------------------------
    | Skills
    |--------------------------------------------------------------------------
    */

    skills: Array.isArray(form.skills) ? form.skills : [],

    /*
    |--------------------------------------------------------------------------
    | Experience
    |--------------------------------------------------------------------------
    */

    experience: Number(form.experienceYears) || 0,

    /*
    |--------------------------------------------------------------------------
    | Rates
    |--------------------------------------------------------------------------
    */

    hourlyRate: form.hourlyRate !== undefined && form.hourlyRate !== null && form.hourlyRate !== "" ? Number(form.hourlyRate) : (Number(form.onlineRate) || null),

    dailyRate: form.dailyRate !== undefined && form.dailyRate !== null && form.dailyRate !== "" ? Number(form.dailyRate) : (Number(form.offlineRate) || null),

    batchRate: form.batchRate !== undefined && form.batchRate !== null && form.batchRate !== "" ? Number(form.batchRate) : null,

    fixedProjectRate: form.fixedProjectRate !== undefined && form.fixedProjectRate !== null && form.fixedProjectRate !== "" ? Number(form.fixedProjectRate) : null,

    currency: form.currency || "INR",

    rateCard: {
      hourlyRate: form.hourlyRate !== undefined && form.hourlyRate !== null && form.hourlyRate !== "" ? Number(form.hourlyRate) : (Number(form.onlineRate) || null),
      dailyRate: form.dailyRate !== undefined && form.dailyRate !== null && form.dailyRate !== "" ? Number(form.dailyRate) : (Number(form.offlineRate) || null),
      batchRate: form.batchRate !== undefined && form.batchRate !== null && form.batchRate !== "" ? Number(form.batchRate) : null,
      fixedProjectRate: form.fixedProjectRate !== undefined && form.fixedProjectRate !== null && form.fixedProjectRate !== "" ? Number(form.fixedProjectRate) : null,
      currency: form.currency || "INR",
    },

    /*
    |--------------------------------------------------------------------------
    | Availability
    |--------------------------------------------------------------------------
    */

    availabilityStatus: form.availability || "AVAILABLE",

    /*
    |--------------------------------------------------------------------------
    | Status
    |--------------------------------------------------------------------------
    */

    status: form.status || "ACTIVE",

    /*
    |--------------------------------------------------------------------------
    | Training Modes
    |--------------------------------------------------------------------------
    */

    trainingModes: Array.isArray(form.modes)
      ? form.modes.map(
          (mode) => TRAINING_MODE_TO_API[mode] || String(mode).toUpperCase(),
        )
      : [],

    /*
    |--------------------------------------------------------------------------
    | Preferred Locations
    |--------------------------------------------------------------------------
    */

    preferredLocations: Array.isArray(form.preferredLocations)
      ? form.preferredLocations
      : String(form.preferredLocations || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

    /*
    |--------------------------------------------------------------------------
    | Resume
    |--------------------------------------------------------------------------
    |
    | Deliberately NOT setting resumeUrl here. Now that resumes are
    | uploaded as files (see File Uploads below) rather than pasted as a
    | URL, resumeUrl should only ever be written by the backend's upload
    | handling. Sending resumeUrl: "" here on every save (when no new file
    | is chosen) would silently wipe out an existing resume on update.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Training Types
    |--------------------------------------------------------------------------
    |
    | Current backend does not have a dedicated trainingTypes field.
    | Preserve them through tags for now.
    |
    */

    tags: Array.isArray(form.trainingTypes) ? form.trainingTypes : [],

    professionalHeadline: form.professionalHeadline?.trim() || "",

    professionalSummary: form.professionalSummary?.trim() || "",

    currentDesignation: form.currentDesignation?.trim() || "",

    currentOrganization: form.currentOrganization?.trim() || "",

    projects: Array.isArray(form.projects) ? form.projects : [],

    /*
    |--------------------------------------------------------------------------
    | File Uploads
    |--------------------------------------------------------------------------
    |
    | Passed through untouched (not renamed/transformed like the fields
    | above) so trainersApi.create/update can detect them and switch to a
    | multipart request. Only present when TrainerForm's file inputs were
    | used this session - see TrainerForm.jsx handleSubmit.
    |
    */

    ...(form.profilePhotoFile
      ? { profilePhotoFile: form.profilePhotoFile }
      : {}),
    ...(form.resumeFile ? { resumeFile: form.resumeFile } : {}),
  };
};
