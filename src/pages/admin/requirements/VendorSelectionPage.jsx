import { useMemo, useState } from "react";
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

import { requirements } from "../../../data/requirements";
import { trainers } from "../../../data/trainers";
import { rankTrainers } from "../../../utils/trainerMatching";

const VendorSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const requirement = requirements.find((item) => item.id === id);

  const rankedTrainers = useMemo(() => {
    if (!requirement) return [];

    return rankTrainers(trainers, requirement).filter(
      (trainer) => trainer.match.score >= 45,
    );
  }, [requirement]);

  const [vendorStatuses, setVendorStatuses] = useState(() => {
    const initial = {};

    rankedTrainers.forEach((trainer) => {
      initial[trainer.id] = "PROFILE_SENT";
    });

    return initial;
  });

  if (!requirement) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Requirement not found.
      </div>
    );
  }

  const updateStatus = (trainerId, status) => {
    setVendorStatuses((previous) => ({
      ...previous,
      [trainerId]: status,
    }));
  };

  const selectedCount = Object.values(vendorStatuses).filter(
    (status) => status === "SELECTED",
  ).length;

  const shortlistedCount = Object.values(vendorStatuses).filter(
    (status) => status === "SHORTLISTED",
  ).length;

  const rejectedCount = Object.values(vendorStatuses).filter(
    (status) => status === "REJECTED",
  ).length;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/requirements/${id}/outreach`)}
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
        {rankedTrainers.map((trainer) => {
          const status = vendorStatuses[trainer.id];

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
                      onChange={(e) => updateStatus(trainer.id, e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                        `/requirements/${id}/create-assignment/${trainer.id}`,
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
