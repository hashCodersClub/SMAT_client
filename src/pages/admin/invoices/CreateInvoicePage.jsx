import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiSave, FiAlertCircle } from "react-icons/fi";

import Card, { CardHeader, CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import PageHeader from "../../../components/ui/PageHeader";

import invoicesApi from "../../../api/invoicesApi";
import vendorsApi from "../../../api/vendorsApi";

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

const CreateInvoicePage = () => {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [taxType, setTaxType] = useState("INTRA_STATE");
  const [currency, setCurrency] = useState("INR");

  const [billFrom, setBillFrom] = useState({
    name: "TrainExus Learning Solutions Pvt. Ltd.",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    gstin: "",
    email: "",
    phone: "",
  });

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
  const [shippingCharges, setShippingCharges] = useState(0);
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    branch: "",
    ifscCode: "",
    upiId: "",
  });
  const [termsAndConditions, setTermsAndConditions] = useState(
    "1. Payment is due within the agreed credit period from the invoice date.\n2. Please quote the invoice number in all payment correspondence.\n3. Interest @ 18% p.a. will be charged on overdue amounts.",
  );
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    vendorsApi
      .getAll({ limit: 100, status: "ACTIVE" })
      .then((res) => setVendors(res.vendors || []))
      .catch(() => setVendors([]));
  }, []);

  const handleVendorSelect = (vendorId) => {
    setSelectedVendorId(vendorId);

    const vendor = vendors.find((v) => v._id === vendorId);

    if (vendor) {
      const primaryContact =
        vendor.contacts?.find((c) => c.isPrimary) || vendor.contacts?.[0];

      setBillTo({
        name: vendor.companyName || "",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        country: vendor.country || "India",
        pincode: "",
        gstin: vendor.gstNumber || "",
        email: primaryContact?.email || "",
        phone: primaryContact?.phone || "",
      });
    }
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);

  const removeItem = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  /*
  |--------------------------------------------------------------------------
  | Live Totals Preview (mirrors backend pre-validate calculation)
  |--------------------------------------------------------------------------
  */

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      const discount = base * ((Number(item.discountPercent) || 0) / 100);
      const taxable = base - discount;
      const tax = taxable * ((Number(item.taxPercent) || 0) / 100);

      subtotal += base;
      totalDiscount += discount;
      totalTax += tax;
    });

    const preRound = subtotal - totalDiscount + totalTax + (Number(shippingCharges) || 0);
    const grandTotal = Math.round(preRound);

    return {
      subtotal,
      totalDiscount,
      totalTax,
      cgst: taxType === "INTRA_STATE" ? totalTax / 2 : 0,
      sgst: taxType === "INTRA_STATE" ? totalTax / 2 : 0,
      igst: taxType === "INTER_STATE" ? totalTax : 0,
      grandTotal,
    };
  }, [items, shippingCharges, taxType]);

  const money = (value) => {
    const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";

    return `${symbol} ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!billTo.name.trim()) {
      setError("Please provide the client's name in Bill To.");
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Every line item needs a description.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        invoiceDate,
        dueDate: dueDate || undefined,
        placeOfSupply,
        taxType,
        currency,
        billFrom,
        billTo,
        vendor: selectedVendorId || undefined,
        items: items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          discountPercent: Number(item.discountPercent) || 0,
          taxPercent: Number(item.taxPercent) || 0,
        })),
        shippingCharges: Number(shippingCharges) || 0,
        bankDetails,
        termsAndConditions,
        notes,
      };

      const invoice = await invoicesApi.create(payload);

      navigate(`/admin/invoices/${invoice._id}`);
    } catch (err) {
      console.error("Failed to create invoice:", err);
      setError(err?.response?.data?.message || "Unable to create invoice. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <PageHeader title="New Invoice" description="Fill in the details below to generate a tax invoice." />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
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
            <label className={labelClass}>Place of Supply</label>
            <input value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} className={inputClass} placeholder="e.g. Karnataka" />
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
          <div>
            <label className={labelClass}>Link to Vendor (optional)</label>
            <select
              value={selectedVendorId}
              onChange={(e) => handleVendorSelect(e.target.value)}
              className={inputClass}
            >
              <option value="">— Manual entry —</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.companyName}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Bill From" description="Your business details" />
          <CardBody className="mt-4 space-y-3">
            <PartyFields party={billFrom} setParty={setBillFrom} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Bill To" description="Client / vendor being invoiced" />
          <CardBody className="mt-4 space-y-3">
            <PartyFields party={billTo} setParty={setBillTo} required />
          </CardBody>
        </Card>
      </div>

      <Card padding={false}>
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">Line Items</h2>
            <p className="mt-0.5 text-sm text-slate-500">Add each product or service being billed.</p>
          </div>
          <Button type="button" variant="secondary" size="sm" icon={FiPlus} onClick={addItem}>
            Add Item
          </Button>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 font-medium">HSN/SAC</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Unit</th>
                <th className="px-3 py-2 font-medium">Rate</th>
                <th className="px-3 py-2 font-medium">Disc %</th>
                <th className="px-3 py-2 font-medium">Tax %</th>
                <th className="px-3 py-2 font-medium text-right">Amount</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                const discount = base * ((Number(item.discountPercent) || 0) / 100);
                const taxable = base - discount;
                const tax = taxable * ((Number(item.taxPercent) || 0) / 100);
                const amount = taxable + tax;

                return (
                  <tr key={index} className="border-t border-slate-50">
                    <td className="px-3 py-2">
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        className={inputClass}
                        placeholder="Corporate training program — 3 days"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.hsnSacCode}
                        onChange={(e) => updateItem(index, "hsnSacCode", e.target.value)}
                        className={`${inputClass} w-24`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => updateItem(index, "rate", e.target.value)}
                        className={`${inputClass} w-24`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.discountPercent}
                        onChange={(e) => updateItem(index, "discountPercent", e.target.value)}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxPercent}
                        onChange={(e) => updateItem(index, "taxPercent", e.target.value)}
                        className={`${inputClass} w-20`}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">{money(amount)}</td>
                    <td className="px-3 py-2">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Payment Details" description="Shown on the printed invoice" />
          <CardBody className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Account Name</label>
              <input
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails((p) => ({ ...p, accountName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Bank Name</label>
              <input
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails((p) => ({ ...p, bankName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Account Number</label>
              <input
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails((p) => ({ ...p, accountNumber: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>IFSC Code</label>
              <input
                value={bankDetails.ifscCode}
                onChange={(e) => setBankDetails((p) => ({ ...p, ifscCode: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>UPI ID</label>
              <input
                value={bankDetails.upiId}
                onChange={(e) => setBankDetails((p) => ({ ...p, upiId: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Shipping / Other Charges</label>
              <input
                type="number"
                min="0"
                value={shippingCharges}
                onChange={(e) => setShippingCharges(e.target.value)}
                className={inputClass}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Totals" />
          <CardBody className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{money(totals.subtotal)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span>- {money(totals.totalDiscount)}</span>
              </div>
            )}
            {taxType === "INTRA_STATE" && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>CGST</span>
                  <span>{money(totals.cgst)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST</span>
                  <span>{money(totals.sgst)}</span>
                </div>
              </>
            )}
            {taxType === "INTER_STATE" && (
              <div className="flex justify-between text-slate-600">
                <span>IGST</span>
                <span>{money(totals.igst)}</span>
              </div>
            )}
            {Number(shippingCharges) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{money(shippingCharges)}</span>
              </div>
            )}
            <div className="mt-2 flex justify-between rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white">
              <span>Grand Total</span>
              <span>{money(totals.grandTotal)}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Terms & Notes" />
        <CardBody className="mt-4 space-y-3">
          <div>
            <label className={labelClass}>Terms & Conditions</label>
            <textarea
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              rows={4}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
          </div>
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

const PartyFields = ({ party, setParty, required = false }) => (
  <>
    <div>
      <label className={labelClass}>
        Name{required && <span className="text-red-500"> *</span>}
      </label>
      <input
        value={party.name}
        onChange={(e) => setParty((p) => ({ ...p, name: e.target.value }))}
        className={inputClass}
      />
    </div>
    <div>
      <label className={labelClass}>Address</label>
      <input
        value={party.address}
        onChange={(e) => setParty((p) => ({ ...p, address: e.target.value }))}
        className={inputClass}
      />
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div>
        <label className={labelClass}>City</label>
        <input value={party.city} onChange={(e) => setParty((p) => ({ ...p, city: e.target.value }))} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>State</label>
        <input value={party.state} onChange={(e) => setParty((p) => ({ ...p, state: e.target.value }))} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>PIN Code</label>
        <input value={party.pincode} onChange={(e) => setParty((p) => ({ ...p, pincode: e.target.value }))} className={inputClass} />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelClass}>GSTIN</label>
        <input value={party.gstin} onChange={(e) => setParty((p) => ({ ...p, gstin: e.target.value }))} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input value={party.email} onChange={(e) => setParty((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
      </div>
    </div>
    <div>
      <label className={labelClass}>Phone</label>
      <input value={party.phone} onChange={(e) => setParty((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />
    </div>
  </>
);

export default CreateInvoicePage;
