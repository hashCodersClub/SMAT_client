import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLoader,
  FiLock,
} from "react-icons/fi";
import { Cpu } from "lucide-react";

import trainerInvitationApi from "../../api/trainerInvitationApi";

const TrainerAcceptInvitePage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Validate Invitation
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setError("Invitation token is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await trainerInvitationApi.validate(token);

        setInvitation(response.invitation);
      } catch (error) {
        console.error("Trainer invitation validation failed:", error);

        setError(
          error.response?.data?.message ||
            "This invitation is invalid or has expired.",
        );
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | Submit
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      await trainerInvitationApi.accept({
        token,
        password,
      });

      setSuccess(true);

      /*
      |--------------------------------------------------------------------------
      | Redirect to Login
      |--------------------------------------------------------------------------
      */

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1800);
    } catch (error) {
      console.error("Trainer account activation failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to activate your trainer account.",
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

  if (loading) {
    return (
      <PageShell>
        <div className="py-14 text-center">
          <FiLoader size={28} className="mx-auto animate-spin text-blue-600" />

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Checking invitation
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we verify your invitation.
          </p>
        </div>
      </PageShell>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid Invitation
  |--------------------------------------------------------------------------
  */

  if (error && !invitation) {
    return (
      <PageShell>
        <div className="py-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <FiAlertCircle size={25} className="text-red-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Invitation unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to Login
          </button>
        </div>
      </PageShell>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Success
  |--------------------------------------------------------------------------
  */

  if (success) {
    return (
      <PageShell>
        <div className="py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <FiCheckCircle size={30} className="text-emerald-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Account activated
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Your Nxthack Trainer Portal account has been activated successfully.
          </p>

          <p className="mt-4 text-xs font-medium text-slate-400">
            Redirecting you to login...
          </p>
        </div>
      </PageShell>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Form
  |--------------------------------------------------------------------------
  */

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
          Activate Trainer Account
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Welcome to Nxthack! Set up your password to activate your Trainer Portal account.
        </p>
      </div>

      {/* Trainer Info Card */}
      <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
          Invited Account
        </p>

        <p className="mt-1 text-base font-bold text-slate-900">
          {invitation?.trainerName || "Trainer"}
        </p>

        <p className="mt-0.5 text-xs text-slate-600 font-medium">{invitation?.email}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-sm">
          <FiAlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Password Field */}
        <PasswordField
          label="Create Password"
          value={password}
          setValue={setPassword}
          show={showPassword}
          setShow={setShowPassword}
          placeholder="Minimum 8 characters"
        />

        {/* Strength meter */}
        {password.length > 0 && (
          <div className="-mt-3 space-y-1.5">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  password.length >= 12
                    ? "w-full bg-emerald-500"
                    : password.length >= 8
                      ? "w-2/3 bg-blue-500"
                      : "w-1/3 bg-amber-500"
                }`}
              />
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {password.length >= 12
                ? "Strong password"
                : password.length >= 8
                  ? "Good password length"
                  : "Must be at least 8 characters"}
            </p>
          </div>
        )}

        {/* Confirm Password Field */}
        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          setValue={setConfirmPassword}
          show={showConfirmPassword}
          setShow={setShowConfirmPassword}
          placeholder="Re-enter your password"
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <FiLoader size={17} className="animate-spin" />}
          {submitting ? "Activating Account..." : "Set Password & Activate Portal"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-slate-400">
        Once activated, you can immediately log in with your email and new password.
      </p>
    </PageShell>
  );
};

/*
|--------------------------------------------------------------------------
| Password Field
|--------------------------------------------------------------------------
*/

const PasswordField = ({
  label,
  value,
  setValue,
  show,
  setShow,
  placeholder,
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">
        <FiLock
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={() => setShow((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"
        >
          {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
        </button>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Page Shell
|--------------------------------------------------------------------------
*/

const PageShell = ({ children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}

        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <Cpu size={21} className="text-white" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">
                NXTHACK
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Trainer Portal
              </p>
            </div>
          </div>
        </div>

        {/* Card */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Nxthack IT Solutions
        </p>
      </div>
    </div>
  );
};

export default TrainerAcceptInvitePage;
