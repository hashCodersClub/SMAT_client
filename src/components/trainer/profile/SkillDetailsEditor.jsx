import { useState } from "react";
import { FiEdit2, FiPlus, FiStar, FiTrash2, FiX } from "react-icons/fi";

import { SearchableSelect } from "../../ui/SearchableSelect";
import { IT_SKILLS } from "../../../constants/trainerOptions";

const EMPTY_SKILL = {
  name: "",
  proficiency: "INTERMEDIATE",
  yearsOfExperience: 0,
  trainingExperienceYears: 0,
  isPrimary: false,
};

const PROFICIENCY_OPTIONS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

const SkillDetailsEditor = ({ skills = [], editing = false, onChange }) => {
  const [form, setForm] = useState(EMPTY_SKILL);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));

    setError("");
  };

  const resetForm = () => {
    setForm(EMPTY_SKILL);
    setEditingIndex(null);
    setShowForm(false);
    setError("");
  };

  const handleAdd = () => {
    setForm(EMPTY_SKILL);
    setEditingIndex(null);
    setShowForm(true);
    setError("");
  };

  const handleEdit = (index) => {
    setForm({
      name: skills[index]?.name || "",
      proficiency: skills[index]?.proficiency || "INTERMEDIATE",
      yearsOfExperience: skills[index]?.yearsOfExperience || 0,
      trainingExperienceYears: skills[index]?.trainingExperienceYears || 0,
      isPrimary: Boolean(skills[index]?.isPrimary),
    });

    setEditingIndex(index);
    setShowForm(true);
    setError("");
  };

  const handleSave = () => {
    const name = form.name.trim();

    if (!name) {
      setError("Skill name is required.");
      return;
    }

    const duplicate = skills.some(
      (skill, index) =>
        index !== editingIndex &&
        skill.name?.trim().toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      setError("This skill has already been added.");
      return;
    }

    const skill = {
      name,
      proficiency: form.proficiency,
      yearsOfExperience: Math.max(Number(form.yearsOfExperience) || 0, 0),
      trainingExperienceYears: Math.max(
        Number(form.trainingExperienceYears) || 0,
        0,
      ),
      isPrimary: Boolean(form.isPrimary),
    };

    let updatedSkills;

    if (editingIndex !== null) {
      updatedSkills = skills.map((item, index) =>
        index === editingIndex ? skill : item,
      );
    } else {
      updatedSkills = [...skills, skill];
    }

    onChange(updatedSkills);
    resetForm();
  };

  const handleDelete = (index) => {
    onChange(skills.filter((_, skillIndex) => skillIndex !== index));

    if (editingIndex === index) {
      resetForm();
    }
  };

  return (
    <div className="space-y-4">
      {skills.length > 0 ? (
        <div className="grid gap-3">
          {skills.map((skill, index) => (
            <div
              key={skill._id || `${skill.name}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900">{skill.name}</h3>

                    {skill.isPrimary && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        <FiStar size={12} />
                        Primary
                      </span>
                    )}

                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {formatEnum(skill.proficiency)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <span>
                      Professional experience:{" "}
                      <strong className="text-slate-700">
                        {skill.yearsOfExperience || 0} years
                      </strong>
                    </span>

                    <span>
                      Training experience:{" "}
                      <strong className="text-slate-700">
                        {skill.trainingExperienceYears || 0} years
                      </strong>
                    </span>
                  </div>
                </div>

                {editing && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
                      title="Edit skill"
                    >
                      <FiEdit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:text-red-600"
                      title="Delete skill"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            No detailed skills added yet.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Add your core technologies with proficiency and experience.
          </p>
        </div>
      )}

      {editing && !showForm && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          <FiPlus />
          Add Detailed Skill
        </button>
      )}

      {editing && showForm && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">
                {editingIndex !== null ? "Edit Skill" : "Add Skill"}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Add information that can be used for trainer matching.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700"
            >
              <FiX />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Skill / Technology">
              <SearchableSelect
                value={form.name}
                onChange={(value) =>
                  setForm((current) => ({ ...current, name: value }))
                }
                options={IT_SKILLS}
                placeholder="Search or select a skill..."
              />
            </Field>

            <Field label="Proficiency">
              <select
                name="proficiency"
                value={form.proficiency}
                onChange={handleFieldChange}
                className="input-style bg-white"
              >
                {PROFICIENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {formatEnum(option)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Professional Experience">
              <div className="relative">
                <input
                  type="number"
                  name="yearsOfExperience"
                  min="0"
                  step="0.5"
                  value={form.yearsOfExperience}
                  onChange={handleFieldChange}
                  className="input-style pr-16"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  years
                </span>
              </div>
            </Field>

            <Field label="Training Experience">
              <div className="relative">
                <input
                  type="number"
                  name="trainingExperienceYears"
                  min="0"
                  step="0.5"
                  value={form.trainingExperienceYears}
                  onChange={handleFieldChange}
                  className="input-style pr-16"
                />

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  years
                </span>
              </div>
            </Field>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              name="isPrimary"
              checked={form.isPrimary}
              onChange={handleFieldChange}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
            />

            <div>
              <p className="text-sm font-semibold text-slate-700">
                Primary skill
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Mark this if the technology is one of your main training
                specializations.
              </p>
            </div>
          </label>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {editingIndex !== null ? "Update Skill" : "Add Skill"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    {children}
  </div>
);

const formatEnum = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

export default SkillDetailsEditor;
