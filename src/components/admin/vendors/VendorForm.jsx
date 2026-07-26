import { useState } from "react";

const emptyVendor = {
  companyName: "",
  companyType: "Training Company",
  website: "",

  primaryContact: {
    name: "",
    designation: "",
    email: "",
    phone: "",
  },

  city: "",
  state: "",

  paymentTerms: "30 Days",
  gstNumber: "",

  status: "ACTIVE",
  notes: "",
};

const VendorForm = ({
  initialData = emptyVendor,
  onSubmit,
  submitLabel = "Save Vendor",
}) => {
  const [form, setForm] = useState({
    ...emptyVendor,
    ...initialData,
    primaryContact: {
      ...emptyVendor.primaryContact,
      ...initialData.primaryContact,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      primaryContact: {
        ...prev.primaryContact,
        [name]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        />

        <Select
          label="Company Type"
          name="companyType"
          value={form.companyType}
          onChange={handleChange}
          options={[
            "Training Company",
            "EdTech",
            "College Training Partner",
            "Corporate",
            "Other",
          ]}
        />

        <Input
          label="Website"
          name="website"
          value={form.website}
          onChange={handleChange}
          placeholder="https://"
        />

        <Input
          label="GST Number"
          name="gstNumber"
          value={form.gstNumber}
          onChange={handleChange}
        />

        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          required
        />

        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={handleChange}
        />
      </Section>

      <Section
        title="Primary Contact"
        description="Person who usually sends or coordinates requirements."
      >
        <Input
          label="Contact Name"
          name="name"
          value={form.primaryContact.name}
          onChange={handleContactChange}
          required
        />

        <Input
          label="Designation"
          name="designation"
          value={form.primaryContact.designation}
          onChange={handleContactChange}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.primaryContact.email}
          onChange={handleContactChange}
        />

        <Input
          label="Phone / WhatsApp"
          name="phone"
          value={form.primaryContact.phone}
          onChange={handleContactChange}
          required
        />
      </Section>

      <Section
        title="Commercial Information"
        description="Payment and operational details."
      >
        <Select
          label="Payment Terms"
          name="paymentTerms"
          value={form.paymentTerms}
          onChange={handleChange}
          options={[
            "Immediate",
            "7 Days",
            "15 Days",
            "30 Days",
            "45 Days",
            "60 Days",
          ]}
        />

        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={["ACTIVE", "INACTIVE"]}
        />

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Internal Notes
          </label>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Notes about this vendor..."
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </Section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

const Section = ({ title, description, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="font-semibold text-slate-900">{title}</h2>

    <p className="mt-1 text-sm text-slate-500">{description}</p>

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
      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {label}
    </label>

    <select
      {...props}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  </div>
);

export default VendorForm;
