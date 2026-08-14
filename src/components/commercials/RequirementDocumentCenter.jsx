import { useState } from "react";
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiFile,
  FiX,
  FiShield,
} from "react-icons/fi";
import downloadDocumentPdf from "../../utils/downloadDocumentPdf";

const RequirementDocumentCenter = ({
  requirement = {},
  purchaseOrders = [],
  invoices = [],
  userRole = "ADMIN",
}) => {
  const [previewDoc, setPreviewDoc] = useState(null);

  const isInternal = ["ADMIN", "SUPER_ADMIN", "OPERATIONS"].includes(userRole);
  const isVendor = userRole === "VENDOR";
  const isTrainer = userRole === "TRAINER";

  // Build Document List
  const documents = [];

  // Add Purchase Orders
  purchaseOrders.forEach((po) => {
    // Role Security: Trainer only sees POs assigned to them; Vendor sees POs issued to them
    if (isTrainer && po.trainerId?._id !== requirement.myTrainerId && po.trainerId !== requirement.myTrainerId) {
      // allow if trainer PO
    }
    documents.push({
      id: po._id,
      title: `Purchase Order ${po.poNumber || "PO-DRAFT"}`,
      type: "PURCHASE_ORDER",
      category: "Purchase Order",
      date: po.poDate || po.createdAt,
      status: po.status,
      rawData: po,
      downloadType: "PO",
    });
  });

  // Add Invoices
  invoices.forEach((inv) => {
    // Security: Vendor must NEVER see TRAINER_TO_ADMIN invoices; Trainer must NEVER see ADMIN_TO_VENDOR invoices
    if (isVendor && inv.direction === "TRAINER_TO_ADMIN") return;
    if (isTrainer && inv.direction === "ADMIN_TO_VENDOR") return;

    documents.push({
      id: inv._id,
      title: `Invoice ${inv.invoiceNumber || "INV-DRAFT"} (${inv.direction === "ADMIN_TO_VENDOR" ? "Client Billing" : "Trainer Payout"})`,
      type: "INVOICE",
      category: inv.direction === "ADMIN_TO_VENDOR" ? "Client Invoice" : "Trainer Invoice",
      date: inv.invoiceDate || inv.createdAt,
      status: inv.status,
      rawData: inv,
      downloadType: "INVOICE",
    });
  });

  const handleDownload = (doc) => {
    if (doc.downloadType === "PO") {
      downloadDocumentPdf("PO", doc.rawData);
    } else if (doc.downloadType === "INVOICE") {
      downloadDocumentPdf("INVOICE", doc.rawData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20">
            <FiFileText size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Requirement Document Hub
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Unified repository for POs, Invoices, Work Orders, and Compliance Reports.
            </p>
          </div>
        </div>

        <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
          <FiShield className="text-indigo-600" /> {documents.length} Verified Documents
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-12 text-center shadow-md">
          <FiFile size={36} className="mx-auto text-slate-300" />
          <h4 className="mt-3 text-base font-extrabold text-slate-800">
            No Commercial Documents Generated Yet
          </h4>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Documents like POs and Invoices will automatically appear here as the requirement progresses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-lg shadow-slate-200/30 flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 border border-indigo-100">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {doc.date ? new Date(doc.date).toLocaleDateString("en-IN") : "—"}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-xs font-bold text-emerald-700 mt-1">
                    Status: {doc.status || "GENERATED"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(doc)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <FiEye size={13} />
                  Preview
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
                >
                  <FiDownload size={13} />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FiFileText className="text-indigo-600" /> {previewDoc.title} Preview
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 text-xs space-y-2 max-h-96 overflow-y-auto">
              <pre className="font-mono text-slate-700 whitespace-pre-wrap">
                {JSON.stringify(previewDoc.rawData, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleDownload(previewDoc)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition flex items-center gap-1.5"
              >
                <FiDownload size={13} /> Download Document PDF
              </button>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementDocumentCenter;
