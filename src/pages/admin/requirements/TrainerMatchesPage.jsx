import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiFilter, FiSearch } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import requirementsApi from "../../../api/requirementsApi";
import trainersApi from "../../../api/trainersApi";
import outreachApi from "../../../api/outreachApi";

import { rankTrainers } from "../../../utils/trainerMatching";
import {
  normalizeRequirement,
  normalizeTrainer,
} from "../../../utils/requirementDisplay";

import TrainerMatchCard from "../../../components/matching/TrainerMatchCard";

const TrainerMatchesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [minimumScore, setMinimumScore] = useState(0);
  const [search, setSearch] = useState("");
  const [shortlisted, setShortlisted] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [{ requirement: req }, { trainers: trainerList }] =
          await Promise.all([
            requirementsApi.getById(id),
            trainersApi.getAll({ status: "ACTIVE", limit: 100 }),
          ]);

        if (isCancelled) return;

        setRequirement(normalizeRequirement(req));
        setTrainers(trainerList.map(normalizeTrainer));
      } catch (error) {
        console.error("Failed to load trainer matches:", error);

        if (!isCancelled) {
          setLoadError(
            error?.response?.data?.message ||
              "Failed to load this requirement's trainer matches.",
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

    return rankTrainers(trainers, requirement);
  }, [requirement, trainers]);

  const filteredTrainers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rankedTrainers.filter((trainer) => {
      const matchesScore = trainer.match.score >= minimumScore;

      const matchesSearch =
        !query ||
        trainer.name.toLowerCase().includes(query) ||
        trainer.city?.toLowerCase().includes(query) ||
        trainer.skills?.some((skill) => skill.toLowerCase().includes(query));

      return matchesScore && matchesSearch;
    });
  }, [rankedTrainers, minimumScore, search]);

  const toggleShortlist = (trainerId) => {
    setShortlisted((previous) => {
      if (previous.includes(trainerId)) {
        return previous.filter((existingId) => existingId !== trainerId);
      }

      return [...previous, trainerId];
    });
  };

  const continueToOutreach = async () => {
    if (!shortlisted.length) return;

    setSubmitting(true);

    try {
      await Promise.all(
        shortlisted.map((trainerId) =>
          outreachApi.upsert({
            requirementId: id,
            trainerId,
            outreachStatus: "NOT_CONTACTED",
          }),
        ),
      );

      navigate(`/admin/requirements/${id}/outreach`);
    } catch (error) {
      console.error("Failed to shortlist trainers:", error);

      alert("Could not shortlist the selected trainers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="relative mx-auto max-w-6xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

        <button
          type="button"
          onClick={() => navigate(`/admin/requirements/${id}`)}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Requirement</span>
        </button>

        <div className="relative flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-white/20 bg-white/60 p-8 backdrop-blur-xl shadow-2xl shadow-slate-200/40">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-xl opacity-30 animate-pulse" />
            <FiSearch className="relative h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">
            Loading trainer matches…
          </p>
        </div>
      </div>
    );
  }

  // ---------- Error State ----------
  if (loadError || !requirement) {
    return (
      <div className="relative mx-auto max-w-3xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/30 to-pink-100/30 blur-3xl" />

        <button
          type="button"
          onClick={() => navigate(`/admin/requirements/${id}`)}
          className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
        >
          <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to Requirement</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-red-200/80 bg-white/80 p-8 text-center backdrop-blur-sm shadow-lg shadow-red-100/20">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-red-100/70 p-2.5">
              <FiSearch size={28} className="text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load matches
              </h2>
              <p className="mt-1 text-sm text-red-700">
                {loadError || "Requirement not found."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-red-100/80 px-5 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200/80 hover:shadow-md active:scale-95"
            >
              Try Again
            </button>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-300 to-red-500/60" />
        </div>
      </div>
    );
  }

  const excellentMatches = rankedTrainers.filter(
    (trainer) => trainer.match.score >= 80,
  ).length;

  // ---------- Main Render ----------
  return (
    <div className="relative mx-auto max-w-6xl animate-fade-in-up px-4 py-8 sm:px-6 lg:px-8">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-100/30 to-purple-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-100/20 to-pink-100/20 blur-3xl" />

      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(`/admin/requirements/${requirement.id}`)}
        className="group mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-all duration-200 hover:text-slate-900"
      >
        <FiArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
        <span>Back to Requirement</span>
      </button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 backdrop-blur-xl shadow-2xl shadow-slate-200/40 transition-all duration-300 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 backdrop-blur-sm dark:bg-blue-900/30 dark:text-blue-300">
              <FiSearch className="h-3 w-3" />
              Trainer Matching
            </div>

            <h1 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-white dark:to-slate-300 sm:text-3xl">
              {requirement.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {requirement.vendorName} • {requirement.city} • {requirement.mode}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {requirement.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-blue-50/80 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur-sm dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Trainers" value={rankedTrainers.length} />
            <Stat label="80%+ Match" value={excellentMatches} />
            <Stat label="Shortlisted" value={shortlisted.length} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-30" />
      </div>

      {/* Explanation */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-blue-200/70 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-800/30 dark:bg-blue-900/20">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
          How matching works
        </p>
        <p className="mt-1 text-sm leading-6 text-blue-700 dark:text-blue-300/80">
          Trainers are automatically ranked using skills, location, experience,
          budget, training mode and availability.
        </p>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-300 to-cyan-400 opacity-30" />
      </div>

      {/* Filters */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trainer, city or skill..."
              className="w-full rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2.5 pl-10 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-md dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-white dark:focus:bg-slate-800"
            />
          </div>

          <div className="relative min-w-[160px]">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={minimumScore}
              onChange={(e) => setMinimumScore(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-slate-200/60 bg-white/70 px-4 py-2.5 pl-10 pr-8 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:shadow-md dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-white dark:focus:bg-slate-800"
            >
              <option value={0}>All Matches</option>
              <option value={45}>45%+ Match</option>
              <option value={65}>65%+ Match</option>
              <option value={80}>80%+ Match</option>
            </select>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-20" />
      </div>

      {/* Results */}
      <div className="mt-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recommended Trainers
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredTrainers.length} trainers found, ranked by suitability.
            </p>
          </div>

          {shortlisted.length > 0 && (
            <button
              type="button"
              disabled={submitting}
              onClick={continueToOutreach}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-xl hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <FiCheckCircle className="h-4 w-4" />
              {submitting
                ? "Starting outreach…"
                : `Continue with ${shortlisted.length}`}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {filteredTrainers.map((trainer) => (
            <TrainerMatchCard
              key={trainer.id}
              trainer={trainer}
              shortlisted={shortlisted.includes(trainer.id)}
              onShortlist={toggleShortlist}
            />
          ))}

          {!filteredTrainers.length && (
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-12 text-center backdrop-blur-sm shadow-xl shadow-slate-200/30 dark:bg-slate-800/30">
              <div className="rounded-full bg-slate-100/80 p-3 dark:bg-slate-700/30">
                <FiSearch size={28} className="mx-auto text-slate-400" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
                No matching trainers
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Try reducing the minimum match score or changing the search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="min-w-[80px] rounded-xl bg-white/70 px-4 py-3 text-center backdrop-blur-sm transition hover:bg-white/90 dark:bg-slate-800/50 dark:hover:bg-slate-800/70">
    <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
      {label}
    </p>
  </div>
);

export default TrainerMatchesPage;
