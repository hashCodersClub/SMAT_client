import { Navigate, Route, Routes } from "react-router-dom";

// Authentication
import LoginPage from "../pages/auth/LoginPage";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import VendorRegisterPage from "../pages/auth/VendorRegisterPage";
import TrainerAcceptInvitePage from "../pages/auth/TrainerAcceptInvitePage";

// Admin Layout
import AdminLayout from "../layouts/AdminLayout";

// Admin Dashboard
import DashboardPage from "../pages/admin/DashboardPage";

// Admin - Trainers
import TrainersPage from "../pages/admin/trainers/TrainersPage";
import AddTrainerPage from "../pages/admin/trainers/AddTrainerPage";
import TrainerDetailsPage from "../pages/admin/trainers/TrainerDetailsPage";
import EditTrainerPage from "../pages/admin/trainers/EditTrainerPage";
import AdminTrainerAvailabilityPage from "../pages/admin/trainers/AdminTrainerAvailabilityPage";

// Admin - Requirements
import RequirementsPage from "../pages/admin/requirements/RequirementsPage";
import AddRequirementPage from "../pages/admin/requirements/AddRequirementPage";
import RequirementDetailsPage from "../pages/admin/requirements/RequirementDetailsPage";
import EditRequirementPage from "../pages/admin/requirements/EditRequirementPage";
import SmartRequirementPage from "../pages/admin/requirements/SmartRequirementPage";
import TrainerMatchesPage from "../pages/admin/requirements/TrainerMatchesPage";
import RequirementOutreachPage from "../pages/admin/requirements/RequirementOutreachPage";
import VendorSelectionPage from "../pages/admin/requirements/VendorSelectionPage";

// Admin - Vendors
import VendorsPage from "../pages/admin/vendors/VendorsPage";
import AddVendorPage from "../pages/admin/vendors/AddVendorPage";
import VendorDetailsPage from "../pages/admin/vendors/VendorDetailsPage";
import EditVendorPage from "../pages/admin/vendors/EditVendorPage";

// Admin - Assignments
import AssignmentsPage from "../pages/admin/assignments/AssignmentsPage";
import CreateAssignmentPage from "../pages/admin/assignments/CreateAssignmentPage";
import AssignmentDetailsPage from "../pages/admin/assignments/AssignmentDetailsPage";

// Admin - Settings
import SettingsPage from "../pages/admin/SettingsPage";

// Vendor Portal
import VendorLayout from "../layouts/VendorLayout";
import VendorDashboardPage from "../pages/vendor/dashboard/VendorDashboardPage";
import VendorRequirementsPage from "../pages/vendor/requirements/VendorRequirementsPage";
import AddVendorRequirementPage from "../pages/vendor/requirements/AddVendorRequirementPage";
import VendorRequirementDetailsPage from "../pages/vendor/requirements/VendorRequirementDetailsPage";
import EditVendorRequirementPage from "../pages/vendor/requirements/EditVendorRequirementPage";

// Trainer Portal
import TrainerLayout from "../layouts/TrainerLayout";
import TrainerDashboardPage from "../pages/trainer/dashboard/TrainerDashboardPage";
import TrainerProfilePage from "../pages/trainer/profile/TrainerProfilePage";
import TrainerAvailabilityPage from "../pages/trainer/availability/TrainerAvailabilityPage";
import TrainerOpportunitiesPage from "../pages/trainer/opportunities/TrainerOpportunitiesPage";
import TrainerAssignmentsPage from "../pages/trainer/assignments/TrainerAssignmentsPage";

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
          ADMIN / OPERATIONS PORTAL
          
          Accessible by:
          SUPER_ADMIN
          ADMIN
          OPERATIONS
      ================================================================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["SUPER_ADMIN", "ADMIN", "OPERATIONS"]}
          />
        }
      >
        <Route element={<AdminLayout />}>
          {/* ------------------------------------------------------------
              DASHBOARD
          ------------------------------------------------------------- */}

          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route path="/admin/dashboard" element={<DashboardPage />} />

          {/* ------------------------------------------------------------
              TRAINERS
          ------------------------------------------------------------- */}

          <Route path="/admin/trainers" element={<TrainersPage />} />

          <Route path="/admin/trainers/add" element={<AddTrainerPage />} />

          <Route path="/admin/trainers/:id" element={<TrainerDetailsPage />} />

          <Route
            path="/admin/trainers/:id/edit"
            element={<EditTrainerPage />}
          />

          <Route
            path="/admin/trainers/:id/availability"
            element={<AdminTrainerAvailabilityPage />}
          />

          {/* ------------------------------------------------------------
              REQUIREMENTS
          ------------------------------------------------------------- */}

          <Route path="/admin/requirements" element={<RequirementsPage />} />

          <Route
            path="/admin/requirements/add"
            element={<AddRequirementPage />}
          />

          <Route
            path="/admin/requirements/smart-create"
            element={<SmartRequirementPage />}
          />

          <Route
            path="/admin/requirements/:id"
            element={<RequirementDetailsPage />}
          />

          <Route
            path="/admin/requirements/:id/edit"
            element={<EditRequirementPage />}
          />

          <Route
            path="/admin/requirements/:id/matches"
            element={<TrainerMatchesPage />}
          />

          <Route
            path="/admin/requirements/:id/outreach"
            element={<RequirementOutreachPage />}
          />

          <Route
            path="/admin/requirements/:id/vendor-selection"
            element={<VendorSelectionPage />}
          />

          <Route
            path="/admin/requirements/:id/create-assignment/:trainerId"
            element={<CreateAssignmentPage />}
          />

          {/* ------------------------------------------------------------
              VENDORS
          ------------------------------------------------------------- */}

          <Route path="/admin/vendors" element={<VendorsPage />} />

          <Route path="/admin/vendors/add" element={<AddVendorPage />} />

          <Route path="/admin/vendors/:id" element={<VendorDetailsPage />} />

          <Route path="/admin/vendors/:id/edit" element={<EditVendorPage />} />

          {/* ------------------------------------------------------------
              ASSIGNMENTS
          ------------------------------------------------------------- */}

          <Route path="/admin/assignments" element={<AssignmentsPage />} />

          <Route
            path="/admin/assignments/:id"
            element={<AssignmentDetailsPage />}
          />

          {/* ------------------------------------------------------------
              SETTINGS
          ------------------------------------------------------------- */}

          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ================================================================
          VENDOR PORTAL
      ================================================================= */}

      <Route element={<ProtectedRoute allowedRoles={["VENDOR"]} />}>
        <Route element={<VendorLayout />}>
          <Route
            path="/vendor"
            element={<Navigate to="/vendor/dashboard" replace />}
          />

          <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />

          <Route
            path="/vendor/requirements"
            element={<VendorRequirementsPage />}
          />

          <Route
            path="/vendor/requirements/add"
            element={<AddVendorRequirementPage />}
          />

          <Route
            path="/vendor/requirements/:id"
            element={<VendorRequirementDetailsPage />}
          />

          <Route
            path="/vendor/requirements/:id/edit"
            element={<EditVendorRequirementPage />}
          />
        </Route>
      </Route>

      {/* ================================================================
          TRAINER PORTAL
      ================================================================= */}

      <Route element={<ProtectedRoute allowedRoles={["TRAINER"]} />}>
        <Route element={<TrainerLayout />}>
          <Route
            path="/trainer"
            element={<Navigate to="/trainer/dashboard" replace />}
          />

          <Route path="/trainer/dashboard" element={<TrainerDashboardPage />} />

          <Route
            path="/trainer/opportunities"
            element={<TrainerOpportunitiesPage />}
          />

          <Route
            path="/trainer/assignments"
            element={<TrainerAssignmentsPage />}
          />

          <Route path="/trainer/profile" element={<TrainerProfilePage />} />

          <Route
            path="/trainer/availability"
            element={<TrainerAvailabilityPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
