import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiMessageCircle,
  FiSend,
  FiUsers,
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

import TrainerOutreachCard from "../../../components/admin/outreach/TrainerOutreachCard";

const RequirementOutreachPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [allTrainers, setAllTrainers] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadOutreach = async () => {
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

        outreach.forEach((record) => {
          const trainerId = record.trainerId?._id || record.trainerId;

          byTrainerId[trainerId] = record;
        });

        setRecords(byTrainerId);
      } catch (error) {
        console.error("Failed to load outreach records:", error);

        if (!isCancelled) {
          setLoadError(
            error?.response?.data?.message ||
              "Failed to load the outreach pipeline for this requirement.",
          );
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadOutreach();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const rankedTrainers = useMemo(() => {
    if (!requirement) return [];

    return rankTrainers(allTrainers, requirement);
  }, [requirement, allTrainers]);

  /*
   * Candidates are trainers that were explicitly shortlisted from the
   * Matches page, i.e. they already have an outreach record for this
   * requirement.
   */

  const shortlistedTrainers = useMemo(
    () => rankedTrainers.filter((trainer) => Boolean(records[trainer.id])),
    [rankedTrainers, records],
  );

  if (!loading && !loadError && requirement && !shortlistedTrainers.length) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/admin/requirements/${id}/matches`)}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <FiArrowLeft />
          Back to Matching
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FiUsers size={28} className="mx-auto text-slate-300" />

          <h3 className="mt-3 font-semibold text-slate-800">
            No trainers shortlisted yet
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Go to Trainer Matching and shortlist candidates before starting
            outreach.
          </p>
        </div>
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
        requirementId: id,
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
    const isNumericField = field === "quotedRate" || field === "negotiatedRate";
    const parsed = isNumericField ? (value === "" ? "" : Number(value)) : value;

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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Loading outreach records…
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
        onClick={() => navigate(`/admin/requirements/${id}/matches`)}
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
              navigate(`/admin/requirements/${id}/vendor-selection`)
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
