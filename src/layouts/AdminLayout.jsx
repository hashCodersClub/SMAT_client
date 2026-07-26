import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="lg:ml-72 transition-all duration-300">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl rounded-2xl bg-card backdrop-blur-sm border-theme p-6 md:p-8 shadow-theme">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
