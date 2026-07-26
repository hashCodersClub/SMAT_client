import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { requirements } from "../../data/requirements";
import { trainers } from "../../data/trainers";

const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const difference = end.getTime() - start.getTime();

  if (difference < 0) return 0;

  return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
};

const CreateAssignmentPage = () => {
  const { id: requirementId, trainerId } = useParams();

  const navigate = useNavigate();

  const requirement = requirements.find((item) => item.id === requirementId);

  const trainer = trainers.find((item) => item.id === trainerId);

  const [form, setForm] = useState({
    startDate: requirement?.startDate || "",

    endDate: requirement?.endDate || "",

    trainerRate: trainer?.dailyRate || "",

    vendorRate: requirement?.budget || "",

    status: "UPCOMING",

    notes: "",
  });

  const totalDays = useMemo(
    () => calculateDays(form.startDate, form.endDate),
    [form.startDate, form.endDate],
  );

  const trainerCost = totalDays * Number(form.trainerRate || 0);

  const vendorBilling = totalDays * Number(form.vendorRate || 0);

  const expectedProfit = vendorBilling - trainerCost;

  const marginPercentage =
    vendorBilling > 0 ? ((expectedProfit / vendorBilling) * 100).toFixed(1) : 0;

  if (!requirement || !trainer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Requirement or trainer not found.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const assignment = {
      id: `ASN-${Date.now()}`,

      requirementId: requirement.id,

      trainerId: trainer.id,
      trainerName: trainer.name,

      vendorId: requirement.vendorId,

      vendorName: requirement.vendorName,

      title: requirement.title,

      startDate: form.startDate,
      endDate: form.endDate,

      city: requirement.city,
      mode: requirement.mode,

      trainerRateType: "Per Day",
      trainerRate: Number(form.trainerRate),

      vendorRateType: "Per Day",
      vendorRate: Number(form.vendorRate),

      totalDays,

      trainerCost,
      vendorBilling,
      expectedProfit,

      status: form.status,

      trainerPaymentStatus: "PENDING",

      vendorPaymentStatus: "PENDING",

      notes: form.notes,

      createdAt: new Date().toISOString(),
    };

    console.log("Assignment:", assignment);

    alert("Assignment created successfully.");

    navigate("/assignments");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <button
        type="button"
        onClick={() =>
          navigate(`/requirements/${requirementId}/vendor-selection`)
        }
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Vendor Selection
      </button>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Assignment
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Create Assignment
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Confirm commercial and delivery details before assigning the trainer.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <Section title="Assignment">
            <InfoBox
              icon={FiBriefcase}
              label="Requirement"
              value={requirement.title}
            />

            <InfoBox icon={FiUser} label="Trainer" value={trainer.name} />

            <InfoBox
              icon={FiBriefcase}
              label="Vendor"
              value={requirement.vendorName}
            />

            <InfoBox
              icon={FiCalendar}
              label="Delivery"
              value={`${requirement.city} • ${requirement.mode}`}
            />
          </Section>

          <Section title="Schedule">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
            />

            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              required
            />
          </Section>

          <Section title="Commercial">
            <Input
              label="Trainer Rate / Day"
              name="trainerRate"
              type="number"
              value={form.trainerRate}
              onChange={handleChange}
              required
            />

            <Input
              label="Vendor Billing / Day"
              name="vendorRate"
              type="number"
              value={form.vendorRate}
              onChange={handleChange}
              required
            />
          </Section>

          <Section title="Additional Information">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Internal Notes
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Assignment notes..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </Section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={totalDays <= 0}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Confirm Assignment
            </button>
          </div>
        </form>

        {/* Financial Summary */}

        <div>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FiDollarSign className="text-blue-600" />

              <h2 className="font-bold text-slate-900">Financial Summary</h2>
            </div>

            <div className="mt-6 space-y-4">
              <MoneyRow label="Training Days" value={totalDays} money={false} />

              <MoneyRow label="Vendor Rate" value={form.vendorRate} />

              <MoneyRow label="Trainer Rate" value={form.trainerRate} />

              <div className="border-t border-slate-100 pt-4">
                <MoneyRow label="Expected Revenue" value={vendorBilling} />
              </div>

              <MoneyRow label="Trainer Cost" value={trainerCost} />

              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Expected Profit
                </p>

                <p
                  className={`mt-2 text-3xl font-bold ${
                    expectedProfit >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  ₹{expectedProfit.toLocaleString("en-IN")}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {marginPercentage}% gross margin
                </p>
              </div>

              {expectedProfit < 0 && (
                <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  Warning: Trainer cost is higher than vendor billing.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="font-bold text-slate-900">{title}</h2>

    <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
  </section>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <input
      {...props}
      min={props.type === "number" ? 0 : undefined}
      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    />
  </div>
);

const InfoBox = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
      <Icon />
      {label}
    </div>

    <p className="mt-2 text-sm font-semibold text-slate-800">{value}</p>
  </div>
);

const MoneyRow = ({ label, value, money = true }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-500">{label}</span>

    <span className="font-semibold text-slate-800">
      {money && "₹"}
      {Number(value || 0).toLocaleString("en-IN")}
      {money && (label.includes("Rate") ? "/day" : "")}
    </span>
  </div>
);

export default CreateAssignmentPage;
