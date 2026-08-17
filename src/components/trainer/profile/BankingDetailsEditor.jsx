import { useState, useEffect } from "react";
import {
  FiCreditCard,
  FiAlertCircle,
  FiLock,
  FiShield,
  FiFileText,
  FiCopy,
  FiCheck,
} from "react-icons/fi";

const INITIAL_BANK_DETAILS = {
  accountHolderName: "",
  bankName: "",
  branchName: "",
  accountNumber: "",
  accountType: "SAVINGS",
  ifscCode: "",
  panNumber: "",
  upiId: "",
  cancelledChequeUrl: "",
  isVerified: false,
};

const BankingDetailsEditor = ({
  bankDetails = {},
  editing = false,
  onChange,
}) => {
  const [data, setData] = useState({
    ...INITIAL_BANK_DETAILS,
    ...(bankDetails || {}),
  });

  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    setData({ ...INITIAL_BANK_DETAILS, ...(bankDetails || {}) });
  }, [bankDetails]);

  const handleChange = (field, value) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const isIfscValid =
    !data.ifscCode || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode);
  const isPanValid =
    !data.panNumber || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber);

  return (
    <div className="space-y-6">
      {/* Header Badge / Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <FiCreditCard size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Bank Account & Tax Details
            </h4>
            <p className="text-xs text-slate-500">
              Used strictly for processing trainer honorarium & payouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data.isVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <FiShield className="h-4 w-4 text-emerald-600" />
              Verified Account
            </span>
          ) : data.accountNumber && data.ifscCode ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <FiAlertCircle className="h-4 w-4 text-amber-600" />
              Pending Admin Verification
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Details Incomplete
            </span>
          )}
        </div>
      </div>

      {editing ? (
        /* EDIT FORM MODE */
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Account Holder Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.accountHolderName}
              onChange={(e) => handleChange("accountHolderName", e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              placeholder="e.g. HDFC Bank / ICICI Bank"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
              placeholder="e.g. 50100123456789"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Account Type
            </label>
            <select
              value={data.accountType}
              onChange={(e) => handleChange("accountType", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="SAVINGS">Savings Account</option>
              <option value="CURRENT">Current Account</option>
            </select>
          </div>

          {/* IFSC Code */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              IFSC Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.ifscCode}
              onChange={(e) =>
                handleChange("ifscCode", e.target.value.toUpperCase())
              }
              placeholder="e.g. HDFC0001234"
              maxLength={11}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm uppercase text-slate-900 outline-none transition focus:ring-4 ${
                !isIfscValid
                  ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/10"
              }`}
            />
            {!isIfscValid && (
              <p className="mt-1 text-xs text-red-600">
                Invalid IFSC format. Must be 11 characters (e.g. HDFC0001234).
              </p>
            )}
          </div>

          {/* Branch Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Branch Name / City
            </label>
            <input
              type="text"
              value={data.branchName}
              onChange={(e) => handleChange("branchName", e.target.value)}
              placeholder="e.g. MG Road, Bengaluru"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* PAN Number */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              PAN Number (Tax ID)
            </label>
            <input
              type="text"
              value={data.panNumber}
              onChange={(e) =>
                handleChange("panNumber", e.target.value.toUpperCase())
              }
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm uppercase text-slate-900 outline-none transition focus:ring-4 ${
                !isPanValid
                  ? "border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200 bg-white focus:border-blue-500 focus:ring-blue-500/10"
              }`}
            />
            {!isPanValid && (
              <p className="mt-1 text-xs text-red-600">
                Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F).
              </p>
            )}
          </div>

          {/* UPI ID */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              UPI ID (Optional)
            </label>
            <input
              type="text"
              value={data.upiId}
              onChange={(e) => handleChange("upiId", e.target.value)}
              placeholder="e.g. username@upi"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {/* Cancelled Cheque / Bank Statement Link */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Cancelled Cheque / Passbook Document Link (Optional)
            </label>
            <input
              type="url"
              value={data.cancelledChequeUrl}
              onChange={(e) => handleChange("cancelledChequeUrl", e.target.value)}
              placeholder="https://drive.google.com/file/... or Document URL"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
      ) : (
        /* READ-ONLY DISPLAY MODE */
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Account Holder Name */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Account Holder Name
            </span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {data.accountHolderName || (
                <span className="font-normal italic text-slate-400">Not provided</span>
              )}
            </p>
          </div>

          {/* Bank & Branch */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Bank & Branch
            </span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {data.bankName ? (
                <>
                  {data.bankName}
                  {data.branchName && (
                    <span className="text-xs font-normal text-slate-500">
                      {" "}
                      ({data.branchName})
                    </span>
                  )}
                </>
              ) : (
                <span className="font-normal italic text-slate-400">Not provided</span>
              )}
            </p>
          </div>

          {/* Account Number */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Account Number ({data.accountType || "SAVINGS"})
              </span>
              {data.accountNumber && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(data.accountNumber, "acc")}
                  className="text-slate-400 hover:text-slate-600"
                  title="Copy Account Number"
                >
                  {copiedField === "acc" ? (
                    <FiCheck className="text-emerald-600" size={14} />
                  ) : (
                    <FiCopy size={14} />
                  )}
                </button>
              )}
            </div>
            <p className="mt-1 font-mono text-sm font-semibold tracking-wider text-slate-900">
              {data.accountNumber ? (
                data.accountNumber
              ) : (
                <span className="font-sans font-normal italic text-slate-400">
                  Not provided
                </span>
              )}
            </p>
          </div>

          {/* IFSC Code */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                IFSC Code
              </span>
              {data.ifscCode && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(data.ifscCode, "ifsc")}
                  className="text-slate-400 hover:text-slate-600"
                  title="Copy IFSC Code"
                >
                  {copiedField === "ifsc" ? (
                    <FiCheck className="text-emerald-600" size={14} />
                  ) : (
                    <FiCopy size={14} />
                  )}
                </button>
              )}
            </div>
            <p className="mt-1 font-mono text-sm font-semibold uppercase text-slate-900">
              {data.ifscCode || (
                <span className="font-sans font-normal italic text-slate-400">
                  Not provided
                </span>
              )}
            </p>
          </div>

          {/* PAN Number */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              PAN Number (Tax ID)
            </span>
            <p className="mt-1 font-mono text-sm font-semibold uppercase text-slate-900">
              {data.panNumber || (
                <span className="font-sans font-normal italic text-slate-400">
                  Not provided
                </span>
              )}
            </p>
          </div>

          {/* UPI ID */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              UPI ID
            </span>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {data.upiId || (
                <span className="font-normal italic text-slate-400">Not provided</span>
              )}
            </p>
          </div>

          {/* Document Link */}
          {data.cancelledChequeUrl && (
            <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Verification Document
              </span>
              <div className="mt-1 flex items-center gap-2">
                <FiFileText className="text-indigo-600" size={16} />
                <a
                  href={data.cancelledChequeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  View Attached Cancelled Cheque / Passbook
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FiLock className="text-slate-400" size={13} />
        <span>Your financial data is encrypted and securely stored for payout disbursal.</span>
      </div>
    </div>
  );
};

export default BankingDetailsEditor;
