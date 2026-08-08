import { useEffect, useRef, useState } from "react";
import {
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiPlus,
  FiTrash2,
  FiCamera,
  FiUser,
} from "react-icons/fi";

import vendorsApi from "../../../api/vendorsApi";

/*
|--------------------------------------------------------------------------
| Vendor Profile Page (Self-Service)
|--------------------------------------------------------------------------
|
| Lets a vendor portal user view and edit their own company profile.
| Backed by GET/PATCH /api/vendors/me — only company/contact fields are
| editable here; commercial terms, status, and portal access remain
| admin-controlled (the backend enforces this too, this is not just a
| UI restriction).
|--------------------------------------------------------------------------
*/

const COMPANY_TYPES = [
  { value: "TRAINING_COMPANY", label: "Training Company" },
  { value: "COLLEGE", label: "College" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "CONSULTANCY", label: "Consultancy" },
  { value: "OTHER", label: "Other" },
];

const emptyContact = {
  name: "",
  designation: "",
  email: "",
  phone: "",
  whatsapp: "",
  isPrimary: false,
};

const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB — matches backend vendorUpload limit

const VendorProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [logoError, setLogoError] = useState("");
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    companyName: "",
    companyType: "TRAINING_COMPANY",
    website: "",
    gstNumber: "",
    city: "",
    state: "",
    country: "India",
    address: "",
    contacts: [{ ...emptyContact, isPrimary: true }],
  });

  /*
  |--------------------------------------------------------------------------
  | Load Profile
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await vendorsApi.getMyProfile();
        const vendor = response?.vendor;

        if (vendor) {
          setLogoUrl(vendor.logoUrl || "");

          setForm({
            companyName: vendor.companyName || "",
            companyType: vendor.companyType || "TRAINING_COMPANY",
            website: vendor.website || "",
            gstNumber: vendor.gstNumber || "",
            city: vendor.city || "",
            state: vendor.state || "",
            country: vendor.country || "India",
            address: vendor.address || "",
            contacts:
              vendor.contacts?.length > 0
                ? vendor.contacts
                : [{ ...emptyContact, isPrimary: true }],
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your company profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Handlers
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | Logo Preview Cleanup
  |--------------------------------------------------------------------------
  |
  | Revoke the blob: URL created for the local preview whenever it changes
  | or the component unmounts, so we don't leak memory.
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later

    if (!file) return;

    setLogoError("");

    if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
      setLogoError("Logo must be a JPEG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setLogoError("Logo must be smaller than 5MB.");
      return;
    }

    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveSelectedLogo = () => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoFile(null);
    setLogoPreviewUrl("");
    setLogoError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleContactChange = (index, field, value) => {
    setForm((previous) => {
      const contacts = [...previous.contacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...previous, contacts };
    });
  };

  const handleSetPrimary = (index) => {
    setForm((previous) => ({
      ...previous,
      contacts: previous.contacts.map((contact, i) => ({
        ...contact,
        isPrimary: i === index,
      })),
    }));
  };

  const addContact = () => {
    setForm((previous) => ({
      ...previous,
      contacts: [...previous.contacts, { ...emptyContact }],
    }));
  };

  const removeContact = (index) => {
    setForm((previous) => ({
      ...previous,
      contacts: previous.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await vendorsApi.updateMyProfile({
        ...form,
        ...(logoFile ? { logoFile } : {}),
      });

      const updatedLogoUrl = response?.vendor?.logoUrl;

      if (updatedLogoUrl !== undefined) {
        setLogoUrl(updatedLogoUrl);
      }

      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      setLogoFile(null);
      setLogoPreviewUrl("");

      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save your company profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <FiRefreshCw className="mx-auto h-6 w-6 animate-spin text-blue-600" />
          <p className="mt-3 text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Company Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your company details and contacts.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo / Avatar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Company Logo</h2>

          <p className="mt-1 text-sm text-slate-500">
            Shown on your vendor profile. JPEG, PNG, or WEBP, up to 5MB.
          </p>

          <div className="mt-5 flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              {logoPreviewUrl || logoUrl ? (
                <img
                  src={logoPreviewUrl || logoUrl}
                  alt="Company logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <FiUser size={28} className="text-slate-300" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <FiCamera size={15} />
                  {logoUrl || logoPreviewUrl ? "Change logo" : "Upload logo"}
                </button>

                {logoFile && (
                  <button
                    type="button"
                    onClick={handleRemoveSelectedLogo}
                    className="text-sm font-medium text-slate-500 transition hover:text-red-600"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {logoFile && (
                <p className="text-xs text-slate-500">
                  {logoFile.name} — will be uploaded when you save changes.
                </p>
              )}

              {logoError && <p className="text-xs text-red-600">{logoError}</p>}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Company Information
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Company Name" required>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </Field>

            <Field label="Company Type">
              <select
                name="companyType"
                value={form.companyType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {COMPANY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Website">
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </Field>

            <Field label="GST Number">
              <input
                type="text"
                name="gstNumber"
                value={form.gstNumber}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </Field>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Location</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="City">
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </Field>

            <Field label="State">
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </Field>

            <Field label="Country">
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </Field>

            <Field label="Address" full>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </Field>
          </div>
        </div>

        {/* Contacts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Contacts</h2>

            <button
              type="button"
              onClick={addContact}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <FiPlus size={14} />
              Add contact
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {form.contacts.map((contact, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="primaryContact"
                      checked={!!contact.isPrimary}
                      onChange={() => handleSetPrimary(index)}
                    />
                    Primary contact
                  </label>

                  {form.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove contact"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) =>
                        handleContactChange(index, "name", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </Field>

                  <Field label="Designation">
                    <input
                      type="text"
                      value={contact.designation}
                      onChange={(e) =>
                        handleContactChange(
                          index,
                          "designation",
                          e.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        handleContactChange(index, "email", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </Field>

                  <Field label="Phone">
                    <input
                      type="text"
                      value={contact.phone}
                      onChange={(e) =>
                        handleContactChange(index, "phone", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </Field>

                  <Field label="WhatsApp">
                    <input
                      type="text"
                      value={contact.whatsapp}
                      onChange={(e) =>
                        handleContactChange(index, "whatsapp", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            <FiSave size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Field Wrapper
|--------------------------------------------------------------------------
*/

const Field = ({ label, required, full, children }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default VendorProfilePage;
