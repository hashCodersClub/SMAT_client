import { useState } from "react";

/* ==========================================================================
   DEFAULT DATA
============================================================================ */

const emptyVendor = {
  companyName: "",
  companyType: "TRAINING_COMPANY",

  website: "",
  gstNumber: "",

  contacts: [
    {
      name: "",
      designation: "",
      email: "",
      phone: "",
      whatsapp: "",
      isPrimary: true,
    },
  ],

  city: "",
  state: "",
  country: "India",
  address: "",

  paymentTerms: "Payment within 30 days",
  defaultPaymentDays: 30,

  source: "WHATSAPP",
  status: "ACTIVE",

  notes: "",
  tags: [],
};

/* ==========================================================================
   VENDOR FORM
============================================================================ */

const VendorForm = ({
  initialData = emptyVendor,
  onSubmit,
  submitLabel = "Save Vendor",
  submitting = false,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Normalize Initial Data
  |--------------------------------------------------------------------------
  */

  const getInitialForm = () => {
    const contacts =
      initialData?.contacts?.length > 0
        ? initialData.contacts
        : emptyVendor.contacts;

    return {
      ...emptyVendor,
      ...initialData,

      contacts: contacts.map((contact) => ({
        name: contact.name || "",
        designation: contact.designation || "",
        email: contact.email || "",
        phone: contact.phone || "",
        whatsapp: contact.whatsapp || "",
        isPrimary: contact.isPrimary ?? true,
      })),
    };
  };

  const [form, setForm] = useState(getInitialForm);

  const [tagInput, setTagInput] = useState("");

  /*
  |--------------------------------------------------------------------------
  | General Change
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Primary Contact Change
  |--------------------------------------------------------------------------
  */

  const handleContactChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,

      contacts: previous.contacts.map((contact, index) =>
        index === 0
          ? {
              ...contact,
              [name]: value,
            }
          : contact,
      ),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Add Tag
  |--------------------------------------------------------------------------
  */

  const addTag = () => {
    const value = tagInput.trim();

    if (!value) return;

    const exists = form.tags.some(
      (tag) => tag.toLowerCase() === value.toLowerCase(),
    );

    if (!exists) {
      setForm((previous) => ({
        ...previous,
        tags: [...previous.tags, value],
      }));
    }

    setTagInput("");
  };

  /*
  |--------------------------------------------------------------------------
  | Remove Tag
  |--------------------------------------------------------------------------
  */

  const removeTag = (tag) => {
    setForm((previous) => ({
      ...previous,
      tags: previous.tags.filter((item) => item !== tag),
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (e) => {
    e.preventDefault();

    if (submitting) return;

    const payload = {
      ...form,

      companyName: form.companyName.trim(),

      website: form.website.trim(),

      gstNumber: form.gstNumber.trim(),

      city: form.city.trim(),

      state: form.state.trim(),

      country: form.country.trim(),

      address: form.address.trim(),

      paymentTerms: form.paymentTerms.trim(),

      defaultPaymentDays: Number(form.defaultPaymentDays),

      notes: form.notes.trim(),

      contacts: form.contacts.map((contact, index) => ({
        name: contact.name.trim(),

        designation: contact.designation.trim(),

        email: contact.email.trim(),

        phone: contact.phone.trim(),

        whatsapp: contact.whatsapp.trim(),

        isPrimary: index === 0,
      })),

      tags: form.tags.map((tag) => tag.trim()).filter(Boolean),
    };

    onSubmit(payload);
  };

  const primaryContact = form.contacts[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ==================================================================
          COMPANY
      ================================================================== */}

      <Section
        title="Company Information"
        description="Basic information about the vendor."
      >
        <Input
          label="Company Name"
          name="companyName"
          value={form.companyName}
          onChange={handleChange}
          required
          disabled={submitting}
        />

        <Select
          label="Company Type"
          name="companyType"
          value={form.companyType}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="TRAINING_COMPANY">Training Company</option>

          <option value="EDTECH">EdTech</option>

          <option value="COLLEGE_TRAINING_PARTNER">
            College Training Partner
          </option>

          <option value="CORPORATE">Corporate</option>

          <option value="OTHER">Other</option>
        </Select>

        <Input
          label="Website"
          name="website"
          value={form.website}
          onChange={handleChange}
          placeholder="https://example.com"
          disabled={submitting}
        />

        <Input
          label="GST Number"
          name="gstNumber"
          value={form.gstNumber}
          onChange={handleChange}
          placeholder="GST number"
          disabled={submitting}
        />
      </Section>

      {/* ==================================================================
          PRIMARY CONTACT
      ================================================================== */}

      <Section
        title="Primary Contact"
        description="Person who usually sends or coordinates training requirements."
      >
        <Input
          label="Contact Name"
          name="name"
          value={primaryContact.name}
          onChange={handleContactChange}
          required
          disabled={submitting}
        />

        <Input
          label="Designation"
          name="designation"
          value={primaryContact.designation}
          onChange={handleContactChange}
          placeholder="Training Coordinator"
          disabled={submitting}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={primaryContact.email}
          onChange={handleContactChange}
          placeholder="contact@example.com"
          disabled={submitting}
        />

        <Input
          label="Phone"
          name="phone"
          value={primaryContact.phone}
          onChange={handleContactChange}
          placeholder="Phone number"
          required
          disabled={submitting}
        />

        <Input
          label="WhatsApp"
          name="whatsapp"
          value={primaryContact.whatsapp}
          onChange={handleContactChange}
          placeholder="WhatsApp number"
          disabled={submitting}
        />
      </Section>

      {/* ==================================================================
          LOCATION
      ================================================================== */}

      <Section
        title="Location"
        description="Vendor office and operational location."
      >
        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          required
          disabled={submitting}
        />

        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={handleChange}
          disabled={submitting}
        />

        <Input
          label="Country"
          name="country"
          value={form.country}
          onChange={handleChange}
          disabled={submitting}
        />

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Address
          </label>

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            disabled={submitting}
            placeholder="Office address"
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-100"
          />
        </div>
      </Section>

      {/* ==================================================================
          COMMERCIAL
      ================================================================== */}

      <Section
        title="Commercial Information"
        description="Payment and operational details."
      >
        <Input
          label="Payment Terms"
          name="paymentTerms"
          value={form.paymentTerms}
          onChange={handleChange}
          placeholder="Payment within 30 days"
          disabled={submitting}
        />

        <Input
          label="Default Payment Days"
          name="defaultPaymentDays"
          type="number"
          min="0"
          value={form.defaultPaymentDays}
          onChange={handleChange}
          disabled={submitting}
        />

        <Select
          label="Source"
          name="source"
          value={form.source}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="WHATSAPP">WhatsApp</option>

          <option value="EMAIL">Email</option>

          <option value="PHONE">Phone</option>

          <option value="REFERRAL">Referral</option>

          <option value="WEBSITE">Website</option>

          <option value="OTHER">Other</option>
        </Select>

        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          disabled={submitting}
        >
          <option value="ACTIVE">Active</option>

          <option value="INACTIVE">Inactive</option>

          <option value="BLOCKED">Blocked</option>
        </Select>
      </Section>

      {/* ==================================================================
          TAGS
      ================================================================== */}

      <Section
        title="Tags"
        description="Optional labels to help organize vendors."
      >
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Vendor Tags
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              disabled={submitting}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="e.g. Corporate Training"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />

            <button
              type="button"
              onClick={addTag}
              disabled={submitting}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {form.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700"
                >
                  {tag}

                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    disabled={submitting}
                    className="text-blue-500 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* ==================================================================
          NOTES
      ================================================================== */}

      <Section
        title="Internal Notes"
        description="Information useful to your operations team."
      >
        <div className="md:col-span-2">
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            disabled={submitting}
            rows={4}
            placeholder="Notes about this vendor..."
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-100"
          />
        </div>
      </Section>

      {/* ==================================================================
          ACTIONS
      ================================================================== */}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          disabled={submitting}
          onClick={() => window.history.back()}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

/* ==========================================================================
   SECTION
============================================================================ */

const Section = ({ title, description, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="font-bold text-slate-900">{title}</h2>

    <p className="mt-1 text-sm font-medium text-slate-600">{description}</p>

    <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
  </section>
);

/* ==========================================================================
   INPUT
============================================================================ */

const Input = ({ label, required, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}

      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <input
      {...props}
      required={required}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
    />
  </div>
);

/* ==========================================================================
   SELECT
============================================================================ */

const Select = ({ label, required, children, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}

      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <select
      {...props}
      required={required}
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      {children}
    </select>
  </div>
);

export default VendorForm;
