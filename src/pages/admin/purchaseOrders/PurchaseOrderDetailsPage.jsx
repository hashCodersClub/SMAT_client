import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiDownload, FiArrowLeft, FiAlertCircle } from "react-icons/fi";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import PurchaseOrderTemplate from "../../../components/documents/PurchaseOrderTemplate";

import purchaseOrdersApi from "../../../api/purchaseOrdersApi";
import downloadDocumentPdf from "../../../utils/downloadDocumentPdf";

const STATUS_VARIANTS = {
  DRAFT: "default",
  ISSUED: "primary",
  ACKNOWLEDGED: "purple",
  PARTIALLY_FULFILLED: "warning",
  COMPLETED: "success",
  CANCELLED: "danger",
};

const PurchaseOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let active = true;

    purchaseOrdersApi
      .getById(id)
      .then((data) => active && setPurchaseOrder(data))
      .catch((err) => {
        console.error("Failed to load purchase order:", err);
        if (active) setError(err?.response?.data?.message || "Unable to load purchase order.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

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

  const handleStatusChange = async (status) => {
    try {
      setUpdatingStatus(true);
      const updated = await purchaseOrdersApi.updateStatus(id, { status });
      setPurchaseOrder(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (error && !purchaseOrder) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
        <FiAlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

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
              {purchaseOrder.poNumber}
            </h1>
            <div className="mt-1">
              <Badge variant={STATUS_VARIANTS[purchaseOrder.status] || "default"}>
                {purchaseOrder.status?.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={purchaseOrder.status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            {Object.keys(STATUS_VARIANTS).map((s) => (
              <option key={s} value={s}>
                Mark as {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <Button icon={FiDownload} onClick={handleDownload} loading={downloading}>
            Download PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <Card padding={false} className="overflow-x-auto">
        <div className="flex justify-center bg-slate-100 p-6">
          <div className="shadow-lg" style={{ transform: "scale(0.9)", transformOrigin: "top center" }}>
            <PurchaseOrderTemplate ref={printRef} purchaseOrder={purchaseOrder} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseOrderDetailsPage;
