import { useEffect, useState } from "react";
import { FiShoppingCart, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

import Card, { CardHeader, CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";

import purchaseOrdersApi from "../../../api/purchaseOrdersApi";

const STATUS_VARIANTS = {
  ADMIN_ISSUED: "primary",
  TRAINER_CONFIRMED: "success",
  TRAINER_REJECTED: "danger",
};

const STATUS_LABELS = {
  ADMIN_ISSUED: "Awaiting Your Response",
  TRAINER_CONFIRMED: "Confirmed",
  TRAINER_REJECTED: "Rejected",
};

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  return `${symbol} ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

const TrainerPurchaseOrdersPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondingId, setRespondingId] = useState(null);
  const [rejectNoteFor, setRejectNoteFor] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const load = () => {
    setLoading(true);
    purchaseOrdersApi
      .getAll({ limit: 50 })
      .then((res) => setPurchaseOrders(res.purchaseOrders || []))
      .catch((err) => {
        console.error("Failed to load purchase orders:", err);
        setError(err?.response?.data?.message || "Unable to load purchase orders.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = async (id) => {
    try {
      setRespondingId(id);
      setError("");
      await purchaseOrdersApi.respond(id, { action: "CONFIRM" });
      load();
    } catch (err) {
      console.error("Failed to confirm PO:", err);
      setError(err?.response?.data?.message || "Unable to confirm this purchase order.");
    } finally {
      setRespondingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setRespondingId(id);
      setError("");
      await purchaseOrdersApi.respond(id, { action: "REJECT", note: rejectNote });
      setRejectNoteFor(null);
      setRejectNote("");
      load();
    } catch (err) {
      console.error("Failed to reject PO:", err);
      setError(err?.response?.data?.message || "Unable to reject this purchase order.");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Review purchase orders issued to you. Confirming one starts the assignment."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && purchaseOrders.length === 0 ? (
        <Card>
          <EmptyState icon={FiShoppingCart} title="No purchase orders yet" description="Issued POs will show up here." />
        </Card>
      ) : (
        <div className="space-y-4">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              ))
            : purchaseOrders.map((po) => (
                <Card key={po._id}>
                  <CardHeader
                    title={po.poNumber}
                    description={po.requirement?.title || ""}
                    action={
                      <Badge variant={STATUS_VARIANTS[po.status] || "default"}>
                        {STATUS_LABELS[po.status] || po.status}
                      </Badge>
                    }
                  />
                  <CardBody className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div>Vendor: {po.vendor?.companyName || "—"}</div>
                      <div>PO Date: {new Date(po.poDate).toLocaleDateString("en-IN")}</div>
                    </div>

                    <div className="rounded-xl border border-slate-100">
                      {po.items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b border-slate-50 px-3 py-2 text-sm last:border-0"
                        >
                          <span className="text-slate-700">
                            {item.description} ({item.quantity} {item.unit})
                          </span>
                          <span className="font-medium text-slate-900">{money(item.amount, po.currency)}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 text-sm font-semibold">
                        <span>Total</span>
                        <span>{money(po.grandTotal, po.currency)}</span>
                      </div>
                    </div>

                    {po.status === "ADMIN_ISSUED" && (
                      <div className="space-y-2">
                        {rejectNoteFor === po._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                              placeholder="Optional reason for declining..."
                              rows={2}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                loading={respondingId === po._id}
                                onClick={() => handleReject(po._id)}
                              >
                                Confirm Rejection
                              </Button>
                              <Button variant="secondary" size="sm" onClick={() => setRejectNoteFor(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              icon={FiCheckCircle}
                              loading={respondingId === po._id}
                              onClick={() => handleConfirm(po._id)}
                            >
                              Confirm PO
                            </Button>
                            <Button
                              variant="secondary"
                              icon={FiXCircle}
                              onClick={() => setRejectNoteFor(po._id)}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {po.trainerResponse?.action && (
                      <p className="text-xs text-slate-500">
                        You {po.trainerResponse.action === "CONFIRM" ? "confirmed" : "declined"} this on{" "}
                        {new Date(po.trainerResponse.respondedAt).toLocaleDateString("en-IN")}.
                      </p>
                    )}
                  </CardBody>
                </Card>
              ))}
        </div>
      )}
    </div>
  );
};

export default TrainerPurchaseOrdersPage;
