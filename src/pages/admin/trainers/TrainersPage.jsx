import { useMemo, useState, useEffect } from "react";
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
  const [trainers, setTrainers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await trainersApi.getAll({
          limit: 100,
        });

        setTrainers((data.trainers || []).map(mapTrainerFromApi));
      } catch (error) {
        console.error(error);

        setError(error.response?.data?.message || "Unable to load trainers");
      } finally {
        setLoading(false);
      }
    };

    loadTrainers();
  }, []);
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const skills = useMemo(
    () => [...new Set(trainers.flatMap((trainer) => trainer.skills))].sort(),
    [],
  );

  const locations = useMemo(
    () => [...new Set(trainers.map((trainer) => trainer.city))].sort(),
    [],
  );

  const filteredTrainers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return trainers.filter((trainer) => {
      const matchesSearch =
        !searchValue ||
        trainer.name.toLowerCase().includes(searchValue) ||
        trainer.email.toLowerCase().includes(searchValue) ||
        trainer.phone.includes(searchValue) ||
        trainer.skills.some((item) => item.toLowerCase().includes(searchValue));

      const matchesSkill = !skill || trainer.skills.includes(skill);

      const matchesLocation = !location || trainer.city === location;

      const matchesAvailability =
        !availability || trainer.availability === availability;

      const matchesStatus = !status || trainer.status === status;

      return (
        matchesSearch &&
        matchesSkill &&
        matchesLocation &&
        matchesAvailability &&
        matchesStatus
      );
    });
  }, [search, skill, location, availability, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTrainers = filteredTrainers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  const resetFilters = () => {
    setSearch("");
    setSkill("");
    setLocation("");
    setAvailability("");
    setStatus("");
    setCurrentPage(1);
  };

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}

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

      {/* Statistics */}

      <TrainerStats trainers={trainers} />

      {/* Filters */}

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

      {/* Result count */}

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

      {/* Table */}

      <TrainerTable trainers={paginatedTrainers} />

      {/* Pagination */}

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
