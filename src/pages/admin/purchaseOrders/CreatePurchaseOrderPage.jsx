import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiSave,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";

import Button from "../../../components/ui/Button";
import purchaseOrdersApi from "../../../api/purchaseOrdersApi";
import api from "../../../api/axios";

const emptyItem = () => ({
  description: "Corporate Training Engagement",
  hsnSacCode: "998311",
  quantity: 1,
  unit: "Days",
  rate: 0,
  taxPercent: 18,
});

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  return `${symbol} ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CreatePurchaseOrderPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requirementId = searchParams.get("requirementId") || "";
  const assignmentId = searchParams.get("assignmentId") || "";
  const initialVendorId = searchParams.get("vendorId") || "";
  const initialTrainerId = searchParams.get("trainerId") || "";

  // Data sources for dropdowns/prefill
  const [requirement, setRequirement] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [trainers, setTrainers] = useState([]);

  // Selected Entities
  const [selectedVendorId, setSelectedVendorId] = useState(initialVendorId);
  const [selectedTrainerId, setSelectedTrainerId] = useState(initialTrainerId);

  // Document Fields
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [taxType, setTaxType] = useState("INTRA_STATE");

  // Party Details
  const [buyer, setBuyer] = useState({
    name: "Nxthack IT Solutions",
    address: "Level 4, Commercial Hub, Cyber City",
    city: "Gurugram",
    state: "Haryana",
    country: "India",
    pincode: "122002",
    gstin: "06AAACT0000A1Z5",
    email: "billing@nxthack.com",
    phone: "+91 98765 43210",
  });

  const [supplier, setSupplier] = useState({
    name: "",
    contactPerson: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    email: "",
    phone: "",
  });

  // Line items
  const [items, setItems] = useState([emptyItem()]);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState(
    "100% payment within 30 days of invoice, subject to satisfactory delivery."
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    "1. Please acknowledge receipt of this Purchase Order.\n2. Goods/services must conform to specifications.\n3. PO number must be referenced on the invoice."
  );
  const [notes, setNotes] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("Authorized Signatory");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load context options
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [vRes, tRes, cRes] = await Promise.all([
          api.get("/vendors").catch(() => ({ data: [] })),
          api.get("/trainers").catch(() => ({ data: [] })),
          api.get("/company-settings").catch(() => ({ data: null })),
        ]);

        const trainerList = tRes.data?.trainers || tRes.data || [];
        const vendorList = vRes.data?.vendors || vRes.data || [];

        if (active) {
          setVendors(vendorList);
          setTrainers(trainerList);

          if (cRes.data && cRes.data.name) {
            setBuyer((prev) => ({
              ...prev,
              name: cRes.data.name || "Nxthack IT Solutions",
              address: cRes.data.address || prev.address,
              city: cRes.data.city || prev.city,
              state: cRes.data.state || prev.state,
              country: cRes.data.country || prev.country,
              pincode: cRes.data.pincode || prev.pincode,
              gstin: cRes.data.gstin || prev.gstin,
              email: cRes.data.email || prev.email,
              phone: cRes.data.phone || prev.phone,
            }));
          }
        }

        // If assignmentId is passed, fetch assignment directly
        if (assignmentId) {
          try {
            const assignRes = await api.get(`/assignments/${assignmentId}`);
            const assignData = assignRes.data?.data || assignRes.data;
            if (active && assignData) {
              if (assignData.vendorId) {
                const vId = assignData.vendorId._id || assignData.vendorId;
                setSelectedVendorId(vId);
              }
              if (assignData.trainerId) {
                const trObj = assignData.trainerId;
                const trId = trObj._id || trObj;
                setSelectedTrainerId(trId);
                if (typeof trObj === "object" && trObj.name) {
                  setSupplier({
                    name: trObj.name || "",
                    contactPerson: trObj.name || "",
                    address: trObj.address || "",
                    city: trObj.city || "",
                    state: trObj.state || "",
                    pincode: trObj.pincode || "",
                    gstin: trObj.gstin || "",
                    email: trObj.email || "",
                    phone: trObj.phone || "",
                  });
                }
              }
              if (assignData.trainerRate !== undefined) {
                setItems([
                  {
                    description: `Corporate Training - ${assignData.requirementId?.title || "Engagement"}`,
                    hsnSacCode: "998311",
                    quantity: 1,
                    unit: assignData.rateType === "PER_HOUR" ? "Hours" : "Days",
                    rate: Number(assignData.trainerRate) || 0,
                    taxPercent: 18,
                  },
                ]);
              }
            }
          } catch (err) {
            console.error("Failed to load assignment:", err);
          }
        }

        // If requirementId is passed, fetch requirement details & shortlisted trainer
        if (requirementId) {
          const reqRes = await api.get(`/requirements/${requirementId}`);
          if (active && reqRes.data) {
            setRequirement(reqRes.data);
            const reqData = reqRes.data;

            const defaultRate = Number(reqData.budget) || 0;
            if (!assignmentId) {
              setItems([
                {
                  description: `Corporate Training - ${reqData.title || "Engagement"}`,
                  hsnSacCode: "998311",
                  quantity: reqData.durationDays || reqData.durationValue || 1,
                  unit: "Days",
                  rate: defaultRate,
                  taxPercent: 18,
                },
              ]);
            }

            if (reqData.vendorId && !selectedVendorId) {
              const vId = reqData.vendorId._id || reqData.vendorId;
              setSelectedVendorId(vId);
            }

            // Find shortlisted/selected candidate for this requirement
            const shortlisted = reqData.candidateMatches?.find(
              (c) =>
                c.selectionStatus === "SHORTLISTED" ||
                c.selectionStatus === "SELECTED" ||
                c.selectionStatus === "ONBOARDED"
            );
            if (shortlisted?.trainerId && !selectedTrainerId) {
              const trId = shortlisted.trainerId._id || shortlisted.trainerId;
              setSelectedTrainerId(trId);

              const trObj = shortlisted.trainerId;
              if (trObj && typeof trObj === "object" && trObj.name) {
                setSupplier({
                  name: trObj.name || "",
                  contactPerson: trObj.name || "",
                  address: trObj.address || "",
                  city: trObj.city || "",
                  state: trObj.state || "",
                  pincode: trObj.pincode || "",
                  gstin: trObj.gstin || "",
                  email: trObj.email || "",
                  phone: trObj.phone || "",
                });
              }

              if (!assignmentId && (shortlisted.quotedRate || shortlisted.trainerQuotedRate)) {
                const trRate = Number(shortlisted.trainerQuotedRate || shortlisted.quotedRate);
                setItems([
                  {
                    description: `Corporate Training - ${reqData.title || "Engagement"}`,
                    hsnSacCode: "998311",
                    quantity: reqData.durationDays || reqData.durationValue || 1,
                    unit: "Days",
                    rate: trRate,
                    taxPercent: 18,
                  },
                ]);
              }
            }
          }
        }

        // If explicit initialTrainerId was passed in query
        if (initialTrainerId && active) {
          setSelectedTrainerId(initialTrainerId);
          const tr = trainerList.find((t) => (t._id || t.id) === initialTrainerId);
          if (tr) {
            setSupplier({
              name: tr.name || "",
              contactPerson: tr.name || "",
              address: tr.address || "",
              city: tr.city || "",
              state: tr.state || "",
              pincode: tr.pincode || "",
              gstin: tr.gstin || "",
              email: tr.email || "",
              phone: tr.phone || "",
            });
          }
        }
      } catch (err) {
        console.error("Failed to load initial context:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [requirementId, assignmentId, initialTrainerId]);

  const handleTrainerChange = (trId) => {
    setSelectedTrainerId(trId);
    const tr = trainers.find((t) => (t._id || t.id) === trId);
    if (tr) {
      setSupplier({
        name: tr.name || "",
        contactPerson: tr.name || "",
        address: tr.address || "",
        city: tr.city || "",
        state: tr.state || "",
        pincode: tr.pincode || "",
        gstin: tr.gstin || "",
        email: tr.email || "",
        phone: tr.phone || "",
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
    let totalTax = 0;

    items.forEach((item) => {
      const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      const tax = base * ((Number(item.taxPercent) || 0) / 100);
      subtotal += base;
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

    const preRound = subtotal + totalTax + Number(shippingCharges || 0) + Number(otherCharges || 0);
    const grandTotal = Math.round(preRound);
    const roundOff = Math.round((grandTotal - preRound) * 100) / 100;

    return { subtotal, totalTax, cgst, sgst, igst, roundOff, grandTotal };
  }, [items, taxType, shippingCharges, otherCharges]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTrainerId) {
      setError("Please select a Trainer / Supplier for this Purchase Order.");
      return;
    }

    if (!selectedVendorId && !requirementId) {
      setError("Please select a Corporate Vendor.");
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      setError("Every line item requires a description.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const poPayload = {
        requirement: requirementId || undefined,
        assignment: assignmentId || undefined,
        vendor: selectedVendorId,
        trainer: selectedTrainerId,
        poDate,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        deliveryLocation,
        taxType,
        currency,
        buyer,
        supplier,
        items: items.map((it) => ({
          ...it,
          quantity: Number(it.quantity) || 0,
          rate: Number(it.rate) || 0,
          taxPercent: Number(it.taxPercent) || 0,
        })),
        shippingCharges: Number(shippingCharges) || 0,
        otherCharges: Number(otherCharges) || 0,
        paymentTerms,
        termsAndConditions,
        notes,
        authorizedBy,
        status: "ADMIN_ISSUED",
      };

      const created = await purchaseOrdersApi.create(poPayload);
      navigate(`/admin/purchase-orders/${created._id}`);
    } catch (err) {
      console.error("Failed to create Purchase Order:", err);
      setError(err?.response?.data?.message || "Unable to issue Purchase Order.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {/* Top Header & Actions */}
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
              <FiFileText className="text-blue-700" /> Create Official Purchase Order
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
            Issue Purchase Order
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200">
          <FiAlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Context selectors bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            Linked Vendor (Client) *
          </label>
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
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
            Assigned Trainer (Supplier) *
          </label>
          <select
            value={selectedTrainerId}
            onChange={(e) => handleTrainerChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
          >
            <option value="">Select Trainer...</option>
            {trainers.map((t) => (
              <option key={t._id || t.id} value={t._id || t.id}>
                {t.name} ({t.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
            Tax Type Format
          </label>
          <select
            value={taxType}
            onChange={(e) => setTaxType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
          >
            <option value="INTRA_STATE">Intra-State (CGST 9% + SGST 9%)</option>
            <option value="INTER_STATE">Inter-State (IGST 18%)</option>
            <option value="NONE">No Tax (Exempt)</option>
          </select>
        </div>
      </div>

      {/* INTERACTIVE A4 DOCUMENT CANVAS */}
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
          {/* Header Bar */}
          <div className="flex justify-between items-start border-b-4 border-blue-900 pb-4">
            <div className="max-w-[60%] space-y-1">
              <input
                type="text"
                value={buyer.name}
                onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                className="w-full text-xl font-bold text-blue-900 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded px-1 outline-none"
                placeholder="Buyer Company Name"
              />
              <textarea
                value={buyer.address}
                onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                rows={2}
                className="w-full text-xs text-slate-600 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded px-1 outline-none resize-none"
                placeholder="Buyer Address..."
              />
              <div className="flex gap-2 text-xs text-slate-500">
                <input
                  type="text"
                  value={buyer.gstin}
                  onChange={(e) => setBuyer({ ...buyer, gstin: e.target.value })}
                  className="w-1/2 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded px-1 outline-none"
                  placeholder="GSTIN: 06AAA..."
                />
                <input
                  type="text"
                  value={buyer.phone}
                  onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                  className="w-1/2 bg-transparent hover:bg-slate-50 focus:bg-slate-50 border border-transparent focus:border-slate-300 rounded px-1 outline-none"
                  placeholder="Phone..."
                />
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-2xl font-black text-blue-900 tracking-wider">PURCHASE ORDER</div>
              <span className="inline-block rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase">
                ADMIN DRAFT
              </span>

              <div className="text-xs space-y-1 text-slate-600 pt-1">
                <div className="flex justify-end items-center gap-2">
                  <span className="font-semibold text-slate-400">PO Date:</span>
                  <input
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                    className="border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div className="flex justify-end items-center gap-2">
                  <span className="font-semibold text-slate-400">Delivery By:</span>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Supplier / Ship To Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Supplier / Vendor (Trainer)
              </div>
              <input
                type="text"
                value={supplier.name}
                onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
                className="w-full font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                placeholder="Supplier Name..."
              />
              <input
                type="text"
                value={supplier.address}
                onChange={(e) => setSupplier({ ...supplier, address: e.target.value })}
                className="w-full text-xs text-slate-600 bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                placeholder="Supplier Address..."
              />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={supplier.gstin}
                  onChange={(e) => setSupplier({ ...supplier, gstin: e.target.value })}
                  className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  placeholder="GSTIN..."
                />
                <input
                  type="text"
                  value={supplier.phone}
                  onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })}
                  className="bg-white border border-slate-200 rounded px-2 py-1 outline-none"
                  placeholder="Phone..."
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50/50">
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Ship To / Venue Location
              </div>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full font-bold text-xs text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                placeholder="Delivery / Training Location..."
              />
              <p className="text-[11px] text-slate-500 italic pt-1">
                Same as platform buyer address unless specified above for client location.
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-blue-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-2 text-left w-[6%]">#</th>
                  <th className="p-2 text-left w-[36%]">Description</th>
                  <th className="p-2 text-left w-[12%]">HSN/SAC</th>
                  <th className="p-2 text-right w-[10%]">Qty</th>
                  <th className="p-2 text-right w-[14%]">Rate ({currency})</th>
                  <th className="p-2 text-right w-[8%]">Tax %</th>
                  <th className="p-2 text-right w-[10%]">Amount</th>
                  <th className="p-2 text-center w-[4%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => {
                  const base = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                  const tax = base * ((Number(item.taxPercent) || 0) / 100);
                  const lineTotal = base + tax;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(idx, "description", e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-blue-600"
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
                          className="w-14 border border-slate-200 rounded px-1 py-1 text-xs text-right outline-none"
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
                className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-900 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition"
              >
                <FiPlus size={14} /> Add Line Item
              </button>
            </div>
          </div>

          {/* Totals Section */}
          <div className="flex justify-between items-start gap-6 pt-4 border-t border-slate-200">
            <div className="w-1/2 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Payment Terms</span>
                <textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={2}
                  className="w-full mt-1 border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none resize-none"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Terms & Conditions</span>
                <textarea
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  rows={3}
                  className="w-full mt-1 border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none resize-none"
                />
              </div>
            </div>

            <div className="w-1/2 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold">{money(totals.subtotal, currency)}</span>
              </div>

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

              <div className="flex justify-between py-2 px-3 bg-blue-900 text-white rounded font-bold text-sm">
                <span>Grand Total:</span>
                <span>{money(totals.grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          {/* Signature Footer */}
          <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs">
            <div className="text-slate-400 text-[10px]">
              Computer-generated document. Subject to Trainexus Platform Terms.
            </div>
            <div className="text-center space-y-8">
              <span className="text-slate-500 block">For Trainexus Platform</span>
              <input
                type="text"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
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
          Issue Purchase Order
        </Button>
      </div>
    </form>
  );
};

export default CreatePurchaseOrderPage;
