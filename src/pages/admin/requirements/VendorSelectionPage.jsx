import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiMapPin,
  FiStar,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import requirementsApi from "../../../api/requirementsApi";
import trainersApi from "../../../api/trainersApi";
import outreachApi from "../../../api/outreachApi";

import { rankTrainers } from "../../../utils/trainerMatching";
import {
  normalizeRequirement,
  normalizeTrainer,
} from "../../../utils/requirementDisplay";

const VendorSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [allTrainers, setAllTrainers] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [{ requirement: req }, { trainers: trainerList }, { outreach }] =
          await Promise.all([
            requirementsApi.getById(id),
            trainersApi.getAll({ status: "ACTIVE", limit: 100 }),
            outreachApi.getByRequirement(id),
          ]);

        if (isCancelled) return;

        setRequirement(normalizeRequirement(req));
        setAllTrainers(trainerList.map(normalizeTrainer));

        const byTrainerId = {};

        outreach
          .filter((record) => record.vendorStatus !== "NOT_SENT")
          .forEach((record) => {
            const trainerId = record.trainerId?._id || record.trainerId;

            byTrainerId[trainerId] = record;
          });

        setRecords(byTrainerId);
      } catch (error) {
        console.error("Failed to load vendor selection data:", error);

        if (!isCancelled) {
          setLoadError(
            error?.response?.data?.message ||
              "Failed to load vendor selection for this requirement.",
          );
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const rankedTrainers = useMemo(() => {
    if (!requirement) return [];

    return rankTrainers(allTrainers, requirement);
  }, [requirement, allTrainers]);

  const sentTrainers = useMemo(
    () => rankedTrainers.filter((trainer) => Boolean(records[trainer.id])),
    [rankedTrainers, records],
  );

  const updateStatus = async (trainerId, vendorStatus) => {
    const record = records[trainerId];

    if (!record?._id) return;

    setSavingId(trainerId);

    try {
      const { outreach } = await outreachApi.updateVendorStatus(record._id, {
        vendorStatus,
      });

      setRecords((previous) => ({
        ...previous,
        [trainerId]: outreach,
      }));
    } catch (error) {
      console.error("Failed to update vendor decision:", error);

      alert("Could not save the vendor's decision. Please try again.");
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading vendor selection…
      </div>
    );
  }

  if (loadError || !requirement) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        {loadError || "Requirement not found."}
      </div>
    );
  }

  if (!sentTrainers.length) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/admin/requirements/${id}/outreach`)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <FiArrowLeft />
          Back to Outreach
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FiUser size={28} className="mx-auto text-slate-300" />

          <h3 className="mt-3 font-semibold text-slate-800">
            No profiles sent to the vendor yet
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Send at least one interested trainer's profile from the Outreach
            page before recording vendor feedback.
          </p>
        </div>
      </div>
    );
  }

  const statuses = Object.values(records).map((record) => record.vendorStatus);

  const selectedCount = statuses.filter(
    (status) => status === "SELECTED",
  ).length;

  const shortlistedCount = statuses.filter(
    (status) => status === "SHORTLISTED",
  ).length;

  const rejectedCount = statuses.filter(
    (status) => status === "REJECTED",
  ).length;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/admin/requirements/${id}/outreach`)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Outreach
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Vendor Selection
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {requirement.title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Record feedback received from {requirement.vendorName} for the
          submitted trainer profiles.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Vendor Shortlisted" value={shortlistedCount} />

        <Stat label="Selected" value={selectedCount} />

        <Stat label="Rejected" value={rejectedCount} />
      </div>

      <div className="space-y-4">
        {sentTrainers.map((trainer) => {
          const record = records[trainer.id];
          const status = record?.vendorStatus || "PROFILE_SENT";

          return (
            <div
              key={trainer.id}
              className={`rounded-2xl border bg-white shadow-sm ${
                status === "SELECTED"
                  ? "border-emerald-300"
                  : "border-slate-200"
              }`}
            >
              <div className="p-5">
                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <FiUser />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          {trainer.name}
                        </h3>

                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {trainer.match.score}% Match
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <FiMapPin />
                          {trainer.city}
                        </span>

                        <span>{trainer.experience} years</span>

                        {trainer.rating && (
                          <span className="flex items-center gap-1">
                            <FiStar />
                            {trainer.rating}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {trainer.skills?.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[210px]">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Vendor Decision
                    </label>

                    <select
                      value={status}
                      disabled={savingId === trainer.id}
                      onChange={(e) => updateStatus(trainer.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:opacity-60"
                    >
                      <option value="PROFILE_SENT">Awaiting Feedback</option>

                      <option value="SHORTLISTED">Shortlisted</option>

                      <option value="SELECTED">Selected</option>

                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {status === "SELECTED" && (
                <div className="flex flex-col justify-between gap-3 border-t border-emerald-100 bg-emerald-50/50 px-5 py-4 sm:flex-row sm:items-center">
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <FiCheckCircle />
                    Vendor selected this trainer.
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/requirements/${id}/create-assignment/${trainer.id}`,
                      )
                    }
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Create Assignment →
                  </button>
                </div>
              )}

              {status === "SHORTLISTED" && (
                <div className="border-t border-blue-100 bg-blue-50/50 px-5 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-blue-700">
                    <FiCheck />
                    Vendor shortlisted this profile.
                  </span>
                </div>
              )}

              {status === "REJECTED" && (
                <div className="border-t border-red-100 bg-red-50/50 px-5 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <FiX />
                    Vendor rejected this profile.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">{label}</p>

    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export default VendorSelectionPage;
