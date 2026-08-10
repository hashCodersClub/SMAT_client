import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiFileText, FiSearch, FiAlertCircle } from "react-icons/fi";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import StatCard from "../../../components/ui/StatCard";

import invoicesApi from "../../../api/invoicesApi";

const STATUS_VARIANTS = {
  DRAFT: "default",
  SENT: "primary",
  PAID: "success",
  PARTIALLY_PAID: "warning",
  OVERDUE: "danger",
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

const InvoicesPage = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({ totalInvoiced: 0, totalOutstanding: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await invoicesApi.getAll({
        search: search.trim(),
        status,
        page: pagination.page,
        limit: pagination.limit,
      });

      setInvoices(response.invoices || []);
      setSummary(response.summary || { totalInvoiced: 0, totalOutstanding: 0 });
      setPagination((prev) => ({ ...prev, ...(response.pagination || {}) }));
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setInvoices([]);
      setError(err?.response?.data?.message || "Unable to load invoices. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, status, pagination.page, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchInvoices();
      },
      search ? 400 : 0,
    );

    return () => clearTimeout(timer);
  }, [fetchInvoices, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Create and manage tax invoices for vendors and clients."
        action={
          <Button icon={FiPlus} onClick={() => navigate("/admin/invoices/create")}>
            New Invoice
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Invoiced"
          value={formatMoney(summary.totalInvoiced)}
          icon={FiFileText}
        />
        <StatCard
          label="Outstanding"
          value={formatMoney(summary.totalOutstanding)}
          icon={FiAlertCircle}
        />
      </div>

      <Card padding={false}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number or client..."
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

        {!loading && invoices.length === 0 && !error ? (
          <EmptyState
            icon={FiFileText}
            title="No invoices yet"
            description="Create your first invoice to get started."
            action={
              <Button icon={FiPlus} onClick={() => navigate("/admin/invoices/create")}>
                New Invoice
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Invoice #</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Due Date</th>
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
                  : invoices.map((invoice) => (
                      <tr
                        key={invoice._id}
                        onClick={() => navigate(`/admin/invoices/${invoice._id}`)}
                        className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{invoice.billTo?.name || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(invoice.invoiceDate)}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(invoice.dueDate)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {formatMoney(invoice.grandTotal, invoice.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANTS[invoice.status] || "default"}>
                            {invoice.status?.replace(/_/g, " ")}
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

export default InvoicesPage;
