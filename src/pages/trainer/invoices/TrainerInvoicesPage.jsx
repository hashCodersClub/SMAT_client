import { useEffect, useMemo, useState } from "react";
import { FiFileText, FiPlus, FiTrash2, FiSend, FiAlertCircle } from "react-icons/fi";

import Card, { CardHeader, CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";

import invoicesApi from "../../../api/invoicesApi";
import assignmentsApi from "../../../api/assignmentsApi";

const STATUS_VARIANTS = {
  SENT: "primary",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "danger",
};

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  return `${symbol} ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

const emptyItem = (rate = 0, unit = "Nos") => ({
  description: "Training delivery fee",
  quantity: 1,
  unit,
  rate,
  taxPercent: 0,
});

const TrainerInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formAssignmentId, setFormAssignmentId] = useState(null);
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([invoicesApi.getAll({ limit: 50 }), assignmentsApi.getMine()])
      .then(([invoiceRes, assignmentRes]) => {
        setInvoices(invoiceRes.invoices || []);
        setAssignments(assignmentRes.data || []);
      })
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

  const invoicedAssignmentIds = useMemo(
    () => new Set(invoices.map((inv) => String(inv.assignment?._id || inv.assignment))),
    [invoices],
  );

  const eligibleAssignments = useMemo(
    () =>
      (assignments || []).filter(
        (a) => a.status === "COMPLETED" && !invoicedAssignmentIds.has(String(a._id)),
      ),
    [assignments, invoicedAssignmentIds],
  );

  const openForm = (assignment) => {
    setFormAssignmentId(assignment._id);
    const unit =
      assignment.rateType === "PER_HOUR" ? "Hours" : assignment.rateType === "PER_DAY" ? "Days" : "Nos";
    setItems([emptyItem(assignment.trainerRate || 0, unit)]);
    setNotes("");
  };

  const updateItem = (index, field, value) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);

  const handleSubmit = async () => {
    if (items.some((item) => !item.description.trim())) {
      setError("Every line item needs a description.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await invoicesApi.createTrainerInvoice({
        assignmentId: formAssignmentId,
        items: items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          taxPercent: Number(item.taxPercent) || 0,
        })),
        notes,
      });

      setFormAssignmentId(null);
      load();
    } catch (err) {
      console.error("Failed to submit invoice:", err);
      setError(err?.response?.data?.message || "Unable to submit invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Submit an invoice once a training assignment is complete."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {eligibleAssignments.length > 0 && (
        <Card>
          <CardHeader title="Ready to Invoice" description="Completed assignments awaiting an invoice from you." />
          <CardBody className="mt-4 space-y-3">
            {eligibleAssignments.map((assignment) => (
              <div
                key={assignment._id}
                className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {assignment.requirementId?.title || "Assignment"}
                  </p>
                  <p className="text-xs text-slate-500">Rate: ₹{assignment.trainerRate} / {assignment.rateType?.replace("PER_", "").toLowerCase()}</p>
                </div>
                <Button size="sm" icon={FiPlus} onClick={() => openForm(assignment)}>
                  Create Invoice
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {formAssignmentId && (
        <Card>
          <CardHeader title="New Invoice" description="This will be sent to admin for review." />
          <CardBody className="mt-4 space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Description"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  placeholder="Qty"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
                <input
                  value={item.unit}
                  onChange={(e) => updateItem(index, "unit", e.target.value)}
                  placeholder="Unit"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
                <input
                  type="number"
                  min="0"
                  value={item.rate}
                  onChange={(e) => updateItem(index, "rate", e.target.value)}
                  placeholder="Rate"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            <Button type="button" variant="secondary" size="sm" icon={FiPlus} onClick={addItem}>
              Add Item
            </Button>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />

            <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
              <span className="text-sm">Total</span>
              <span className="text-lg font-semibold">₹ {total.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setFormAssignmentId(null)}>
                Cancel
              </Button>
              <Button icon={FiSend} loading={submitting} onClick={handleSubmit}>
                Send Invoice to Admin
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card padding={false}>
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-base font-semibold text-slate-900">Submitted Invoices</h2>
        </div>

        {!loading && invoices.length === 0 ? (
          <EmptyState icon={FiFileText} title="No invoices yet" description="Invoices you send will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Invoice #</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {money(inv.grandTotal, inv.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[inv.status] || "default"}>{inv.status}</Badge>
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

export default TrainerInvoicesPage;
