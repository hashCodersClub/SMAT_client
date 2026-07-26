import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClipboard,
  FiCheckCircle,
} from "react-icons/fi";

import { vendors } from "../../../data/vendors";

const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const vendor = vendors.find((item) => item.id === id);

  if (!vendor) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Vendor not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/vendors")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500"
      >
        <FiArrowLeft />
        Vendors
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {vendor.companyName}
              </h1>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  vendor.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {vendor.status}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {vendor.id} • {vendor.companyType}
            </p>

            <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <FiMapPin />
              {vendor.city}, {vendor.state}
            </p>
          </div>

          <button
            onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
            className="flex h-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <FiEdit2 />
            Edit Vendor
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Primary Contact">
            <h3 className="font-semibold text-slate-800">
              {vendor.primaryContact.name}
            </h3>

            <p className="text-sm text-slate-500">
              {vendor.primaryContact.designation}
            </p>

            <div className="mt-4 space-y-3">
              <Row icon={FiMail} value={vendor.primaryContact.email} />

              <Row icon={FiPhone} value={vendor.primaryContact.phone} />
            </div>
          </Section>

          <Section title="Internal Notes">
            <p className="text-sm leading-6 text-slate-600">
              {vendor.notes || "No notes available."}
            </p>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Activity">
            <div className="space-y-5">
              <Metric
                icon={FiClipboard}
                label="Total Requirements"
                value={vendor.totalRequirements}
              />

              <Metric
                icon={FiClipboard}
                label="Active Requirements"
                value={vendor.activeRequirements}
              />

              <Metric
                icon={FiCheckCircle}
                label="Completed Assignments"
                value={vendor.completedAssignments}
              />
            </div>
          </Section>

          <Section title="Commercial">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Payment Terms
            </p>

            <p className="mt-1 font-semibold text-slate-700">
              {vendor.paymentTerms}
            </p>

            <p className="mt-5 text-xs uppercase tracking-wide text-slate-400">
              GST Number
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {vendor.gstNumber || "Not provided"}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 font-semibold text-slate-900">{title}</h2>

    {children}
  </section>
);

const Row = ({ icon: Icon, value }) => (
  <div className="flex items-center gap-3 text-sm text-slate-600">
    <Icon className="text-slate-400" />
    {value || "Not provided"}
  </div>
);

const Metric = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
      <Icon />
    </div>

    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default VendorDetailsPage;
