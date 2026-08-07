// The scoring algorithm is shared with the backend so automatic opportunity
// generation and the existing admin match view always use identical rules.
export { calculateTrainerMatch, rankTrainers } from "../../../shared/trainerMatching.js";
