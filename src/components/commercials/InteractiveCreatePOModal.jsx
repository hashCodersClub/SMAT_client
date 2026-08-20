import { useState, useEffect } from "react";
import {
  FiX,
  FiCheckCircle,
  FiFileText,
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiLoader,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import purchaseOrdersApi from "../../api/purchaseOrdersApi";

const InteractiveCreatePOModal = ({
  isOpen,
  onClose,
  requirement = {},
  selectedCandidate = null,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trainer = selectedCandidate?.trainerId || {};
  const vendor = requirement.vendorId || {};

  const defaultRate = selectedCandidate
    ? Number(selectedCandidate.trainerQuotedRate ?? selectedCandidate.quotedRate ?? 0)
    : Number(requirement.budget) || 0;

  const [formData, setFormData] = useState({
    poDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: requirement.endDate
      ? new Date(requirement.endDate).toISOString().split("T")[0]
      : "",
    deliveryLocation: `${requirement.city || ""}, ${requirement.state || ""}`.trim(),
    paymentTerms: "Payment within 30 days of completion and invoice submission.",
    notes: "Please confirm acceptance of this Purchase Order.",
    items: [
      {
        description: `Corporate Training Delivery: ${requirement.title || "Engagement"}`,
        quantity: requirement.durationValue || 1,
        unit: requirement.durationUnit || "Days",
        rate: defaultRate || 0,
        taxPercent: 18,
        amount: defaultRate || 0,
      },
    ],
  });

  useEffect(() => {
    if (requirement || selectedCandidate) {
      setFormData((prev) => ({
        ...prev,
        deliveryLocation: `${requirement.city || ""}, ${requirement.state || ""}`.trim(),
        expectedDeliveryDate: requirement.endDate
          ? new Date(requirement.endDate).toISOString().split("T")[0]
          : "",
        items: [
          {
            description: `Corporate Training Delivery: ${requirement.title || "Engagement"}`,
            quantity: requirement.durationValue || 1,
            unit: requirement.durationUnit || "Days",
            rate: defaultRate || 0,
            taxPercent: 18,
            amount: (requirement.durationValue || 1) * (defaultRate || 0),
          },
        ],
      }));
    }
  }, [requirement, selectedCandidate, defaultRate]);

  if (!isOpen) return null;

  const handleItemChange = (index, field, val) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = val;

    if (field === "quantity" || field === "rate") {
      const q = Number(updatedItems[index].quantity) || 0;
      const r = Number(updatedItems[index].rate) || 0;
      updatedItems[index].amount = q * r;
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: "Additional Training Module / Material",
          quantity: 1,
          unit: "Nos",
          rate: 0,
          taxPercent: 18,
          amount: 0,
        },
      ],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxTotal = subtotal * 0.18;
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Create & issue PO payload
      const payload = {
        requirement: requirement._id || requirement.id,
        trainer: trainer._id || selectedCandidate?.trainerId?._id || selectedCandidate?.trainerId,
        vendor: vendor._id || requirement.vendorId?._id || requirement.vendorId,
        poDate: formData.poDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        deliveryLocation: formData.deliveryLocation,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        items: formData.items,
        status: "ADMIN_ISSUED",
      };

      const res = await purchaseOrdersApi.create(payload);

      if (onSuccess) onSuccess(res.purchaseOrder || res);
      onClose();
    } catch (err) {
      console.error("PO Creation Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to generate Purchase Order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold shadow-md">
              <FiFileText size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                Commercial Verification & Review Form
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Review & Issue Purchase Order
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Party Pre-filled Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs">
            <div>
              <span className="font-extrabold uppercase text-slate-400 text-[10px]">PO Issuer / Sender</span>
              <p className="mt-1 font-extrabold text-blue-900">Nxthack IT Solutions</p>
              <p className="text-slate-500">billing@nxthack.com</p>
            </div>
            <div>
              <span className="font-extrabold uppercase text-slate-400 text-[10px]">Shortlisted Trainer (PO Receiver)</span>
              <p className="mt-1 font-extrabold text-indigo-950">{trainer.name || selectedCandidate?.trainerId?.name || selectedCandidate?.name || "Assigned Trainer"}</p>
              <p className="text-slate-500">Agreed Rate: ₹{defaultRate.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <span className="font-extrabold uppercase text-slate-400 text-[10px]">Client / Vendor</span>
              <p className="mt-1 font-extrabold text-slate-900">{vendor.companyName || vendor.name || requirement.vendorId?.companyName || "Corporate Client Vendor"}</p>
            </div>
          </div>

          {/* Dates & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">PO Date</label>
              <input
                type="date"
                value={formData.poDate}
                onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Delivery Date</label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Delivery Location</label>
              <input
                type="text"
                value={formData.deliveryLocation}
                onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
                placeholder="City / Remote"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-hidden"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-800">Commercial Line Items & Rates</label>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800"
              >
                <FiPlus size={12} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      placeholder="Item Description"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      placeholder="Qty"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      placeholder="Rate (₹)"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-black text-slate-900">
                      ₹{Number(item.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-4 space-y-1.5 text-xs">
            <div className="flex justify-between font-semibold text-slate-600">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-600">
              <span>GST / Tax (18%):</span>
              <span>₹{taxTotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total PO Value:</span>
              <span className="text-indigo-700">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Payment Terms & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Payment Terms</label>
              <textarea
                rows={2}
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Notes / Instructions</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-800 focus:border-indigo-600 outline-hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiCheck />}
              {loading ? "Generating PO..." : "Confirm & Submit Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InteractiveCreatePOModal;
