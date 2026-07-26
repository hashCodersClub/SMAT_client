import { useState } from "react";
import {
  FiSearch,
  FiPlus,
  FiDownload,
  FiMail,
  FiPhone,
  FiMoreVertical,
  FiStar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

// ---------- Custom Half-Star Component ----------
const HalfStar = () => (
  <span className="relative inline-block w-3.5 h-3.5">
    <FiStar className="absolute inset-0 text-slate-600" />
    <span className="absolute inset-0 overflow-hidden w-1/2">
      <FiStar className="text-blue-400 fill-blue-400" />
    </span>
  </span>
);
// ------------------------------------------------

// Mock data
const vendors = [
  {
    id: 1,
    name: "ABC Training Solutions",
    contact: "Ramesh Kumar",
    email: "ramesh@abctraining.com",
    phone: "+91 98765 43001",
    services: ["Python", "Data Analytics", "Power BI"],
    status: "Active",
    rating: 4.7,
    assignments: 8,
    location: "Noida",
    avatar: "AT",
  },
  {
    id: 2,
    name: "XYZ Technologies",
    contact: "Sneha Iyer",
    email: "sneha@xyztech.com",
    phone: "+91 98765 43002",
    services: ["Java", "Spring Boot", "Microservices"],
    status: "Active",
    rating: 4.5,
    assignments: 6,
    location: "Gurgaon",
    avatar: "XT",
  },
  {
    id: 3,
    name: "Tech Learning Pvt Ltd",
    contact: "Vikram Rao",
    email: "vikram@techlearn.com",
    phone: "+91 98765 43003",
    services: ["React", "Node.js", "TypeScript"],
    status: "Pending",
    rating: 4.2,
    assignments: 3,
    location: "Delhi",
    avatar: "TL",
  },
  {
    id: 4,
    name: "CloudGuru Inc.",
    contact: "Priya Sharma",
    email: "priya@cloudguru.com",
    phone: "+91 98765 43004",
    services: ["AWS", "DevOps", "Kubernetes"],
    status: "Active",
    rating: 4.9,
    assignments: 10,
    location: "Bangalore",
    avatar: "CG",
  },
  {
    id: 5,
    name: "AppMasters",
    contact: "Arjun Reddy",
    email: "arjun@appmasters.com",
    phone: "+91 98765 43005",
    services: ["Flutter", "iOS", "Android"],
    status: "Inactive",
    rating: 4.0,
    assignments: 1,
    location: "Hyderabad",
    avatar: "AM",
  },
  {
    id: 6,
    name: "AnalyticsHub",
    contact: "Neha Patel",
    email: "neha@analyticshub.com",
    phone: "+91 98765 43006",
    services: ["Data Science", "R", "Machine Learning"],
    status: "Active",
    rating: 4.6,
    assignments: 5,
    location: "Pune",
    avatar: "AH",
  },
];

const statusColors = {
  Active: "from-emerald-500 to-teal-400",
  Inactive: "from-gray-500 to-slate-400",
  Pending: "from-amber-500 to-orange-400",
};

const statusIcons = {
  Active: FiCheckCircle,
  Inactive: FiXCircle,
  Pending: FiClock,
};

const VendorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterService, setFilterService] = useState("All");

  // Extract unique services
  const allServices = [
    "All",
    ...new Set(vendors.flatMap((v) => v.services)),
  ].sort();

  // Filter logic
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.services.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesStatus =
      filterStatus === "All" || vendor.status === filterStatus;
    const matchesService =
      filterService === "All" || vendor.services.includes(filterService);
    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Vendors
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage vendor companies here.
          </p>
        </div>
        <div className="mt-3 flex gap-3 sm:mt-0">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
            <FiDownload size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/50">
            <FiPlus size={16} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Total Vendors</p>
          <p className="text-xl font-bold text-white">{vendors.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Active</p>
          <p className="text-xl font-bold text-emerald-400">
            {vendors.filter((v) => v.status === "Active").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Pending</p>
          <p className="text-xl font-bold text-amber-400">
            {vendors.filter((v) => v.status === "Pending").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          <p className="text-xs text-slate-400">Inactive</p>
          <p className="text-xl font-bold text-slate-400">
            {vendors.filter((v) => v.status === "Inactive").length}
          </p>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by vendor, contact or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          {["All", "Active", "Pending", "Inactive"].map((status) => (
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
          {/* Service filter dropdown */}
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 outline-none transition-all focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          >
            {allServices.map((service) => (
              <option key={service} value={service} className="bg-slate-900">
                {service}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendors grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
            <p className="text-slate-400">No vendors match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs text-slate-400">
          Showing {filteredVendors.length} of {vendors.length} vendors
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

// Vendor Card Component
const VendorCard = ({ vendor }) => {
  const StatusIcon = statusIcons[vendor.status] || FiClock;
  const statusColor =
    statusColors[vendor.status] || "from-gray-500 to-gray-400";

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
        {/* Avatar (company initial) */}
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-semibold text-white shadow-lg shadow-blue-500/30">
          {vendor.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-white group-hover:text-blue-200">
                {vendor.name}
              </h3>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`rounded-full bg-gradient-to-r ${statusColor} px-2 py-0.5 text-xs font-medium text-white shadow-lg shadow-blue-500/20`}
                >
                  {vendor.status}
                </span>
                <span className="text-xs text-slate-400">
                  {vendor.assignments} assignments
                </span>
              </div>
            </div>
            <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white">
              <FiMoreVertical size={16} />
            </button>
          </div>

          {/* Contact info */}
          <div className="mt-1 text-sm text-slate-400">
            <p>Contact: {vendor.contact}</p>
          </div>

          {/* Services */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {vendor.services.slice(0, 3).map((service) => (
              <span
                key={service}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300"
              >
                {service}
              </span>
            ))}
            {vendor.services.length > 3 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                +{vendor.services.length - 3}
              </span>
            )}
          </div>

          {/* Rating and location */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {renderStars(vendor.rating)}
              <span className="ml-1 text-xs text-slate-400">
                {vendor.rating}
              </span>
            </div>
            <div className="text-xs text-slate-400">{vendor.location}</div>
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

export default VendorsPage;
