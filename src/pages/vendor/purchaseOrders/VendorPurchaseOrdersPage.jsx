import { useEffect, useState } from "react";
import { FiShoppingCart, FiAlertCircle, FiX } from "react-icons/fi";

import Card, { CardHeader, CardBody } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";

import purchaseOrdersApi from "../../../api/purchaseOrdersApi";

const STATUS_VARIANTS = {
  VENDOR_REQUESTED: "warning",
  ADMIN_ISSUED: "primary",
  TRAINER_CONFIRMED: "success",
  TRAINER_REJECTED: "danger",
  CANCELLED: "default",
};

const STATUS_LABELS = {
  VENDOR_REQUESTED: "Pending Admin Review",
  ADMIN_ISSUED: "Sent to Trainer — Awaiting Confirmation",
  TRAINER_CONFIRMED: "Confirmed — Assignment Active",
  TRAINER_REJECTED: "Declined by Trainer",
  CANCELLED: "Cancelled",
};

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";
  return `${symbol} ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

const VendorPurchaseOrdersPage = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

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

  const handleCancel = async (id) => {
    try {
      setCancellingId(id);
      await purchaseOrdersApi.cancel(id);
      load();
    } catch (err) {
      console.error("Failed to cancel PO request:", err);
      setError(err?.response?.data?.message || "Unable to cancel this request.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Track the purchase orders you've requested for your assignments."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && purchaseOrders.length === 0 ? (
        <Card>
          <EmptyState
            icon={FiShoppingCart}
            title="No purchase orders yet"
            description="Request one when booking a trainer for an assignment."
          />
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
                    title={po.poNumber || "Awaiting PO Number"}
                    description={po.requirement?.title || ""}
                    action={
                      <Badge variant={STATUS_VARIANTS[po.status] || "default"}>
                        {STATUS_LABELS[po.status] || po.status}
                      </Badge>
                    }
                  />
                  <CardBody className="mt-4 space-y-3">
                    <p className="text-sm text-slate-600">Trainer: {po.trainer?.name || "—"}</p>

                    {po.status === "VENDOR_REQUESTED" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FiX}
                        loading={cancellingId === po._id}
                        onClick={() => handleCancel(po._id)}
                      >
                        Withdraw Request
                      </Button>
                    )}

                    {po.status === "ADMIN_ISSUED" && (
                      <p className="text-sm text-slate-500">
                        Waiting for the trainer to confirm.
                      </p>
                    )}

                    {po.grandTotal > 0 && (
                      <p className="text-sm font-medium text-slate-900">
                        Total: {money(po.grandTotal, po.currency)}
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

export default VendorPurchaseOrdersPage;
