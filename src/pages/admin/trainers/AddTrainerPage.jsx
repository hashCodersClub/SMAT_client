import { useState } from "react";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiMail,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import TrainerForm from "../../../components/admin/trainers/TrainerForm";
import trainersApi from "../../../api/trainersApi";
import { mapTrainerToApi } from "../../../utils/trainerAdapter";

const AddTrainerPage = () => {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | Create Trainer
  |--------------------------------------------------------------------------
  |
  | Backend now handles BOTH:
  |
  | 1. Trainer creation
  | 2. Trainer portal invitation email
  |
  | Therefore the frontend only makes ONE request.
  |
  */

  const handleSubmit = async (trainerData) => {
    try {
      setSubmitting(true);
      setError("");
      setSuccess(null);

      const response = await trainersApi.create(mapTrainerToApi(trainerData));

      /*
      |--------------------------------------------------------------------------
      | Trainer Created
      |--------------------------------------------------------------------------
      */

      const createdTrainer = response?.trainer;

      setSuccess({
        name: createdTrainer?.name || trainerData.name || "Trainer",

        email: createdTrainer?.email || trainerData.email,

        message:
          response?.message ||
          "Trainer created and portal invitation sent successfully.",

        trainerId: createdTrainer?._id || createdTrainer?.id,

        invitationSent: response?.invitationSent !== false,
      });

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | We intentionally DO NOT immediately navigate away.
      |
      | Admin should see whether the invitation email was successfully sent.
      |
      */
    } catch (err) {
      console.error("Failed to create trainer:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create trainer. Please check the information and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Success Screen
  |--------------------------------------------------------------------------
  */

  if (success) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {/* Icon */}

          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              success.invitationSent ? "bg-emerald-50" : "bg-amber-50"
            }`}
          >
            {success.invitationSent ? (
              <FiCheckCircle size={30} className="text-emerald-600" />
            ) : (
              <FiAlertCircle size={30} className="text-amber-600" />
            )}
          </div>

          {/* Heading */}

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Trainer Created
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {success.message}
          </p>

          {/* Trainer */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trainer
            </p>

            <p className="mt-1 font-bold text-slate-900">{success.name}</p>

            {success.email && (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <FiMail />

                <span>{success.email}</span>
              </div>
            )}
          </div>

          {/* Invitation Status */}

          {success.invitationSent ? (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <FiCheckCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    Portal invitation sent
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-700">
                    An activation email has been sent to{" "}
                    <span className="font-semibold">{success.email}</span>. The
                    trainer can use the link to create their password and
                    activate their account.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <FiAlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Invitation not sent
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-700">
                    The trainer was created successfully, but the invitation
                    email could not be sent. You can resend the invitation from
                    the trainer details page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flow */}

          {success.invitationSent && (
            <div className="mt-6 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                What happens next?
              </p>

              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>1. Trainer opens the invitation email.</p>

                <p>2. Trainer creates their portal password.</p>

                <p>3. Their Trainer account becomes active.</p>

                <p>4. They can sign in to the Trainer Portal.</p>
              </div>
            </div>
          )}

          {/* Actions */}

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/trainers")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Trainers
            </button>

            {success.trainerId && (
              <button
                type="button"
                onClick={() => navigate(`/trainers/${success.trainerId}`)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View Trainer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Add Trainer Form
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={() => navigate("/trainers")}
        disabled={submitting}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiArrowLeft />
        Back to Trainers
      </button>

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Trainer</h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a trainer to the Nxthack network. An invitation email will
          automatically be sent so they can activate their Trainer Portal
          account.
        </p>
      </div>

      {/* Invitation Information */}

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <FiMail size={19} className="mt-0.5 shrink-0 text-blue-600" />

        <div>
          <p className="text-sm font-semibold text-blue-900">
            Trainer Portal Invitation
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-700">
            After saving, Nxthack will automatically email the trainer an
            activation link. Make sure the email address is correct.
          </p>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <FiAlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to create trainer
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}

      <TrainerForm
        onSubmit={handleSubmit}
        submitLabel={
          submitting
            ? "Creating & Sending Invitation..."
            : "Create Trainer & Send Invitation"
        }
      />
    </div>
  );
};

export default AddTrainerPage;
