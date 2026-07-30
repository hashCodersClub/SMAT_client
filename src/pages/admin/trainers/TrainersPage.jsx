import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiUpload,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiUser,
  FiCheckCircle,
  FiClock,
  FiX,
  FiEdit,
  FiTrash2,
  FiMail,
  FiPhone,
  FiMoreVertical,
  FiStar,
} from "react-icons/fi";

import trainersApi from "../../../api/trainersApi";
import { mapTrainerFromApi } from "../../../utils/trainerAdapter";

// ---------- Custom Half-Star Component ----------
const HalfStar = () => (
  <span className="relative inline-block h-3.5 w-3.5">
    <FiStar className="absolute inset-0 text-slate-300 dark:text-slate-600" />
    <span className="absolute inset-0 w-1/2 overflow-hidden">
      <FiStar className="fill-amber-400 text-amber-400" />
    </span>
  </span>
);

// ------------------------------------------------

const ITEMS_PER_PAGE = 5;

const TrainersPage = () => {
  const navigate = useNavigate();

  // ---------- Data State ----------
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // ---------- Filter State ----------
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("");
  const [status, setStatus] = useState("");

  // ---------- Pagination ----------
  const [currentPage, setCurrentPage] = useState(1);

  // ---------- Load Trainers ----------
  useEffect(() => {
    const loadTrainers = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await trainersApi.getAll({ limit: 100 });
        const apiTrainers = Array.isArray(data?.trainers) ? data.trainers : [];
        const mappedTrainers = apiTrainers.map(mapTrainerFromApi);
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

  // ---------- Delete Trainer ----------
  const handleDeleteTrainer = async (trainerId) => {
    const confirmed = window.confirm(
      "Delete this trainer? This cannot be undone.",
    );
    if (!confirmed) return;
    try {
      setDeletingId(trainerId);
      setError("");
      await trainersApi.remove(trainerId);
      setTrainers((prev) => prev.filter((t) => t.id !== trainerId));
    } catch (err) {
      console.error("Failed to delete trainer:", err);
      setError(err.response?.data?.message || "Unable to delete trainer.");
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- Derived Data ----------
  const skills = useMemo(
    () => [...new Set(trainers.flatMap((t) => t.skills || []))].sort(),
    [trainers],
  );
  const locations = useMemo(
    () => [...new Set(trainers.map((t) => t.city).filter(Boolean))].sort(),
    [trainers],
  );

  // ---------- Filtering ----------
  const filteredTrainers = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return trainers.filter((trainer) => {
      const name = (trainer.name || "").toLowerCase();
      const email = (trainer.email || "").toLowerCase();
      const phone = String(trainer.phone || "").toLowerCase();
      const trainerSkills = trainer.skills || [];
      const city = trainer.city || "";

      const matchesSearch =
        !searchLower ||
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        trainerSkills.some((s) => s.toLowerCase().includes(searchLower));

      const matchesSkill = !skill || trainerSkills.includes(skill);
      const matchesLocation = !location || city === location;
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
  }, [trainers, search, skill, location, availability, status]);

  // ---------- Pagination ----------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTrainers.length / ITEMS_PER_PAGE),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTrainers = filteredTrainers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  // ---------- Filter Setters ----------
  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSkill("");
    setLocation("");
    setAvailability("");
    setStatus("");
    setCurrentPage(1);
  };

  // KPI card click handlers (apply filters)
  const handleSelectAvailability = (value) =>
    setAvailability((prev) => (prev === value ? "" : value));
  const handleSelectStatus = (value) =>
    setStatus((prev) => (prev === value ? "" : value));

  // ---------- Assign Trainer ----------
  const handleAssignTrainer = (trainer) => {
    navigate(`/admin/requirements?assignTrainerId=${trainer.id}`);
  };

  // ---------- Loading State ----------
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-4 w-80 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
        <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="space-y-8">
      {/* ============================================================
          PAGE HEADER
      ============================================================ */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trainers
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Find, verify and assign trainers to requirements.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 dark:text-slate-200">
            <FiUpload className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => navigate("/admin/trainers/add")}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50 hover:shadow-xl active:scale-95"
          >
            <FiPlus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            <span>Add Trainer</span>
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        </div>
      </div>

      {/* ============================================================
          ERROR MESSAGE
      ============================================================ */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 backdrop-blur-sm">
          <FiX className="h-5 w-5 text-rose-500" />
          <p className="text-sm font-medium text-rose-500">{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto text-rose-500/70 hover:text-rose-500"
          >
            <FiXCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ============================================================
          KPI STATS CARDS (clickable)
      ============================================================ */}
      <TrainerStats
        trainers={trainers}
        availability={availability}
        status={status}
        onSelectAvailability={handleSelectAvailability}
        onSelectStatus={handleSelectStatus}
        onShowAll={resetFilters}
      />

      {/* ============================================================
          SEARCH & FILTER BAR
      ============================================================ */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 p-4 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone, skill..."
            value={search}
            onChange={(e) => updateFilter(setSearch)(e.target.value)}
            className="w-full rounded-xl border border-slate-200/20 bg-white/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/80 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-slate-500 dark:focus:bg-white/10"
          />
          {search && (
            <button
              onClick={() => updateFilter(setSearch)("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
            >
              <FiXCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Skill filter */}
          <select
            value={skill}
            onChange={(e) => updateFilter(setSkill)(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-slate-400"
          >
            <option value="">All Skills</option>
            {skills.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-slate-800">
                {s}
              </option>
            ))}
          </select>

          {/* Location filter */}
          <select
            value={location}
            onChange={(e) => updateFilter(setLocation)(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-500 outline-none transition-all focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 dark:bg-white/5 dark:text-slate-400"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option
                key={loc}
                value={loc}
                className="bg-white dark:bg-slate-800"
              >
                {loc}
              </option>
            ))}
          </select>

          {/* Clear filters */}
          {(search || skill || location || availability || status) && (
            <button
              onClick={resetFilters}
              className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:bg-rose-500/20"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          RESULT COUNT
      ============================================================ */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Showing {paginatedTrainers.length} of {filteredTrainers.length}{" "}
          trainers
        </span>
        <span className="text-xs">Total: {trainers.length} trainers</span>
      </div>

      {/* ============================================================
          TRAINER TABLE
      ============================================================ */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/20 dark:border-white/5 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">Trainer</th>
                <th className="px-4 py-3 hidden sm:table-cell">Skills</th>
                <th className="px-4 py-3 hidden md:table-cell">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Rating</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/20 dark:divide-white/5">
              {paginatedTrainers.length > 0 ? (
                paginatedTrainers.map((trainer) => (
                  <TrainerRow
                    key={trainer.id}
                    trainer={trainer}
                    onDelete={handleDeleteTrainer}
                    deletingId={deletingId}
                    onAssign={handleAssignTrainer}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    <FiXCircle className="mx-auto h-8 w-8 mb-2 text-slate-400" />
                    No trainers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================
          PAGINATION
      ============================================================ */}
      {filteredTrainers.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 px-4 py-3 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {safeCurrentPage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-400"
            >
              <FiChevronLeft className="inline mr-1 h-3 w-3" />
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
                  safeCurrentPage === page
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 scale-105"
                    : "text-slate-500 hover:bg-white/10 dark:text-slate-400"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-400"
            >
              Next
              <FiChevronRight className="inline ml-1 h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// COMPONENT: Trainer Stats (KPI Cards)
// ============================================================

const TrainerStats = ({
  trainers,
  availability,
  status,
  onSelectAvailability,
  onSelectStatus,
  onShowAll,
}) => {
  const total = trainers.length;
  const available = trainers.filter(
    (t) => t.availability === "Available",
  ).length;
  const busy = trainers.filter((t) => t.status === "Busy").length;
  const onLeave = trainers.filter((t) => t.status === "On Leave").length;

  const stats = [
    {
      label: "Total Trainers",
      value: total,
      trend: "+5 this month",
      trendUp: true,
      color: "from-indigo-500 to-blue-400",
      icon: FiUser,
      onClick: onShowAll,
      active: !availability && !status,
    },
    {
      label: "Available",
      value: available,
      trend: "+2 this week",
      trendUp: true,
      color: "from-emerald-500 to-teal-400",
      icon: FiCheckCircle,
      onClick: () => onSelectAvailability("Available"),
      active: availability === "Available",
    },
    {
      label: "Busy",
      value: busy,
      trend: "-1 from yesterday",
      trendUp: false,
      color: "from-amber-500 to-orange-400",
      icon: FiClock,
      onClick: () => onSelectStatus("Busy"),
      active: status === "Busy",
    },
    {
      label: "On Leave",
      value: onLeave,
      trend: "0 change",
      trendUp: null,
      color: "from-rose-500 to-pink-400",
      icon: FiXCircle,
      onClick: () => onSelectStatus("On Leave"),
      active: status === "On Leave",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isActive = stat.active;

        return (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className={`group relative overflow-hidden rounded-2xl border p-6 text-left shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
              isActive
                ? `border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 shadow-indigo-500/10 dark:shadow-indigo-500/10`
                : `border-white/10 bg-white/70 backdrop-blur-xl dark:bg-slate-800/70 shadow-slate-200/50 dark:shadow-slate-900/50 hover:border-indigo-500/30 hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/10`
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div
              className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-20`}
            />

            <div className="relative flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              {stat.trend !== null && (
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    stat.trendUp
                      ? "bg-emerald-500/10 text-emerald-400 dark:bg-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 dark:bg-rose-500/20"
                  }`}
                >
                  {stat.trendUp ? (
                    <FiTrendingUp className="h-3 w-3" />
                  ) : (
                    <FiTrendingDown className="h-3 w-3" />
                  )}
                  {stat.trend}
                </span>
              )}
            </div>

            <p className="relative mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <h2 className="relative mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stat.value}
            </h2>

            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl bg-slate-100 dark:bg-slate-700">
              <div
                className={`h-full w-0 bg-gradient-to-r ${stat.color} transition-all duration-1000 group-hover:w-full ${
                  isActive ? "w-full" : ""
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================
// COMPONENT: Trainer Row (Table Row)
// ============================================================

const TrainerRow = ({ trainer, onDelete, deletingId, onAssign }) => {
  const [showMenu, setShowMenu] = useState(false);

  const renderStars = (rating) => {
    if (!rating) return <span className="text-slate-400">—</span>;
    const stars = [];
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(
          <FiStar
            key={i}
            size={14}
            className="fill-amber-400 text-amber-400"
          />,
        );
      } else if (i === full && hasHalf) {
        stars.push(<HalfStar key={i} />);
      } else {
        stars.push(
          <FiStar
            key={i}
            size={14}
            className="text-slate-300 dark:text-slate-600"
          />,
        );
      }
    }
    return stars;
  };

  const statusColor =
    trainer.status === "Available"
      ? "from-emerald-500 to-teal-400"
      : trainer.status === "Busy"
        ? "from-amber-500 to-orange-400"
        : "from-rose-500 to-pink-400";

  return (
    <tr className="group transition-all duration-300 hover:bg-slate-50/50 dark:hover:bg-white/5">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-blue-500/30">
            {trainer.avatar || trainer.name?.charAt(0) || "T"}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {trainer.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {trainer.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="flex flex-wrap gap-1">
          {(trainer.skills || []).slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-white/20 bg-white/30 px-2 py-0.5 text-xs text-slate-700 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              {skill}
            </span>
          ))}
          {(trainer.skills || []).length > 2 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              +{(trainer.skills || []).length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
        {trainer.city || "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${statusColor} px-2.5 py-0.5 text-xs font-medium text-white shadow-lg shadow-blue-500/20`}
        >
          {trainer.status}
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-1">
          {renderStars(trainer.rating)}
          {trainer.rating && (
            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
              {trainer.rating}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="relative flex items-center justify-end gap-1">
          <button
            onClick={() => onAssign(trainer)}
            className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-500/10"
            title="Assign to requirement"
          >
            <FiPlus size={16} />
          </button>
          <button
            onClick={() => navigate(`/admin/trainers/edit/${trainer.id}`)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100/50 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(trainer.id)}
            disabled={deletingId === trainer.id}
            className="rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-500/10 disabled:opacity-30"
          >
            <FiTrash2
              size={16}
              className={deletingId === trainer.id ? "animate-pulse" : ""}
            />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100/50 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FiMoreVertical size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-white shadow-xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1 z-10">
              <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                <FiMail size={14} /> Email
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                <FiPhone size={14} /> Call
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TrainersPage;
