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
  FiSend,
  FiUserCheck,
  FiClock,
  FiX,
} from "react-icons/fi";

import vendorsApi from "../../../api/vendorsApi";
import vendorInvitationApi from "../../../api/vendorInvitationApi";
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

  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

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
  | Send / Resend Portal Invitation
  |--------------------------------------------------------------------------
  |
  | Mirrors the Trainer Portal Access flow (handleSendInvitation in
  | TrainerDetailsPage.jsx). Uses the vendor's primary contact by default —
  | the backend falls back to it automatically when no name/email is sent.
  |--------------------------------------------------------------------------
  */

  const handleSendInvitation = async () => {
    const vendorId = vendor?._id || vendor?.id || id;

    if (!vendorId) {
      setInviteError("Vendor ID is missing.");
      return;
    }

    try {
      setInviting(true);
      setInviteSuccess("");
      setInviteError("");

      const response = await vendorInvitationApi.invite(vendorId);

      setInviteSuccess(
        response?.message || "Vendor portal invitation sent successfully.",
      );

      await fetchVendor();
    } catch (err) {
      console.error("Failed to send vendor invitation:", err);

      setInviteError(
        err.response?.data?.message ||
          "Unable to send vendor portal invitation.",
      );
    } finally {
      setInviting(false);
    }
  };

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
      <div className="relative mx-auto max-w-3xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

        <button
          type="button"
          onClick={() => navigate("/admin/vendors")}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Vendors</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-red-200/80 bg-white/80 p-8 text-center backdrop-blur-sm shadow-lg shadow-red-100/20">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-red-100/70 p-2.5">
              <FiAlertCircle size={28} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-red-800">
                Vendor could not be loaded
              </h2>
              <p className="mt-1 text-sm text-red-700">
                {error || "Vendor not found."}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchVendor}
              className="rounded-full bg-red-100/80 px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200/80 hover:shadow-md active:scale-95"
            >
              Retry
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
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

  /*
  |--------------------------------------------------------------------------
  | Portal Status
  |--------------------------------------------------------------------------
  */

  const portalActive = Boolean(vendor.portalEnabled);
  const inviteEmail = primaryContact?.email;

  return (
    <div className="relative mx-auto max-w-7xl animate-fade-in-up px-4 py-6 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/20 to-pink-100/20 blur-3xl" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/admin/vendors")}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
      >
        <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back to Vendors</span>
      </button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 backdrop-blur-xl shadow-2xl shadow-slate-200/40 transition-all duration-300 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 sm:text-3xl">
                {vendor.companyName}
              </h1>
              <VendorStatus status={vendor.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {formatCompanyType(vendor.companyType)}
            </p>
            {(vendor.city || vendor.state || vendor.country) && (
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FiMapPin className="mt-0.5 shrink-0" />
                {[vendor.city, vendor.state, vendor.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {vendor.website && (
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <FiGlobe />
                {vendor.website}
              </p>
            )}
          </div>
          <div className="flex h-fit shrink-0 flex-wrap gap-2">
            {!portalActive && (
              <button
                type="button"
                onClick={handleSendInvitation}
                disabled={inviting || !inviteEmail}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/80 px-4 py-2.5 text-sm font-medium text-blue-700 backdrop-blur-sm transition hover:bg-blue-100/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800/30 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
              >
                {inviting ? <FiLoader className="animate-spin" /> : <FiSend />}
                {inviting ? "Sending…" : "Send Portal Invitation"}
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate(`/admin/vendors/${vendor._id}/edit`)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-95"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit Vendor
            </button>
            <button
              type="button"
              onClick={handleDeleteVendor}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200/80 bg-white/70 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
            >
              {deleting ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
              {deleting ? "Deleting…" : "Delete Vendor"}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
      </div>

      {/* Delete Error */}
      {deleteError && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-red-100/30"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
              <FiAlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Delete failed
              </p>
              <p className="mt-1 text-sm text-red-700">{deleteError}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {inviteSuccess && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border border-emerald-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-emerald-100/30"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-600 shadow-inner">
              <FiCheckCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-800">
                Invitation sent
              </p>
              <p className="mt-1 text-sm text-emerald-700">{inviteSuccess}</p>
            </div>
            <button
              type="button"
              onClick={() => setInviteSuccess("")}
              className="text-emerald-500 hover:text-emerald-800"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-300 to-emerald-500/60" />
        </div>
      )}

      {inviteError && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-red-100/30"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
              <FiAlertCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800">
                Invitation failed
              </p>
              <p className="mt-1 text-sm text-red-700">{inviteError}</p>
            </div>
            <button
              type="button"
              onClick={() => setInviteError("")}
              className="text-red-500 hover:text-red-800"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {/* Vendor Portal Access & Onboarding Workflow */}
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl shadow-xl shadow-slate-200/40 transition-all duration-300 dark:bg-slate-800/40">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                portalActive
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-emerald-500/20"
                  : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/20"
              }`}
            >
              {portalActive ? <FiUserCheck size={22} /> : <FiClock size={22} />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Vendor Portal Access
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    portalActive
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  }`}
                >
                  {portalActive ? "ACTIVE" : "PENDING"}
                </span>
              </div>

              {portalActive ? (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Portal access is active. The vendor can sign in to submit
                  requirements, track assignments, and manage their profile.
                </p>
              ) : (
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {inviteEmail ? (
                    <>
                      Send an activation link to{" "}
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {inviteEmail}
                      </span>{" "}
                      so the vendor can set up their password.
                    </>
                  ) : (
                    "Add a primary contact email to this vendor before sending a portal invitation."
                  )}
                </p>
              )}
            </div>
          </div>

          {!portalActive && inviteEmail && (
            <button
              type="button"
              onClick={handleSendInvitation}
              disabled={inviting}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {inviting ? <FiLoader className="animate-spin" /> : <FiSend />}
              {inviting ? "Sending..." : "Send Invitation Email"}
            </button>
          )}
        </div>

        {/* Onboarding Workflow Stepper */}
        <div className="mt-6 border-t border-slate-200/60 pt-5 dark:border-white/10">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Vendor Onboarding Workflow
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-xs">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  1. Vendor Added
                </p>
                <p className="text-[10px] text-slate-500">By Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${inviteEmail ? "bg-emerald-500" : "bg-amber-500"}`}
              >
                {inviteEmail ? "✓" : "2"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2. Email Dispatched
                </p>
                <p className="text-[10px] text-slate-500">
                  {inviteEmail
                    ? "Activation Link Sent"
                    : "Contact Email Required"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${portalActive ? "bg-emerald-500" : "bg-amber-400"}`}
              >
                {portalActive ? "✓" : "3"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  3. Password Setup
                </p>
                <p className="text-[10px] text-slate-500">
                  {portalActive ? "Completed by Vendor" : "Pending Action"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${portalActive ? "bg-emerald-500" : "bg-slate-300"}`}
              >
                {portalActive ? "✓" : "4"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  4. Portal Activated
                </p>
                <p className="text-[10px] text-slate-500">
                  {portalActive ? "Ready for Login" : "Awaiting Setup"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 opacity-30" />
      </section>

      {/* Main Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Primary Contact */}
          <Section title="Primary Contact">
            {primaryContact ? (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {primaryContact.name || "Unnamed Contact"}
                </h3>
                {primaryContact.designation && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
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
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
            <p className="whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-300">
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
                    className="rounded-full bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur-sm dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right Column */}
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
    ACTIVE:
      "border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-300",
    INACTIVE:
      "border-slate-200/80 bg-slate-100/80 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-400",
    BLOCKED:
      "border-red-200/80 bg-red-50/80 text-red-700 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${
        styles[status] ||
        "border-slate-200/80 bg-slate-50/80 text-slate-600 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-400"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
};

/* ==========================================================================
   SECTION (glass card)
============================================================================ */

const Section = ({ title, children }) => (
  <section className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-5 backdrop-blur-sm shadow-xl shadow-slate-200/30 transition-all duration-300 dark:bg-slate-800/30">
    <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
      {title}
    </h2>
    {children}
    <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20" />
  </section>
);

/* ==========================================================================
   ROW
============================================================================ */

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
    <div>
      {label && (
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          {label}
        </p>
      )}
      <p className="font-medium text-slate-700 dark:text-slate-300">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

/* ==========================================================================
   INFORMATION
============================================================================ */

const Information = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
      {value || "Not provided"}
    </p>
  </div>
);

/* ==========================================================================
   METRIC
============================================================================ */

const Metric = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="rounded-xl bg-blue-50/80 p-2.5 text-blue-600 backdrop-blur-sm dark:bg-blue-900/20 dark:text-blue-300">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="text-lg font-bold text-slate-900 dark:text-white">
        {value ?? 0}
      </p>
    </div>
  </div>
);

/* ==========================================================================
   SKELETON (upgraded with glass styling)
============================================================================ */

const VendorDetailsSkeleton = () => (
  <div className="relative mx-auto max-w-7xl animate-fade-in-up px-4 py-6 sm:px-6 lg:px-8">
    <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/20 to-pink-100/20 blur-3xl" />

    <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

    <div className="relative mt-6 overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 backdrop-blur-xl shadow-2xl shadow-slate-200/40">
      <div className="h-7 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-700/60" />
      <div className="mt-4 h-4 w-52 animate-pulse rounded bg-slate-100 dark:bg-slate-700/60" />
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="relative h-60 animate-pulse rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
        <div className="relative h-60 animate-pulse rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
      </div>
      <div className="space-y-6">
        <div className="relative h-60 animate-pulse rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
        <div className="relative h-60 animate-pulse rounded-2xl bg-slate-100/60 backdrop-blur-sm dark:bg-slate-700/30" />
      </div>
    </div>
  </div>
);

export default VendorDetailsPage;
