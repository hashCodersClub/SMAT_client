import { useEffect, useState } from "react";
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Import your logos (adjust the path as needed)
import logoDark from "../../assets/logos/trainexus.dark.png"; // for dark backgrounds
import logoLight from "../../assets/logos/trainexus.light.png"; // for light backgrounds

// ----------------------------------------------------------------------
// Role → Home route mapping
// ----------------------------------------------------------------------
const getHomeRoute = (role) => {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "OPERATIONS":
      return "/admin/dashboard";
    case "VENDOR":
      return "/vendor/dashboard";
    case "TRAINER":
      return "/trainer/dashboard";
    default:
      return "/login";
  }
};

// ----------------------------------------------------------------------
// LoginPage component
// ----------------------------------------------------------------------
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(getHomeRoute(user.role), { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Handle login
  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const loggedInUser = await login(normalizedEmail, password);

      if (!loggedInUser) {
        throw new Error(
          "Login succeeded but user information was not returned.",
        );
      }
      if (!loggedInUser.role) {
        throw new Error("No role is assigned to this account.");
      }

      navigate(getHomeRoute(loggedInUser.role), { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-slate-950 font-sans">
      {/* ================================================================
          LEFT SIDE – Dark Hero
      ================================================================ */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

        {/* Brand – using the DARK logo variant (white text) */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={logoDark}
              alt="Tranexus"
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-xl -mt-30">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
            One Platform. Multiple Roles.
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.15] tracking-tight text-white">
            Connect vendors with top‑tier trainers – automatically.
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-slate-400">
            Vendors post training requirements, and our AI‑powered engine
            shortlists the best‑matched, pre‑evaluated trainers from the
            Tranexus network. Streamline your entire training operations.
          </p>

          {/* Role indicators */}
          <div className="mt-8 flex flex-wrap gap-2">
            {["Vendors", "Trainers", "Admins"].map((role) => (
              <span
                key={role}
                className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-1.5 text-xs font-medium tracking-wide text-slate-300"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs font-light text-slate-600">
            Tranexus – AI Powered Training OS
          </p>
        </div>
      </div>

      {/* ================================================================
          RIGHT SIDE – Light Login Form
      ================================================================ */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile brand – using the LIGHT logo variant */}
          <div className="mb-9 lg:hidden">
            <img
              src={logoLight}
              alt="Tranexus"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div>
            <p className="text-sm font-semibold text-blue-600">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Access your Tranexus workspace using your credentials.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <FiAlertCircle className="mt-0.5 shrink-0" size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
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

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <FiLock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 hover:shadow-blue-600/40 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-center text-xs text-slate-500">
              Vendor and trainer accounts are activated through an invitation
              from Tranexus.
            </p>
          </div>

          <p className="mt-6 text-center text-xs font-light text-slate-400">
            Secure Tranexus platform access
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
