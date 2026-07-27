import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

// Authentication
import LoginPage from "../pages/auth/LoginPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import VendorRegisterPage from "../pages/auth/VendorRegisterPage";
import TrainerAcceptInvitePage from "../pages/auth/TrainerAcceptInvitePage";

// Dashboard
import DashboardPage from "../pages/admin/DashboardPage";

// Trainers
import TrainersPage from "../pages/admin/trainers/TrainersPage";
import AddTrainerPage from "../pages/admin/trainers/AddTrainerPage";
import TrainerDetailsPage from "../pages/admin/trainers/TrainerDetailsPage";
import TrainerAvailabilityPage from "../pages/admin/trainers/TrainerAvailabilityPage";
import EditTrainerPage from "../pages/admin/trainers/EditTrainerPage";

// Requirements
import RequirementsPage from "../pages/admin/requirements/RequirementsPage";
import AddRequirementPage from "../pages/admin/requirements/AddRequirementPage";
import RequirementDetailsPage from "../pages/admin/requirements/RequirementDetailsPage";
import EditRequirementPage from "../pages/admin/requirements/EditRequirementPage";
import SmartRequirementPage from "../pages/admin/requirements/SmartRequirementPage";
import VendorSelectionPage from "../pages/admin/requirements/VendorSelectionPage";

// Vendors
import VendorsPage from "../pages/admin/vendors/VendorsPage";
import AddVendorPage from "../pages/admin/vendors/AddVendorPage";
import VendorDetailsPage from "../pages/admin/vendors/VendorDetailsPage";
import EditVendorPage from "../pages/admin/vendors/EditVendorPage";

// Assignments
import CreateAssignmentPage from "../pages/admin/assignments/CreateAssignmentPage";
import AssignmentsPage from "../pages/admin/assignments/AssignmentsPage";

// Settings
import SettingsPage from "../pages/admin/SettingsPage";

//vendor layout
import VendorLayout from "../layouts/VendorLayout";
import VendorDashboardPage from "../pages/vendor/dashboard/VendorDashboardPage";
import VendorRequirementsPage from "../pages/vendor/requirements/VendorRequirementsPage";
import AddVendorRequirementPage from "../pages/vendor/requirements/AddVendorRequirementPage";
import VendorRequirementDetailsPage from "../pages/vendor/requirements/VendorRequirementDetailsPage";
import EditVendorRequirementPage from "../pages/vendor/requirements/EditVendorRequirementPage";

//trainer layout
import TrainerLayout from "../layouts/TrainerLayout";
import TrainerDashboardPage from "../pages/trainer/dashboard/TrainerDashboardPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================================================================
          PUBLIC ROUTES
      ================================================================= */}

      <Route path="/login" element={<LoginPage />} />
      <Route path="/vendor/register" element={<VendorRegisterPage />} />
      <Route
        path="/trainer/accept-invite"
        element={<TrainerAcceptInvitePage />}
      />

      {/* ================================================================
    PROTECTED VENDOR PORTAL
================================================================= */}

      <Route element={<ProtectedRoute allowedRoles={["VENDOR"]} />}>
        <Route element={<VendorLayout />}>
          <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
          <Route
            path="/vendor/requirements"
            element={<VendorRequirementsPage />}
          />

          {/* Create */}

          <Route
            path="/vendor/requirements/add"
            element={<AddVendorRequirementPage />}
          />

          {/* Details */}

          <Route
            path="/vendor/requirements/:id"
            element={<VendorRequirementDetailsPage />}
          />

          {/* Edit */}

          <Route
            path="/vendor/requirements/:id/edit"
            element={<EditVendorRequirementPage />}
          />
        </Route>
      </Route>

      {/* ================================================================
    PROTECTED TRAINER PORTAL
================================================================= */}

      <Route element={<ProtectedRoute allowedRoles={["TRAINER"]} />}>
        <Route element={<TrainerLayout />}>
          <Route path="/trainer" element={<TrainerDashboardPage />} />

          <Route path="/trainer/dashboard" element={<TrainerDashboardPage />} />
        </Route>
      </Route>

      {/* ================================================================
          PROTECTED ADMIN / OPERATIONS PORTAL
      ================================================================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATIONS"]}
          />
        }
      >
        <Route element={<AdminLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<DashboardPage />} />

          {/* ============================================================
              TRAINERS
          ============================================================= */}

          <Route path="/trainers" element={<TrainersPage />} />

          <Route path="/trainers/add" element={<AddTrainerPage />} />

          <Route path="/trainers/:id" element={<TrainerDetailsPage />} />

          <Route path="/trainers/:id/edit" element={<EditTrainerPage />} />

          <Route
            path="/trainers/:id/availability"
            element={<TrainerAvailabilityPage />}
          />

          {/* ============================================================
              REQUIREMENTS
          ============================================================= */}

          <Route path="/requirements" element={<RequirementsPage />} />

          <Route path="/requirements/add" element={<AddRequirementPage />} />

          <Route
            path="/requirements/smart-create"
            element={<SmartRequirementPage />}
          />

          <Route
            path="/requirements/:id"
            element={<RequirementDetailsPage />}
          />

          <Route
            path="/requirements/:id/edit"
            element={<EditRequirementPage />}
          />

          <Route
            path="/requirements/:id/vendor-selection"
            element={<VendorSelectionPage />}
          />

          {/* ============================================================
              VENDORS
          ============================================================= */}

          <Route path="/vendors" element={<VendorsPage />} />

          <Route path="/vendors/add" element={<AddVendorPage />} />

          <Route path="/vendors/:id" element={<VendorDetailsPage />} />

          <Route path="/vendors/:id/edit" element={<EditVendorPage />} />

          {/* ============================================================
              ASSIGNMENTS
          ============================================================= */}

          <Route path="/assignments" element={<AssignmentsPage />} />

          <Route
            path="/requirements/:id/create-assignment/:trainerId"
            element={<CreateAssignmentPage />}
          />

          {/* ============================================================
              SETTINGS
          ============================================================= */}

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
