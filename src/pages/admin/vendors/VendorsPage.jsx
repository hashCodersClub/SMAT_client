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

  return (
    <div className="space-y-6">
      {/* ================================================================
          PAGE HEADER
      ================================================================= */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Vendors</h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Manage companies and partners sending training requirements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/vendors/add")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <FiPlus size={18} />
          Add Vendor
        </button>
      </div>

      {/* ================================================================
          STATS
      ================================================================= */}

      <VendorStats vendors={vendors} />

      {/* ================================================================
          FILTERS
      ================================================================= */}

      <VendorFilters
        search={search}
        setSearch={handleSearchChange}
        status={status}
        setStatus={handleStatusChange}
        resetFilters={resetFilters}
      />

      {/* ================================================================
          ERROR
      ================================================================= */}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

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
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            <FiRefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* ================================================================
          RESULT COUNT
      ================================================================= */}

      {!error && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            Showing{" "}
            <span className="font-bold text-slate-900">{vendors.length}</span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">{pagination.total}</span>{" "}
            vendors
          </p>
        </div>
      )}

      {/* ================================================================
          LOADING
      ================================================================= */}

      {loading ? (
        <VendorTableSkeleton />
      ) : !error ? (
        <>
          {/* ============================================================
              VENDOR TABLE
          ============================================================= */}

          <VendorTable
            vendors={vendors}
            onDelete={handleDeleteVendor}
            deletingId={deletingId}
          />

          {/* ============================================================
              PAGINATION
          ============================================================= */}

          {pagination.pages > 1 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-600">
                Page{" "}
                <span className="font-bold text-slate-900">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">
                  {pagination.pages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => goToPage(pagination.page - 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => goToPage(pagination.page + 1)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
   LOADING SKELETON
============================================================================ */

const VendorTableSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-6 px-5 py-5">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />

            <div className="flex-1">
              <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="hidden h-4 w-32 animate-pulse rounded bg-slate-100 md:block" />

            <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-100 lg:block" />

            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorsPage;
