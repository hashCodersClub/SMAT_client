import { useEffect, useState } from "react";
import {
  FiSave,
  FiUser,
  FiBell,
  FiLock,
  FiGlobe,
  FiMoon,
  FiMail,
  FiShield,
  FiToggleLeft,
  FiToggleRight,
  FiChevronRight,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import authApi from "../../api/authApi";

const SettingsPage = () => {
  // State for toggles
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });
  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: "English",
    timezone: "IST (UTC+5:30)",
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30 mins",
  });

  /*
  |--------------------------------------------------------------------------
  | Notification/Timezone Preferences — real, backed by
  | GET /api/auth/me + PATCH /api/auth/me/preferences.
  |
  | Dark Mode, Language, 2FA, Session Timeout, and the Profile fields
  | below are NOT wired to anything yet — there's no backend support for
  | them (theming/localization aren't implemented, and there's no admin
  | profile-edit endpoint). They stay local-only, same as before.
  |--------------------------------------------------------------------------
  */

  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsError, setPrefsError] = useState("");
  const [prefsSuccess, setPrefsSuccess] = useState("");

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await authApi.getMe();
        const savedPreferences = response?.user?.preferences;

        if (savedPreferences) {
          setNotifications((prev) => ({
            ...prev,
            email: savedPreferences.emailNotifications ?? prev.email,
            push: savedPreferences.pushNotifications ?? prev.push,
            sms: savedPreferences.smsNotifications ?? prev.sms,
          }));

          setPreferences((prev) => ({
            ...prev,
            timezone: savedPreferences.timezone || prev.timezone,
          }));
        }
      } catch {
        // Non-fatal — fall back to defaults already in state.
      } finally {
        setPrefsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleSaveChanges = async () => {
    setPrefsSaving(true);
    setPrefsError("");
    setPrefsSuccess("");

    try {
      await authApi.updatePreferences({
        emailNotifications: notifications.email,
        pushNotifications: notifications.push,
        smsNotifications: notifications.sms,
        timezone: preferences.timezone,
      });

      setPrefsSuccess("Notification and timezone preferences saved.");
    } catch (err) {
      setPrefsError(
        err.response?.data?.message || "Unable to save preferences.",
      );
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleToggle = (section, key) => {
    if (section === "notifications") {
      setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    } else if (section === "preferences") {
      if (key === "darkMode") {
        setPreferences((prev) => ({ ...prev, darkMode: !prev.darkMode }));
      }
    } else if (section === "security") {
      if (key === "twoFactor") {
        setSecurity((prev) => ({ ...prev, twoFactor: !prev.twoFactor }));
      }
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Notification and timezone changes below are saved to your account.
            Profile and security settings aren't wired up yet.
          </p>
        </div>
        <button
          onClick={handleSaveChanges}
          disabled={prefsSaving || prefsLoading}
          className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50 disabled:opacity-60 sm:mt-0"
        >
          <FiSave size={16} />
          {prefsSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {prefsError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{prefsError}</span>
        </div>
      )}

      {prefsSuccess && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{prefsSuccess}</span>
        </div>
      )}

      {/* Settings cards */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <SettingCard
          icon={FiUser}
          title="Profile"
          description="Manage your personal information"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Admin User"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="admin@nxthack.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>
        </SettingCard>

        {/* Preferences */}
        <SettingCard
          icon={FiGlobe}
          title="Preferences"
          description="Customize your experience"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Dark Mode</p>
                <p className="text-xs text-slate-400">Switch to dark theme</p>
              </div>
              <button
                onClick={() => handleToggle("preferences", "darkMode")}
                className="text-2xl text-slate-400 transition hover:text-white"
              >
                {preferences.darkMode ? (
                  <FiToggleRight className="text-blue-400" />
                ) : (
                  <FiToggleLeft />
                )}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              >
                <option value="English" className="bg-slate-900">
                  English
                </option>
                <option value="Hindi" className="bg-slate-900">
                  Hindi
                </option>
                <option value="Spanish" className="bg-slate-900">
                  Spanish
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    timezone: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              >
                <option value="IST (UTC+5:30)" className="bg-slate-900">
                  IST (UTC+5:30)
                </option>
                <option value="EST (UTC-5:00)" className="bg-slate-900">
                  EST (UTC-5:00)
                </option>
                <option value="PST (UTC-8:00)" className="bg-slate-900">
                  PST (UTC-8:00)
                </option>
              </select>
            </div>
          </div>
        </SettingCard>

        {/* Notifications */}
        <SettingCard
          icon={FiBell}
          title="Notifications"
          description="Manage how you receive updates"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Email Notifications</p>
                <p className="text-xs text-slate-400">
                  Receive updates via email
                </p>
              </div>
              <button
                onClick={() => handleToggle("notifications", "email")}
                className="text-2xl text-slate-400 transition hover:text-white"
              >
                {notifications.email ? (
                  <FiToggleRight className="text-blue-400" />
                ) : (
                  <FiToggleLeft />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Push Notifications</p>
                <p className="text-xs text-slate-400">In-app alerts</p>
              </div>
              <button
                onClick={() => handleToggle("notifications", "push")}
                className="text-2xl text-slate-400 transition hover:text-white"
              >
                {notifications.push ? (
                  <FiToggleRight className="text-blue-400" />
                ) : (
                  <FiToggleLeft />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">SMS Notifications</p>
                <p className="text-xs text-slate-400">
                  Important alerts via SMS
                </p>
              </div>
              <button
                onClick={() => handleToggle("notifications", "sms")}
                className="text-2xl text-slate-400 transition hover:text-white"
              >
                {notifications.sms ? (
                  <FiToggleRight className="text-blue-400" />
                ) : (
                  <FiToggleLeft />
                )}
              </button>
            </div>
          </div>
        </SettingCard>

        {/* Security */}
        <SettingCard
          icon={FiLock}
          title="Security"
          description="Protect your account"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400">
                  Add an extra layer of security
                </p>
              </div>
              <button
                onClick={() => handleToggle("security", "twoFactor")}
                className="text-2xl text-slate-400 transition hover:text-white"
              >
                {security.twoFactor ? (
                  <FiToggleRight className="text-blue-400" />
                ) : (
                  <FiToggleLeft />
                )}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Session Timeout
              </label>
              <select
                value={security.sessionTimeout}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    sessionTimeout: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              >
                <option value="15 mins" className="bg-slate-900">
                  15 mins
                </option>
                <option value="30 mins" className="bg-slate-900">
                  30 mins
                </option>
                <option value="1 hour" className="bg-slate-900">
                  1 hour
                </option>
                <option value="Never" className="bg-slate-900">
                  Never
                </option>
              </select>
            </div>
            <button className="text-sm font-medium text-red-400 transition hover:text-red-300">
              Change Password
            </button>
          </div>
        </SettingCard>
      </div>
    </div>
  );
};

// Setting Card Component
const SettingCard = ({ icon: Icon, title, description, children }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2.5 border border-white/10">
          <Icon size={20} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <div className="pl-2">{children}</div>
    </div>
  );
};

export default SettingsPage;
