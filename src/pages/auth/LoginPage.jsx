import { useEffect, useState } from "react";

import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

import { Cpu } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

/*
|--------------------------------------------------------------------------
| Role Redirect
|--------------------------------------------------------------------------
|
| Central place for deciding where each user role lands after login.
|
*/

const getHomeRoute = (role) => {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "OPERATIONS":
      return "/";

    case "VENDOR":
      return "/vendor/dashboard";

    case "TRAINER":
      return "/trainer/dashboard";

    default:
      return "/login";
  }
};

/*
|--------------------------------------------------------------------------
| Login Page
|--------------------------------------------------------------------------
*/

const LoginPage = () => {
  const navigate = useNavigate();

  const { login, user, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Already Logged In
  |--------------------------------------------------------------------------
  |
  | Prevent authenticated users from staying on /login.
  |
  */

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(getHomeRoute(user.role), {
        replace: true,
      });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    /*
    |--------------------------------------------------------------------------
    | Basic Validation
    |--------------------------------------------------------------------------
    */

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

      /*
      |--------------------------------------------------------------------------
      | Authenticate
      |--------------------------------------------------------------------------
      |
      | AuthContext.login() should return the authenticated user.
      |
      */

      const loggedInUser = await login(normalizedEmail, password);

      /*
      |--------------------------------------------------------------------------
      | Safety Check
      |--------------------------------------------------------------------------
      */

      if (!loggedInUser) {
        throw new Error(
          "Login succeeded but user information was not returned.",
        );
      }

      if (!loggedInUser.role) {
        throw new Error("No role is assigned to this account.");
      }

      /*
      |--------------------------------------------------------------------------
      | Redirect By Role
      |--------------------------------------------------------------------------
      */

      const destination = getHomeRoute(loggedInUser.role);

      navigate(destination, {
        replace: true,
      });
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

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* ================================================================
          LEFT SIDE
      ================================================================= */}

      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Background Effects */}

        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

        {/* Brand */}

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30">
              <Cpu size={21} className="text-white" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                NXTHACK
              </h1>

              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-300/70">
                Training Operations Platform
              </p>
            </div>
          </div>
        </div>

        {/* Hero */}

        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
            One Platform. Multiple Roles.
          </p>

          <h2 className="mt-5 text-5xl font-bold leading-tight tracking-tight text-white">
            Manage the complete training lifecycle.
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
            A unified workspace for administrators, vendors and trainers to
            manage training requirements, trainer engagement and assignments.
          </p>

          {/* Role Indicators */}

          <div className="mt-8 flex flex-wrap gap-2">
            {["Operations", "Vendors", "Trainers"].map((role) => (
              <span
                key={role}
                className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}

        <div className="relative z-10">
          <p className="text-xs text-slate-600">Nxthack IT Solutions</p>
        </div>
      </div>

      {/* ================================================================
          RIGHT SIDE
      ================================================================= */}

      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Brand */}

          <div className="mb-9 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <Cpu size={19} className="text-white" />
              </div>

              <div>
                <h1 className="font-bold text-slate-900">NXTHACK</h1>

                <p className="text-[10px] uppercase tracking-widest text-slate-400">
                  Training Operations Platform
                </p>
              </div>
            </div>
          </div>

          {/* Heading */}

          <div>
            <p className="text-sm font-semibold text-blue-600">Welcome back</p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Access your Nxthack workspace using your account credentials.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div
              role="alert"
              className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <FiAlertCircle className="mt-0.5 shrink-0" size={17} />

              <span>{error}</span>
            </div>
          )}

          {/* ================================================================
              LOGIN FORM
          ================================================================= */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
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
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
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
                  onChange={(event) => {
                    setPassword(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                >
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Account Information */}

          <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-center text-xs leading-5 text-slate-500">
              Vendor and trainer accounts are activated through an invitation
              from Nxthack.
            </p>
          </div>

          {/* Footer */}

          <p className="mt-6 text-center text-xs text-slate-400">
            Secure Nxthack platform access
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
