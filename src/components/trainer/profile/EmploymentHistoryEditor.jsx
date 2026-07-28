import { useEffect, useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiEdit2,
  FiMapPin,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const EMPTY_EMPLOYMENT = {
  company: "",
  designation: "",
  location: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString() : "—";

const EmploymentHistoryEditor = ({
  employmentHistory = [],
  editing = false,
  onChange,
}) => {
  const [items, setItems] = useState(employmentHistory);

  const [showForm, setShowForm] = useState(false);

  const [editingIndex, setEditingIndex] = useState(-1);

  const [form, setForm] = useState(EMPTY_EMPLOYMENT);

  useEffect(() => {
    setItems(employmentHistory || []);
  }, [employmentHistory]);

  const updateParent = (list) => {
    setItems(list);

    if (onChange) {
      onChange(list);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_EMPLOYMENT);
    setEditingIndex(-1);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.company.trim()) {
      alert("Company name is required.");
      return;
    }

    if (!form.designation.trim()) {
      alert("Designation is required.");
      return;
    }

    const employment = {
      ...form,
      company: form.company.trim(),
      designation: form.designation.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      endDate: form.currentlyWorking ? "" : form.endDate,
    };

    let updated = [...items];

    if (editingIndex >= 0) {
      updated[editingIndex] = employment;
    } else {
      updated.push(employment);
    }

    updateParent(updated);

    resetForm();
  };

  const handleEdit = (index) => {
    setEditingIndex(index);

    setForm({
      ...EMPTY_EMPLOYMENT,
      ...items[index],
      startDate: items[index].startDate
        ? String(items[index].startDate).slice(0, 10)
        : "",
      endDate: items[index].endDate
        ? String(items[index].endDate).slice(0, 10)
        : "",
    });

    setShowForm(true);
  };

  const handleDelete = (index) => {
    if (!window.confirm("Delete this employment record?")) {
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
                setForm(EMPTY_EMPLOYMENT);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FiPlus />
              Add Employment
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
            {editingIndex >= 0 ? "Edit Employment" : "Add Employment"}
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Company *
              </label>

              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Designation *
              </label>

              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Senior Trainer"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Location
              </label>

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Bengaluru, India"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {!form.currentlyWorking && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                maxLength={2000}
                placeholder="Key responsibilities and achievements..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <label className="mt-6 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="currentlyWorking"
              checked={form.currentlyWorking}
              onChange={handleChange}
            />

            <span className="text-sm text-slate-700">
              I currently work here
            </span>
          </label>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <FiSave />

              {editingIndex >= 0 ? "Update Employment" : "Save Employment"}
            </button>
          </div>
        </div>
      )}

      {/* ===========================
          Employment List
      ============================ */}

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <FiBriefcase size={48} className="mx-auto mb-4 text-slate-300" />

          <h3 className="text-lg font-semibold text-slate-700">
            No Employment History Added
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Add your past and current roles to strengthen your trainer profile.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((job, index) => (
            <div
              key={job._id || index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <FiBriefcase size={22} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {job.designation}
                      </h3>

                      <p className="text-sm font-medium text-slate-500">
                        {job.company}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiCalendar />

                      <span>
                        {formatDate(job.startDate)} —{" "}
                        {job.currentlyWorking
                          ? "Present"
                          : formatDate(job.endDate)}
                      </span>
                    </div>

                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FiMapPin />
                        <span>{job.location}</span>
                      </div>
                    )}
                  </div>

                  {job.description && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {job.description}
                    </p>
                  )}
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

export default EmploymentHistoryEditor;
