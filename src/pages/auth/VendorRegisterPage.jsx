import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";

import vendorInvitationApi from "../../api/vendorInvitationApi";

const VendorRegisterPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  /*
  |--------------------------------------------------------------------------
  | Invitation State
  |--------------------------------------------------------------------------
  */

  const [invitation, setInvitation] = useState(null);

  const [loadingInvitation, setLoadingInvitation] = useState(true);

  const [invitationError, setInvitationError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Registration State
  |--------------------------------------------------------------------------
  */

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState("");

  const [success, setSuccess] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Validate Invitation
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const validateInvitation = async () => {
      /*
      |--------------------------------------------------------------------------
      | Missing Token
      |--------------------------------------------------------------------------
      */

      if (!token) {
        setInvitationError("This invitation link is invalid.");

        setLoadingInvitation(false);

        return;
      }

      try {
        setLoadingInvitation(true);

        setInvitationError("");

        const response = await vendorInvitationApi.validate(token);

        setInvitation(response.invitation);
      } catch (error) {
        console.error("Invitation validation failed:", error);

        setInvitationError(
          error.response?.data?.message ||
            "This invitation is invalid or has expired.",
        );
      } finally {
        setLoadingInvitation(false);
      }
    };

    validateInvitation();
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | Register
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!password) {
      setFormError("Please enter a password.");

      return;
    }

    if (password.length < 8) {
      setFormError("Password must contain at least 8 characters.");

      return;
    }

    if (!confirmPassword) {
      setFormError("Please confirm your password.");

      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Accept Invitation
    |--------------------------------------------------------------------------
    */

    try {
      setSubmitting(true);

      await vendorInvitationApi.accept(token, {
        password,
        confirmPassword,
      });

      setSuccess(true);
    } catch (error) {
      console.error("Vendor registration failed:", error);

      setFormError(
        error.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loadingInvitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Validating your invitation...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid Invitation
  |--------------------------------------------------------------------------
  */

  if (invitationError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <FiAlertCircle size={23} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Invitation unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {invitationError}
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Login
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            Contact Nxthack if you need a new invitation.
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Registration Successful
  |--------------------------------------------------------------------------
  */

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <FiCheckCircle size={27} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Account created
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your vendor account has been created successfully.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            You can now sign in to the Nxthack Vendor Portal.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/login", {
                replace: true,
              })
            }
            className="mt-7 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Registration Form
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2">
          {/* ================================================================
              LEFT
          ================================================================= */}

          <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="text-xl font-bold tracking-tight">NXTHACK</div>

              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                Vendor Portal
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold leading-tight">
                Manage your training requirements in one place.
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
                Submit requirements, track progress, review trainer profiles and
                coordinate assignments directly with Nxthack.
              </p>
            </div>

            <p className="text-xs text-slate-500">Nxthack IT Solutions</p>
          </div>

          {/* ================================================================
              RIGHT
          ================================================================= */}

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="lg:hidden">
              <p className="text-lg font-bold text-slate-900">NXTHACK</p>

              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                Vendor Portal
              </p>
            </div>

            <div className="mt-8 lg:mt-0">
              <p className="text-sm font-semibold text-blue-600">
                Vendor invitation
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Set a password to activate your vendor portal access.
              </p>
            </div>

            {/* ================================================================
                INVITATION INFORMATION
            ================================================================= */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                You're joining
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {invitation?.companyName}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <FiMail className="shrink-0 text-slate-400" />

                <span className="truncate">{invitation?.email}</span>
              </div>

              {invitation?.name && (
                <p className="mt-2 text-sm text-slate-500">
                  Invited as{" "}
                  <span className="font-medium text-slate-700">
                    {invitation.name}
                  </span>
                </p>
              )}
            </div>

            {/* ================================================================
                FORM
            ================================================================= */}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {/* Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <FiLock
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <FiLock
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}

              {formError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  <FiAlertCircle size={17} className="mt-0.5 shrink-0" />

                  <span>{formError}</span>
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating account..." : "Create Vendor Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              This registration link is tied to your invited email address and
              can only be used once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegisterPage;
