import { useEffect, useRef, useState } from "react";
import {
  FiSave,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiCamera,
  FiBriefcase,
} from "react-icons/fi";

import companySettingsApi from "../../api/companySettingsApi";

/*
|--------------------------------------------------------------------------
| Company Settings Page (Admin)
|--------------------------------------------------------------------------
|
| Lets an admin edit the platform's own business identity — the "buyer"
| party stamped on every trainer-facing purchase order (and, eventually,
| the "billFrom" party on admin-issued invoices). Backed by GET/PATCH
| /api/company-settings.
|
| There is exactly one CompanySettings document (a singleton) — this page
| always edits that same record, there's no list/create/delete here.
|--------------------------------------------------------------------------
*/

const ALLOWED_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB — matches backend companySettingsUpload limit

const emptyBankDetails = {
  accountName: "",
  accountNumber: "",
  bankName: "",
  ifscCode: "",
  branch: "",
};

const CompanySettingsPage = () => {
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
    name: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    gstin: "",
    pan: "",
    email: "",
    phone: "",
    website: "",
    bankDetails: { ...emptyBankDetails },
    defaultPaymentTerms: "",
    defaultTermsAndConditions: "",
  });

  /*
  |--------------------------------------------------------------------------
  | Load Settings
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const settings = await companySettingsApi.get();

        if (settings) {
          setLogoUrl(settings.logoUrl || "");

          setForm({
            name: settings.name || "",
            address: settings.address || "",
            city: settings.city || "",
            state: settings.state || "",
            country: settings.country || "India",
            pincode: settings.pincode || "",
            gstin: settings.gstin || "",
            pan: settings.pan || "",
            email: settings.email || "",
            phone: settings.phone || "",
            website: settings.website || "",
            bankDetails: {
              ...emptyBankDetails,
              ...(settings.bankDetails || {}),
            },
            defaultPaymentTerms: settings.defaultPaymentTerms || "",
            defaultTermsAndConditions:
              settings.defaultTermsAndConditions || "",
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load company settings.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

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

  /*
  |--------------------------------------------------------------------------
  | Handlers
  |--------------------------------------------------------------------------
  */

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

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      bankDetails: { ...previous.bankDetails, [name]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updated = await companySettingsApi.update({
        ...form,
        ...(logoFile ? { logoFile } : {}),
      });

      if (updated?.logoUrl !== undefined) {
        setLogoUrl(updated.logoUrl);
      }

      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
      setLogoFile(null);
      setLogoPreviewUrl("");

      setSuccessMessage("Company settings saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save company settings.",
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
          <FiRefreshCw className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm text-slate-500">
            Loading company settings...
          </p>
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
          Company Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          These details appear as the issuing party on every purchase order
          sent to trainers.
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
        {/* Logo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Company Logo
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Shown on issued purchase orders and invoices. JPEG, PNG, or WEBP,
            up to 5MB.
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
                <FiBriefcase size={28} className="text-slate-300" />
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
                <p className="text-xs text-slate-500">{logoFile.name}</p>
              )}

              {logoError && (
                <p className="text-xs text-red-600">{logoError}</p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_LOGO_TYPES.join(",")}
              onChange={handleLogoSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Business Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Business Details
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Company Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                GSTIN
              </label>
              <input
                type="text"
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                PAN
              </label>
              <input
                type="text"
                name="pan"
                value={form.pan}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Bank Details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Used as the default remittance details on issued documents.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Account Name
              </label>
              <input
                type="text"
                name="accountName"
                value={form.bankDetails.accountName}
                onChange={handleBankDetailsChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={form.bankDetails.accountNumber}
                onChange={handleBankDetailsChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={form.bankDetails.ifscCode}
                onChange={handleBankDetailsChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankDetails.bankName}
                onChange={handleBankDetailsChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Branch
              </label>
              <input
                type="text"
                name="branch"
                value={form.bankDetails.branch}
                onChange={handleBankDetailsChange}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Default Terms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Default Terms
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pre-fills onto new purchase orders and invoices — still editable
            per document.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Default Payment Terms
              </label>
              <textarea
                name="defaultPaymentTerms"
                value={form.defaultPaymentTerms}
                onChange={handleChange}
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Default Terms &amp; Conditions
              </label>
              <textarea
                name="defaultTermsAndConditions"
                value={form.defaultTermsAndConditions}
                onChange={handleChange}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <FiRefreshCw size={15} className="animate-spin" />
            ) : (
              <FiSave size={15} />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettingsPage;
