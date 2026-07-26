import { useMemo, useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiFilter, FiSearch } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import { requirements } from "../../../data/requirements";
import { trainers } from "../../../data/trainers";

import { rankTrainers } from "../../../utils/trainerMatching";

import TrainerMatchCard from "../../../components/matching/TrainerMatchCard";

const TrainerMatchesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const requirement = requirements.find((item) => item.id === id);

  const [minimumScore, setMinimumScore] = useState(0);

  const [search, setSearch] = useState("");

  const [shortlisted, setShortlisted] = useState([]);

  const rankedTrainers = useMemo(() => {
    if (!requirement) return [];

    return rankTrainers(trainers, requirement);
  }, [requirement]);

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
        return previous.filter((id) => id !== trainerId);
      }

      return [...previous, trainerId];
    });
  };

  if (!requirement) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        Requirement not found.
      </div>
    );
  }

  const excellentMatches = rankedTrainers.filter(
    (trainer) => trainer.match.score >= 80,
  ).length;

  return (
    <div className="space-y-6">
      {/* Back */}

      <button
        type="button"
        onClick={() => navigate(`/requirements/${requirement.id}`)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FiArrowLeft />
        Back to Requirement
      </button>

      {/* Header */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <FiSearch />
              TRAINER MATCHING
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              {requirement.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {requirement.vendorName} • {requirement.city} • {requirement.mode}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {requirement.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
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
      </div>

      {/* Explanation */}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <p className="text-sm font-semibold text-blue-900">
          How matching works
        </p>

        <p className="mt-1 text-sm leading-6 text-blue-700">
          Trainers are automatically ranked using skills, location, experience,
          budget, training mode and availability.
        </p>
      </div>

      {/* Filters */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trainer, city or skill..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <select
              value={minimumScore}
              onChange={(e) => setMinimumScore(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-8 text-sm outline-none focus:border-blue-500"
            >
              <option value={0}>All Matches</option>

              <option value={45}>45%+ Match</option>

              <option value={65}>65%+ Match</option>

              <option value={80}>80%+ Match</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Recommended Trainers</h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredTrainers.length} trainers found, ranked by suitability.
            </p>
          </div>

          {shortlisted.length > 0 && (
            <button
              type="button"
              onClick={() => {
                console.log("Shortlisted:", shortlisted);
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <FiCheckCircle />
              Continue with {shortlisted.length}
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
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <FiSearch size={28} className="mx-auto text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-800">
                No matching trainers
              </h3>

              <p className="mt-1 text-sm text-slate-500">
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
  <div className="min-w-[90px] rounded-xl bg-slate-50 px-4 py-3 text-center">
    <p className="text-xl font-bold text-slate-900">{value}</p>

    <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>
  </div>
);

export default TrainerMatchesPage;
