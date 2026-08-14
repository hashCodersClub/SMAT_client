import { useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiCreditCard,
  FiArrowRight,
  FiLoader,
  FiCheck,
} from "react-icons/fi";

const STEPS = [
  { key: "SENT", label: "Invoice Sent", icon: FiClock },
  { key: "AWAITING", label: "Awaiting Client Payment", icon: FiDollarSign },
  { key: "CLIENT_PAID", label: "Client Payment Received", icon: FiCheckCircle },
  { key: "PAYOUT_DUE", label: "Trainer Payout Due", icon: FiCreditCard },
  { key: "TRAINER_PAID", label: "Trainer Paid & Closed", icon: FiCheck },
];

const PaymentWorkflowTracker = ({
  status = "SENT",
  clientAmount = 0,
  trainerAmount = 0,
  marginAmount = 0,
  marginPercent = 0,
  userRole = "ADMIN",
  onRecordClientPayment,
  onReleaseTrainerPayout,
}) => {
  const [updating, setUpdating] = useState(false);

  const getStepIndex = (st) => {
    switch (st) {
      case "DRAFT":
      case "SENT":
        return 0;
      case "AWAITING":
      case "PARTIAL":
        return 1;
      case "PAID":
      case "CLIENT_PAID":
        return 2;
      case "PAYOUT_DUE":
        return 3;
      case "COMPLETED":
      case "TRAINER_PAID":
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);
  const isInternal = ["ADMIN", "SUPER_ADMIN", "OPERATIONS"].includes(userRole);

  const handleAction = async (fn) => {
    if (!fn) return;
    try {
      setUpdating(true);
      await fn();
    } catch (err) {
      console.error("Payment action error:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
            Payment & Settlement Workflow
          </span>
          <h3 className="text-lg font-black text-slate-900">
            Commercial Settlement Lifecycle
          </h3>
        </div>

        {isInternal && (
          <div className="flex flex-wrap gap-2">
            {currentIndex < 2 && onRecordClientPayment && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleAction(onRecordClientPayment)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {updating ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                Record Client Payment
              </button>
            )}

            {currentIndex >= 2 && currentIndex < 4 && onReleaseTrainerPayout && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleAction(onReleaseTrainerPayout)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-extrabold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {updating ? <FiLoader className="animate-spin" /> : <FiCreditCard />}
                Release Trainer Payout
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.key}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all ${
                isCurrent
                  ? "border-indigo-600 bg-indigo-50/60 shadow-md shadow-indigo-500/10"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200/80 bg-slate-50/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${
                    isCurrent
                      ? "bg-indigo-600 text-white"
                      : isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Icon size={14} />
                </div>
                <span className="text-[10px] font-extrabold text-slate-400">Step {idx + 1}</span>
              </div>

              <div className="mt-3">
                <p
                  className={`text-xs font-extrabold ${
                    isCurrent ? "text-indigo-950" : isDone ? "text-emerald-950" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
                <span className="text-[10px] font-semibold text-slate-400">
                  {isCurrent ? "Active Stage" : isDone ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Role-Based Financial Summary Bar */}
      {isInternal && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Client Billing</span>
            <p className="mt-0.5 text-base font-black text-slate-900">
              ₹{Number(clientAmount).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Trainer Payout</span>
            <p className="mt-0.5 text-base font-black text-slate-700">
              ₹{Number(trainerAmount).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Gross Margin</span>
            <p
              className={`mt-0.5 text-base font-black ${
                marginAmount >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              {marginAmount >= 0 ? `+₹${Number(marginAmount).toLocaleString("en-IN")}` : `-₹${Math.abs(marginAmount).toLocaleString("en-IN")}`}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Margin Health</span>
            <p className="mt-0.5 text-base font-black text-indigo-700">
              {marginPercent}% Profit
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentWorkflowTracker;
