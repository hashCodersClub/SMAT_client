import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiFilter,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiX,
  FiZap,
} from "react-icons/fi";
import opportunitiesApi from "../../../api/opportunitiesApi";
import demoSessionsApi from "../../../api/demoSessionsApi";
import MatchInsight from "../../../components/opportunities/MatchInsight";
import OpportunityDetailModal from "../../../components/opportunities/OpportunityDetailModal";

const MODE_LABELS = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HYBRID: "Hybrid",
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const FILTERS = [
  { key: "ALL", label: "All Opportunities" },
  { key: "PENDING", label: "Pending" },
  { key: "INTERESTED", label: "Interested" },
  { key: "MAYBE", label: "Maybe" },
  { key: "DECLINED", label: "Declined" },
  { key: "EXPIRED", label: "Expired" },
];

const TrainerOpportunitiesPage = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    pendingOpportunities: 0,
    interestedOpportunities: 0,
    selectedOpportunities: 0,
    expiredOpportunities: 0,
    averageMatchScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [respondingId, setRespondingId] = useState("");

  // Confirmation modal state for inline "Interested" click
  const [confirmingRecord, setConfirmingRecord] = useState(null);
  const [quotedRateDrafts, setQuotedRateDrafts] = useState({});
  const [demoActionLoading, setDemoActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [oppResponse, statsResponse] = await Promise.all([
        opportunitiesApi.getMine({
          status: activeFilter,
          search: searchTerm,
          sort: sortBy,
          page,
          limit: 10,
        }),
        opportunitiesApi.getMineStats().catch(() => ({ stats: null })),
      ]);

      setRecords(oppResponse.opportunities || []);
      if (oppResponse.pagination) setPagination(oppResponse.pagination);

      if (statsResponse?.stats) {
        setStats(statsResponse.stats);
      }
    } catch (err) {
      console.error("Failed to load opportunities:", err);
      setError(err.response?.data?.message || "Unable to load opportunities.");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, searchTerm, sortBy, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRespond = async (opportunityId, responsePayload) => {
    try {
      setRespondingId(opportunityId);
      const res = await opportunitiesApi.respondMine(
        opportunityId,
        responsePayload,
      );

      setRecords((prev) =>
        prev.map((item) =>
          item._id === opportunityId ? res.opportunity : item,
        ),
      );

      if (selectedOpportunity && selectedOpportunity._id === opportunityId) {
        setSelectedOpportunity(res.opportunity);
      }

      // Refresh stats
      const statsRes = await opportunitiesApi.getMineStats().catch(() => null);
      if (statsRes?.stats) setStats(statsRes.stats);
    } catch (err) {
      console.error("Failed to submit response:", err);
      setError(err.response?.data?.message || "Unable to submit response.");
    } finally {
      setRespondingId("");
      setConfirmingRecord(null);
    }
  };

  const handleInlineInterestConfirm = (record) => {
    const draftRate = quotedRateDrafts[record._id];
    const numRate = draftRate !== undefined && draftRate !== "" ? Number(draftRate) : null;
    handleRespond(record._id, {
      status: "INTERESTED",
      ...(numRate !== null ? { quotedRate: numRate, trainerQuotedRate: numRate } : {}),
      trainerQuotedRateType: "PER_DAY",
    });
  };

  const refreshSelectedOpportunity = async () => {
    if (!selectedOpportunity) return;
    try {
      const res = await opportunitiesApi.getMineById(selectedOpportunity._id);
      setSelectedOpportunity(res.opportunity);
      setRecords((prev) =>
        prev.map((item) =>
          item._id === res.opportunity._id ? res.opportunity : item,
        ),
      );
    } catch (err) {
      console.error("Failed to refresh opportunity after demo action:", err);
    }
  };

  const handleAcceptDemo = async (demoSessionId) => {
    if (!demoSessionId) return;
    try {
      setDemoActionLoading(true);
      await demoSessionsApi.acceptDemo(demoSessionId);
      await refreshSelectedOpportunity();
    } catch (err) {
      console.error("Failed to accept demo:", err);
      setError(err.response?.data?.message || "Unable to accept the demo.");
    } finally {
      setDemoActionLoading(false);
    }
  };

  const handleRescheduleDemo = async (demoSessionId, payload) => {
    if (!demoSessionId) return;
    try {
      setDemoActionLoading(true);
      await demoSessionsApi.rescheduleDemo(demoSessionId, payload);
      await refreshSelectedOpportunity();
    } catch (err) {
      console.error("Failed to request demo reschedule:", err);
      setError(
        err.response?.data?.message || "Unable to request a reschedule.",
      );
    } finally {
      setDemoActionLoading(false);
    }
  };

  const handleDeclineDemo = async (demoSessionId) => {
    if (!demoSessionId) return;
    try {
      setDemoActionLoading(true);
      await demoSessionsApi.declineDemo(demoSessionId);
      await refreshSelectedOpportunity();
    } catch (err) {
      console.error("Failed to decline demo:", err);
      setError(err.response?.data?.message || "Unable to decline the demo.");
    } finally {
      setDemoActionLoading(false);
    }
  };

  const handleOpenDetail = (record) => {
    setSelectedOpportunity(record);
    setIsDetailOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Opportunity Portal
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Discover training opportunities matched specifically to your
            expertise. Review match insights and respond seamlessly.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Phase E - Trainer Dashboard Stats Widgets */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pending</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FiClock size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {stats.pendingOpportunities}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Interested</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FiCheck size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {stats.interestedOpportunities}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Selected</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FiStar size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {stats.selectedOpportunities}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Expired</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FiX size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {stats.expiredOpportunities}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700">
              Avg Match Score
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <FiZap size={16} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-900">
            {stats.averageMatchScore}%
          </p>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Sorting */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search Input */}
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
              placeholder="Search by skill, title, location, delivery mode..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <FiFilter size={15} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="NEWEST">Newest First</option>
              <option value="MATCH_SCORE_DESC">Highest Match Score</option>
              <option value="EXPIRING_SOON">Expiring Soonest</option>
              <option value="OLDEST">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
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

      {/* Error State */}
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

      {/* Opportunity List */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 shadow-xl">
          <FiRefreshCw size={28} className="animate-spin text-indigo-600" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading opportunities...
          </p>
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center shadow-xl">
          <FiBriefcase size={36} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-extrabold text-slate-800">
            No opportunities found
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {searchTerm
              ? "No requirements matched your search criteria."
              : "You'll see new opportunities here as soon as you are matched."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const requirement =
              record.requirementId || record.requirementSnapshot || {};
            const isResponded = ["INTERESTED", "MAYBE", "DECLINED"].includes(
              record.status,
            );
            // No time-based expiry — an opportunity only closes once the
            // requirement itself is locked to another trainer (status
            // moves to REJECTED/NOT_SELECTED at that point) or this
            // trainer withdraws. `EXPIRED` is kept only for any legacy
            // records that were expired under the old 24-hour rule.
            const isExpired = record.status === "EXPIRED";

            return (
              <div
                key={record._id}
                className={`group rounded-3xl border bg-white p-6 shadow-xl shadow-slate-200/30 transition-all hover:shadow-2xl hover:scale-[1.003] ${
                  record.status === "INTERESTED"
                    ? "border-emerald-300 bg-emerald-50/30"
                    : record.status === "MAYBE"
                      ? "border-amber-300 bg-amber-50/30"
                      : record.status === "DECLINED" ||
                          record.status === "EXPIRED"
                        ? "border-slate-200 bg-slate-50/50 opacity-75"
                        : "border-slate-200/90"
                }`}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left Main Information */}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() => handleOpenDetail(record)}
                        className="text-lg font-extrabold text-slate-900 hover:text-indigo-600 cursor-pointer transition"
                      >
                        {requirement.title || "Training Requirement"}
                      </h3>

                      {/* Vendor Anonymization Label (Phase A Requirement) */}
                      <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
                        Client: Corporate Client
                      </span>

                      {/* Status Badges */}
                      {record.status === "INTERESTED" && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                          <FiCheck size={13} /> Interested
                        </span>
                      )}
                      {record.status === "MAYBE" && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold text-amber-800">
                          <FiClock size={13} /> Maybe
                        </span>
                      )}
                      {record.status === "DECLINED" && (
                        <span className="rounded-full bg-slate-200 px-3 py-0.5 text-xs font-bold text-slate-600">
                          Declined
                        </span>
                      )}
                      {record.status === "SELECTED" && (
                        <span className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                          <FiStar size={13} /> You're Selected
                        </span>
                      )}
                      {isExpired && record.status !== "SELECTED" && (
                        <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-bold text-red-700">
                          Expired
                        </span>
                      )}
                    </div>

                    {/* Metadata Line */}
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <FiMapPin size={14} className="text-slate-400" />
                        {requirement.mode === "ONLINE"
                          ? "Online"
                          : requirement.city || "—"}
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

                      {/* No deadline chip — opportunities no longer carry
                          a response deadline; they stay open until the
                          requirement is closed. */}
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {requirement.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Phase B Match Explanation Insight */}
                    <div className="pt-2">
                      <MatchInsight
                        matchScore={record.matchScore}
                        breakdown={record.matchBreakdown}
                      />
                    </div>
                  </div>

                  {/* Right Actions & Responses */}
                  <div className="flex shrink-0 flex-col gap-3 lg:w-56">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(record)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
                    >
                      View Details & History
                    </button>

                    {!isExpired &&
                      ![
                        "SELECTED",
                        "WITHDRAWN",
                        "REJECTED",
                        "NOT_SELECTED",
                      ].includes(record.status) && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div>
                            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Your Rate (₹/day optional)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={
                                quotedRateDrafts[record._id] ??
                                record.quotedRate ??
                                ""
                              }
                              onChange={(e) =>
                                setQuotedRateDrafts((prev) => ({
                                  ...prev,
                                  [record._id]: e.target.value,
                                }))
                              }
                              placeholder="₹ Rate"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white"
                            />
                          </div>

                          {/* Responsive Phase D Action Buttons */}
                          <div className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              disabled={respondingId === record._id}
                              onClick={() => setConfirmingRecord(record)}
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition disabled:opacity-50"
                            >
                              <FiCheck size={14} /> I'm Interested
                            </button>

                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                disabled={respondingId === record._id}
                                onClick={() =>
                                  handleRespond(record._id, { status: "MAYBE" })
                                }
                                className="rounded-xl border border-amber-200 bg-amber-50 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition disabled:opacity-50"
                              >
                                Maybe
                              </button>

                              <button
                                type="button"
                                disabled={respondingId === record._id}
                                onClick={() =>
                                  handleRespond(record._id, {
                                    status: "DECLINED",
                                  })
                                }
                                className="rounded-xl border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    {isResponded && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs font-medium text-slate-500">
                        Responded on {formatDate(record.respondedAt)}
                        {record.quotedRate > 0 && (
                          <p className="mt-1 font-bold text-slate-800">
                            Quoted: ₹
                            {Number(record.quotedRate).toLocaleString("en-IN")}
                            /day
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <span className="text-xs font-bold text-slate-500">
            Page {pagination.page} of {pagination.pages} ({pagination.total}{" "}
            total)
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= pagination.pages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {isDetailOpen && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onRespond={handleRespond}
          responding={respondingId === selectedOpportunity?._id}
          onAcceptDemo={handleAcceptDemo}
          onRescheduleDemo={handleRescheduleDemo}
          onDeclineDemo={handleDeclineDemo}
          demoActionLoading={demoActionLoading}
        />
      )}

      {/* Phase D Response UX Inline Confirmation Modal */}
      {confirmingRecord && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <FiCheck size={24} />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">
              Express Interest
            </h3>

            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              You are expressing interest in this opportunity. The operations
              team will review your profile and may select you for assignment.
            </p>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 font-medium">
              Note: This action expresses your availability. It does not create
              an assignment or guarantee selection.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingRecord(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={respondingId === confirmingRecord._id}
                onClick={() => handleInlineInterestConfirm(confirmingRecord)}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.02] transition disabled:opacity-50"
              >
                {respondingId === confirmingRecord._id
                  ? "Confirming..."
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerOpportunitiesPage;
