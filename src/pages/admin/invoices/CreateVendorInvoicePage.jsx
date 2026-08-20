import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiSave,
  FiAlertCircle,
  FiZap,
  FiFileText,
} from "react-icons/fi";

import Button from "../../../components/ui/Button";
import invoicesApi from "../../../api/invoicesApi";
import api from "../../../api/axios";

const emptyItem = () => ({
  description: "Corporate Training Services",
  hsnSacCode: "998311",
  quantity: 1,
  unit: "Days",
  rate: 0,
  discountPercent: 0,
  taxPercent: 18,
});

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  return `${symbol} ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CreateVendorInvoicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requirementId = searchParams.get("requirementId") || "";
  const initialAssignmentId = searchParams.get("assignmentId") || "";
  const sourceInvoiceId = searchParams.get("fromTrainerInvoice") || "";

  const [assignmentId, setAssignmentId] = useState(initialAssignmentId);
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const [invoiceType, setInvoiceType] = useState("TAX_INVOICE");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("Haryana (06)");
  const [currency, setCurrency] = useState("INR");
  const [taxType, setTaxType] = useState("INTRA_STATE");

  const [billFrom, setBillFrom] = useState({
    name: "Nxthack IT Solutions",
    address: "Level 4, Commercial Hub, Cyber City",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    country: "India",
    gstin: "06AAACT0000A1Z5",
    pan: "AAACT0000A",
    email: "billing@nxthack.com",
    phone: "+91 98765 43210",
  });

  const [billTo, setBillTo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    email: "",
    phone: "",
  });

  const [bankDetails, setBankDetails] = useState({
    accountName: "Trainexus Technologies Pvt Ltd",
    accountNumber: "987654321098",
    bankName: "HDFC Bank",
    branch: "Cyber City Branch",
    ifscCode: "HDFC0001234",
    upiId: "trainexus@hdfcbank",
  });

  const [items, setItems] = useState([emptyItem()]);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [termsAndConditions, setTermsAndConditions] = useState(
    "1. Payment is due within agreed credit period from invoice date.\n2. Quote invoice number in all payment correspondence.\n3. Interest @ 18% p.a. will be charged on overdue amounts."
  );
  const [notes, setNotes] = useState("");
  const [authorizedSignatory, setAuthorizedSignatory] = useState("Authorized Signatory");

  const [prefilling, setPrefilling] = useState(!!sourceInvoiceId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load Vendor list & Context
  useEffect(() => {
    let active = true;

    const loadContext = async () => {
      try {
        setLoading(true);
        const vRes = await api.get("/vendors").catch(() => ({ data: [] }));
        if (active) setVendors(vRes.data?.vendors || vRes.data || []);

        if (requirementId) {
          const reqRes = await api.get(`/requirements/${requirementId}`);
          if (active && reqRes.data) {
            const reqData = reqRes.data;
            if (reqData.vendorId) {
              const vObj = reqData.vendorId;
              setSelectedVendorId(vObj._id || vObj);
              setBillTo({
                name: vObj.companyName || vObj.name || "",
                address: vObj.address || "",
                city: vObj.city || "",
                state: vObj.state || "",
                pincode: vObj.pincode || "",
                gstin: vObj.gstNumber || vObj.gstin || "",
                email: vObj.contactEmail || vObj.email || "",
                phone: vObj.contactPhone || vObj.phone || "",
              });
            }

            // Find assignment if available
            const assignRes = await api.get(`/assignments?requirement=${requirementId}`).catch(() => ({ data: { assignments: [] } }));
            const assignList = assignRes.data?.assignments || assignRes.data || [];
            if (assignList.length > 0) {
              setAssignmentId(assignList[0]._id);
            }

            setItems([
              {
                description: `Client Training Invoice - ${reqData.title}`,
                hsnSacCode: "998311",
                quantity: reqData.durationDays || 1,
                unit: "Days",
                rate: Number(reqData.budget) || 0,
                discountPercent: 0,
                taxPercent: 18,
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load context:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadContext();

    return () => {
      active = false;
    };
  }, [requirementId]);

  // Handle Trainer Invoice Prefill
  useEffect(() => {
    if (!sourceInvoiceId) return;

    setPrefilling(true);
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
        setError("Could not auto-fill from the trainer invoice — you can edit manually.");
      })
      .finally(() => setPrefilling(false));
  }, [sourceInvoiceId]);

  const handleVendorSelect = (vId) => {
    setSelectedVendorId(vId);
    const v = vendors.find((vendor) => (vendor._id || vendor.id) === vId);
    if (v) {
      setBillTo({
        name: v.companyName || v.name || "",
        address: v.address || "",
        city: v.city || "",
        state: v.state || "",
        pincode: v.pincode || "",
        gstin: v.gstNumber || v.gstin || "",
        email: v.contactEmail || v.email || "",
        phone: v.contactPhone || v.phone || "",
      });
    }
  };

  const updateItem = (index, field, value) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

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

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (taxType === "INTER_STATE") {
      igst = totalTax;
    } else if (taxType === "INTRA_STATE") {
      cgst = totalTax / 2;
      sgst = totalTax / 2;
    }

    const preRound = subtotal - totalDiscount + totalTax + Number(shippingCharges || 0);
    const grandTotal = Math.round(preRound);
    const roundOff = Math.round((grandTotal - preRound) * 100) / 100;

    return { subtotal, totalDiscount, totalTax, cgst, sgst, igst, roundOff, grandTotal };
  }, [items, taxType, shippingCharges]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!billTo.name.trim()) {
      setError("Please specify the Vendor name under Bill To.");
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Every line item requires a description.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const invoicePayload = {
        assignmentId: assignmentId || undefined,
        requirementId: requirementId || undefined,
        sourceInvoiceId: sourceInvoiceId || undefined,
        invoiceType,
        invoiceDate,
        dueDate: dueDate || undefined,
        placeOfSupply,
        taxType,
        currency,
        billFrom,
        billTo,
        items: items.map((it) => ({
          ...it,
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
          discountPercent: Number(it.discountPercent) || 0,
          taxPercent: Number(it.taxPercent) || 0,
        })),
        shippingCharges: Number(shippingCharges) || 0,
        bankDetails,
        termsAndConditions,
        notes,
        authorizedSignatory,
      };

      const created = await invoicesApi.createVendorInvoice(invoicePayload);
      navigate(`/admin/invoices/${created._id}`);
    } catch (err) {
      console.error("Failed to create vendor invoice:", err);
      setError(err?.response?.data?.message || "Unable to create invoice.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50 transition"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FiFileText className="text-slate-900" /> Create Client Tax Invoice
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Interactive document sheet styled identically to the downloadable PDF document.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" icon={FiSave} loading={saving}>
            Save & Issue Invoice
          </Button>
        </div>
      </div>

      {prefilling && (
        <div className="flex items-center gap-2 rounded-2xl bg-indigo-50 p-4 text-xs font-bold text-indigo-700 border border-indigo-200">
          <FiZap size={16} className="shrink-0" /> Auto-filling values from trainer invoice...
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200">
          <FiAlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Top Configuration Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            Billed Vendor (Client) *
          </label>
          <select
            value={selectedVendorId}
            onChange={(e) => handleVendorSelect(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-800"
          >
            <option value="">Select Vendor...</option>
            {vendors.map((v) => (
              <option key={v._id || v.id} value={v._id || v.id}>
                {v.companyName || v.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            Invoice Type
          </label>
          <select
            value={invoiceType}
            onChange={(e) => setInvoiceType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-800"
          >
            <option value="TAX_INVOICE">Tax Invoice</option>
            <option value="PROFORMA_INVOICE">Proforma Invoice</option>
            <option value="CREDIT_NOTE">Credit Note</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            Tax Format
          </label>
          <select
            value={taxType}
            onChange={(e) => setTaxType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-800"
          >
            <option value="INTRA_STATE">Intra-State (CGST 9% + SGST 9%)</option>
            <option value="INTER_STATE">Inter-State (IGST 18%)</option>
            <option value="NONE">No Tax (Exempt)</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE A4 INVOICE CANVAS (Styled identically to InvoiceTemplate) */}
      {/* ========================================================================= */}
      <div className="flex justify-center bg-slate-100/80 p-4 sm:p-8 rounded-3xl border border-slate-200/80 shadow-inner overflow-x-auto">
        <div
          className="bg-white shadow-2xl rounded-sm p-8 text-slate-800 space-y-6 border border-slate-200"
          style={{
            width: "210mm",
            minHeight: "297mm",
            boxSizing: "border-box",
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-4">
            <div className="max-w-[60%] space-y-1">
              <input
                type="text"
                value={billFrom.name}
                onChange={(e) => setBillFrom({ ...billFrom, name: e.target.value })}
                className="w-full text-xl font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded px-1 outline-none"
                placeholder="Platform Company Name"
              />
              <textarea
                value={billFrom.address}
                onChange={(e) => setBillFrom({ ...billFrom, address: e.target.value })}
                rows={2}
                className="w-full text-xs text-slate-600 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded px-1 outline-none resize-none"
                placeholder="Address..."
              />
              <div className="flex gap-2 text-xs text-slate-500">
                <input
                  type="text"
                  value={billFrom.gstin}
                  onChange={(e) => setBillFrom({ ...billFrom, gstin: e.target.value })}
                  className="w-1/2 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded px-1 outline-none"
                  placeholder="GSTIN..."
                />
                <input
                  type="text"
                  value={billFrom.pan}
                  onChange={(e) => setBillFrom({ ...billFrom, pan: e.target.value })}
                  className="w-1/2 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded px-1 outline-none"
                  placeholder="PAN..."
                />
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-2xl font-black text-slate-900 tracking-wider">
                {invoiceType.replace(/_/g, " ")}
              </div>
              <span className="inline-block rounded-full bg-slate-900 px-3 py-0.5 text-[10px] font-bold text-white uppercase">
                DRAFT
              </span>

              <div className="text-xs space-y-1 text-slate-600 pt-1">
                <div className="flex justify-end items-center gap-2">
                  <span className="font-semibold text-slate-400">Invoice Date:</span>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="flex justify-end items-center gap-2">
                  <span className="font-semibold text-slate-400">Due Date:</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="flex justify-end items-center gap-2">
                  <span className="font-semibold text-slate-400">Place of Supply:</span>
                  <input
                    type="text"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 outline-none w-32"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Ship To Boxes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Bill To (Client / Vendor)
              </div>
              <input
                type="text"
                value={billTo.name}
                onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
                className="w-full font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-slate-800"
                placeholder="Client / Vendor Name..."
              />
              <input
                type="text"
                value={billTo.address}
                onChange={(e) => setBillTo({ ...billTo, address: e.target.value })}
                className="w-full text-xs text-slate-600 bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                placeholder="Address..."
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={billTo.gstin}
                  onChange={(e) => setBillTo({ ...billTo, gstin: e.target.value })}
                  className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  placeholder="GSTIN..."
                />
                <input
                  type="text"
                  value={billTo.email}
                  onChange={(e) => setBillTo({ ...billTo, email: e.target.value })}
                  className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  placeholder="Email..."
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Payment Bank Details
              </div>
              <input
                type="text"
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                placeholder="Account Name..."
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  placeholder="Bank Name..."
                />
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  placeholder="Account No..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                  className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  placeholder="IFSC Code..."
                />
                <input
                  type="text"
                  value={bankDetails.upiId}
                  onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                  className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  placeholder="UPI ID..."
                />
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-2 text-left w-[5%]">#</th>
                  <th className="p-2 text-left w-[32%]">Description</th>
                  <th className="p-2 text-left w-[11%]">HSN/SAC</th>
                  <th className="p-2 text-right w-[8%]">Qty</th>
                  <th className="p-2 text-right w-[14%]">Rate ({currency})</th>
                  <th className="p-2 text-right w-[8%]">Disc %</th>
                  <th className="p-2 text-right w-[8%]">Tax %</th>
                  <th className="p-2 text-right w-[10%]">Amount</th>
                  <th className="p-2 text-center w-[4%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => {
                  const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                  const discount = base * ((Number(item.discountPercent) || 0) / 100);
                  const taxable = base - discount;
                  const tax = taxable * ((Number(item.taxPercent) || 0) / 100);
                  const lineTotal = taxable + tax;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-slate-800"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={item.hsnSacCode}
                          onChange={(e) => updateItem(idx, "hsnSacCode", e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs outline-none"
                        />
                      </td>
                      <td className="p-1 text-right">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          className="w-12 border border-slate-200 rounded px-1 py-1 text-xs text-right outline-none"
                        />
                      </td>
                      <td className="p-1 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updateItem(idx, "rate", e.target.value)}
                          className="w-20 border border-slate-200 rounded px-1 py-1 text-xs text-right outline-none font-semibold"
                        />
                      </td>
                      <td className="p-1 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.discountPercent}
                          onChange={(e) => updateItem(idx, "discountPercent", e.target.value)}
                          className="w-12 border border-slate-200 rounded px-1 py-1 text-xs text-right outline-none"
                        />
                      </td>
                      <td className="p-1 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.taxPercent}
                          onChange={(e) => updateItem(idx, "taxPercent", e.target.value)}
                          className="w-12 border border-slate-200 rounded px-1 py-1 text-xs text-right outline-none"
                        />
                      </td>
                      <td className="p-2 text-right font-bold text-slate-900">
                        {money(lineTotal, currency)}
                      </td>
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pt-2">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-slate-900 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 transition"
              >
                <FiPlus size={14} /> Add Line Item
              </button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-between items-start gap-6 pt-4 border-t border-slate-200">
            <div className="w-1/2 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Terms & Conditions</span>
                <textarea
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  rows={3}
                  className="w-full mt-1 border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none resize-none"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none resize-none"
                  placeholder="Additional notes for client..."
                />
              </div>
            </div>

            <div className="w-1/2 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold">{money(totals.subtotal, currency)}</span>
              </div>

              {totals.totalDiscount > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                  <span>Discount:</span>
                  <span>- {money(totals.totalDiscount, currency)}</span>
                </div>
              )}

              {taxType === "INTER_STATE" ? (
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>IGST (18%):</span>
                  <span>{money(totals.igst, currency)}</span>
                </div>
              ) : taxType === "INTRA_STATE" ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>CGST (9%):</span>
                    <span>{money(totals.cgst, currency)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                    <span>SGST (9%):</span>
                    <span>{money(totals.sgst, currency)}</span>
                  </div>
                </>
              ) : null}

              {totals.roundOff !== 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                  <span>Round Off:</span>
                  <span>{money(totals.roundOff, currency)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 px-3 bg-slate-900 text-white rounded font-bold text-sm">
                <span>Grand Total:</span>
                <span>{money(totals.grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          {/* Signature Footer */}
          <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs">
            <div className="text-slate-400 text-[10px]">
              This is a computer-generated tax invoice and does not require a physical signature.
            </div>
            <div className="text-center space-y-8">
              <span className="text-slate-500 block">For Trainexus Platform</span>
              <input
                type="text"
                value={authorizedSignatory}
                onChange={(e) => setAuthorizedSignatory(e.target.value)}
                className="text-center border-t border-slate-400 pt-1 font-semibold text-slate-800 bg-transparent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Actions */}
      <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" icon={FiSave} loading={saving}>
          Save & Issue Invoice
        </Button>
      </div>
    </form>
  );
};

export default CreateVendorInvoicePage;
