import {
  FiGrid,
  FiBriefcase,
  FiUsers,
  FiUserCheck,
  FiClipboard,
  FiSettings,
  FiUser,
  FiCalendar,
} from "react-icons/fi";

/*
|--------------------------------------------------------------------------
| Navigation Configuration
|--------------------------------------------------------------------------
*/

export const navigationConfig = {
  /*
  |--------------------------------------------------------------------------
  | ADMIN
  |--------------------------------------------------------------------------
  */

  ADMIN: {
    portalName: "Operations Portal",

    navbar: {
      title: "Trainer Operations",
      subtitle: "Manage requirements, trainers and assignments",
      searchPlaceholder: "Search trainers, vendors...",
    },

    profilePath: "/settings",
    settingsPath: "/settings",

    navigation: [
      {
        title: "MAIN",
        items: [
          {
            name: "Dashboard",
            path: "/",
            icon: FiGrid,
          },
        ],
      },

      {
        title: "OPERATIONS",
        items: [
          {
            name: "Requirements",
            path: "/requirements",
            icon: FiClipboard,
          },
          {
            name: "Trainers",
            path: "/trainers",
            icon: FiUsers,
          },
          {
            name: "Vendors",
            path: "/vendors",
            icon: FiBriefcase,
          },
          {
            name: "Assignments",
            path: "/assignments",
            icon: FiUserCheck,
          },
        ],
      },

      {
        title: "ACCOUNT",
        items: [
          {
            name: "Settings",
            path: "/settings",
            icon: FiSettings,
          },
        ],
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | VENDOR
  |--------------------------------------------------------------------------
  */

  VENDOR: {
    portalName: "Vendor Portal",

    navbar: {
      title: "Vendor Portal",
      subtitle: "Manage your training requirements",
      searchPlaceholder: "Search requirements...",
    },

    profilePath: "/vendor/profile",
    settingsPath: "/vendor/settings",

    navigation: [
      {
        title: "MAIN",
        items: [
          {
            name: "Dashboard",
            path: "/vendor",
            icon: FiGrid,
          },
        ],
      },

      {
        title: "TRAINING",
        items: [
          {
            name: "Requirements",
            path: "/vendor/requirements",
            icon: FiClipboard,
          },
          {
            name: "Assignments",
            path: "/vendor/assignments",
            icon: FiUserCheck,
          },
        ],
      },

      {
        title: "ACCOUNT",
        items: [
          {
            name: "My Profile",
            path: "/vendor/profile",
            icon: FiUser,
          },
          {
            name: "Settings",
            path: "/vendor/settings",
            icon: FiSettings,
          },
        ],
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | TRAINER
  |--------------------------------------------------------------------------
  */

  TRAINER: {
    portalName: "Trainer Portal",

    navbar: {
      title: "Trainer Portal",
      subtitle: "Manage your opportunities and training assignments",
      searchPlaceholder: "Search opportunities...",
    },

    profilePath: "/trainer/profile",
    settingsPath: "/trainer/settings",

    navigation: [
      {
        title: "MAIN",
        items: [
          {
            name: "Dashboard",
            path: "/trainer",
            icon: FiGrid,
          },
        ],
      },

      {
        title: "TRAINING",
        items: [
          {
            name: "Opportunities",
            path: "/trainer/opportunities",
            icon: FiClipboard,
          },
          {
            name: "Assignments",
            path: "/trainer/assignments",
            icon: FiUserCheck,
          },
          {
            name: "Schedule",
            path: "/trainer/schedule",
            icon: FiCalendar,
          },
        ],
      },

      {
        title: "ACCOUNT",
        items: [
          {
            name: "My Profile",
            path: "/trainer/profile",
            icon: FiUser,
          },
          {
            name: "Settings",
            path: "/trainer/settings",
            icon: FiSettings,
          },
        ],
      },
    ],
  },
};

export const getNavigationConfig = (role) => {
  console.log(role);
  return navigationConfig[role] || navigationConfig.ADMIN;
};
