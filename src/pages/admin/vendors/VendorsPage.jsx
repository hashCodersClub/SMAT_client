import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

import VendorStats from "../../../components/admin/vendors/VendorStats";
import VendorFilters from "../../../components/admin/vendors/VendorFilters";
import VendorTable from "../../../components/admin/vendors/VendorTable";

import vendorsApi from "../../../api/vendorsApi";

const VendorsPage = () => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  const [vendors, setVendors] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  /*
  |--------------------------------------------------------------------------
  | UI State
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Vendors
  |--------------------------------------------------------------------------
  */

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await vendorsApi.getAll({
        search: search.trim(),
        status,
        page: pagination.page,
        limit: pagination.limit,
        sort: "newest",
      });

      setVendors(response.vendors || []);

      setPagination((previous) => ({
        ...previous,
        ...(response.pagination || {}),
      }));
    } catch (err) {
      console.error("Failed to fetch vendors:", err);

      setVendors([]);

      setError(
        err?.response?.data?.message ||
          "Unable to load vendors. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, pagination.page, pagination.limit]);

  /*
  |--------------------------------------------------------------------------
  | Delete Vendor
  |--------------------------------------------------------------------------
  */

  const handleDeleteVendor = async (vendorId) => {
    const confirmed = window.confirm(
      "Delete this vendor? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(vendorId);
      setError("");

      await vendorsApi.delete(vendorId);

      await fetchVendors();
    } catch (err) {
      console.error("Failed to delete vendor:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to delete vendor. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Load Vendors
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchVendors();
      },
      search ? 400 : 0,
    );

    return () => clearTimeout(timer);
  }, [fetchVendors, search]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearchChange = (value) => {
    setSearch(value);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = (value) => {
    setStatus(value);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Reset Filters
  |--------------------------------------------------------------------------
  */

  const resetFilters = () => {
    setSearch("");
    setStatus("");

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const goToPage = (page) => {
    if (page < 1 || page > pagination.pages || page === pagination.page) {
      return;
    }

    setPagination((previous) => ({
      ...previous,
      page,
    }));
  };

  // ---------- Render ----------
  return (
    <div className="relative mx-auto max-w-7xl animate-fade-in-up px-4 py-6 sm:px-6 lg:px-8">
      {/* Background orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/20 to-pink-100/20 blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 sm:text-4xl">
            Vendors
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage companies and partners sending training requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/vendors/add")}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl active:scale-95"
        >
          <FiPlus className="h-4 w-4" />
          Add Vendor
        </button>
      </div>

      {/* Stats - wrapped in glass card */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-5 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30">
        <VendorStats vendors={vendors} />
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
      </div>

      {/* Filters - glass card */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30">
        <VendorFilters
          search={search}
          setSearch={handleSearchChange}
          status={status}
          setStatus={handleStatusChange}
          resetFilters={resetFilters}
        />
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20" />
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="relative mt-6 overflow-hidden rounded-2xl border border-red-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-lg shadow-red-100/30 transition-all duration-300"
          role="alert"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100/70 text-red-600 shadow-inner">
                <FiAlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Failed to load vendors
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchVendors}
              className="flex shrink-0 items-center gap-2 rounded-full bg-red-100/80 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200/80 hover:shadow-md active:scale-95"
            >
              <FiRefreshCw
                size={14}
                className="transition-transform duration-500 group-active:rotate-180"
              />
              Retry
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      )}

      {/* Result count */}
      {!error && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {vendors.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {pagination.total}
            </span>{" "}
            vendors
          </p>
        </div>
      )}

      {/* Table / Loading / Error */}
      {loading ? (
        <VendorTableSkeleton />
      ) : !error ? (
        <>
          <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/20 bg-white/60 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30">
            <VendorTable
              vendors={vendors}
              onDelete={handleDeleteVendor}
              deletingId={deletingId}
            />
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20" />
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200/60 pt-5 dark:border-slate-700/60 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {pagination.pages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => goToPage(pagination.page - 1)}
                  className="rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800/80"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => goToPage(pagination.page + 1)}
                  className="rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800/80"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

/* ==========================================================================
   LOADING SKELETON (upgraded with glass styling)
============================================================================ */

const VendorTableSkeleton = () => {
  return (
    <div className="relative mt-2 overflow-hidden rounded-2xl border border-white/20 bg-white/60 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30">
      <div className="border-b border-slate-200/60 px-6 py-4 dark:border-slate-700/60">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="divide-y divide-slate-100/60 dark:divide-slate-700/60">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-6 px-6 py-5">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />

            <div className="flex-1">
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-700/60" />
            </div>

            <div className="hidden h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-700/60 md:block" />

            <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-700/60 lg:block" />

            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700/60" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20" />
    </div>
  );
};

export default VendorsPage;
