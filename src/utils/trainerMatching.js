const normalize = (value = "") => String(value).trim().toLowerCase();

const normalizeArray = (values = []) =>
  Array.isArray(values) ? values.map((value) => normalize(value)) : [];

const getTrainerSkills = (trainer) => {
  if (Array.isArray(trainer.skills)) {
    return trainer.skills;
  }

  if (Array.isArray(trainer.technologies)) {
    return trainer.technologies;
  }

  return [];
};

const getTrainerExperience = (trainer) => {
  return Number(
    trainer.experience ??
      trainer.yearsOfExperience ??
      trainer.totalExperience ??
      0,
  );
};

const getTrainerRate = (trainer) => {
  return Number(trainer.dailyRate ?? trainer.rate ?? trainer.expectedRate ?? 0);
};

const getTrainerCity = (trainer) => {
  return trainer.city ?? trainer.location ?? "";
};

const getTrainingModes = (trainer) => {
  if (Array.isArray(trainer.trainingModes)) {
    return trainer.trainingModes;
  }

  if (Array.isArray(trainer.modes)) {
    return trainer.modes;
  }

  if (trainer.mode) {
    return [trainer.mode];
  }

  return [];
};

const isTrainerAvailable = (trainer) => {
  if (typeof trainer.available === "boolean") {
    return trainer.available;
  }

  if (trainer.availabilityStatus) {
    return normalize(trainer.availabilityStatus) === "available";
  }

  if (trainer.availability) {
    return normalize(trainer.availability) === "available";
  }

  return true;
};

export const calculateTrainerMatch = (trainer, requirement) => {
  /*
    SCORE WEIGHTS

    Skills       = 40
    Location     = 15
    Experience   = 15
    Budget       = 15
    Mode         = 10
    Availability = 5

    TOTAL        = 100
  */

  let totalScore = 0;

  /*
   * SKILLS
   */

  const requiredSkills = normalizeArray(requirement.skills);

  const trainerSkills = normalizeArray(getTrainerSkills(trainer));

  const matchedSkills = requiredSkills.filter((requiredSkill) =>
    trainerSkills.includes(requiredSkill),
  );

  const missingSkills = requiredSkills.filter(
    (requiredSkill) => !trainerSkills.includes(requiredSkill),
  );

  const skillScore =
    requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 40)
      : 40;

  totalScore += skillScore;

  /*
   * LOCATION
   */

  const trainerCity = normalize(getTrainerCity(trainer));

  const requirementCity = normalize(requirement.city);

  let locationScore = 0;

  if (normalize(requirement.mode) === "online") {
    locationScore = 15;
  } else if (
    trainerCity &&
    requirementCity &&
    trainerCity === requirementCity
  ) {
    locationScore = 15;
  }

  totalScore += locationScore;

  /*
   * EXPERIENCE
   */

  const trainerExperience = getTrainerExperience(trainer);

  const requiredExperience = Number(requirement.experienceRequired || 0);

  let experienceScore = 0;

  if (requiredExperience === 0) {
    experienceScore = 15;
  } else if (trainerExperience >= requiredExperience) {
    experienceScore = 15;
  } else {
    experienceScore = Math.round((trainerExperience / requiredExperience) * 15);
  }

  totalScore += experienceScore;

  /*
   * BUDGET
   */

  const trainerRate = getTrainerRate(trainer);

  const vendorBudget = Number(requirement.budget || 0);

  let budgetScore = 0;

  if (!trainerRate || !vendorBudget) {
    budgetScore = 8;
  } else if (trainerRate <= vendorBudget) {
    budgetScore = 15;
  } else {
    const difference = trainerRate - vendorBudget;

    const percentageOver = difference / vendorBudget;

    if (percentageOver <= 0.1) {
      budgetScore = 10;
    } else if (percentageOver <= 0.25) {
      budgetScore = 5;
    }
  }

  totalScore += budgetScore;

  /*
   * TRAINING MODE
   */

  const trainingModes = normalizeArray(getTrainingModes(trainer));

  const requiredMode = normalize(requirement.mode);

  let modeScore = 0;

  if (trainingModes.length === 0 || trainingModes.includes(requiredMode)) {
    modeScore = 10;
  }

  totalScore += modeScore;

  /*
   * AVAILABILITY
   */

  const available = isTrainerAvailable(trainer);

  const availabilityScore = available ? 5 : 0;

  totalScore += availabilityScore;

  return {
    score: Math.min(100, Math.round(totalScore)),

    breakdown: {
      skills: {
        score: skillScore,
        max: 40,
        matched: matchedSkills,
        missing: missingSkills,
      },

      location: {
        score: locationScore,
        max: 15,
        matched: locationScore === 15,
      },

      experience: {
        score: experienceScore,
        max: 15,
        trainerExperience,
        requiredExperience,
      },

      budget: {
        score: budgetScore,
        max: 15,
        trainerRate,
        vendorBudget,
      },

      mode: {
        score: modeScore,
        max: 10,
        matched: modeScore === 10,
      },

      availability: {
        score: availabilityScore,
        max: 5,
        available,
      },
    },
  };
};

export const rankTrainers = (trainers, requirement) => {
  return trainers
    .map((trainer) => ({
      ...trainer,
      match: calculateTrainerMatch(trainer, requirement),
    }))
    .sort((a, b) => b.match.score - a.match.score);
};
