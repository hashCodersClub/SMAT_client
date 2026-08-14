import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiAlertCircle, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";

import purchaseOrdersApi from "../../../api/purchaseOrdersApi";

const STATUS_VARIANTS = {
  VENDOR_REQUESTED: "warning",
  ADMIN_ISSUED: "primary",
  TRAINER_CONFIRMED: "success",
  TRAINER_REJECTED: "danger",
  CANCELLED: "default",
};

const STATUS_LABELS = {
  VENDOR_REQUESTED: "Awaiting Review",
  ADMIN_ISSUED: "Sent to Trainer",
  TRAINER_CONFIRMED: "Confirmed",
  TRAINER_REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await purchaseOrdersApi.getAll({ status, limit: 50 });

      setPurchaseOrders(response.purchaseOrders || []);
    } catch (err) {
      console.error("Failed to fetch purchase orders:", err);
      setPurchaseOrders([]);
      setError(err?.response?.data?.message || "Unable to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPurchaseOrders(), 0);
    return () => clearTimeout(timer);
  }, [fetchPurchaseOrders]);

  const handleDelete = async (e, poId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this purchase order? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(poId);
      await purchaseOrdersApi.delete(poId);
      setPurchaseOrders((prev) => prev.filter((item) => item._id !== poId));
    } catch (err) {
      console.error("Failed to delete PO:", err);
      alert(err?.response?.data?.message || "Failed to delete purchase order.");
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = purchaseOrders.filter((po) => po.status === "VENDOR_REQUESTED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Purchase Orders"
          description="Vendor PO requests awaiting review, and official POs issued to trainers."
        />
        <Button
          icon={FiPlus}
          onClick={() => navigate("/admin/purchase-orders/create")}
        >
          Create Purchase Order
        </Button>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {pendingCount} request{pendingCount > 1 ? "s" : ""} waiting for you to review and issue.
        </div>
      )}

      <Card padding={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center justify-between">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="m-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <FiAlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && purchaseOrders.length === 0 && !error ? (
          <EmptyState
            icon={FiShoppingCart}
            title="No purchase orders yet"
            description="POs will appear here once requested or created."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">PO #</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Trainer</th>
                  <th className="px-4 py-3 font-medium">Requirement</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  : purchaseOrders.map((po) => (
                      <tr
                        key={po._id}
                        onClick={() => navigate(`/admin/purchase-orders/${po._id}`)}
                        className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {po.poNumber || <span className="text-slate-400">Not yet issued</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{po.vendor?.companyName || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{po.trainer?.name || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{po.requirement?.title || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(po.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANTS[po.status] || "default"}>
                            {STATUS_LABELS[po.status] || po.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/purchase-orders/${po._id}/edit`);
                              }}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                              title="Edit PO"
                            >
                              <FiEdit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === po._id}
                              onClick={(e) => handleDelete(e, po._id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete PO"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PurchaseOrdersPage;
