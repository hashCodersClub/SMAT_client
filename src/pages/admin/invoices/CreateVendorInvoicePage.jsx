import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiPlus, FiTrash2, FiSave, FiAlertCircle, FiZap } from "react-icons/fi";

import Card, { CardHeader, CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";

import invoicesApi from "../../../api/invoicesApi";

const emptyItem = () => ({
  description: "",
  hsnSacCode: "",
  quantity: 1,
  unit: "Nos",
  rate: 0,
  discountPercent: 0,
  taxPercent: 18,
});

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

/*
|--------------------------------------------------------------------------
| Create Vendor Invoice (Admin -> Vendor)
|--------------------------------------------------------------------------
|
| Reached either from a trainer invoice ("Generate Vendor Invoice" button,
| passes ?fromTrainerInvoice=<id> and ?assignmentId=<id>) or started blank
| from the assignment's invoice tab. Either way, admin can freely edit
| everything before sending — the auto-fill only seeds the draft.
|--------------------------------------------------------------------------
*/

const CreateVendorInvoicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const assignmentId = searchParams.get("assignmentId") || "";
  const sourceInvoiceId = searchParams.get("fromTrainerInvoice") || "";

  const [billTo, setBillTo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    gstin: "",
    email: "",
    phone: "",
  });

  const [items, setItems] = useState([emptyItem()]);
  const [taxType, setTaxType] = useState("INTRA_STATE");
  const [currency, setCurrency] = useState("INR");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState(
    "1. Payment is due within the agreed credit period from the invoice date.\n2. Please quote the invoice number in all payment correspondence.",
  );

  const [prefilling, setPrefilling] = useState(!!sourceInvoiceId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sourceInvoiceId) return;

    invoicesApi
      .prefillVendorInvoice(sourceInvoiceId)
      .then((draft) => {
        if (draft.billTo?.name) setBillTo((prev) => ({ ...prev, ...draft.billTo }));
        if (draft.items?.length > 0) setItems(draft.items);
        if (draft.notes) setNotes(draft.notes);
        if (draft.currency) setCurrency(draft.currency);
      })
      .catch((err) => {
        console.error("Failed to prefill from trainer invoice:", err);
        setError("Could not auto-fill from the trainer invoice — you can still fill this in manually.");
      })
      .finally(() => setPrefilling(false));
  }, [sourceInvoiceId]);

  const updateItem = (index, field, value) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      const discount = base * ((Number(item.discountPercent) || 0) / 100);
      const taxable = base - discount;
      const tax = taxable * ((Number(item.taxPercent) || 0) / 100);
      subtotal += base;
      totalTax += tax;
    });

    return { subtotal, totalTax, grandTotal: Math.round(subtotal + totalTax) };
  }, [items]);

  const money = (value) => {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
    return `${symbol} ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assignmentId) {
      setError("This page must be opened from an assignment or a trainer invoice.");
      return;
    }

    if (!billTo.name.trim()) {
      setError("Please provide the vendor's name in Bill To.");
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Every line item needs a description.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const invoice = await invoicesApi.createVendorInvoice({
        assignmentId,
        sourceInvoiceId: sourceInvoiceId || undefined,
        invoiceDate,
        dueDate: dueDate || undefined,
        taxType,
        currency,
        billTo,
        items: items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          taxPercent: Number(item.taxPercent) || 0,
        })),
        termsAndConditions,
        notes,
      });

      navigate(`/admin/invoices/${invoice._id}`);
    } catch (err) {
      console.error("Failed to create vendor invoice:", err);
      setError(err?.response?.data?.message || "Unable to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <PageHeader
        title="New Invoice to Vendor"
        description={
          sourceInvoiceId
            ? "Auto-filled from the trainer's invoice — review and adjust before sending."
            : "Bill the vendor for a completed assignment."
        }
      />

      {prefilling && (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          <FiZap className="h-4 w-4 shrink-0" />
          Auto-filling from the trainer's invoice...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!assignmentId && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          No assignment linked — open this page from a completed assignment or a trainer invoice.
        </div>
      )}

      <Card>
        <CardHeader title="Document Details" />
        <CardBody className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Invoice Date</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputClass}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Tax Type</label>
            <select value={taxType} onChange={(e) => setTaxType(e.target.value)} className={inputClass}>
              <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
              <option value="INTER_STATE">Inter-State (IGST)</option>
              <option value="NONE">No Tax</option>
            </select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Bill To (Vendor)" />
        <CardBody className="mt-4 space-y-3">
          <div>
            <label className={labelClass}>Name *</label>
            <input value={billTo.name} onChange={(e) => setBillTo((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>GSTIN</label>
              <input value={billTo.gstin} onChange={(e) => setBillTo((p) => ({ ...p, gstin: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input value={billTo.email} onChange={(e) => setBillTo((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card padding={false}>
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">Line Items</h2>
          <Button type="button" variant="secondary" size="sm" icon={FiPlus} onClick={addItem}>
            Add Item
          </Button>
        </div>
        <div className="overflow-x-auto p-2">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2 font-medium">Description</th>
                <th className="px-2 py-2 font-medium">Qty</th>
                <th className="px-2 py-2 font-medium">Unit</th>
                <th className="px-2 py-2 font-medium">Rate</th>
                <th className="px-2 py-2 font-medium">Tax %</th>
                <th className="px-2 py-2 font-medium text-right">Amount</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                const tax = base * ((Number(item.taxPercent) || 0) / 100);

                return (
                  <tr key={index} className="border-t border-slate-50">
                    <td className="px-2 py-2">
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(index, "rate", e.target.value)}
                        className={`${inputClass} w-24`}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.taxPercent}
                        onChange={(e) => updateItem(index, "taxPercent", e.target.value)}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="px-2 py-2 text-right font-medium text-slate-900">{money(base + tax)}</td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Totals" />
        <CardBody className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax</span>
            <span>{money(totals.totalTax)}</span>
          </div>
          <div className="mt-2 flex justify-between rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white">
            <span>Grand Total</span>
            <span>{money(totals.grandTotal)}</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Terms & Notes" />
        <CardBody className="mt-4 space-y-3">
          <textarea
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            rows={3}
            className={inputClass}
          />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes" className={inputClass} />
        </CardBody>
      </Card>

      <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur">
        <Button type="button" variant="secondary" onClick={() => navigate("/admin/invoices")}>
          Cancel
        </Button>
        <Button type="submit" icon={FiSave} loading={saving}>
          Save Invoice
        </Button>
      </div>
    </form>
  );
};

export default CreateVendorInvoicePage;
