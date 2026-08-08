import { useState } from "react";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import VendorForm from "../../../components/admin/vendors/VendorForm";
import vendorsApi from "../../../api/vendorsApi";
import vendorInvitationApi from "../../../api/vendorInvitationApi";

const AddVendorPage = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Create Vendor & Send Portal Invitation
  |--------------------------------------------------------------------------
  |
  | Mirrors AddTrainerPage.jsx. The backend (vendor.controller.js:createVendor)
  | already creates the vendor AND sends the portal invitation email to the
  | primary contact in one request — it returns `portal.emailSent` to tell us
  | whether that succeeded. We only fall back to calling
  | vendorInvitationApi.invite() ourselves if the backend didn't manage to
  | send it (e.g. transient SMTP failure), exactly like the trainer flow.
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess(null);

      const response = await vendorsApi.create(data);

      const createdVendor = response?.vendor || response;
      const vendorId = createdVendor?._id || createdVendor?.id;

      const primaryContact =
        createdVendor?.contacts?.find((contact) => contact.isPrimary) ||
        createdVendor?.contacts?.[0];

      let invitationSent = response?.portal?.emailSent === true;
      let invitationError = response?.portal?.error || "";

      // If the backend didn't already send it, trigger it now as a fallback
      if (!invitationSent && vendorId) {
        try {
          await vendorInvitationApi.invite(vendorId);
          invitationSent = true;
          invitationError = "";
        } catch (inviteErr) {
          console.warn("Vendor invitation trigger failed:", inviteErr);

          invitationError =
            inviteErr.response?.data?.message ||
            invitationError ||
            "The vendor was created, but the invitation email could not be sent.";
        }
      }

      setSuccess({
        companyName: createdVendor?.companyName || data.companyName || "Vendor",

        email: primaryContact?.email,

        message: invitationSent
          ? "Vendor created and portal invitation email sent successfully."
          : "Vendor created successfully. You can send the portal invitation anytime.",

        vendorId,

        invitationSent,

        invitationError,
      });

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | We intentionally DO NOT immediately navigate away.
      |
      | Admin should see whether the invitation email was successfully sent.
      |--------------------------------------------------------------------------
      */
    } catch (err) {
      console.error("Failed to create vendor:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to create vendor. Please check the information and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Success Screen
  |--------------------------------------------------------------------------
  */

  if (success) {
    return (
      <div className="relative mx-auto max-w-2xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

        <div className="relative rounded-3xl border border-white/20 bg-white/70 p-8 text-center shadow-2xl shadow-slate-200/40 backdrop-blur-xl">
          {/* Icon */}

          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              success.invitationSent ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            {success.invitationSent ? (
              <FiCheckCircle size={30} className="text-emerald-600" />
            ) : (
              <FiAlertCircle size={30} className="text-amber-600" />
            )}
          </div>

          {/* Heading */}

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Vendor Created
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {success.message}
          </p>

          {/* Vendor */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Vendor
            </p>

            <p className="mt-1 font-bold text-slate-900">
              {success.companyName}
            </p>

            {success.email && (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <FiMail />

                <span>{success.email}</span>
              </div>
            )}
          </div>

          {/* Invitation Status */}

          {success.invitationSent ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <FiCheckCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Portal invitation sent
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-700">
                    An activation email has been sent to{" "}
                    <span className="font-semibold">{success.email}</span>. The
                    vendor can use the link to create their password and
                    activate their portal account.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <FiAlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Invitation not sent
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    {success.invitationError ||
                      "Add a primary contact email and send the invitation from the vendor details page."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flow */}

          {success.invitationSent && (
            <div className="mt-6 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                What happens next?
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>1. Vendor opens the invitation email.</p>

                <p>2. Vendor creates their portal password.</p>

                <p>3. Their Vendor account becomes active.</p>

                <p>4. They can sign in to the Vendor Portal.</p>
              </div>
            </div>
          )}

          {/* Actions */}

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/admin/vendors")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Vendors
            </button>

            {success.vendorId && (
              <button
                type="button"
                onClick={() => navigate(`/admin/vendors/${success.vendorId}`)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View Vendor
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Add Vendor Form
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative mx-auto max-w-5xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/admin/vendors")}
        disabled={submitting}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back to Vendors</span>
      </button>

      {/* Header */}
      <div className="relative mb-8">
        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 sm:text-4xl">
          Add Vendor
        </h1>
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
          Add a training partner or client to Nxthack. An invitation email will
          automatically be sent to the primary contact so they can activate
          their Vendor Portal account.
        </p>
      </div>

      {/* Invitation Information */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <FiMail size={19} className="mt-0.5 shrink-0 text-blue-600" />

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Vendor Portal Invitation
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">
            After saving, Nxthack will automatically email the vendor's primary
            contact an activation link. Make sure the primary contact's email
            address is correct.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="relative mb-8 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-red-100/30 transition-all duration-300"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
              <FiAlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to create vendor
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {/* Main Card */}
      <div className="relative rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 sm:p-8 dark:bg-slate-800/30">
        <VendorForm
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={
            submitting
              ? "Creating & Sending Invitation..."
              : "Create Vendor & Send Invitation"
          }
        />
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
      </div>
    </div>
  );
};

export default AddVendorPage;
