import { useMemo, useState } from "react";
import {
  FiBriefcase,
  FiCalendar,
  FiDollarSign,
  FiEye,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { assignments } from "../../../data/assignments";

const statusStyles = {
  UPCOMING: "bg-blue-50 text-blue-700",
  ONGOING: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const AssignmentsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesSearch =
        !query ||
        assignment.title.toLowerCase().includes(query) ||
        assignment.trainerName.toLowerCase().includes(query) ||
        assignment.vendorName.toLowerCase().includes(query);

      const matchesStatus = !status || assignment.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const totalRevenue = assignments.reduce(
    (sum, assignment) => sum + assignment.vendorBilling,
    0,
  );

  const totalProfit = assignments.reduce(
    (sum, assignment) => sum + assignment.expectedProfit,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assignments</h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage confirmed trainer engagements and training delivery.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={FiBriefcase}
          label="Assignments"
          value={assignments.length}
        />

        <Stat
          icon={FiCalendar}
          label="Ongoing"
          value={assignments.filter((a) => a.status === "ONGOING").length}
        />

        <Stat
          icon={FiDollarSign}
          label="Expected Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
        />

        <Stat
          icon={FiDollarSign}
          label="Expected Profit"
          value={`₹${totalProfit.toLocaleString("en-IN")}`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assignment, trainer or vendor..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none"
          >
            <option value="">All Status</option>

            <option value="UPCOMING">Upcoming</option>

            <option value="ONGOING">Ongoing</option>

            <option value="COMPLETED">Completed</option>

            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  "Assignment",
                  "Trainer",
                  "Vendor",
                  "Schedule",
                  "Financial",
                  "Status",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {assignment.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {assignment.id}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FiUser className="text-slate-400" />

                      {assignment.trainerName}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {assignment.vendorName}
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm text-slate-700">
                      {assignment.startDate}
                    </p>

                    <p className="text-xs text-slate-400">
                      to {assignment.endDate}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-700">
                      ₹{assignment.vendorBilling.toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs font-medium text-emerald-600">
                      + ₹{assignment.expectedProfit.toLocaleString("en-IN")}{" "}
                      profit
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[assignment.status]
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <FiEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>

        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>

      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
        <Icon />
      </div>
    </div>
  </div>
);

export default AssignmentsPage;
