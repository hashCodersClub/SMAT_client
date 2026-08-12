import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Layouts & Auth Guards
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import VendorLayout from "../layouts/VendorLayout";
import TrainerLayout from "../layouts/TrainerLayout";

// Page Loader Fallback
const PageFallback = () => (
  <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-3 p-8">
    <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
    <span className="text-xs font-medium text-slate-400">Loading...</span>
  </div>
);

// Public / Auth Pages
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("../pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const VendorRegisterPage = lazy(
  () => import("../pages/auth/VendorRegisterPage"),
);
const TrainerAcceptInvitePage = lazy(
  () => import("../pages/auth/TrainerAcceptInvitePage"),
);

// Shared Pages
const NotFoundPage = lazy(() => import("../pages/shared/NotFoundPage"));
const NotificationsPage = lazy(
  () => import("../pages/shared/notification/NotificationsPage"),
);

// Admin Pages
const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const TrainersPage = lazy(() => import("../pages/admin/trainers/TrainersPage"));
const AddTrainerPage = lazy(
  () => import("../pages/admin/trainers/AddTrainerPage"),
);
const TrainerDetailsPage = lazy(
  () => import("../pages/admin/trainers/TrainerDetailsPage"),
);
const EditTrainerPage = lazy(
  () => import("../pages/admin/trainers/EditTrainerPage"),
);
const AdminTrainerAvailabilityPage = lazy(
  () => import("../pages/admin/trainers/AdminTrainerAvailabilityPage"),
);

const RequirementsPage = lazy(
  () => import("../pages/admin/requirements/RequirementsPage"),
);
const AddRequirementPage = lazy(
  () => import("../pages/admin/requirements/AddRequirementPage"),
);
const RequirementDetailsPage = lazy(
  () => import("../pages/admin/requirements/RequirementDetailsPage"),
);
const EditRequirementPage = lazy(
  () => import("../pages/admin/requirements/EditRequirementPage"),
);
const SmartRequirementPage = lazy(
  () => import("../pages/admin/requirements/SmartRequirementPage"),
);
const TrainerMatchesPage = lazy(
  () => import("../pages/admin/requirements/TrainerMatchesPage"),
);
const OpportunityPipelinePage = lazy(
  () => import("../pages/admin/requirements/OpportunityPipelinePage"),
);
const RequirementOutreachPage = lazy(
  () => import("../pages/admin/requirements/RequirementOutreachPage"),
);
const VendorSelectionPage = lazy(
  () => import("../pages/admin/requirements/VendorSelectionPage"),
);

const VendorsPage = lazy(() => import("../pages/admin/vendors/VendorsPage"));
const AddVendorPage = lazy(
  () => import("../pages/admin/vendors/AddVendorPage"),
);
const VendorDetailsPage = lazy(
  () => import("../pages/admin/vendors/VendorDetailsPage"),
);
const EditVendorPage = lazy(
  () => import("../pages/admin/vendors/EditVendorPage"),
);

const AssignmentsPage = lazy(
  () => import("../pages/admin/assignments/AssignmentsPage"),
);
const CreateAssignmentPage = lazy(
  () => import("../pages/admin/assignments/CreateAssignmentPage"),
);
const AssignmentDetailsPage = lazy(
  () => import("../pages/admin/assignments/AssignmentDetailsPage"),
);

const SettingsPage = lazy(() => import("../pages/admin/SettingsPage"));
const CompanySettingsPage = lazy(
  () => import("../pages/admin/CompanySettingsPage"),
);

// Billing: Invoices & Purchase Orders
const InvoicesPage = lazy(() => import("../pages/admin/invoices/InvoicesPage"));
const CreateVendorInvoicePage = lazy(
  () => import("../pages/admin/invoices/CreateVendorInvoicePage"),
);
const InvoiceDetailsPage = lazy(
  () => import("../pages/admin/invoices/InvoiceDetailsPage"),
);
const PurchaseOrdersPage = lazy(
  () => import("../pages/admin/purchaseOrders/PurchaseOrdersPage"),
);
const PurchaseOrderDetailsPage = lazy(
  () => import("../pages/admin/purchaseOrders/PurchaseOrderDetailsPage"),
);

// Vendor Portal Pages
const VendorDashboardPage = lazy(
  () => import("../pages/vendor/dashboard/VendorDashboardPage"),
);
const VendorRequirementsPage = lazy(
  () => import("../pages/vendor/requirements/VendorRequirementsPage"),
);
const AddVendorRequirementPage = lazy(
  () => import("../pages/vendor/requirements/AddVendorRequirementPage"),
);
const VendorRequirementDetailsPage = lazy(
  () => import("../pages/vendor/requirements/VendorRequirementDetailsPage"),
);
const VendorOpportunityDetailPage = lazy(
  () => import("../pages/vendor/requirements/VendorOpportunityDetailPage"),
);
const EditVendorRequirementPage = lazy(
  () => import("../pages/vendor/requirements/EditVendorRequirementPage"),
);
const VendorProfilePage = lazy(
  () => import("../pages/vendor/profile/VendorProfilePage"),
);
const VendorSettingsPage = lazy(
  () => import("../pages/vendor/settings/VendorSettingsPage"),
);
const VendorAssignmentsPage = lazy(
  () => import("../pages/vendor/assignments/VendorAssignmentsPage"),
);

const VendorPurchaseOrdersPage = lazy(
  () => import("../pages/vendor/purchaseOrders/VendorPurchaseOrdersPage"),
);

const VendorInvoicesPage = lazy(
  () => import("../pages/vendor/invoices/VendorInvoicesPage"),
);

// Trainer Portal Pages
const TrainerDashboardPage = lazy(
  () => import("../pages/trainer/dashboard/TrainerDashboardPage"),
);
const TrainerProfilePage = lazy(
  () => import("../pages/trainer/profile/TrainerProfilePage"),
);
const TrainerAvailabilityPage = lazy(
  () => import("../pages/trainer/availability/TrainerAvailabilityPage"),
);
const TrainerOpportunitiesPage = lazy(
  () => import("../pages/trainer/opportunities/TrainerOpportunitiesPage"),
);
const TrainerAssignmentsPage = lazy(
  () => import("../pages/trainer/assignments/TrainerAssignmentsPage"),
);

const TrainerPurchaseOrdersPage = lazy(
  () => import("../pages/trainer/purchaseOrders/TrainerPurchaseOrdersPage"),
);

const TrainerInvoicesPage = lazy(
  () => import("../pages/trainer/invoices/TrainerInvoicesPage"),
);
const TrainerSettingsPage = lazy(
  () => import("../pages/trainer/settings/TrainerSettingsPage"),
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ================================================================
          PUBLIC ROUTES
      ================================================================= */}

        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

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

            <Route
              path="/admin/trainers/:id"
              element={<TrainerDetailsPage />}
            />

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
              path="/admin/requirements/smart"
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
              path="/admin/requirements/:id/opportunities"
              element={<OpportunityPipelinePage />}
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

            <Route
              path="/admin/vendors/:id/edit"
              element={<EditVendorPage />}
            />

            {/* ------------------------------------------------------------
              ASSIGNMENTS
          ------------------------------------------------------------- */}

            <Route path="/admin/assignments" element={<AssignmentsPage />} />

            <Route
              path="/admin/assignments/:id"
              element={<AssignmentDetailsPage />}
            />

            {/* ------------------------------------------------------------
              INVOICES
          ------------------------------------------------------------- */}

            <Route path="/admin/invoices" element={<InvoicesPage />} />

            <Route
              path="/admin/invoices/create-vendor-invoice"
              element={<CreateVendorInvoicePage />}
            />

            <Route
              path="/admin/invoices/:id"
              element={<InvoiceDetailsPage />}
            />

            {/* ------------------------------------------------------------
              PURCHASE ORDERS
          ------------------------------------------------------------- */}

            <Route
              path="/admin/purchase-orders"
              element={<PurchaseOrdersPage />}
            />

            <Route
              path="/admin/purchase-orders/:id"
              element={<PurchaseOrderDetailsPage />}
            />

            {/* ------------------------------------------------------------
              SETTINGS
          ------------------------------------------------------------- */}

            <Route path="/admin/settings" element={<SettingsPage />} />
            <Route
              path="/admin/company-settings"
              element={<CompanySettingsPage />}
            />

            {/* ------------------------------------------------------------
              NOTIFICATIONS
          ------------------------------------------------------------- */}

            <Route
              path="/admin/notifications"
              element={<NotificationsPage />}
            />
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
              path="/vendor/requirements/:id/opportunities/:opportunityId"
              element={<VendorOpportunityDetailPage />}
            />

            <Route
              path="/vendor/requirements/:id/edit"
              element={<EditVendorRequirementPage />}
            />

            <Route
              path="/vendor/assignments"
              element={<VendorAssignmentsPage />}
            />

            <Route
              path="/vendor/purchase-orders"
              element={<VendorPurchaseOrdersPage />}
            />

            <Route path="/vendor/invoices" element={<VendorInvoicesPage />} />

            <Route path="/vendor/profile" element={<VendorProfilePage />} />

            <Route path="/vendor/settings" element={<VendorSettingsPage />} />

            <Route
              path="/vendor/notifications"
              element={<NotificationsPage />}
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

            <Route
              path="/trainer/dashboard"
              element={<TrainerDashboardPage />}
            />

            <Route
              path="/trainer/opportunities"
              element={<TrainerOpportunitiesPage />}
            />

            <Route
              path="/trainer/assignments"
              element={<TrainerAssignmentsPage />}
            />

            <Route
              path="/trainer/purchase-orders"
              element={<TrainerPurchaseOrdersPage />}
            />

            <Route path="/trainer/invoices" element={<TrainerInvoicesPage />} />

            <Route path="/trainer/profile" element={<TrainerProfilePage />} />

            <Route
              path="/trainer/availability"
              element={<TrainerAvailabilityPage />}
            />

            <Route path="/trainer/settings" element={<TrainerSettingsPage />} />

            <Route
              path="/trainer/notifications"
              element={<NotificationsPage />}
            />
          </Route>
        </Route>

        {/* ================================================================
          CATCH-ALL 404
          Must stay last — matches any URL not matched above instead of
          rendering a blank screen.
      ================================================================= */}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
