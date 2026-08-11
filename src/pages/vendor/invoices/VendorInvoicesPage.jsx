import { useEffect, useState } from "react";
import { FiFileText, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";

import invoicesApi from "../../../api/invoicesApi";

const STATUS_VARIANTS = {
  DRAFT: "default",
  SENT: "primary",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "danger",
};

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  return `${symbol} ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const VendorInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);

  const load = () => {
    setLoading(true);
    invoicesApi
      .getAll({ limit: 50 })
      .then((res) => setInvoices(res.invoices || []))
      .catch((err) => {
        console.error("Failed to load invoices:", err);
        setError(err?.response?.data?.message || "Unable to load your invoices.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleMarkPaid = async (id) => {
    try {
      setPayingId(id);
      await invoicesApi.markPaid(id);
      load();
    } catch (err) {
      console.error("Failed to mark invoice paid:", err);
      setError(err?.response?.data?.message || "Unable to update this invoice.");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Invoices from TrainExus for your assignments. Online payment is coming soon — for now, mark an invoice paid once you've settled it."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card padding={false}>
        {!loading && invoices.length === 0 ? (
          <EmptyState icon={FiFileText} title="No invoices yet" description="Invoices will appear here once issued." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Invoice #</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  : invoices
                      .filter((inv) => inv.status !== "DRAFT")
                      .map((inv) => (
                        <tr key={inv._id} className="border-b border-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{inv.invoiceNumber}</td>
                          <td className="px-4 py-3 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900">
                            {money(inv.grandTotal, inv.currency)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_VARIANTS[inv.status] || "default"}>{inv.status}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            {inv.status === "SENT" && (
                              <Button
                                size="sm"
                                icon={FiCheckCircle}
                                loading={payingId === inv._id}
                                onClick={() => handleMarkPaid(inv._id)}
                              >
                                Mark as Paid
                              </Button>
                            )}
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

export default VendorInvoicesPage;
