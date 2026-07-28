import {
  FiCheck,
  FiEye,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSend,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import OutreachStatusBadge from "./OutreachStatusBadge";

const TrainerOutreachCard = ({
  trainer,
  record,
  onUpdateStatus,
  onUpdateRate,
  onSendProfile,
}) => {
  const navigate = useNavigate();

  const status = record?.outreachStatus || "NOT_CONTACTED";

  const whatsappMessage = `Hi ${trainer.name}, we have a training requirement for you. Please confirm your availability and commercial rate.`;

  const openWhatsApp = () => {
    const phone = String(trainer.phone || "").replace(/\D/g, "");

    if (!phone) {
      alert("Trainer phone number is missing.");
      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`,
      "_blank",
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                {trainer.name}
              </h3>

              <OutreachStatusBadge status={status} />
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <FiMapPin />
                {trainer.city}
              </span>

              <span>{trainer.experience} years experience</span>

              <span>Match {trainer.match?.score || 0}%</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {trainer.skills?.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/admin/trainers/${trainer.id}`)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <FiEye />
              Profile
            </button>

            <button
              type="button"
              onClick={openWhatsApp}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <FiMessageCircle />
              WhatsApp
            </button>

            {trainer.phone && (
              <a
                href={`tel:${trainer.phone}`}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
              >
                <FiPhone />
                Call
              </a>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Trainer Response
            </label>

            <select
              value={status}
              onChange={(e) => onUpdateStatus(trainer.id, e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="NOT_CONTACTED">Not Contacted</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="DECLINED">Declined</option>
              <option value="NO_RESPONSE">No Response</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Trainer Quoted Rate
            </label>

            <input
              type="number"
              value={record?.quotedRate ?? trainer.dailyRate ?? ""}
              onChange={(e) =>
                onUpdateRate(trainer.id, "quotedRate", e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="Rate per day"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Final Negotiated Rate
            </label>

            <input
              type="number"
              value={record?.negotiatedRate ?? ""}
              onChange={(e) =>
                onUpdateRate(trainer.id, "negotiatedRate", e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="Final rate"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center">
        <div className="text-sm text-slate-500">
          {status === "INTERESTED" && (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <FiCheck />
              Trainer interested in this requirement
            </span>
          )}

          {["DECLINED", "UNAVAILABLE"].includes(status) && (
            <span className="flex items-center gap-1.5 text-red-600">
              <FiX />
              Trainer cannot proceed
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={status !== "INTERESTED"}
          onClick={() => onSendProfile(trainer.id)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <FiSend />
          Send Profile to Vendor
        </button>
      </div>
    </div>
  );
};

export default TrainerOutreachCard;
