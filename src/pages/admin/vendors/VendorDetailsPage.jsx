import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiArrowLeft,
  FiEdit2,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClipboard,
  FiCheckCircle,
  FiGlobe,
  FiAlertCircle,
  FiRefreshCw,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";

import vendorsApi from "../../../api/vendorsApi";
import VendorPortalUsers from "../../../components/admin/vendors/VendorPortalUsers";

/* ==========================================================================
   HELPERS
============================================================================ */

const formatCompanyType = (value = "") => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

/* ==========================================================================
   VENDOR DETAILS
============================================================================ */

const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Vendor
  |--------------------------------------------------------------------------
  */

  const fetchVendor = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await vendorsApi.getById(id);

      setVendor(response.vendor);
    } catch (err) {
      console.error("Failed to fetch vendor:", err);

      setError(
        err?.response?.data?.message || "Unable to load vendor information.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchVendor();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Delete Vendor
  |--------------------------------------------------------------------------
  */

  const handleDeleteVendor = async () => {
    const confirmed = window.confirm(
      "Delete this vendor? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await vendorsApi.delete(id);

      navigate("/admin/vendors");
    } catch (err) {
      console.error("Failed to delete vendor:", err);

      setDeleteError(
        err?.response?.data?.message || "Unable to delete vendor.",
      );

      setDeleting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return <VendorDetailsSkeleton />;
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !vendor) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/admin/vendors")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <FiArrowLeft />
          Vendors
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <FiAlertCircle size={30} className="mx-auto text-red-500" />

          <h2 className="mt-3 font-bold text-red-900">
            Vendor could not be loaded
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {error || "Vendor not found."}
          </p>

          <button
            type="button"
            onClick={fetchVendor}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
          >
            <FiRefreshCw />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Primary Contact
  |--------------------------------------------------------------------------
  */

  const primaryContact =
    vendor.contacts?.find((contact) => contact.isPrimary) ||
    vendor.contacts?.[0] ||
    null;

  return (
    <div className="space-y-6">
      {/* ================================================================
          BACK
      ================================================================= */}

      <button
        type="button"
        onClick={() => navigate("/admin/vendors")}
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <FiArrowLeft />
        Vendors
      </button>

      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-950">
                {vendor.companyName}
              </h1>

              <VendorStatus status={vendor.status} />
            </div>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {formatCompanyType(vendor.companyType)}
            </p>

            {(vendor.city || vendor.state || vendor.country) && (
              <p className="mt-3 flex items-start gap-2 text-sm font-medium text-slate-600">
                <FiMapPin className="mt-0.5 shrink-0" />

                {[vendor.city, vendor.state, vendor.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            {vendor.website && (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <FiGlobe />

                {vendor.website}
              </p>
            )}
          </div>

          <div className="flex h-fit shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/vendors/${vendor._id}/edit`)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FiEdit2 />
              Edit Vendor
            </button>

            <button
              type="button"
              onClick={handleDeleteVendor}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
              {deleting ? "Deleting..." : "Delete Vendor"}
            </button>
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-bold text-red-800">Delete failed</p>

            <p className="mt-1 text-sm text-red-700">{deleteError}</p>
          </div>
        </div>
      )}

      {/* ================================================================
          CONTENT
      ================================================================= */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT */}

        <div className="space-y-6 lg:col-span-2">
          {/* Primary Contact */}

          <Section title="Primary Contact">
            {primaryContact ? (
              <>
                <h3 className="font-bold text-slate-900">
                  {primaryContact.name || "Unnamed Contact"}
                </h3>

                {primaryContact.designation && (
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {primaryContact.designation}
                  </p>
                )}

                <div className="mt-5 space-y-3">
                  <Row icon={FiMail} value={primaryContact.email} />

                  <Row icon={FiPhone} value={primaryContact.phone} />

                  {primaryContact.whatsapp && (
                    <Row
                      icon={FiPhone}
                      label="WhatsApp"
                      value={primaryContact.whatsapp}
                    />
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No contact information available.
              </p>
            )}
          </Section>

          {/* Address */}

          <Section title="Location & Address">
            <div className="grid gap-5 sm:grid-cols-2">
              <Information label="City" value={vendor.city} />

              <Information label="State" value={vendor.state} />

              <Information label="Country" value={vendor.country} />

              <Information label="Address" value={vendor.address} />
            </div>
          </Section>

          {/* Notes */}

          <Section title="Internal Notes">
            <p className="whitespace-pre-line text-sm font-medium leading-6 text-slate-600">
              {vendor.notes || "No internal notes available."}
            </p>
          </Section>

          {/* Tags */}

          {vendor.tags?.length > 0 && (
            <Section title="Tags">
              <div className="flex flex-wrap gap-2">
                {vendor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* RIGHT */}

        <div className="space-y-6">
          {/* Portal Users */}

          <VendorPortalUsers
            vendorId={vendor._id}
            portalEnabled={vendor.portalEnabled}
          />

          {/* Activity */}

          <Section title="Activity">
            <div className="space-y-5">
              <Metric
                icon={FiClipboard}
                label="Total Requirements"
                value={vendor.totalRequirements ?? 0}
              />

              <Metric
                icon={FiCheckCircle}
                label="Total Assignments"
                value={vendor.totalAssignments ?? 0}
              />
            </div>
          </Section>

          {/* Commercial */}

          <Section title="Commercial">
            <div className="space-y-5">
              <Information label="Payment Terms" value={vendor.paymentTerms} />

              <Information
                label="Default Payment Days"
                value={
                  vendor.defaultPaymentDays !== undefined
                    ? `${vendor.defaultPaymentDays} days`
                    : null
                }
              />

              <Information label="GST Number" value={vendor.gstNumber} />

              <Information
                label="Source"
                value={vendor.source ? formatCompanyType(vendor.source) : null}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   STATUS
============================================================================ */

const VendorStatus = ({ status }) => {
  const styles = {
    ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",

    INACTIVE: "border-slate-200 bg-slate-100 text-slate-600",

    BLOCKED: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
};

/* ==========================================================================
   SECTION
============================================================================ */

const Section = ({ title, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 font-bold text-slate-950">{title}</h2>

    {children}
  </section>
);

/* ==========================================================================
   ROW
============================================================================ */

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon className="mt-0.5 shrink-0 text-slate-400" />

    <div>
      {label && <p className="text-xs font-semibold text-slate-400">{label}</p>}

      <p className="font-medium text-slate-700">{value || "Not provided"}</p>
    </div>
  </div>
);

/* ==========================================================================
   INFORMATION
============================================================================ */

const Information = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-sm font-semibold text-slate-700">
      {value || "Not provided"}
    </p>
  </div>
);

/* ==========================================================================
   METRIC
============================================================================ */

const Metric = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
      <Icon size={18} />
    </div>

    <div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>

      <p className="text-lg font-bold text-slate-900">{value ?? 0}</p>
    </div>
  </div>
);

/* ==========================================================================
   SKELETON
============================================================================ */

const VendorDetailsSkeleton = () => (
  <div className="space-y-6">
    <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />

    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="h-7 w-64 animate-pulse rounded bg-slate-200" />

      <div className="mt-3 h-4 w-40 animate-pulse rounded bg-slate-100" />

      <div className="mt-4 h-4 w-52 animate-pulse rounded bg-slate-100" />
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <div className="h-60 animate-pulse rounded-xl bg-slate-100 lg:col-span-2" />

      <div className="h-60 animate-pulse rounded-xl bg-slate-100" />
    </div>
  </div>
);

export default VendorDetailsPage;
