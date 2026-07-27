import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiUpload,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import trainersApi from "../../../api/trainersApi";
import { mapTrainerFromApi } from "../../../utils/trainerAdapter";

import TrainerStats from "../../../components/admin/trainers/TrainerStats";
import TrainerFilters from "../../../components/admin/trainers/TrainerFilters";
import TrainerTable from "../../../components/admin/trainers/TrainerTable";

const ITEMS_PER_PAGE = 5;

const TrainersPage = () => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Data State
  |--------------------------------------------------------------------------
  */

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Filter State
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [status, setStatus] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const [currentPage, setCurrentPage] = useState(1);

  /*
  |--------------------------------------------------------------------------
  | Load Trainers
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await trainersApi.getAll({
          limit: 100,
        });

        console.log("Trainer API response:", data);

        const apiTrainers = Array.isArray(data?.trainers) ? data.trainers : [];

        const mappedTrainers = apiTrainers.map(mapTrainerFromApi);

        console.log("Mapped trainers:", mappedTrainers);

        setTrainers(mappedTrainers);
      } catch (error) {
        console.error("Failed to load trainers:", error);

        setError(error.response?.data?.message || "Unable to load trainers");

        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainers();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Available Skills
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | trainers must be in the dependency array because trainer data arrives
  | asynchronously after the first render.
  |
  */

  const skills = useMemo(() => {
    return [
      ...new Set(trainers.flatMap((trainer) => trainer.skills || [])),
    ].sort();
  }, [trainers]);

  /*
  |--------------------------------------------------------------------------
  | Available Locations
  |--------------------------------------------------------------------------
  */

  const locations = useMemo(() => {
    return [
      ...new Set(trainers.map((trainer) => trainer.city).filter(Boolean)),
    ].sort();
  }, [trainers]);

  /*
  |--------------------------------------------------------------------------
  | Filter Trainers
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | trainers must also be in this dependency array.
  |
  | Previously this memo ran while trainers = [] and did not run again
  | after the API populated the trainers state.
  |
  */

  const filteredTrainers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return trainers.filter((trainer) => {
      const trainerName = trainer.name?.toLowerCase().trim() || "";

      const trainerEmail = trainer.email?.toLowerCase().trim() || "";

      const trainerPhone = String(trainer.phone || "").toLowerCase();

      const trainerCity = trainer.city || "";

      const trainerSkills = Array.isArray(trainer.skills) ? trainer.skills : [];

      /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

      const matchesSearch =
        !searchValue ||
        trainerName.includes(searchValue) ||
        trainerEmail.includes(searchValue) ||
        trainerPhone.includes(searchValue) ||
        trainerSkills.some((item) =>
          String(item).toLowerCase().includes(searchValue),
        );

      /*
        |--------------------------------------------------------------------------
        | Skill
        |--------------------------------------------------------------------------
        */

      const matchesSkill = !skill || trainerSkills.includes(skill);

      /*
        |--------------------------------------------------------------------------
        | Location
        |--------------------------------------------------------------------------
        */

      const matchesLocation = !location || trainerCity === location;

      /*
        |--------------------------------------------------------------------------
        | Availability
        |--------------------------------------------------------------------------
        */

      const matchesAvailability =
        !availability || trainer.availability === availability;

      /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

      const matchesStatus = !status || trainer.status === status;

      return (
        matchesSearch &&
        matchesSkill &&
        matchesLocation &&
        matchesAvailability &&
        matchesStatus
      );
    });
  }, [trainers, search, skill, location, availability, status]);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTrainers = filteredTrainers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,

    safeCurrentPage * ITEMS_PER_PAGE,
  );

  /*
  |--------------------------------------------------------------------------
  | Reset Filters
  |--------------------------------------------------------------------------
  */

  const resetFilters = () => {
    setSearch("");
    setSkill("");
    setLocation("");
    setAvailability("");
    setStatus("");
    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Update Filter
  |--------------------------------------------------------------------------
  */

  const updateFilter = (setter) => (value) => {
    setter(value);

    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="space-y-6">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trainers</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your trainer network, skills, rates and availability.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <FiUpload />
            Import CSV
          </button>

          <button
            type="button"
            onClick={() => navigate("/trainers/add")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <FiPlus />
            Add Trainer
          </button>
        </div>
      </div>

      {/* ================================================================
          ERROR
      ================================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">{error}</p>
        </div>
      )}

      {/* ================================================================
          STATISTICS
      ================================================================= */}

      <TrainerStats trainers={trainers} />

      {/* ================================================================
          FILTERS
      ================================================================= */}

      <TrainerFilters
        search={search}
        setSearch={updateFilter(setSearch)}
        skill={skill}
        setSkill={updateFilter(setSkill)}
        location={location}
        setLocation={updateFilter(setLocation)}
        availability={availability}
        setAvailability={updateFilter(setAvailability)}
        status={status}
        setStatus={updateFilter(setStatus)}
        skills={skills}
        locations={locations}
        resetFilters={resetFilters}
      />

      {/* ================================================================
          RESULT COUNT
      ================================================================= */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {paginatedTrainers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {filteredTrainers.length}
          </span>{" "}
          trainers
        </p>
      </div>

      {/* ================================================================
          TABLE
      ================================================================= */}

      <TrainerTable trainers={paginatedTrainers} />

      {/* ================================================================
          PAGINATION
      ================================================================= */}

      {filteredTrainers.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Page {safeCurrentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft />
              Previous
            </button>

            <button
              type="button"
              disabled={safeCurrentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainersPage;
