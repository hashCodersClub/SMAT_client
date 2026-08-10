import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiShoppingCart, FiSearch, FiAlertCircle } from "react-icons/fi";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";

import purchaseOrdersApi from "../../../api/purchaseOrdersApi";

const STATUS_VARIANTS = {
  DRAFT: "default",
  ISSUED: "primary",
  ACKNOWLEDGED: "purple",
  PARTIALLY_FULFILLED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const formatMoney = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";

  return `${symbol}${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const PurchaseOrdersPage = () => {
  const navigate = useNavigate();

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await purchaseOrdersApi.getAll({
        search: search.trim(),
        status,
        page: pagination.page,
        limit: pagination.limit,
      });

      setPurchaseOrders(response.purchaseOrders || []);
      setPagination((prev) => ({ ...prev, ...(response.pagination || {}) }));
    } catch (err) {
      console.error("Failed to fetch purchase orders:", err);
      setPurchaseOrders([]);
      setError(err?.response?.data?.message || "Unable to load purchase orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, status, pagination.page, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchPurchaseOrders();
      },
      search ? 400 : 0,
    );

    return () => clearTimeout(timer);
  }, [fetchPurchaseOrders, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Issue and track purchase orders sent to vendors."
        action={
          <Button icon={FiPlus} onClick={() => navigate("/admin/purchase-orders/create")}>
            New Purchase Order
          </Button>
        }
      />

      <Card padding={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PO number or vendor..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_VARIANTS).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
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
            description="Create your first purchase order to send to a vendor."
            action={
              <Button icon={FiPlus} onClick={() => navigate("/admin/purchase-orders/create")}>
                New Purchase Order
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">PO #</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">PO Date</th>
                  <th className="px-4 py-3 font-medium">Delivery By</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td colSpan={6} className="px-4 py-4">
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
                        <td className="px-4 py-3 font-medium text-slate-900">{po.poNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{po.supplier?.name || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(po.poDate)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(po.expectedDeliveryDate)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {formatMoney(po.grandTotal, po.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANTS[po.status] || "default"}>
                            {po.status?.replace(/_/g, " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 p-4 text-sm text-slate-500">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PurchaseOrdersPage;
