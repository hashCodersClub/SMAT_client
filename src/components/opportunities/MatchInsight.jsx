import { useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiMapPin,
  FiZap,
} from "react-icons/fi";

const MatchInsight = ({ matchScore, breakdown, insights = [], compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  const score = matchScore ?? 0;
  const isHigh = score >= 80;
  const isMedium = score >= 60 && score < 80;

  const badgeStyle = isHigh
    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-emerald-500/10"
    : isMedium
      ? "bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-indigo-500/10"
      : "bg-amber-50 text-amber-700 border-amber-200/80 shadow-amber-500/10";

  const barStyle = isHigh
    ? "from-emerald-500 to-teal-500"
    : isMedium
      ? "from-indigo-500 to-purple-500"
      : "from-amber-500 to-orange-500";

  // Synthesize bullet points if breakdown exists
  const bulletPoints = [];
  if (breakdown?.skills?.matched?.length > 0) {
    bulletPoints.push({
      label: `Expertise in ${breakdown.skills.matched.join(", ")}`,
      icon: FiCheckCircle,
    });
  }
  if (breakdown?.availability?.available) {
    bulletPoints.push({
      label: "Available During Required Dates",
      icon: FiCalendar,
    });
  }
  if (breakdown?.location?.matched) {
    bulletPoints.push({
      label: "Same Region / Location Fit",
      icon: FiMapPin,
    });
  }
  if (breakdown?.experience?.trainerExperience >= (breakdown?.experience?.requiredExperience || 0)) {
    bulletPoints.push({
      label: `Meets Experience Requirement (${breakdown.experience.trainerExperience} yrs)`,
      icon: FiBriefcase,
    });
  }
  if (breakdown?.budget?.score > 8) {
    bulletPoints.push({
      label: "Within Target Daily Rate Budget",
      icon: FiDollarSign,
    });
  }

  // Fallback to AI Insights string list if available
  if (bulletPoints.length === 0 && Array.isArray(insights) && insights.length > 0) {
    insights.forEach((text) => {
      bulletPoints.push({ label: text, icon: FiCheckCircle });
    });
  }

  // Default fallbacks if no detailed breakdown is attached
  if (bulletPoints.length === 0) {
    if (score >= 80) {
      bulletPoints.push({ label: "High Skill & Experience Alignment", icon: FiCheckCircle });
      bulletPoints.push({ label: "Available During Requested Dates", icon: FiCalendar });
    } else {
      bulletPoints.push({ label: "Partial Skill Match", icon: FiCheckCircle });
    }
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeStyle}`}
        >
          <FiZap size={12} />
          {score}% Match
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-extrabold shadow-sm ${badgeStyle}`}
          >
            <FiZap size={15} />
            <span>{score}% Match</span>
          </div>

          <div className="hidden sm:block text-xs font-semibold text-slate-500">
            {isHigh ? "Strong Match" : isMedium ? "Good Match" : "Potential Match"}
          </div>
        </div>

        {bulletPoints.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 transition hover:text-slate-800"
          >
            {expanded ? "Hide Details" : "Why matched?"}
            {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Score Meter Bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barStyle} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Match Reasons Bullet List */}
      {(expanded || !compact) && bulletPoints.length > 0 && (
        <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3">
          {bulletPoints.map((item, index) => {
            const IconComponent = item.icon || FiCheckCircle;
            return (
              <div
                key={index}
                className="flex items-center gap-2 text-xs font-medium text-slate-700"
              >
                <IconComponent size={14} className="shrink-0 text-emerald-600" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchInsight;
