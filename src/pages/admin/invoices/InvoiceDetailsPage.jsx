import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiDownload, FiArrowLeft, FiAlertCircle, FiZap } from "react-icons/fi";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import InvoiceTemplate from "../../../components/documents/InvoiceTemplate";

import invoicesApi from "../../../api/invoicesApi";
import downloadDocumentPdf from "../../../utils/downloadDocumentPdf";

const STATUS_VARIANTS = {
  DRAFT: "default",
  SENT: "primary",
  PAID: "success",
  PARTIALLY_PAID: "warning",
  OVERDUE: "danger",
  CANCELLED: "danger",
};

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let active = true;

    invoicesApi
      .getById(id)
      .then((data) => active && setInvoice(data))
      .catch((err) => {
        console.error("Failed to load invoice:", err);
        if (active) setError(err?.response?.data?.message || "Unable to load invoice.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadDocumentPdf(printRef.current, `${invoice.invoiceNumber}.pdf`);
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
      const updated = await invoicesApi.updateStatus(id, { status });
      setInvoice(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (error && !invoice) {
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
            onClick={() => navigate("/admin/invoices")}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <FiArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {invoice.invoiceNumber}
            </h1>
            <div className="mt-1">
              <Badge variant={STATUS_VARIANTS[invoice.status] || "default"}>
                {invoice.status?.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {invoice.direction === "TRAINER_TO_ADMIN" && (
            <Button
              variant="secondary"
              icon={FiZap}
              onClick={() =>
                navigate(
                  `/admin/invoices/create-vendor-invoice?fromTrainerInvoice=${invoice._id}&assignmentId=${invoice.assignment?._id || invoice.assignment}`,
                )
              }
            >
              Generate Vendor Invoice
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate(`/admin/invoices/${id}/edit`)}
          >
            Edit Invoice
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              if (window.confirm("Are you sure you want to delete this invoice?")) {
                try {
                  await invoicesApi.delete(id);
                  navigate("/admin/invoices");
                } catch (err) {
                  alert(err?.response?.data?.message || "Failed to delete invoice.");
                }
              }
            }}
          >
            Delete Invoice
          </Button>
          <select
            value={invoice.status}
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
            <InvoiceTemplate ref={printRef} invoice={invoice} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetailsPage;
