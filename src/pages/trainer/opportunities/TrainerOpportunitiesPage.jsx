import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiMapPin,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import outreachApi from "../../../api/outreachApi";

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
  { key: "NEW", label: "New" },
  { key: "RESPONDED", label: "Responded" },
  { key: "ALL", label: "All" },
];

const TrainerOpportunitiesPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("NEW");
  const [rateDrafts, setRateDrafts] = useState({});
  const [respondingId, setRespondingId] = useState("");

  useEffect(() => {
    let ignore = false;
    const fetchMine = async () => {
      try {
        setError("");
        const response = await outreachApi.getMine();
        if (!ignore) {
          setRecords(response?.outreach || []);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load opportunities:", err);
          setError(
            err.response?.data?.message || "Unable to load your opportunities.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMine();

    return () => {
      ignore = true;
    };
  }, []);

  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await outreachApi.getMine();

      setRecords(response?.outreach || []);
    } catch (err) {
      console.error("Failed to load opportunities:", err);

      setError(
        err.response?.data?.message || "Unable to load your opportunities.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const respond = async (record, outreachStatus) => {
    try {
      setRespondingId(record._id);

      const draftRate = rateDrafts[record._id];

      const { outreach } = await outreachApi.respond(record._id, {
        outreachStatus,
        ...(draftRate !== undefined && draftRate !== ""
          ? { quotedRate: Number(draftRate) }
          : {}),
      });

      setRecords((previous) =>
        previous.map((item) => (item._id === record._id ? outreach : item)),
      );
    } catch (err) {
      console.error("Failed to respond:", err);

      setError(err.response?.data?.message || "Unable to save your response.");
    } finally {
      setRespondingId("");
    }
  };

  const updateRateDraft = (id, value) => {
    setRateDrafts((previous) => ({
      ...previous,
      [id]: value,
    }));
  };

  const filteredRecords = useMemo(() => {
    if (filter === "ALL") return records;

    if (filter === "NEW") {
      return records.filter((record) =>
        ["NOT_CONTACTED", "CONTACTED"].includes(record.outreachStatus),
      );
    }

    return records.filter((record) =>
      ["INTERESTED", "DECLINED"].includes(record.outreachStatus),
    );
  }, [records, filter]);

  const newCount = records.filter((record) =>
    ["NOT_CONTACTED", "CONTACTED"].includes(record.outreachStatus),
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-xl">
        <div className="text-center">
          <FiRefreshCw
            size={24}
            className="mx-auto animate-spin text-blue-600"
          />
          <p className="mt-3 text-sm font-medium text-slate-500/80">
            Loading your opportunities...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Opportunities
        </h1>

        <p className="text-base font-medium text-slate-500/80">
          Training requirements you've been matched with. Let us know if you're
          interested — no need to wait for a call.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200/80 bg-red-50/80 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm backdrop-blur-sm">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadOpportunities}
            className="flex shrink-0 items-center gap-1.5 font-bold text-red-700 transition hover:text-red-900 hover:scale-105"
          >
            <FiRefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`relative rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
              filter === item.key
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                : "bg-white/80 text-slate-600 backdrop-blur-sm hover:bg-slate-50/80 hover:shadow-md border border-slate-200/80"
            }`}
          >
            {item.label}
            {item.key === "NEW" && newCount > 0 && (
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  filter === item.key
                    ? "bg-white/20"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {newCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Opportunity List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => {
          const requirement = record.requirementId || {};
          const vendor = requirement.vendorId || {};
          const isResponded = ["INTERESTED", "DECLINED"].includes(
            record.outreachStatus,
          );

          return (
            <div
              key={record._id}
              className={`group rounded-3xl border bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all hover:shadow-2xl hover:shadow-slate-300/50 hover:scale-[1.005] ${
                record.outreachStatus === "INTERESTED"
                  ? "border-emerald-300/80 bg-emerald-50/60"
                  : record.outreachStatus === "DECLINED"
                    ? "border-slate-200/60 bg-slate-50/60 opacity-75"
                    : "border-slate-200/80"
              }`}
            >
              <div className="flex flex-col justify-between gap-5 lg:flex-row">
                {/* Left: Details */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                      {requirement.title || "Training Requirement"}
                    </h3>

                    {record.outreachStatus === "NOT_CONTACTED" && (
                      <span className="rounded-full border border-blue-200/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm backdrop-blur-sm">
                        New
                      </span>
                    )}

                    {record.outreachStatus === "INTERESTED" && (
                      <span className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                        <FiCheck size={13} />
                        You're interested
                      </span>
                    )}

                    {record.outreachStatus === "DECLINED" && (
                      <span className="flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-slate-100/80 px-3 py-1 text-xs font-bold text-slate-500 backdrop-blur-sm">
                        <FiX size={13} />
                        Declined
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-500/80">
                    {vendor.companyName || "Vendor"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500/80">
                    <span className="flex items-center gap-1.5">
                      <FiMapPin size={15} className="text-slate-400" />
                      {requirement.city || "Online"}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <FiBriefcase size={15} className="text-slate-400" />
                      {MODE_LABELS[requirement.mode] || requirement.mode}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <FiCalendar size={15} className="text-slate-400" />
                      {formatDate(requirement.startDate)} –{" "}
                      {formatDate(requirement.endDate)}
                    </span>

                    {requirement.budget > 0 && (
                      <span className="flex items-center gap-1.5">
                        <FiDollarSign size={15} className="text-slate-400" />₹
                        {Number(requirement.budget).toLocaleString("en-IN")}
                        /day (vendor budget)
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {requirement.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-slate-100/80 px-2.5 py-1 text-xs font-semibold text-slate-600 backdrop-blur-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex shrink-0 flex-col gap-3 lg:w-56">
                  {!isResponded ? (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400/80">
                          Your Rate / Day (optional)
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            rateDrafts[record._id] ?? record.quotedRate ?? ""
                          }
                          onChange={(e) =>
                            updateRateDraft(record._id, e.target.value)
                          }
                          placeholder="₹"
                          className="w-full rounded-xl border border-slate-200/80 bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400/60 hover:border-slate-300/80 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 focus:bg-white/80 backdrop-blur-sm"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={respondingId === record._id}
                        onClick={() => respond(record, "INTERESTED")}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                      >
                        <FiCheck size={16} />
                        I'm Interested
                      </button>

                      <button
                        type="button"
                        disabled={respondingId === record._id}
                        onClick={() => respond(record, "DECLINED")}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/50 px-4 py-3 text-sm font-bold text-slate-500 backdrop-blur-sm transition-all hover:bg-slate-50/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiX size={16} />
                        Not Available
                      </button>
                    </>
                  ) : (
                    <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-4 text-center text-xs font-medium text-slate-500/80 backdrop-blur-sm">
                      <FiClock className="mx-auto mb-1.5" size={18} />
                      Responded on {formatDate(record.respondedAt)}
                      {record.quotedRate > 0 && (
                        <p className="mt-1 font-bold text-slate-700">
                          ₹{Number(record.quotedRate).toLocaleString("en-IN")}
                          /day quoted
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!filteredRecords.length && (
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-12 text-center shadow-xl backdrop-blur-sm">
            <FiBriefcase size={32} className="mx-auto text-slate-300/70" />

            <h3 className="mt-4 text-lg font-extrabold text-slate-800">
              {filter === "NEW"
                ? "No new opportunities right now"
                : "Nothing here yet"}
            </h3>

            <p className="mt-1 text-sm font-medium text-slate-500/80">
              You'll see requirements here as soon as we match you to one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerOpportunitiesPage;
