import { useState } from "react";
import {
  FiDollarSign,
  FiFileText,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiPercent,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";
import downloadDocumentPdf from "../../utils/downloadDocumentPdf";
import PaymentWorkflowTracker from "./PaymentWorkflowTracker";

const CommercialWorkspaceTab = ({
  requirement = {},
  candidates = [],
  purchaseOrders = [],
  invoices = [],
  userRole = "ADMIN",
  onCreatePO,
  onCreateInvoice,
  onRecordClientPayment,
  onReleaseTrainerPayout,
}) => {
  const isInternal = ["ADMIN", "SUPER_ADMIN", "OPERATIONS"].includes(userRole);
  const isVendor = userRole === "VENDOR";
  const isTrainer = userRole === "TRAINER";

  // Financial Calculations
  const clientBudget = Number(requirement.budget) || 0;
  
  // Find selected or highest shortlisted trainer quote
  const selectedCandidate = candidates.find(
    (c) =>
      c.selectionStatus === "ONBOARDED" ||
      c.selectionStatus === "SELECTED" ||
      c.selectionStatus === "SHORTLISTED"
  ) || candidates[0];

  const trainerCost = selectedCandidate
    ? Number(selectedCandidate.trainerQuotedRate ?? selectedCandidate.quotedRate ?? 0)
    : 0;

  const marginAmount = clientBudget ? clientBudget - trainerCost : 0;
  const marginPercent = clientBudget ? Math.round((marginAmount / clientBudget) * 100) : 0;

  // Determine current settlement status
  const latestInvoice = invoices[0];
  const settlementStatus = latestInvoice?.status || (purchaseOrders.length > 0 ? "AWAITING" : "DRAFT");

  return (
    <div className="space-y-6">
      {/* Shortlisted Candidate Retroactive Commercial Banner */}
      {selectedCandidate && purchaseOrders.length === 0 && (
        <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50/50 to-white p-6 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20">
              <FiCheckCircle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">
                Active Trainer Commercial Ready: {selectedCandidate.trainerId?.name || "Shortlisted Trainer"}
              </h4>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                This trainer was shortlisted/selected for this assignment (@ ₹{trainerCost.toLocaleString("en-IN")}). You can now generate official PO and Invoice records with 1 click.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200/60">
            {isInternal && onCreatePO && (
              <button
                type="button"
                onClick={onCreatePO}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-slate-800 transition"
              >
                <FiPlus size={14} /> Auto-Generate PO for {selectedCandidate.trainerId?.name || "Trainer"}
              </button>
            )}

            {isInternal && onCreateInvoice && (
              <button
                type="button"
                onClick={onCreateInvoice}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition"
              >
                <FiPlus size={14} /> Generate Client Invoice
              </button>
            )}
          </div>
        </div>
      )}
      {/* 1. Executive Summary Panel (Role-Based Isolation) */}
      {isInternal && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Client Billing Budget</span>
            <p className="mt-1 text-2xl font-black text-slate-900">
              ₹{clientBudget.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] font-semibold text-slate-500">Gross revenue for this requirement</span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Trainer Cost</span>
            <p className="mt-1 text-2xl font-black text-slate-700">
              ₹{trainerCost.toLocaleString("en-IN")}
            </p>
            <span className="text-[11px] font-semibold text-slate-500">
              {selectedCandidate?.trainerId?.name ? `Quoted by ${selectedCandidate.trainerId.name}` : "Estimated candidate cost"}
            </span>
          </div>

          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-5 shadow-lg shadow-indigo-100/40">
            <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
              <FiTrendingUp /> Net Profit Margin
            </span>
            <p className={`mt-1 text-2xl font-black ${marginAmount >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
              {marginAmount >= 0 ? `+₹${marginAmount.toLocaleString("en-IN")}` : `-₹${Math.abs(marginAmount).toLocaleString("en-IN")}`}
            </p>
            <span className="text-[11px] font-bold text-indigo-700">{marginPercent}% Margin</span>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/40">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">PO & Billing Status</span>
            <p className="mt-1 text-xl font-black text-indigo-950">
              {purchaseOrders.length > 0 ? "PO Issued" : "Pending PO"}
            </p>
            <span className="text-[11px] font-bold text-emerald-700">
              {invoices.length} Invoices Generated
            </span>
          </div>
        </div>
      )}

      {isVendor && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Requirement Budget</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{clientBudget.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Authorized budget for {requirement.title}
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-800 border border-emerald-200">
            ✓ Vendor Authorized
          </span>
        </div>
      )}

      {isTrainer && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Your Quoted Commercial Rate</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{trainerCost.toLocaleString("en-IN")}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Agreed trainer fee for {requirement.title}
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-800 border border-indigo-200">
            Confirmed Commercial Terms
          </span>
        </div>
      )}

      {/* 2. Visual Settlement Workflow Tracker */}
      <PaymentWorkflowTracker
        status={settlementStatus}
        clientAmount={clientBudget}
        trainerAmount={trainerCost}
        marginAmount={marginAmount}
        marginPercent={marginPercent}
        userRole={userRole}
        onRecordClientPayment={onRecordClientPayment}
        onReleaseTrainerPayout={onReleaseTrainerPayout}
      />

      {/* 3. Purchase Orders Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Purchase Orders</h3>
            <p className="text-xs font-medium text-slate-500">Official commercial work orders issued for this requirement.</p>
          </div>

          {isInternal && onCreatePO && (
            <button
              type="button"
              onClick={onCreatePO}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              <FiPlus size={14} /> Auto-Generate PO
            </button>
          )}
        </div>

        {purchaseOrders.length === 0 ? (
          <p className="py-6 text-center text-xs font-semibold text-slate-400">
            No Purchase Orders generated yet.
          </p>
        ) : (
          <div className="space-y-3">
            {purchaseOrders.map((po) => (
              <div key={po._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                <div>
                  <span className="font-extrabold text-slate-900 text-sm">{po.poNumber || "PO-DRAFT"}</span>
                  <div className="flex gap-3 text-xs font-semibold text-slate-500 mt-1">
                    <span>Vendor: {po.vendorId?.name || "Corporate Vendor"}</span>
                    <span>Trainer: {po.trainerId?.name || "Assigned Trainer"}</span>
                    <span>Amount: ₹{Number(po.totalAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadDocumentPdf("PO", po)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition self-start sm:self-auto"
                >
                  <FiDownload size={13} /> Download PO PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Invoices Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Invoices & Billing</h3>
            <p className="text-xs font-medium text-slate-500">Client billing and trainer payout invoices.</p>
          </div>

          {isInternal && onCreateInvoice && (
            <button
              type="button"
              onClick={onCreateInvoice}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              <FiPlus size={14} /> Generate Invoice
            </button>
          )}
        </div>

        {invoices.length === 0 ? (
          <p className="py-6 text-center text-xs font-semibold text-slate-400">
            No Invoices generated yet.
          </p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => {
              if (isVendor && inv.direction === "TRAINER_TO_ADMIN") return null;
              if (isTrainer && inv.direction === "ADMIN_TO_VENDOR") return null;

              return (
                <div key={inv._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{inv.invoiceNumber || "INV-DRAFT"}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {inv.direction === "ADMIN_TO_VENDOR" ? "Client Billing" : "Trainer Payout"}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs font-semibold text-slate-500 mt-1">
                      <span>Total: ₹{Number(inv.totalAmount || 0).toLocaleString("en-IN")}</span>
                      <span>Status: {inv.status || "DRAFT"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadDocumentPdf("INVOICE", inv)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition self-start sm:self-auto"
                  >
                    <FiDownload size={13} /> Download Invoice PDF
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommercialWorkspaceTab;
