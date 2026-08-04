import { useEffect, useState } from "react";
import {
  FiBell,
  FiGlobe,
  FiLock,
  FiToggleLeft,
  FiToggleRight,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import authApi from "../../../api/authApi";

/*
|--------------------------------------------------------------------------
| Vendor Settings Page
|--------------------------------------------------------------------------
|
| Change Password — wired to POST /api/auth/change-password.
| Notifications + Timezone — wired to GET /api/auth/me and
| PATCH /api/auth/me/preferences. Both are real now; company details
| still live on the separate Profile page.
|--------------------------------------------------------------------------
*/

const VendorSettingsPage = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
  });

  const [timezone, setTimezone] = useState("IST (UTC+5:30)");

  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsError, setPrefsError] = useState("");
  const [prefsSuccess, setPrefsSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Current Preferences
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await authApi.getMe();
        const preferences = response?.user?.preferences;

        if (preferences) {
          setNotifications({
            email: preferences.emailNotifications ?? true,
            sms: preferences.smsNotifications ?? false,
          });
          setTimezone(preferences.timezone || "IST (UTC+5:30)");
        }
      } catch {
        // Non-fatal — fall back to defaults already in state.
      } finally {
        setPrefsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleToggle = (key) => {
    setNotifications((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const handleSavePreferences = async () => {
    setPrefsSaving(true);
    setPrefsError("");
    setPrefsSuccess("");

    try {
      await authApi.updatePreferences({
        emailNotifications: notifications.email,
        smsNotifications: notifications.sms,
        timezone,
      });

      setPrefsSuccess("Preferences saved.");
    } catch (err) {
      setPrefsError(
        err.response?.data?.message || "Unable to save preferences.",
      );
    } finally {
      setPrefsSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Change Password
  |--------------------------------------------------------------------------
  */

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setPasswordSaving(true);

    try {
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );

      setPasswordSuccess("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          "Unable to update your password. Check your current password and try again.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account, security, and notification preferences.
        </p>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <FiLock size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Change Password
            </h2>
            <p className="text-sm text-slate-500">
              Update the password used to sign in
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Notifications & Preferences */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <FiBell size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Notifications
              </h2>
              <p className="text-sm text-slate-500">
                Choose how you'd like to hear about updates
              </p>
            </div>
          </div>
        </div>

        {prefsError && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{prefsError}</span>
          </div>
        )}

        {prefsSuccess && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{prefsSuccess}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-900">Email Notifications</p>
              <p className="text-xs text-slate-500">
                Requirement updates and outreach responses
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("email")}
              disabled={prefsLoading}
              className="text-2xl text-slate-300 transition hover:text-slate-500 disabled:opacity-50"
              aria-label="Toggle email notifications"
            >
              {notifications.email ? (
                <FiToggleRight className="text-indigo-600" />
              ) : (
                <FiToggleLeft />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-900">SMS Notifications</p>
              <p className="text-xs text-slate-500">
                Time-sensitive alerts via SMS
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("sms")}
              disabled={prefsLoading}
              className="text-2xl text-slate-300 transition hover:text-slate-500 disabled:opacity-50"
              aria-label="Toggle SMS notifications"
            >
              {notifications.sms ? (
                <FiToggleRight className="text-indigo-600" />
              ) : (
                <FiToggleLeft />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <FiGlobe size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Preferences
            </h2>
            <p className="text-sm text-slate-500">Regional settings</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            disabled={prefsLoading}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
          >
            <option value="IST (UTC+5:30)">IST (UTC+5:30)</option>
            <option value="EST (UTC-5:00)">EST (UTC-5:00)</option>
            <option value="PST (UTC-8:00)">PST (UTC-8:00)</option>
          </select>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleSavePreferences}
            disabled={prefsSaving || prefsLoading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <FiSave size={16} />
            {prefsSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorSettingsPage;
