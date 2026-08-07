// Self-contained trainer matching engine for client browser & container builds.

const normalize = (value = "") => String(value).trim().toLowerCase();

const normalizeArray = (values = []) =>
  Array.isArray(values) ? values.map((value) => normalize(value)) : [];

const getTrainerSkills = (trainer) => {
  if (Array.isArray(trainer.skills)) return trainer.skills;
  if (Array.isArray(trainer.technologies)) return trainer.technologies;
  return [];
};

const getTrainerExperience = (trainer) =>
  Number(trainer.experience ?? trainer.yearsOfExperience ?? trainer.totalExperience ?? 0);

const getTrainerRate = (trainer) =>
  Number(trainer.dailyRate ?? trainer.rate ?? trainer.expectedRate ?? 0);

const getTrainerCity = (trainer) => trainer.city ?? trainer.location ?? "";

const getTrainingModes = (trainer) => {
  if (Array.isArray(trainer.trainingModes)) return trainer.trainingModes;
  if (Array.isArray(trainer.modes)) return trainer.modes;
  return trainer.mode ? [trainer.mode] : [];
};

const isTrainerAvailable = (trainer) => {
  if (typeof trainer.available === "boolean") return trainer.available;
  if (trainer.availabilityStatus) return normalize(trainer.availabilityStatus) === "available";
  if (trainer.availability) return normalize(trainer.availability) === "available";
  return true;
};

export const calculateTrainerMatch = (trainer, requirement) => {
  let totalScore = 0;
  const requiredSkills = normalizeArray(requirement.skills);
  const trainerSkills = normalizeArray(getTrainerSkills(trainer));
  const matchedSkills = requiredSkills.filter((requiredSkill) => trainerSkills.includes(requiredSkill));
  const missingSkills = requiredSkills.filter((requiredSkill) => !trainerSkills.includes(requiredSkill));
  const skillScore = requiredSkills.length > 0 ? Math.round((matchedSkills.length / requiredSkills.length) * 35) : 35;
  totalScore += skillScore;

  const trainerCity = normalize(getTrainerCity(trainer));
  const requirementCity = normalize(requirement.city);
  let locationScore = 0;
  if (normalize(requirement.mode) === "online") locationScore = 15;
  else if (trainerCity && requirementCity && trainerCity === requirementCity) locationScore = 15;
  totalScore += locationScore;

  const trainerExperience = getTrainerExperience(trainer);
  const requiredExperience = Number(requirement.experienceRequired || 0);
  const experienceScore = requiredExperience === 0
    ? 15
    : trainerExperience >= requiredExperience
      ? 15
      : Math.round((trainerExperience / requiredExperience) * 15);
  totalScore += experienceScore;

  const trainerRate = getTrainerRate(trainer);
  const vendorBudget = Number(requirement.budget || 0);
  let budgetScore = 0;
  if (!trainerRate || !vendorBudget) budgetScore = 8;
  else if (trainerRate <= vendorBudget) budgetScore = 15;
  else {
    const percentageOver = (trainerRate - vendorBudget) / vendorBudget;
    if (percentageOver <= 0.1) budgetScore = 10;
    else if (percentageOver <= 0.25) budgetScore = 5;
  }
  totalScore += budgetScore;

  const trainingModes = normalizeArray(getTrainingModes(trainer));
  const requiredMode = normalize(requirement.mode);
  const modeScore = trainingModes.length === 0 || trainingModes.includes(requiredMode) ? 10 : 0;
  totalScore += modeScore;

  const available = isTrainerAvailable(trainer);
  const availabilityScore = available ? 5 : 0;
  totalScore += availabilityScore;

  const hasReliabilityHistory = typeof trainer.reliabilityScore === "number";
  const reliabilityScore = hasReliabilityHistory ? Math.round((trainer.reliabilityScore / 100) * 5) : 3;
  totalScore += reliabilityScore;

  const aiInsights = [];
  if (matchedSkills.length > 0) aiInsights.push(`Matches ${matchedSkills.length} key skill(s): ${matchedSkills.join(", ")}.`);
  if (missingSkills.length > 0) aiInsights.push(`Missing skills: ${missingSkills.join(", ")}.`);
  if (trainerExperience >= requiredExperience) aiInsights.push(`Meets experience requirement (${trainerExperience} years vs ${requiredExperience} required).`);
  else if (requiredExperience > 0) aiInsights.push(`Under required experience (${trainerExperience} years vs ${requiredExperience} required).`);
  if (trainerRate && vendorBudget && trainerRate <= vendorBudget) aiInsights.push(`Within daily rate budget (${trainerRate} <= ${vendorBudget}).`);
  if (hasReliabilityHistory && trainer.reliabilityScore >= 80) aiInsights.push(`Strong track record (reliability score ${trainer.reliabilityScore}/100).`);
  else if (hasReliabilityHistory && trainer.reliabilityScore < 50) aiInsights.push(`Below-average track record (reliability score ${trainer.reliabilityScore}/100).`);

  const roundedScore = Math.min(100, Math.round(totalScore));
  let recommendationLevel = "LOW";
  if (roundedScore >= 80) recommendationLevel = "HIGH";
  else if (roundedScore >= 60) recommendationLevel = "MEDIUM";

  return {
    score: roundedScore,
    recommendationLevel,
    aiInsights,
    breakdown: {
      skills: { score: skillScore, max: 35, matched: matchedSkills, missing: missingSkills },
      location: { score: locationScore, max: 15, matched: locationScore === 15 },
      experience: { score: experienceScore, max: 15, trainerExperience, requiredExperience },
      budget: { score: budgetScore, max: 15, trainerRate, vendorBudget },
      mode: { score: modeScore, max: 10, matched: modeScore === 10 },
      availability: { score: availabilityScore, max: 5, available },
      reliability: { score: reliabilityScore, max: 5, reliabilityScore: hasReliabilityHistory ? trainer.reliabilityScore : null },
    },
  };
};

export const rankTrainers = (trainers, requirement) =>
  trainers
    .map((trainer) => ({ ...trainer, match: calculateTrainerMatch(trainer, requirement) }))
    .sort((a, b) => b.match.score - a.match.score);
