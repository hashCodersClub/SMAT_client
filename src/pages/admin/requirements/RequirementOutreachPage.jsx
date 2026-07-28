import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiMessageCircle,
  FiSend,
  FiUsers,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { requirements } from "../../../data/requirements";
import { trainers } from "../../../data/trainers";
import outreachApi from "../../../api/outreachApi";
import { rankTrainers } from "../../../utils/trainerMatching";

import TrainerOutreachCard from "../../../components/admin/outreach/TrainerOutreachCard";

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

  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requirement) return;

    let isCancelled = false;

    const loadOutreach = async () => {
      setLoading(true);

      try {
        const { outreach } = await outreachApi.getByRequirement(requirement.id);

        if (isCancelled) return;

        const byTrainerId = {};

        shortlistedTrainers.forEach((trainer) => {
          const existing = outreach.find(
            (record) =>
              (record.trainerId?._id || record.trainerId) === trainer.id,
          );

          byTrainerId[trainer.id] = existing || {
            requirementId: requirement.id,
            trainerId: trainer.id,
            outreachStatus: "NOT_CONTACTED",
            quotedRate: trainer.dailyRate || "",
            negotiatedRate: "",
            vendorStatus: "NOT_SENT",
            notes: "",
          };
        });

        setRecords(byTrainerId);
      } catch (error) {
        console.error("Failed to load outreach records:", error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadOutreach();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirement?.id]);

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

  const persistOutreach = async (trainerId, changes) => {
    try {
      const { outreach } = await outreachApi.upsert({
        requirementId: requirement.id,
        trainerId,
        ...changes,
      });

      updateRecord(trainerId, outreach);
    } catch (error) {
      console.error("Failed to save outreach record:", error);
    }
  };

  const updateStatus = (trainerId, status) => {
    updateRecord(trainerId, { outreachStatus: status });

    persistOutreach(trainerId, { outreachStatus: status });
  };

  const updateRate = (trainerId, field, value) => {
    const parsed = value === "" ? "" : Number(value);

    updateRecord(trainerId, { [field]: parsed });

    if (parsed !== "") {
      persistOutreach(trainerId, { [field]: parsed });
    }
  };

  const sendProfile = async (trainerId) => {
    const record = records[trainerId];

    if (!record?._id) {
      alert("Set an outreach status before sending the profile.");

      return;
    }

    try {
      const { outreach } = await outreachApi.sendProfile(record._id);

      updateRecord(trainerId, outreach);

      alert("Trainer marked as profile sent.");
    } catch (error) {
      console.error("Failed to send profile:", error);

      alert("Could not send the profile. Please try again.");
    }
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
        onClick={() =>
          navigate(`/admin/requirements/${requirement.id}/matches`)
        }
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
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading outreach records…
          </div>
        ) : (
          shortlistedTrainers.map((trainer) => (
            <TrainerOutreachCard
              key={trainer.id}
              trainer={trainer}
              record={records[trainer.id]}
              onUpdateStatus={updateStatus}
              onUpdateRate={updateRate}
              onSendProfile={sendProfile}
            />
          ))
        )}
      </div>

      {sentCount > 0 && (
        <div className="sticky bottom-4 flex justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/admin/requirements/${requirement.id}/vendor-selection`)
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
