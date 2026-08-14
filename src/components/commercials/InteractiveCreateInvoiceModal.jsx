import { useState, useEffect } from "react";
import {
  FiX,
  FiCheckCircle,
  FiFileText,
  FiDollarSign,
  FiPlus,
  FiTrash2,
  FiLoader,
  FiCheck,
} from "react-icons/fi";
import invoicesApi from "../../api/invoicesApi";

const InteractiveCreateInvoiceModal = ({
  isOpen,
  onClose,
  requirement = {},
  selectedCandidate = null,
  purchaseOrders = [],
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trainer = selectedCandidate?.trainerId || {};
  const vendor = requirement.vendorId || {};
  const latestPO = purchaseOrders[0];

  const clientBudget = Number(requirement.budget) || 0;

  const [formData, setFormData] = useState({
    direction: "ADMIN_TO_VENDOR", // ADMIN_TO_VENDOR | TRAINER_TO_ADMIN
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    purchaseOrderId: latestPO?._id || "",
    paymentTerms: "Payment due within 30 days.",
    notes: "Tax Invoice for training services rendered.",
    items: [
      {
        description: `Professional Training Services: ${requirement.title || "Engagement"}`,
        quantity: 1,
        unit: "Nos",
        rate: clientBudget || 0,
        taxPercent: 18,
        amount: clientBudget || 0,
      },
    ],
  });

  useEffect(() => {
    if (requirement) {
      setFormData((prev) => ({
        ...prev,
        purchaseOrderId: latestPO?._id || prev.purchaseOrderId,
        items: [
          {
            description: `Professional Training Services: ${requirement.title || "Engagement"}`,
            quantity: 1,
            unit: "Nos",
            rate: clientBudget || 0,
            taxPercent: 18,
            amount: clientBudget || 0,
          },
        ],
      }));
    }
  }, [requirement, clientBudget, latestPO]);

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

  const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxTotal = subtotal * 0.18;
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const payload = {
        requirementId: requirement._id,
        direction: formData.direction,
        vendorId: vendor._id || requirement.vendorId,
        trainerId: trainer._id || selectedCandidate?.trainerId,
        purchaseOrderId: formData.purchaseOrderId || undefined,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        items: formData.items,
        subtotal,
        taxTotal,
        grandTotal,
        totalAmount: grandTotal,
      };

      const res = await invoicesApi.create(payload);

      if (onSuccess) onSuccess(res.invoice || res);
      onClose();
    } catch (err) {
      console.error("Invoice Creation Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to generate Tax Invoice.");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold shadow-md">
              <FiDollarSign size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                Invoice Verification & Review Form
              </span>
              <h3 className="text-lg font-black text-slate-900">
                Review & Issue Tax Invoice
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
          {/* Invoice Direction Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 p-1.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, direction: "ADMIN_TO_VENDOR" })}
              className={`rounded-xl py-2 text-xs font-extrabold transition-all ${
                formData.direction === "ADMIN_TO_VENDOR"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Client Tax Invoice (Billed to Vendor)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, direction: "TRAINER_TO_ADMIN" })}
              className={`rounded-xl py-2 text-xs font-extrabold transition-all ${
                formData.direction === "TRAINER_TO_ADMIN"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Trainer Payout Invoice (Billed to Platform)
            </button>
          </div>

          {/* Party Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs">
            <div>
              <span className="font-extrabold uppercase text-slate-400 text-[10px]">Billed To</span>
              <p className="mt-1 font-extrabold text-slate-900">
                {formData.direction === "ADMIN_TO_VENDOR" ? (vendor.name || "Corporate Client Vendor") : "Trainexus Operations"}
              </p>
            </div>
            <div>
              <span className="font-extrabold uppercase text-slate-400 text-[10px]">Billed From</span>
              <p className="mt-1 font-extrabold text-indigo-950">
                {formData.direction === "ADMIN_TO_VENDOR" ? "Trainexus Operations" : (trainer.name || selectedCandidate?.name || "Assigned Trainer")}
              </p>
            </div>
          </div>

          {/* Dates & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">PO Reference (Optional)</label>
              <select
                value={formData.purchaseOrderId}
                onChange={(e) => setFormData({ ...formData, purchaseOrderId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 outline-hidden"
              >
                <option value="">No PO Linked</option>
                {purchaseOrders.map((po) => (
                  <option key={po._id} value={po._id}>
                    {po.poNumber || "PO"} (₹{po.grandTotal || po.totalAmount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-800">Invoice Items & Rates</label>

            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-600 outline-hidden"
                    />
                  </div>
                  <div className="col-span-4 text-right">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 text-right focus:border-indigo-600 outline-hidden"
                    />
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
              <span>Grand Total Invoice Amount:</span>
              <span className="text-indigo-700">₹{grandTotal.toLocaleString("en-IN")}</span>
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
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <FiLoader className="animate-spin" /> : <FiCheck />}
              {loading ? "Generating Invoice..." : "Confirm & Submit Tax Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InteractiveCreateInvoiceModal;
