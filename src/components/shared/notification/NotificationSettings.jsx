// features/notifications/components/NotificationSettings.jsx

import React, { useState } from "react";

const NotificationSettings = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState(
    settings || {
      emailEnabled: true,
      pushEnabled: true,
      soundEnabled: true,
      categories: {
        system: true,
        message: true,
        alert: true,
        reminder: true,
        update: true,
      },
    },
  );

  const handleToggle = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCategoryToggle = (cat) => {
    setLocalSettings((prev) => ({
      ...prev,
      categories: { ...prev.categories, [cat]: !prev.categories[cat] },
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Notification Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Global toggles */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Email Notifications
              </span>
              <input
                type="checkbox"
                checked={localSettings.emailEnabled}
                onChange={() =>
                  handleToggle("emailEnabled", !localSettings.emailEnabled)
                }
                className="toggle"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Push Notifications
              </span>
              <input
                type="checkbox"
                checked={localSettings.pushEnabled}
                onChange={() =>
                  handleToggle("pushEnabled", !localSettings.pushEnabled)
                }
                className="toggle"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Sound
              </span>
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={() =>
                  handleToggle("soundEnabled", !localSettings.soundEnabled)
                }
                className="toggle"
              />
            </label>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Category preferences */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category Preferences
            </h3>
            <div className="space-y-1">
              {Object.entries(localSettings.categories).map(
                ([cat, enabled]) => (
                  <label
                    key={cat}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize text-gray-600 dark:text-gray-400">
                      {cat}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleCategoryToggle(cat)}
                      className="toggle"
                    />
                  </label>
                ),
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
