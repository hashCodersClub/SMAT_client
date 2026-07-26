import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const AvailabilityBadge = ({ available }) => {
  return available ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      <FiCheckCircle />
      Available
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
      <FiAlertCircle />
      Date Conflict
    </span>
  );
};

export default AvailabilityBadge;
