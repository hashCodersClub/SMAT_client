/*
|--------------------------------------------------------------------------
| Trainer Adapter
|--------------------------------------------------------------------------
|
| The existing Trainer UI (TrainerForm, TrainerTable, TrainerStats,
| TrainerDetailsPage) was built against the mock data shape in
| `data/trainers.js`. The real backend (Trainer model / trainer.controller)
| uses different field names.
|
| Rather than rewrite every component, this adapter translates between
| the two shapes so the existing UI keeps working unchanged while the
| pages talk to the real API.
|
| Known limitations (backend has no matching field, so these do not
| persist across a reload):
|   - trainingExperienceYears
|   - trainingTypes (currently folded into `tags` as a best-effort so the
|     information isn't silently dropped, but it will merge with any
|     other tags on the trainer)
|
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
| Map API Trainer -> Form / Table shape
|--------------------------------------------------------------------------
*/

export const mapTrainerFromApi = (trainer = {}) => {
  return {
    id: trainer._id || trainer.id || "",

    name: trainer.name || "",
    email: trainer.email || "",
    phone: trainer.phone || "",

    city: trainer.city || "",
    state: trainer.state || "",

    skills: trainer.skills || [],

    experienceYears: trainer.experience ?? 0,
    trainingExperienceYears: trainer.trainingExperienceYears ?? 0,

    onlineRate: trainer.hourlyRate ?? 0,
    offlineRate: trainer.dailyRate ?? 0,

    availability: trainer.availabilityStatus || "AVAILABLE",
    status: trainer.status || "ACTIVE",

    trainingTypes: trainer.trainingTypes || [],

    modes: (trainer.trainingModes || []).map(
      (mode) => TRAINING_MODE_FROM_API[mode] || mode,
    ),

    preferredLocations: trainer.preferredLocations || [],

    cvUrl: trainer.resumeUrl || "",

    rating: trainer.rating ?? 0,
    assignmentsCompleted: trainer.totalTrainings ?? 0,
  };
};

/*
|--------------------------------------------------------------------------
| Map Form Submission -> API Payload
|--------------------------------------------------------------------------
*/

export const mapTrainerToApi = (form = {}) => {
  return {
    name: form.name,
    email: form.email,
    phone: form.phone,

    city: form.city,
    state: form.state,

    skills: form.skills || [],

    experience: Number(form.experienceYears) || 0,

    hourlyRate: Number(form.onlineRate) || 0,
    dailyRate: Number(form.offlineRate) || 0,

    availabilityStatus: form.availability,
    status: form.status,

    trainingModes: (form.modes || []).map(
      (mode) => TRAINING_MODE_TO_API[mode] || mode.toUpperCase(),
    ),

    preferredLocations: Array.isArray(form.preferredLocations)
      ? form.preferredLocations
      : String(form.preferredLocations || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

    resumeUrl: form.cvUrl || "",

    // Best-effort: training types have no dedicated backend field yet.
    tags: form.trainingTypes || [],
  };
};
