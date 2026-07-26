import { useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMoreVertical,
  FiMail,
  FiPhone,
} from "react-icons/fi";

// ---------- Custom Half-Star Component ----------
const HalfStar = () => (
  <span className="relative inline-block w-3.5 h-3.5">
    {/* Empty background star */}
    <FiStar className="absolute inset-0 text-slate-600" />
    {/* Half-filled star – clipped to 50% width */}
    <span className="absolute inset-0 overflow-hidden w-1/2">
      <FiStar className="text-blue-400 fill-blue-400" />
    </span>
  </span>
);
// ------------------------------------------------

// Mock data
const trainers = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav.sharma@trainers.com",
    phone: "+91 98765 43210",
    skills: ["Python", "Data Analytics", "Power BI"],
    status: "Available",
    rating: 4.8,
    assignments: 3,
    location: "Mumbai",
    avatar: "AS",
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya.patel@trainers.com",
    phone: "+91 98765 43211",
    skills: ["Java", "Spring Boot", "Microservices"],
    status: "Busy",
    rating: 4.5,
    assignments: 5,
    location: "Bangalore",
    avatar: "PP",
  },
  {
    id: 3,
    name: "Rahul Gupta",
    email: "rahul.gupta@trainers.com",
    phone: "+91 98765 43212",
    skills: ["React", "Node.js", "TypeScript"],
    status: "Available",
    rating: 4.9,
    assignments: 2,
    location: "Delhi",
    avatar: "RG",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    email: "sneha.reddy@trainers.com",
    phone: "+91 98765 43213",
    skills: ["AWS", "DevOps", "Kubernetes"],
    status: "On Leave",
    rating: 4.7,
    assignments: 1,
    location: "Hyderabad",
    avatar: "SR",
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@trainers.com",
    phone: "+91 98765 43214",
    skills: ["Data Science", "R", "Machine Learning"],
    status: "Available",
    rating: 4.6,
    assignments: 4,
    location: "Pune",
    avatar: "VS",
  },
  {
    id: 6,
    name: "Ananya Desai",
    email: "ananya.desai@trainers.com",
    phone: "+91 98765 43215",
    skills: ["Flutter", "iOS", "Android"],
    status: "Busy",
    rating: 4.4,
    assignments: 6,
    location: "Chennai",
    avatar: "AD",
  },
];

const statusColors = {
  Available: "from-emerald-500 to-teal-400",
  Busy: "from-amber-500 to-orange-400",
  "On Leave": "from-red-500 to-pink-400",
};

const statusIcons = {
  Available: FiCheckCircle,
  Busy: FiClock,
  "On Leave": FiXCircle,
};

const TrainersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSkill, setFilterSkill] = useState("All");

  // Extract all unique skills
  const allSkills = [
    "All",
    ...new Set(trainers.flatMap((t) => t.skills)),
  ].sort();

  // Filter logic
  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.skills.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesStatus =
      filterStatus === "All" || trainer.status === filterStatus;
    const matchesSkill =
      filterSkill === "All" || trainer.skills.includes(filterSkill);
    return matchesSearch && matchesStatus && matchesSkill;
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Trainers
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your trainer pool here.
          </p>
        </div>
        <div className="mt-3 flex gap-3 sm:mt-0">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
            <FiDownload size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50">
            <FiPlus size={16} />
            Add Trainer
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Total Trainers</p>
          <p className="text-xl font-bold text-white">{trainers.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Available</p>
          <p className="text-xl font-bold text-emerald-400">
            {trainers.filter((t) => t.status === "Available").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Busy</p>
          <p className="text-xl font-bold text-amber-400">
            {trainers.filter((t) => t.status === "Busy").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">On Leave</p>
          <p className="text-xl font-bold text-rose-400">
            {trainers.filter((t) => t.status === "On Leave").length}
          </p>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          {["All", "Available", "Busy", "On Leave"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterStatus === status
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30"
                  : "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {status}
            </button>
          ))}
          {/* Skill filter dropdown */}
          <select
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          >
            {allSkills.map((skill) => (
              <option key={skill} value={skill} className="bg-slate-900">
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trainers grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredTrainers.length > 0 ? (
          filteredTrainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
            <p className="text-slate-400">No trainers match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs text-slate-400">
          Showing {filteredTrainers.length} of {trainers.length} trainers
        </p>
        <div className="flex gap-1">
          <button className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10">
            Previous
          </button>
          <button className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 text-sm font-medium text-white">
            1
          </button>
          <button className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10">
            2
          </button>
          <button className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10">
            3
          </button>
          <button className="rounded-lg px-3 py-1 text-sm text-slate-400 transition hover:bg-white/10">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// Trainer Card Component
const TrainerCard = ({ trainer }) => {
  const StatusIcon = statusIcons[trainer.status] || FiClock;
  const statusColor =
    statusColors[trainer.status] || "from-gray-500 to-gray-400";

  // --- Updated renderStars (no FiStarHalf) ---
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FiStar key={i} size={14} className="fill-blue-400 text-blue-400" />,
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(<HalfStar key={i} />);
      } else {
        stars.push(<FiStar key={i} size={14} className="text-slate-600" />);
      }
    }
    return stars;
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-semibold text-white shadow-lg shadow-blue-500/30">
          {trainer.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-white group-hover:text-blue-200">
                {trainer.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`rounded-full bg-gradient-to-r ${statusColor} px-2 py-0.5 text-xs font-medium text-white shadow-lg shadow-blue-500/20`}
                >
                  {trainer.status}
                </span>
                <span className="text-xs text-slate-400">
                  {trainer.assignments} assignments
                </span>
              </div>
            </div>
            <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <FiMoreVertical size={16} />
            </button>
          </div>

          {/* Skills */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {trainer.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300"
              >
                {skill}
              </span>
            ))}
            {trainer.skills.length > 3 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                +{trainer.skills.length - 3}
              </span>
            )}
          </div>

          {/* Rating and location */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderStars(trainer.rating)}
              <span className="ml-1 text-xs text-slate-400">
                {trainer.rating}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{trainer.location}</span>
            </div>
          </div>

          {/* Contact actions */}
          <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
            <button className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white">
              <FiMail size={14} />
              Email
            </button>
            <button className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/10 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white">
              <FiPhone size={14} />
              Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainersPage;
