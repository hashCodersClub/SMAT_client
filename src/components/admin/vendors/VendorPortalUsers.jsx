import { useEffect, useState } from "react";
import {
  FiUserPlus,
  FiAlertCircle,
  FiRefreshCw,
  FiLoader,
  FiMail,
} from "react-icons/fi";

import vendorsApi from "../../../api/vendorsApi";
import AddVendorUserModal from "./AddVendorUserModal";

/* ==========================================================================
   VENDOR PORTAL USERS
============================================================================ */

const VendorPortalUsers = ({ vendorId, portalEnabled }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [togglingUserId, setTogglingUserId] = useState(null);
  const [toggleError, setToggleError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Fetch Users
  |--------------------------------------------------------------------------
  */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await vendorsApi.getUsers(vendorId);

      setUsers(response.users || []);
    } catch (err) {
      console.error("Failed to fetch vendor portal users:", err);

      setError(err?.response?.data?.message || "Unable to load portal users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  /*
  |--------------------------------------------------------------------------
  | Handle User Created
  |--------------------------------------------------------------------------
  */

  const handleUserCreated = () => {
    setShowAddModal(false);
    fetchUsers();
  };

  /*
  |--------------------------------------------------------------------------
  | Toggle Active Status
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus = async (user) => {
    try {
      setTogglingUserId(user.id || user._id);
      setToggleError("");

      await vendorsApi.updateUserStatus(
        vendorId,
        user.id || user._id,
        !user.isActive,
      );

      await fetchUsers();
    } catch (err) {
      console.error("Failed to update vendor user status:", err);

      setToggleError(
        err?.response?.data?.message || "Unable to update user status.",
      );
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-950">Portal Users</h2>

          <p className="mt-0.5 text-xs font-medium text-slate-400">
            {portalEnabled
              ? "Vendor portal access is enabled."
              : "Portal access enables automatically once a user is added."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          <FiUserPlus size={14} />
          Add User
        </button>
      </div>

      {toggleError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <span>{toggleError}</span>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <FiAlertCircle className="mx-auto mb-1.5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={fetchUsers}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:underline"
          >
            <FiRefreshCw size={12} />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
          No portal users yet. Add one so this vendor can log in and submit
          requirements directly.
        </p>
      )}

      {!loading && !error && users.length > 0 && (
        <ul className="space-y-2">
          {users.map((user) => {
            const userId = user.id || user._id;
            const isToggling = togglingUserId === userId;

            return (
              <li
                key={userId}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user.name}
                  </p>

                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
                    <FiMail size={12} className="shrink-0" />
                    {user.email}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      user.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>

                  <button
                    type="button"
                    disabled={isToggling}
                    onClick={() => handleToggleStatus(user)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isToggling && (
                      <FiLoader size={12} className="animate-spin" />
                    )}
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showAddModal && (
        <AddVendorUserModal
          vendorId={vendorId}
          createUser={vendorsApi.createUser}
          onClose={() => setShowAddModal(false)}
          onCreated={handleUserCreated}
        />
      )}
    </section>
  );
};

export default VendorPortalUsers;
