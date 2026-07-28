import { useEffect, useState } from "react";
import {
  FiAward,
  FiCalendar,
  FiEdit2,
  FiExternalLink,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";

const EMPTY_CERTIFICATION = {
  name: "",
  issuingOrganization: "",
  credentialId: "",
  credentialUrl: "",
  issueDate: "",
  expiryDate: "",
  doesNotExpire: false,
};

const CertificationsEditor = ({
  certifications = [],
  editing = false,
  onChange,
}) => {
  const [items, setItems] = useState(certifications);

  const [showForm, setShowForm] = useState(false);

  const [editingIndex, setEditingIndex] = useState(-1);

  const [form, setForm] = useState(EMPTY_CERTIFICATION);

  useEffect(() => {
    setItems(certifications || []);
  }, [certifications]);

  const updateParent = (list) => {
    setItems(list);

    if (onChange) {
      onChange(list);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_CERTIFICATION);
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
    if (!form.name.trim()) {
      alert("Certification name is required.");
      return;
    }

    if (!form.issuingOrganization.trim()) {
      alert("Issuing organization is required.");
      return;
    }

    const certification = {
      ...form,
      name: form.name.trim(),
      issuingOrganization: form.issuingOrganization.trim(),
      credentialId: form.credentialId.trim(),
      credentialUrl: form.credentialUrl.trim(),
    };

    let updated = [...items];

    if (editingIndex >= 0) {
      updated[editingIndex] = certification;
    } else {
      updated.push(certification);
    }

    updateParent(updated);

    resetForm();
  };

  const handleEdit = (index) => {
    setEditingIndex(index);

    setForm(items[index]);

    setShowForm(true);
  };

  const handleDelete = (index) => {
    if (!window.confirm("Delete this certification?")) {
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
                setForm(EMPTY_CERTIFICATION);
              }}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <FiPlus />
              Add Certification
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
            {editingIndex >= 0 ? "Edit Certification" : "Add Certification"}
          </h3>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Certification Name *
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="AWS Certified Solutions Architect"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Issuing Organization *
              </label>

              <input
                name="issuingOrganization"
                value={form.issuingOrganization}
                onChange={handleChange}
                placeholder="Amazon Web Services"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Credential ID
              </label>

              <input
                name="credentialId"
                value={form.credentialId}
                onChange={handleChange}
                placeholder="AWS-123456"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Credential URL
              </label>

              <input
                name="credentialUrl"
                value={form.credentialUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-600">
                Issue Date
              </label>

              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {!form.doesNotExpire && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  Expiry Date
                </label>

                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <label className="mt-6 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="doesNotExpire"
              checked={form.doesNotExpire}
              onChange={handleChange}
            />

            <span className="text-sm text-slate-700">
              This certification never expires
            </span>
          </label>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              <FiSave />

              {editingIndex >= 0
                ? "Update Certification"
                : "Save Certification"}
            </button>
          </div>
        </div>
      )}

      {/* ===========================
          Certifications List
      ============================ */}

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <FiAward size={48} className="mx-auto mb-4 text-slate-300" />

          <h3 className="text-lg font-semibold text-slate-700">
            No Certifications Added
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Add your professional certifications to strengthen your trainer
            profile.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((certification, index) => (
            <div
              key={certification._id || index}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <FiAward size={22} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {certification.name}
                      </h3>

                      <p className="text-sm font-medium text-slate-500">
                        {certification.issuingOrganization}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiCalendar />

                      <span>
                        Issued:
                        {certification.issueDate
                          ? new Date(
                              certification.issueDate,
                            ).toLocaleDateString()
                          : " —"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiCalendar />

                      <span>
                        {certification.doesNotExpire
                          ? "Never Expires"
                          : certification.expiryDate
                            ? `Expires: ${new Date(
                                certification.expiryDate,
                              ).toLocaleDateString()}`
                            : "No Expiry"}
                      </span>
                    </div>

                    {certification.credentialId && (
                      <div className="text-sm text-slate-600">
                        Credential ID:
                        <span className="ml-2 font-medium">
                          {certification.credentialId}
                        </span>
                      </div>
                    )}

                    {certification.credentialUrl && (
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View Credential
                        <FiExternalLink size={14} />
                      </a>
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

export default CertificationsEditor;
