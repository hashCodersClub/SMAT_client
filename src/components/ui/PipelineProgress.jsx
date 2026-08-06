import { FiCheck } from "react-icons/fi";

import { REQUIREMENT_PIPELINE, formatStatusLabel } from "../../constants/statuses";

const PipelineProgress = ({ currentStatus, compact = false }) => {
  if (currentStatus === "CANCELLED") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-medium text-red-700">
          This requirement has been cancelled.
        </p>
      </div>
    );
  }

  const flow = REQUIREMENT_PIPELINE.map((s) => s.key);
  const currentIndex = flow.indexOf(currentStatus);

  if (compact) {
    const stage = REQUIREMENT_PIPELINE.find((s) => s.key === currentStatus);
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">
          Stage {Math.max(currentIndex + 1, 1)} of {flow.length}
        </span>
        <span className="text-sm font-medium text-slate-900">
          {stage?.label || formatStatusLabel(currentStatus)}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[720px] items-center">
        {REQUIREMENT_PIPELINE.map((stage, index) => {
          const completed = currentIndex >= 0 && index < currentIndex;
          const active = stage.key === currentStatus;
          const reached = currentIndex >= 0 && index <= currentIndex;

          return (
            <div key={stage.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? "bg-slate-900 text-white ring-4 ring-slate-100"
                      : reached
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {completed ? <FiCheck className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <p
                  className={`mt-2 max-w-[80px] text-center text-[10px] font-medium leading-tight ${
                    active
                      ? "text-slate-900"
                      : reached
                        ? "text-slate-600"
                        : "text-slate-400"
                  }`}
                >
                  {stage.label}
                </p>
              </div>
              {index < REQUIREMENT_PIPELINE.length - 1 && (
                <div
                  className={`mx-1 mb-5 h-px flex-1 ${
                    index < currentIndex ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineProgress;
