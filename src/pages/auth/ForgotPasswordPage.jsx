import { useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";

import authApi from "../../api/authApi";
import logoLight from "../../assets/logos/trainexus.light.png";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // The backend always returns a generic success message here,
      // whether or not the email matches an account — this page
      // should never reveal which emails have accounts either.
      await authApi.forgotPassword(normalizedEmail);

      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-9">
          <img
            src={logoLight}
            alt="Trainexus"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter the email on your account and we'll send you a link to
            reset it.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="mt-8 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <FiCheckCircle className="mt-0.5 shrink-0" size={17} />
            <span>
              If an account exists for that email, a password reset link is
              on its way. Check your inbox.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <FiMail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-blue-600/40 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
