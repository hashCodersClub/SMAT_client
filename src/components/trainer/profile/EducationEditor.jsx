import { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiEdit2,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const EMPTY_EDUCATION = {
  qualification: "",
  institution: "",
  fieldOfStudy: "",
  startYear: "",
  endYear: "",
};

const EducationEditor = ({ education = [], editing = false, onChange }) => {
  const [items, setItems] = useState(education);

  const [showForm, setShowForm] = useState(false);

  const [editingIndex, setEditingIndex] = useState(-1);

  const [form, setForm] = useState(EMPTY_EDUCATION);

  useEffect(() => {
    setItems(education || []);
  }, [education]);

  const updateParent = (list) => {
    setItems(list);

    if (onChange) {
      onChange(list);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_EDUCATION);
    setEditingIndex(-1);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.qualification.trim()) {
      alert("Qualification is required.");
      return;
    }

    if (!form.institution.trim()) {
      alert("Institution is required.");
      return;
    }

    const education = {
      ...form,
      qualification: form.qualification.trim(),
      institution: form.institution.trim(),
      fieldOfStudy: form.fieldOfStudy.trim(),
      startYear: form.startYear ? Number(form.startYear) : null,
      endYear: form.endYear ? Number(form.endYear) : null,
    };

    let updated = [...items];

    if (editingIndex >= 0) {
      updated[editingIndex] = education;
    } else {
      updated.push(education);
    }

    updateParent(updated);

    resetForm();
  };

  const handleEdit = (index) => {
    setEditingIndex(index);

    setForm({
      ...EMPTY_EDUCATION,
      ...items[index],
      startYear: items[index].startYear ?? "",
      endYear: items[index].endYear ?? "",
    });

    setShowForm(true);
  };

  const handleDelete = (index) => {
    if (!window.confirm("Delete this education record?")) {
      return;
    }

    const updated = items.filter((_, i) => i !== index);

    updateParent(updated);
  };

  return (
    <div className="space-y-6">
      {/* ===========================
          Header
      ============================ */}

      {editing && (
        <div className="flex justify-end">
          {!showForm ? (
            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setEditingIndex(-1);
                setForm(EMPTY_EDUCATION);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FiPlus />
              Add Education
            </button>
          ) : (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600"
            >
              <FiX />
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ===========================
          Add / Edit Form
      ============================ */}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-6 text-lg font-bold text-slate-800">
            {editingIndex >= 0 ? "Edit Education" : "Add Education"}
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Qualification *
              </label>

              <input
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                placeholder="B.Tech, M.Sc, MBA..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Institution *
              </label>

              <input
                name="institution"
                value={form.institution}
                onChange={handleChange}
                placeholder="University name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Field of Study
              </label>

              <input
                name="fieldOfStudy"
                value={form.fieldOfStudy}
                onChange={handleChange}
                placeholder="Computer Science"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Start Year
              </label>

              <input
                type="number"
                name="startYear"
                value={form.startYear}
                onChange={handleChange}
                min="1950"
                max="2100"
                placeholder="2018"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                End Year
              </label>

              <input
                type="number"
                name="endYear"
                value={form.endYear}
                onChange={handleChange}
                min="1950"
                max="2100"
                placeholder="2022"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <FiSave />

              {editingIndex >= 0 ? "Update Education" : "Save Education"}
            </button>
          </div>
        </div>
      )}

      {/* ===========================
          Education List
      ============================ */}

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <FiBookOpen size={48} className="mx-auto mb-4 text-slate-300" />

          <h3 className="text-lg font-semibold text-slate-700">
            No Education Added
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Add your academic qualifications to strengthen your trainer
            profile.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item, index) => (
            <div
              key={item._id || index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <FiBookOpen size={22} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.qualification}
                      </h3>

                      <p className="text-sm font-medium text-slate-500">
                        {item.institution}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {item.fieldOfStudy && (
                      <div className="text-sm text-slate-600">
                        Field of Study:
                        <span className="ml-2 font-medium">
                          {item.fieldOfStudy}
                        </span>
                      </div>
                    )}

                    {(item.startYear || item.endYear) && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiCalendar />

                        <span>
                          {item.startYear || "—"} — {item.endYear || "—"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="rounded-xl border border-slate-200 p-3 text-slate-600 hover:bg-slate-50"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="rounded-xl border border-red-200 p-3 text-red-600 hover:bg-red-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationEditor;
