import { useCallback, useEffect, useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCompass,
  FiDollarSign,
  FiFilter,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiUsers,
  FiX,
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";
import trainersApi from "../../../api/trainersApi";

const MODE_LABELS = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

const STATUS_LABELS = {
  OPEN: "Open",
  SOURCING: "Sourcing",
  PROFILES_SENT: "Profiles Sent",
  SHORTLISTED: "Shortlisted",
  TRAINER_SELECTED: "Trainer Selected",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  SUBMITTED: "Submitted",
};

const STILL_HIRING = ["OPEN", "SOURCING", "PROFILES_SENT", "SHORTLISTED"];

const FILTERS = [
  { key: "ACTIVE", label: "Still Hiring" },
  { key: "ALL", label: "All Requirements" },
];

const MODE_FILTERS = [
  { key: "", label: "All Modes" },
  { key: "ONLINE", label: "Online" },
  { key: "OFFLINE", label: "Offline" },
  { key: "HYBRID", label: "Hybrid" },
];

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};



const formatDuration = (value, unit) => {
  if (!value) return null;
  const unitLabel =
    { HOURS: "hr", DAYS: "day", WEEKS: "wk", MONTHS: "mo" }[unit] || "";
  return `${value} ${unitLabel}${value > 1 && unitLabel !== "hr" ? "s" : ""}`;
};

const TrainerAllRequirementsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("ACTIVE");
  const [modeFilter, setModeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  const [interestLoadingId, setInterestLoadingId] = useState("");
  const [sentInterestIds, setSentInterestIds] = useState(new Set());
  const [actionError, setActionError] = useState("");

  const [trainerProfile, setTrainerProfile] = useState(null);
  const [modalRequirement, setModalRequirement] = useState(null);
  const [quotedRateType, setQuotedRateType] = useState("PER_DAY");
  const [quotedRate, setQuotedRate] = useState("");
  const [responseNote, setResponseNote] = useState("");
  const [submittingInterest, setSubmittingInterest] = useState(false);

  useEffect(() => {
    trainersApi
      .getMyProfile()
      .then((res) => {
        if (res?.trainer) setTrainerProfile(res.trainer);
      })
      .catch((err) => console.error("Failed to load trainer profile:", err));
  }, []);

  const openInterestModal = (req) => {
    setModalRequirement(req);
    const rc = trainerProfile?.rateCard || trainerProfile || {};
    const defaultType = req.mode === "ONLINE" ? "PER_HOUR" : "PER_DAY";
    setQuotedRateType(defaultType);

    let rateVal = "";
    if (defaultType === "PER_HOUR") rateVal = rc.hourlyRate ?? "";
    else if (defaultType === "PER_DAY") rateVal = rc.dailyRate ?? "";
    else if (defaultType === "PER_BATCH") rateVal = rc.batchRate ?? "";
    else if (defaultType === "FIXED") rateVal = rc.fixedProjectRate ?? "";

    setQuotedRate(rateVal !== "" ? String(rateVal) : "");
    setResponseNote("");
  };

  const handleRateTypeChange = (type) => {
    setQuotedRateType(type);
    const rc = trainerProfile?.rateCard || trainerProfile || {};
    if (type === "PER_HOUR") setQuotedRate(rc.hourlyRate != null ? String(rc.hourlyRate) : "");
    else if (type === "PER_DAY") setQuotedRate(rc.dailyRate != null ? String(rc.dailyRate) : "");
    else if (type === "PER_BATCH") setQuotedRate(rc.batchRate != null ? String(rc.batchRate) : "");
    else if (type === "FIXED") setQuotedRate(rc.fixedProjectRate != null ? String(rc.fixedProjectRate) : "");
  };

  const handleConfirmInterest = async () => {
    if (!modalRequirement) return;
    try {
      setActionError("");
      setSubmittingInterest(true);
      await requirementsApi.expressInterest(modalRequirement._id, {
        quotedRate: quotedRate !== "" ? Number(quotedRate) : undefined,
        quotedRateType: quotedRateType,
        trainerResponseNote: responseNote,
      });
      setSentInterestIds((prev) => new Set(prev).add(modalRequirement._id));
      setModalRequirement(null);
    } catch (err) {
      console.error("Failed to submit rate card interest:", err);
      setActionError(
        err.response?.data?.message ||
          "Unable to send your rate quote right now. Please try again.",
      );
    } finally {
      setSubmittingInterest(false);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await requirementsApi.browse({
        status: activeFilter,
        mode: modeFilter || undefined,
        search: searchTerm || undefined,
        page,
        limit: 12,
      });

      setRecords(response.requirements || []);
      if (response.pagination) setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to load requirements:", err);
      setError(err.response?.data?.message || "Unable to load requirements.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, modeFilter, searchTerm, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExpressInterest = async (requirementId) => {
    try {
      setActionError("");
      setInterestLoadingId(requirementId);
      await requirementsApi.expressInterest(requirementId);
      setSentInterestIds((prev) => new Set(prev).add(requirementId));
    } catch (err) {
      console.error("Failed to send interest:", err);
      setActionError(
        err.response?.data?.message ||
          "Unable to send your interest right now. Please try again.",
      );
    } finally {
      setInterestLoadingId("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <FiCompass size={18} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            All Requirements
          </h1>
        </div>
        <p className="text-sm font-medium text-slate-500">
          Every open requirement across every client, in one place — not just
          the ones matched to you. Let us know if one's a good fit.
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <FiSearch
              size={16}
              className="absolute left-3.5 top-3.5 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by skill, title, location, training type..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div className="flex items-center gap-2">
            <FiFilter size={15} className="text-slate-400" />
            <select
              value={modeFilter}
              onChange={(e) => {
                setModeFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              {MODE_FILTERS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setActiveFilter(item.key);
                setPage(1);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeFilter === item.key
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadData}
            className="flex items-center gap-1 text-xs font-extrabold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            className="text-red-500 hover:text-red-900"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl">
          <FiRefreshCw size={28} className="animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading requirements...
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center shadow-xl">
          <FiCompass size={36} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-extrabold text-slate-800">
            No requirements found
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {searchTerm || modeFilter
              ? "Nothing matched your filters — try widening your search."
              : "Nothing open right now. Check back soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {records.map((requirement) => {
            const isStillHiring = STILL_HIRING.includes(requirement.status);
            const alreadyTracked = Boolean(requirement.myStatus);
            const justSent = sentInterestIds.has(requirement._id);
            const durationLabel = formatDuration(
              requirement.durationValue,
              requirement.durationUnit,
            );

            return (
              <div
                key={requirement._id}
                className={`flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-xl shadow-slate-200/30 transition-all hover:shadow-2xl ${
                  isStillHiring
                    ? "border-slate-200/90"
                    : "border-slate-200 bg-slate-50/50 opacity-80"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="text-lg font-extrabold leading-snug text-slate-900">
                      {requirement.title || "Training Requirement"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200">
                        Client: {requirement.clientLabel || "Corporate Client"}
                      </span>
                      <span
                        className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                          isStillHiring
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {STATUS_LABELS[requirement.status] ||
                          requirement.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <FiMapPin size={14} className="text-slate-400" />
                    {requirement.mode === "ONLINE"
                      ? "Online"
                      : [requirement.city, requirement.state]
                          .filter(Boolean)
                          .join(", ") || "—"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiBriefcase size={14} className="text-slate-400" />
                    {MODE_LABELS[requirement.mode] || requirement.mode}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiCalendar size={14} className="text-slate-400" />
                    {formatDate(requirement.startDate)} –{" "}
                    {formatDate(requirement.endDate)}
                  </span>
                  {durationLabel && (
                    <span className="flex items-center gap-1.5">
                      <FiClock size={14} className="text-slate-400" />
                      {durationLabel}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <FiUsers size={14} className="text-slate-400" />
                    {requirement.trainersNeeded || 1} trainer
                    {(requirement.trainersNeeded || 1) > 1 ? "s" : ""} needed
                  </span>
                </div>

                {requirement.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {requirement.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {requirement.description && (
                  <p className="line-clamp-2 text-sm font-medium text-slate-500">
                    {requirement.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  {alreadyTracked ? (
                    <span className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
                      <FiCheck size={14} /> Already in your Opportunities
                    </span>
                  ) : justSent ? (
                    <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                      <FiCheck size={14} /> Interest sent to the team
                    </span>
                  ) : isStillHiring ? (
                    <button
                      type="button"
                      onClick={() => openInterestModal(requirement)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md shadow-slate-900/20 transition hover:bg-slate-800"
                    >
                      <FiDollarSign size={14} />
                      Show Interest & Submit Rate
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      No longer accepting trainers
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 shadow-sm">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-slate-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Rate Card & Interest Submission Modal */}
      {modalRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Express Interest & Commercial Quote</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {modalRequirement.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalRequirement(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-700"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Select Rate Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "PER_HOUR", label: "Per Hour Rate" },
                    { key: "PER_DAY", label: "Per Day Rate" },
                    { key: "PER_BATCH", label: "Per Batch Rate" },
                    { key: "FIXED", label: "Fixed Project Cost" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleRateTypeChange(item.key)}
                      className={`rounded-xl border p-2.5 text-xs font-bold transition text-left ${
                        quotedRateType === item.key
                          ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Your Quoted Rate (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={quotedRate}
                    onChange={(e) => setQuotedRate(e.target.value)}
                    placeholder="Enter rate amount"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Auto-prefilled from your profile rate card. You may customize it for this specific requirement.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Note to Operations Team / Client (Optional)
                </label>
                <textarea
                  rows={2}
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  placeholder="e.g. Available for full schedule. Rate includes hands-on labs..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={submittingInterest}
                onClick={handleConfirmInterest}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-md shadow-slate-900/20 hover:bg-slate-800 transition disabled:opacity-50"
              >
                {submittingInterest ? (
                  <FiRefreshCw size={14} className="animate-spin" />
                ) : (
                  <FiSend size={14} />
                )}
                {submittingInterest ? "Submitting…" : "Submit Rate & Express Interest"}
              </button>
              <button
                type="button"
                onClick={() => setModalRequirement(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerAllRequirementsPage;
