import { FiEye, FiEdit2, FiMapPin, FiPhone } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const VendorTable = ({ vendors }) => {
  const navigate = useNavigate();

  if (!vendors.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center">
        <h3 className="font-semibold text-slate-800">No vendors found</h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {[
                "Vendor",
                "Contact",
                "Location",
                "Requirements",
                "Assignments",
                "Status",
                "Actions",
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
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-800">
                    {vendor.companyName}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {vendor.id} • {vendor.companyType}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-slate-700">
                    {vendor.primaryContact.name}
                  </p>

                  <p className="text-xs text-slate-400">
                    {vendor.primaryContact.designation}
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <FiPhone />
                    {vendor.primaryContact.phone}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <FiMapPin />
                    {vendor.city}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-700">
                    {vendor.totalRequirements}
                  </p>

                  <p className="text-xs text-slate-400">
                    {vendor.activeRequirements} active
                  </p>
                </td>

                <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                  {vendor.completedAssignments}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      vendor.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {vendor.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <FiEye />
                    </button>

                    <button
                      onClick={() => navigate(`/vendors/${vendor.id}/edit`)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorTable;
