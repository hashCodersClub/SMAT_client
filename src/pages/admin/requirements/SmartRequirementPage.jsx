import { useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiClipboard,
  FiEdit3,
  FiPlus,
  FiZap,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { parseRequirementMessage } from "../../../data/requirementParser";

const emptyRequirement = {
  title: "",
  skills: [],
  city: "",
  mode: "",
  budget: "",
  experienceRequired: "",
  students: "",
  startDate: "",
  endDate: "",
  timing: "",
};

const SmartRequirementPage = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [parsed, setParsed] = useState(null);
  const [newSkill, setNewSkill] = useState("");

  const handleParse = () => {
    if (!message.trim()) return;

    const result = parseRequirementMessage(message);

    setParsed({
      ...emptyRequirement,
      ...result,
    });
  };

  const updateField = (field, value) => {
    setParsed((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const removeSkill = (skill) => {
    setParsed((previous) => ({
      ...previous,

      skills: previous.skills.filter((item) => item !== skill),
    }));
  };

  const addSkill = () => {
    const value = newSkill.trim();

    if (!value) return;

    if (
      parsed.skills.some((skill) => skill.toLowerCase() === value.toLowerCase())
    ) {
      setNewSkill("");
      return;
    }

    setParsed((previous) => ({
      ...previous,

      skills: [...previous.skills, value],
    }));

    setNewSkill("");
  };

  const createRequirement = () => {
    const requirement = {
      id: `REQ-${Date.now()}`,

      ...parsed,

      status: "OPEN",

      source: "WHATSAPP",

      createdAt: new Date().toISOString(),
    };

    console.log("Requirement:", requirement);

    alert(
      "Requirement parsed successfully. Backend persistence will be added later.",
    );

    navigate("/requirements");
  };

  const loadExample = () => {
    setMessage(
      `Urgent requirement for Python + Power BI trainer for college training in Noida.

Dates: 10 Aug to 15 Aug
Mode: Offline
Timing: 9 AM to 4 PM
Budget: 5k/day
Experience: 3+ years
Batch size: 60 students

Please share relevant profiles ASAP.`,
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/requirements")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Requirements
      </button>

      {/* Header */}

      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
          <FiZap />
          Smart Capture
        </div>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Create Requirement from Message
        </h1>

        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
          Paste the requirement received from your vendor. The system will
          extract important information and convert it into structured data.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* LEFT */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Vendor Message</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Copy the requirement from WhatsApp and paste it here.
                </p>
              </div>

              <button
                type="button"
                onClick={loadExample}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Load Example
              </button>
            </div>
          </div>

          <div className="p-5">
            <div className="rounded-2xl bg-[#f0f2f5] p-4">
              <div className="ml-auto max-w-[90%] rounded-xl rounded-tr-sm bg-[#d9fdd3] p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <FiClipboard />
                  WhatsApp Requirement
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={16}
                  placeholder="Paste vendor requirement here..."
                  className="w-full resize-none bg-transparent text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!message.trim()}
              onClick={handleParse}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <FiZap />
              Extract Requirement
            </button>
          </div>
        </div>

        {/* RIGHT */}

        {!parsed ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FiZap size={24} />
              </div>

              <h3 className="mt-4 font-bold text-slate-800">
                Waiting for requirement
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Paste the vendor message and click Extract Requirement.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <FiCheck className="text-emerald-600" />

                  <h2 className="font-bold text-slate-900">
                    Extracted Requirement
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Review and correct the extracted information.
                </p>
              </div>

              <FiEdit3 className="text-slate-400" />
            </div>

            <div className="space-y-5 p-5">
              <Field
                label="Requirement Title"
                value={parsed.title}
                onChange={(value) => updateField("title", value)}
              />

              {/* Skills */}

              <div>
                <Label>Skills</Label>

                <div className="flex flex-wrap gap-2">
                  {parsed.skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-red-50 hover:text-red-600"
                      title="Click to remove"
                    >
                      {skill} ×
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex gap-2">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Add missing skill"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="rounded-xl border border-slate-200 px-3 text-slate-500 hover:bg-slate-50"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="City"
                  value={parsed.city}
                  onChange={(value) => updateField("city", value)}
                />

                <SelectField
                  label="Training Mode"
                  value={parsed.mode}
                  onChange={(value) => updateField("mode", value)}
                  options={["Online", "Offline", "Hybrid"]}
                />

                <Field
                  label="Start Date"
                  type="date"
                  value={parsed.startDate}
                  onChange={(value) => updateField("startDate", value)}
                />

                <Field
                  label="End Date"
                  type="date"
                  value={parsed.endDate}
                  onChange={(value) => updateField("endDate", value)}
                />

                <Field
                  label="Budget / Day"
                  type="number"
                  value={parsed.budget}
                  onChange={(value) => updateField("budget", value)}
                />

                <Field
                  label="Experience Required"
                  type="number"
                  value={parsed.experienceRequired}
                  onChange={(value) => updateField("experienceRequired", value)}
                />

                <Field
                  label="Students"
                  type="number"
                  value={parsed.students}
                  onChange={(value) => updateField("students", value)}
                />

                <Field
                  label="Timing"
                  value={parsed.timing}
                  onChange={(value) => updateField("timing", value)}
                />
              </div>

              <div className="border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={createRequirement}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <FiCheck />
                  Create Requirement
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Label = ({ children }) => (
  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
    {children}
  </label>
);

const Field = ({ label, value, onChange, type = "text" }) => (
  <div>
    <Label>{label}</Label>

    <input
      type={type}
      value={value ?? ""}
      min={type === "number" ? 0 : undefined}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <Label>{label}</Label>

    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
    >
      <option value="">Select</option>

      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default SmartRequirementPage;
