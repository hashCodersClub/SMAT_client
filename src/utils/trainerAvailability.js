import { trainerAvailability } from "../data/trainerAvailability";

const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const datesOverlap = (startA, endA, startB, endB) => {
  const aStart = normalizeDate(startA);
  const aEnd = normalizeDate(endA);

  const bStart = normalizeDate(startB);
  const bEnd = normalizeDate(endB);

  if (!aStart || !aEnd || !bStart || !bEnd) {
    return false;
  }

  return aStart <= bEnd && aEnd >= bStart;
};

export const getTrainerBlocks = (trainerId) => {
  return trainerAvailability.filter((item) => item.trainerId === trainerId);
};

export const getTrainerConflicts = (trainerId, startDate, endDate) => {
  return getTrainerBlocks(trainerId).filter((block) =>
    datesOverlap(startDate, endDate, block.startDate, block.endDate),
  );
};

export const isTrainerAvailableForDates = (trainerId, startDate, endDate) => {
  if (!startDate || !endDate) {
    return true;
  }

  return getTrainerConflicts(trainerId, startDate, endDate).length === 0;
};
