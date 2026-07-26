import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import DashboardPage from "../pages/admin/DashboardPage";

import TrainersPage from "../pages/admin/trainers/TrainersPage";
import AddTrainerPage from "../pages/admin/trainers/AddTrainerPage";
import TrainerDetailsPage from "../pages/admin/trainers/TrainerDetailsPage";
import EditTrainerPage from "../pages/admin/trainers/EditTrainerPage";

import RequirementsPage from "../pages/admin/requirements/RequirementsPage";
import AddRequirementPage from "../pages/admin/requirements/AddRequirementPage";
import RequirementDetailsPage from "../pages/admin/requirements/RequirementDetailsPage";
import EditRequirementPage from "../pages/admin/requirements/EditRequirementPage";
import AssignmentsPage from "../pages/admin/AssignmentsPage";
import SettingsPage from "../pages/admin/SettingsPage";

import VendorsPage from "../pages/admin/vendors/VendorsPage";
import AddVendorPage from "../pages/admin/vendors/AddVendorPage";
import VendorDetailsPage from "../pages/admin/vendors/VendorDetailsPage";
import EditVendorPage from "../pages/admin/vendors/EditVendorPage";
const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />

        {/* Trainers */}
        <Route path="/trainers" element={<TrainersPage />} />
        <Route path="/trainers/add" element={<AddTrainerPage />} />
        <Route path="/trainers/:id" element={<TrainerDetailsPage />} />
        <Route path="/trainers/:id/edit" element={<EditTrainerPage />} />

        {/* Operations */}
        <Route path="/requirements" element={<RequirementsPage />} />

        <Route path="/requirements/add" element={<AddRequirementPage />} />

        <Route path="/requirements/:id" element={<RequirementDetailsPage />} />

        <Route
          path="/requirements/:id/edit"
          element={<EditRequirementPage />}
        />

        <Route path="/vendors" element={<VendorsPage />} />

        <Route path="/vendors/add" element={<AddVendorPage />} />

        <Route path="/vendors/:id" element={<VendorDetailsPage />} />

        <Route path="/vendors/:id/edit" element={<EditVendorPage />} />

        <Route path="/assignments" element={<AssignmentsPage />} />

        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
