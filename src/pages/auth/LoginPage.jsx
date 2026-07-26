import { useEffect, useState } from "react";

import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";

import { Cpu } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

/*
|--------------------------------------------------------------------------
| Role Redirect
|--------------------------------------------------------------------------
*/

const getHomeRoute = (user) => {
  const role = user?.role;

  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
    case "OPERATIONS":
      return "/";

    case "VENDOR":
      return "/vendor/dashboard";

    default:
      return "/";
  }
};

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
  */

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(getHomeRoute(user), {
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

    if (!email.trim()) {
      setError("Please enter your email.");

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
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | AuthContext.login() returns the logged-in user.
      |--------------------------------------------------------------------------
      */

      const loggedInUser = await login(email.trim(), password);

      /*
      |--------------------------------------------------------------------------
      | Redirect By Role
      |--------------------------------------------------------------------------
      */

      navigate(getHomeRoute(loggedInUser), {
        replace: true,
      });
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error.response?.data?.message || "Unable to login. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* ================================================================
          LEFT
      ================================================================= */}

      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />

        {/* Logo */}

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
            Training Operations
          </p>

          <h2 className="mt-5 text-5xl font-bold leading-tight tracking-tight text-white">
            Manage training operations from one place.
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
            Requirements, trainers, vendors, matching and assignments — managed
            through a single operational workflow.
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-600">
          Nxthack IT Solutions
        </p>
      </div>

      {/* ================================================================
          RIGHT
      ================================================================= */}

      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}

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

            <p className="mt-2 text-sm text-slate-500">
              Enter your Nxthack account credentials.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <FiAlertCircle className="mt-0.5 shrink-0" size={17} />

              <span>{error}</span>
            </div>
          )}

          {/* Form */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>

              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Password */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Secure Nxthack platform access
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
