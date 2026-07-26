import { useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiMessageCircle,
  FiSend,
  FiUsers,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { requirements } from "../../data/requirements";
import { trainers } from "../../data/trainers";
import { outreachRecords } from "../../data/outreach";
import { rankTrainers } from "../../utils/trainerMatching";

import TrainerOutreachCard from "../../components/outreach/TrainerOutreachCard";

const RequirementOutreachPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const requirement = requirements.find((item) => item.id === id);

  const rankedTrainers = useMemo(() => {
    if (!requirement) return [];

    return rankTrainers(trainers, requirement);
  }, [requirement]);

  /*
   * For now we treat >= 45% as shortlisted candidates.
   * Later these IDs will come from the backend shortlist table.
   */
  const shortlistedTrainers = rankedTrainers.filter(
    (trainer) => trainer.match.score >= 45,
  );

  const initialRecords = {};

  shortlistedTrainers.forEach((trainer) => {
    const existing = outreachRecords.find(
      (record) =>
        record.requirementId === id && record.trainerId === trainer.id,
    );

    initialRecords[trainer.id] = existing || {
      id: `TEMP-${trainer.id}`,
      requirementId: id,
      trainerId: trainer.id,
      outreachStatus: "NOT_CONTACTED",
      quotedRate: trainer.dailyRate || "",
      negotiatedRate: "",
      vendorStatus: "NOT_SENT",
      notes: "",
    };
  });

  const [records, setRecords] = useState(initialRecords);

  if (!requirement) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Requirement not found.
      </div>
    );
  }

  const updateRecord = (trainerId, changes) => {
    setRecords((previous) => ({
      ...previous,
      [trainerId]: {
        ...previous[trainerId],
        ...changes,
      },
    }));
  };

  const updateStatus = (trainerId, status) => {
    updateRecord(trainerId, {
      outreachStatus: status,

      contactedAt:
        status !== "NOT_CONTACTED"
          ? records[trainerId]?.contactedAt || new Date().toISOString()
          : null,

      respondedAt: ["INTERESTED", "DECLINED", "UNAVAILABLE"].includes(status)
        ? new Date().toISOString()
        : records[trainerId]?.respondedAt,
    });
  };

  const updateRate = (trainerId, field, value) => {
    updateRecord(trainerId, {
      [field]: value === "" ? "" : Number(value),
    });
  };

  const sendProfile = (trainerId) => {
    updateRecord(trainerId, {
      vendorStatus: "PROFILE_SENT",
    });

    console.log("Profile sent to vendor:", trainerId, requirement.id);

    alert("Trainer marked as profile sent.");
  };

  const values = Object.values(records);

  const contactedCount = values.filter(
    (record) => record.outreachStatus !== "NOT_CONTACTED",
  ).length;

  const interestedCount = values.filter(
    (record) => record.outreachStatus === "INTERESTED",
  ).length;

  const sentCount = values.filter(
    (record) => record.vendorStatus === "PROFILE_SENT",
  ).length;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(`/requirements/${requirement.id}/matches`)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Matching
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Trainer Outreach
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {requirement.title}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Contact potential trainers, capture their response and send interested
          profiles to {requirement.vendorName}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={FiUsers}
          label="Candidates"
          value={shortlistedTrainers.length}
        />

        <Stat icon={FiMessageCircle} label="Contacted" value={contactedCount} />

        <Stat icon={FiCheckCircle} label="Interested" value={interestedCount} />

        <Stat icon={FiSend} label="Profiles Sent" value={sentCount} />
      </div>

      <div>
        <h2 className="font-bold text-slate-900">Trainer Pipeline</h2>

        <p className="mt-1 text-sm text-slate-500">
          Record each trainer's response before sharing their profile with the
          vendor.
        </p>
      </div>

      <div className="space-y-4">
        {shortlistedTrainers.map((trainer) => (
          <TrainerOutreachCard
            key={trainer.id}
            trainer={trainer}
            record={records[trainer.id]}
            onUpdateStatus={updateStatus}
            onUpdateRate={updateRate}
            onSendProfile={sendProfile}
          />
        ))}
      </div>

      {sentCount > 0 && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/requirements/${requirement.id}/vendor-selection`)
            }
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
          >
            Manage Vendor Selection →
          </button>
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>

        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>

      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
        <Icon size={19} />
      </div>
    </div>
  </div>
);

export default RequirementOutreachPage;
