import { useState } from "react";
import { FiArrowLeft, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import VendorForm from "../../../components/admin/vendors/VendorForm";
import vendorsApi from "../../../api/vendorsApi";

const AddVendorPage = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Create Vendor
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError("");

      const response = await vendorsApi.create(data);

      console.log("Vendor created:", response);

      navigate("/admin/vendors", {
        replace: true,
      });
    } catch (err) {
      console.error("Failed to create vendor:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to create vendor. Please check the information and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate("/admin/vendors")}
        disabled={submitting}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back to Vendors</span>
      </button>

      {/* Header */}
      <div className="relative mb-8">
        <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 sm:text-4xl">
          Add Vendor
        </h1>
        <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
          Add a training partner or client to Nxthack.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="relative mb-8 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-red-100/30 transition-all duration-300"
          role="alert"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
              <FiAlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to create vendor
              </p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {/* Main Card */}
      <div className="relative rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 sm:p-8 dark:bg-slate-800/30">
        <VendorForm
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel={submitting ? "Creating Vendor…" : "Create Vendor"}
        />
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
      </div>
    </div>
  );
};

export default AddVendorPage;
