import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiEdit2,
  FiEye,
  FiHelpCircle,
  FiLoader,
  FiMapPin,
  FiRefreshCw,
  FiStar,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";

import requirementsApi from "../../../api/requirementsApi";
import opportunitiesApi from "../../../api/opportunitiesApi";

const STATUSES = [
  "SUBMITTED",
  "OPEN",
  "SOURCING",
  "PROFILES_SENT",
  "SHORTLISTED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const statusStyles = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-50 text-blue-700",
  OPEN: "bg-indigo-50 text-indigo-700",
  SOURCING: "bg-amber-50 text-amber-700",
  PROFILES_SENT: "bg-purple-50 text-purple-700",
  SHORTLISTED: "bg-cyan-50 text-cyan-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const formatLabel = (value = "") => {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTimeAgo = (date) => {
  if (!date) return "—";
  const diffHours = (new Date() - new Date(date)) / (1000 * 60 * 60);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
};

const getVendorName = (requirement) => {
  if (requirement?.vendorId && typeof requirement.vendorId === "object") {
    return (
      requirement.vendorId.companyName ||
      requirement.vendorId.name ||
      "Unknown Vendor"
    );
  }

  return requirement?.vendorName || "Unknown Vendor";
};

const RequirementDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [opportunitiesError, setOpportunitiesError] = useState("");

  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [error, setError] = useState("");
  const [statusError, setStatusError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Phase F Admin Response View & Phase G Scoring
  const [candidateFilter, setCandidateFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [selectedScoringModal, setSelectedScoringModal] = useState(null);
  const [selectingOpportunity, setSelectingOpportunity] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Load Requirement
  |--------------------------------------------------------------------------
  */

  const loadRequirement = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [response, opportunityResult] = await Promise.all([
        requirementsApi.getById(id),
        opportunitiesApi
          .getByRequirementAdmin(id)
          .then((data) => ({ data }))
          .catch((opportunityError) => ({ error: opportunityError })),
      ]);

      setRequirement(response.requirement);
      if (opportunityResult.error) {
        setOpportunities([]);
        setOpportunitiesError(
          opportunityResult.error.response?.data?.message ||
            "Unable to load matched opportunities.",
        );
      } else {
        setOpportunities(opportunityResult.data.candidates || []);
        setOpportunitiesError("");
      }
    } catch (error) {
      console.error("Failed to load requirement:", error);

      setError(error.response?.data?.message || "Unable to load requirement.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequirement();
  }, [loadRequirement]);

  /*
  |--------------------------------------------------------------------------
  | Status Update
  |--------------------------------------------------------------------------
  */

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    if (!newStatus) return;

    if (newStatus === requirement.status) return;

    try {
      setStatusUpdating(true);
      setStatusError("");

      const response = await requirementsApi.updateStatus(id, {
        status: newStatus,
      });

      setRequirement((current) => ({
        ...current,
        ...(response.requirement || {}),
        status: response.requirement?.status || newStatus,
      }));
    } catch (error) {
      console.error("Status update failed:", error);

      setStatusError(
        error.response?.data?.message || "Unable to update requirement status.",
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Admin Action Handlers (Phase F)
  |--------------------------------------------------------------------------
  */

  const handleAdminAction = async (opportunityId, action) => {
    try {
      setActionLoadingId(opportunityId);
      await opportunitiesApi.adminAction(opportunityId, action);
      await loadRequirement();
    } catch (err) {
      console.error("Admin action failed:", err);
      alert(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoadingId("");
      setSelectingOpportunity(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete Requirement
  |--------------------------------------------------------------------------
  */

  const handleDeleteRequirement = async () => {
    const confirmed = window.confirm(
      "Delete this requirement? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await requirementsApi.delete(id);

      navigate("/admin/requirements");
    } catch (error) {
      console.error("Failed to delete requirement:", error);

      setDeleteError(
        error.response?.data?.message || "Unable to delete requirement.",
      );

      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <FiRefreshCw
            size={25}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">Loading requirement...</p>
        </div>
      </div>
    );
  }

  if (error || !requirement) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/admin/requirements")}
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <FiArrowLeft />
          Back to Requirements
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <FiAlertCircle size={30} className="mx-auto text-red-500" />

          <h2 className="mt-3 font-semibold text-red-900">
            Unable to load requirement
          </h2>

          <p className="mt-2 text-sm text-red-700">
            {error || "Requirement could not be found."}
          </p>

          <button
            type="button"
            onClick={loadRequirement}
            className="mt-5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const vendorName = getVendorName(requirement);

  const vendor =
    requirement.vendorId && typeof requirement.vendorId === "object"
      ? requirement.vendorId
      : null;

  // Filtered Candidates
  const filteredCandidates = opportunities.filter((c) => {
    if (candidateFilter === "INTERESTED") return c.status === "INTERESTED";
    if (candidateFilter === "SHORTLISTED") return c.status === "SHORTLISTED";
    if (candidateFilter === "SELECTED") return c.status === "SELECTED";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => navigate("/admin/requirements")}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <FiArrowLeft />
        Back to Requirements
      </button>

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {requirement.title}
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                statusStyles[requirement.status] || "bg-slate-100 text-slate-700"
              }`}
            >
              {formatLabel(requirement.status)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>{formatLabel(requirement.trainingType)}</span>
            <span>•</span>
            <span>{formatLabel(requirement.mode)}</span>
            <span>•</span>
            <span>
              Source:{" "}
              {requirement.source === "VENDOR_PORTAL"
                ? "Vendor Portal"
                : "Admin"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/requirements/${id}/edit`)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FiEdit2 />
            Edit
          </button>

          <button
            type="button"
            onClick={handleDeleteRequirement}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
            {deleting ? "Deleting…" : "Delete"}
          </button>

          {!["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
            requirement.status,
          ) && (
            <button
              type="button"
              onClick={() => navigate(`/admin/requirements/${id}/matches`)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:from-indigo-700 hover:to-purple-700"
            >
              <FiCpu />
              ✨ AI Match Trainers
            </button>
          )}
        </div>
      </div>

      {deleteError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert">
          <p className="text-sm font-semibold text-red-800">Delete failed</p>
          <p className="mt-1 text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      {/* AI SMART MATCH HIGHLIGHT */}
      <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <FiCpu size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900">AI Trainer Recommendation Engine</h2>
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">Automated</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Scans available trainer network against skills, location ({requirement.city || "Remote"}), experience ({requirement.experienceRequired || 0} yrs), and budget.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/admin/requirements/${id}/matches`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 shrink-0"
          >
            Run AI Match Analysis &rarr;
          </button>
        </div>
      </section>

      {/* STATUS MANAGEMENT */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Requirement Status</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage the operational lifecycle of this requirement.
            </p>
          </div>

          <div className="w-full lg:w-64">
            <select
              value={requirement.status}
              onChange={handleStatusChange}
              disabled={statusUpdating}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>

            {statusUpdating && (
              <p className="mt-2 text-xs text-blue-600">Updating status...</p>
            )}
          </div>
        </div>

        {statusError && (
          <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <FiAlertCircle size={17} className="mt-0.5 shrink-0" />
            {statusError}
          </div>
        )}
      </section>

      {/* QUICK STATS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard
          icon={FiCalendar}
          label="Start Date"
          value={formatDate(requirement.startDate)}
        />
        <QuickCard
          icon={FiCalendar}
          label="End Date"
          value={formatDate(requirement.endDate)}
        />
        <QuickCard
          icon={FiMapPin}
          label="Location"
          value={requirement.mode === "ONLINE" ? "Online" : requirement.city || "—"}
        />
        <QuickCard
          icon={FiUsers}
          label="Participants"
          value={requirement.participants || "—"}
        />
      </div>

      {/* ================================================================
          PHASE F & G - INTERESTED TRAINERS & SCORED CANDIDATES SECTION
      ================================================================= */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900">
                Interested Trainers & Candidates
              </h2>
              <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                Phase F Response View
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Review trainer responses, overall opportunity scores, and manage final selection. Admin retains final selection authority.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "INTERESTED", "SHORTLISTED", "SELECTED"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCandidateFilter(tab)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  candidateFilter === tab
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab === "ALL" ? "All Matched" : formatLabel(tab)}
              </button>
            ))}
          </div>
        </div>

        {opportunitiesError ? (
          <p className="px-6 py-6 text-sm text-red-600">{opportunitiesError}</p>
        ) : filteredCandidates.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm font-medium text-slate-400">
            No trainer candidates found for this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Rank & Trainer</th>
                  <th className="px-4 py-3.5">Overall Score (Phase G)</th>
                  <th className="px-4 py-3.5">Match %</th>
                  <th className="px-4 py-3.5">Response</th>
                  <th className="px-4 py-3.5">Response Speed</th>
                  <th className="px-4 py-3.5">Quoted Rate</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCandidates.map((opportunity, idx) => {
                  const trainer = opportunity.trainerId || {};
                  const isSelected = opportunity.status === "SELECTED";
                  const isShortlisted = opportunity.status === "SHORTLISTED";

                  return (
                    <tr
                      key={opportunity._id}
                      className={`transition hover:bg-slate-50/80 ${
                        isSelected
                          ? "bg-emerald-50/60 font-semibold"
                          : isShortlisted
                            ? "bg-amber-50/40"
                            : ""
                      }`}
                    >
                      {/* Trainer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-extrabold text-slate-600">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">
                              {trainer.name || "Unknown Trainer"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {trainer.email || "No email"} • {trainer.city || "Remote"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phase G Overall Opportunity Score */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-xs font-black text-white shadow-xs">
                            <FiZap size={12} />
                            {opportunity.overallScore ?? opportunity.matchScore ?? 0}%
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelectedScoringModal(opportunity)}
                            className="text-slate-400 hover:text-indigo-600 transition"
                            title="View Score Breakdown"
                          >
                            <FiHelpCircle size={15} />
                          </button>
                        </div>
                      </td>

                      {/* Match Score */}
                      <td className="px-4 py-4 font-bold text-slate-800">
                        {opportunity.matchScore ?? "—"}%
                      </td>

                      {/* Response Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            opportunity.status === "INTERESTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : opportunity.status === "MAYBE"
                                ? "bg-amber-100 text-amber-800"
                                : opportunity.status === "SHORTLISTED"
                                  ? "bg-purple-100 text-purple-800"
                                  : opportunity.status === "SELECTED"
                                    ? "bg-green-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {formatLabel(opportunity.status)}
                        </span>
                      </td>

                      {/* Response Time */}
                      <td className="px-4 py-4 font-medium text-slate-500">
                        {opportunity.respondedAt ? (
                          <span className="flex items-center gap-1">
                            <FiClock size={12} />
                            {formatTimeAgo(opportunity.respondedAt)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Quoted Rate */}
                      <td className="px-4 py-4 font-bold text-slate-800">
                        {opportunity.quotedRate
                          ? `₹${Number(opportunity.quotedRate).toLocaleString("en-IN")}/day`
                          : "Default rate"}
                      </td>

                      {/* Admin Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Profile */}
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/trainers/${trainer._id}`)}
                            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <FiEye size={12} /> Profile
                          </button>

                          {/* Shortlist */}
                          {!isShortlisted && !isSelected && (
                            <button
                              type="button"
                              disabled={actionLoadingId === opportunity._id}
                              onClick={() => handleAdminAction(opportunity._id, "SHORTLIST")}
                              className="rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 hover:bg-purple-100 transition disabled:opacity-50"
                            >
                              Shortlist
                            </button>
                          )}

                          {/* Reject */}
                          {opportunity.status !== "NOT_SELECTED" && !isSelected && (
                            <button
                              type="button"
                              disabled={actionLoadingId === opportunity._id}
                              onClick={() => handleAdminAction(opportunity._id, "REJECT")}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}

                          {/* Select Trainer */}
                          {!isSelected && (
                            <button
                              type="button"
                              disabled={actionLoadingId === opportunity._id}
                              onClick={() => setSelectingOpportunity(opportunity)}
                              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                              <FiCheck size={12} /> Select Trainer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CONTENT DETAILS */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Training Information">
            <Detail label="Training Type" value={formatLabel(requirement.trainingType)} />
            <Detail label="Delivery Mode" value={formatLabel(requirement.mode)} />
            <Detail
              label="Trainer Experience"
              value={
                requirement.experienceRequired !== undefined && requirement.experienceRequired !== null
                  ? `${requirement.experienceRequired} years`
                  : "—"
              }
            />
            <Detail label="Participants" value={requirement.participants || "—"} />

            <div className="md:col-span-2">
              <Label>Required Skills</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {requirement.skills?.length ? (
                  requirement.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">—</span>
                )}
              </div>
            </div>
          </Section>

          <Section title="Requirement Description">
            <div className="md:col-span-2">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {requirement.description || "No description provided."}
              </p>
            </div>
          </Section>

          <Section title="Vendor Notes">
            <div className="md:col-span-2">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {requirement.vendorNotes || "No additional notes from the vendor."}
              </p>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Vendor">
            <div className="md:col-span-2">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiUser size={19} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{vendorName}</p>
                  {vendor?.primaryContact?.name && (
                    <p className="mt-1 text-sm text-slate-500">{vendor.primaryContact.name}</p>
                  )}
                  {vendor?.primaryContact?.email && (
                    <p className="mt-1 break-all text-xs text-slate-400">{vendor.primaryContact.email}</p>
                  )}
                </div>
              </div>
            </div>
          </Section>

          <Section title="Schedule">
            <div className="space-y-4 md:col-span-2">
              <SideDetail icon={FiCalendar} label="Start Date" value={formatDate(requirement.startDate)} />
              <SideDetail icon={FiCalendar} label="End Date" value={formatDate(requirement.endDate)} />
            </div>
          </Section>
        </div>
      </div>

      {/* PHASE G SCORING BREAKDOWN MODAL */}
      {selectedScoringModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">Phase G Ranking Breakdown</span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {selectedScoringModal.trainerId?.name || "Trainer"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScoringModal(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="rounded-2xl bg-indigo-50/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase">Overall Opportunity Score</span>
                <p className="text-2xl font-black text-indigo-900">
                  {selectedScoringModal.overallScore ?? selectedScoringModal.matchScore}%
                </p>
              </div>
              <FiZap size={28} className="text-indigo-600" />
            </div>

            {/* Score Component Breakdown */}
            <div className="space-y-3 pt-2 text-xs">
              <ScoreRow label="Match Engine Score (30%)" score={selectedScoringModal.scoringBreakdown?.matchScore?.weighted || 0} max={30} />
              <ScoreRow label="Trainer Rating / Track Record (20%)" score={selectedScoringModal.scoringBreakdown?.trainerRating?.weighted || 0} max={20} />
              <ScoreRow label="Response Speed (15%)" score={selectedScoringModal.scoringBreakdown?.responseSpeed?.weighted || 0} max={15} />
              <ScoreRow label="Availability (15%)" score={selectedScoringModal.scoringBreakdown?.availability?.weighted || 0} max={15} />
              <ScoreRow label="Past Delivery Performance (10%)" score={selectedScoringModal.scoringBreakdown?.pastDeliveryPerformance?.weighted || 0} max={10} />
              <ScoreRow label="Margin Potential (10%)" score={selectedScoringModal.scoringBreakdown?.marginPotential?.weighted || 0} max={10} />
            </div>

            <button
              type="button"
              onClick={() => setSelectedScoringModal(null)}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SELECT TRAINER CONFIRMATION DIALOG */}
      {selectingOpportunity && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <FiCheckCircle size={26} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Confirm Trainer Selection
            </h3>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Select <strong>{selectingOpportunity.trainerId?.name}</strong> for this requirement? Admin retains final selection authority. This will finalize selection and notify the trainer.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectingOpportunity(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoadingId === selectingOpportunity._id}
                onClick={() => handleAdminAction(selectingOpportunity._id, "SELECT_TRAINER")}
                className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {actionLoadingId === selectingOpportunity._id ? "Selecting..." : "Confirm Selection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Components */
const ScoreRow = ({ label, score, max }) => (
  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
    <span className="font-semibold text-slate-600">{label}</span>
    <span className="font-bold text-slate-900">{score} / {max} pts</span>
  </div>
);

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
    <h2 className="font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">{title}</h2>
    <div className="grid gap-4 md:grid-cols-2">{children}</div>
  </section>
);

const Detail = ({ label, value }) => (
  <div>
    <Label>{label}</Label>
    <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
  </div>
);

const Label = ({ children }) => (
  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</span>
);

const SideDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
      <Icon size={16} />
    </div>
    <div>
      <Label>{label}</Label>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  </div>
);

const QuickCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
      <Icon size={18} />
    </div>
    <div>
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <p className="text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  </div>
);

export default RequirementDetailsPage;
