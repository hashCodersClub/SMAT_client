import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiDownload, FiArrowLeft, FiAlertCircle, FiPlus, FiTrash2, FiSend } from "react-icons/fi";

import Card, { CardHeader, CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import PurchaseOrderTemplate from "../../../components/documents/PurchaseOrderTemplate";

import purchaseOrdersApi from "../../../api/purchaseOrdersApi";
import downloadDocumentPdf from "../../../utils/downloadDocumentPdf";

const STATUS_VARIANTS = {
  VENDOR_REQUESTED: "warning",
  ADMIN_ISSUED: "primary",
  TRAINER_CONFIRMED: "success",
  TRAINER_REJECTED: "danger",
  CANCELLED: "default",
};

const STATUS_LABELS = {
  VENDOR_REQUESTED: "Awaiting Review",
  ADMIN_ISSUED: "Sent to Trainer",
  TRAINER_CONFIRMED: "Confirmed",
  TRAINER_REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

const emptyItem = () => ({ description: "", hsnSacCode: "", quantity: 1, unit: "Nos", rate: 0, taxPercent: 18 });

const PurchaseOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [issuing, setIssuing] = useState(false);

  // Editable draft used only while reviewing a VENDOR_REQUESTED PO.
  const [items, setItems] = useState([emptyItem()]);
  const [taxType, setTaxType] = useState("INTRA_STATE");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState(
    "100% payment within 30 days of invoice, subject to satisfactory delivery.",
  );

  const load = () => {
    setLoading(true);
    purchaseOrdersApi
      .getById(id)
      .then((data) => {
        setPurchaseOrder(data);

        if (data.status === "VENDOR_REQUESTED") {
          const proposed = data.vendorProposedTerms?.items;
          setItems(proposed && proposed.length > 0 ? proposed : [emptyItem()]);
        }
      })
      .catch((err) => {
        console.error("Failed to load purchase order:", err);
        setError(err?.response?.data?.message || "Unable to load purchase order.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [id]);

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

    return { subtotal, totalTax, grandTotal: Math.round(subtotal + totalTax) };
  }, [items]);

  const handleIssue = async () => {
    if (items.some((item) => !item.description.trim())) {
      setError("Every line item needs a description.");
      return;
    }

    try {
      setIssuing(true);
      setError("");

      const updated = await purchaseOrdersApi.issue(id, {
        items: items.map((item) => ({
          ...item,
          quantity: Number(item.quantity) || 0,
          rate: Number(item.rate) || 0,
          taxPercent: Number(item.taxPercent) || 0,
        })),
        taxType,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        paymentTerms,
      });

      setPurchaseOrder(updated);
    } catch (err) {
      console.error("Failed to issue purchase order:", err);
      setError(err?.response?.data?.message || "Unable to issue purchase order.");
    } finally {
      setIssuing(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadDocumentPdf(printRef.current, `${purchaseOrder.poNumber}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      setError("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;

  if (error && !purchaseOrder) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        <FiAlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

  const isReviewing = purchaseOrder.status === "VENDOR_REQUESTED";
  const isIssued = ["ADMIN_ISSUED", "TRAINER_CONFIRMED", "TRAINER_REJECTED"].includes(
    purchaseOrder.status,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/purchase-orders")}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <FiArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {purchaseOrder.poNumber || "Purchase Order Request"}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Badge variant={STATUS_VARIANTS[purchaseOrder.status] || "default"}>
                {STATUS_LABELS[purchaseOrder.status] || purchaseOrder.status}
              </Badge>
              <span>
                {purchaseOrder.vendor?.companyName} → {purchaseOrder.trainer?.name}
              </span>
            </div>
          </div>
        </div>

        {isIssued && (
          <Button icon={FiDownload} onClick={handleDownload} loading={downloading}>
            Download PDF
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {purchaseOrder.trainerResponse?.action && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            purchaseOrder.trainerResponse.action === "CONFIRM"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          Trainer {purchaseOrder.trainerResponse.action === "CONFIRM" ? "confirmed" : "rejected"} this
          PO on {new Date(purchaseOrder.trainerResponse.respondedAt).toLocaleDateString("en-IN")}.
          {purchaseOrder.trainerResponse.note && ` Note: "${purchaseOrder.trainerResponse.note}"`}
        </div>
      )}

      {isReviewing && (
        <Card>
          <CardHeader
            title="Vendor's Proposed Terms"
            description="Review and adjust before issuing the official PO to the trainer."
          />
          <CardBody className="mt-4 space-y-4">
            {purchaseOrder.vendorProposedTerms?.notes && (
              <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                Vendor notes: {purchaseOrder.vendorProposedTerms.notes}
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-2 font-medium">Description</th>
                    <th className="px-2 py-2 font-medium">Qty</th>
                    <th className="px-2 py-2 font-medium">Unit</th>
                    <th className="px-2 py-2 font-medium">Rate</th>
                    <th className="px-2 py-2 font-medium">Tax %</th>
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
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
                  ))}
                </tbody>
              </table>
            </div>

            <Button type="button" variant="secondary" size="sm" icon={FiPlus} onClick={addItem}>
              Add Item
            </Button>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Tax Type</label>
                <select value={taxType} onChange={(e) => setTaxType(e.target.value)} className={inputClass}>
                  <option value="INTRA_STATE">Intra-State (CGST + SGST)</option>
                  <option value="INTER_STATE">Inter-State (IGST)</option>
                  <option value="NONE">No Tax</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Payment Terms</label>
                <input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
              <span className="text-sm">Estimated Grand Total</span>
              <span className="text-lg font-semibold">
                ₹ {totals.grandTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-end">
              <Button icon={FiSend} onClick={handleIssue} loading={issuing}>
                Issue PO to Trainer
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {isIssued && (
        <Card padding={false} className="overflow-x-auto">
          <div className="flex justify-center bg-slate-100 p-6">
            <div className="shadow-lg" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
              <PurchaseOrderTemplate ref={printRef} purchaseOrder={purchaseOrder} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PurchaseOrderDetailsPage;
