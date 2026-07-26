import { FiEye, FiEdit2, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

import { useNavigate } from "react-router-dom";

/* ==========================================================================
   FORMAT COMPANY TYPE
============================================================================ */

const formatCompanyType = (value = "") => {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

/* ==========================================================================
   VENDOR TABLE
============================================================================ */

const VendorTable = ({ vendors = [] }) => {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | Empty State
  |--------------------------------------------------------------------------
  */

  if (!vendors.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-14 text-center shadow-sm">
        <h3 className="font-semibold text-slate-900">No vendors found</h3>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          {/* ==============================================================
              HEADER
          ============================================================== */}

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {[
                "Vendor",
                "Primary Contact",
                "Location",
                "Requirements",
                "Assignments",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-600"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          {/* ==============================================================
              BODY
          ============================================================== */}

          <tbody className="divide-y divide-slate-100">
            {vendors.map((vendor) => {
              /*
              |--------------------------------------------------------------------------
              | Find Primary Contact
              |--------------------------------------------------------------------------
              */

              const primaryContact =
                vendor.contacts?.find((contact) => contact.isPrimary) ||
                vendor.contacts?.[0] ||
                null;

              return (
                <tr key={vendor._id} className="transition hover:bg-slate-50">
                  {/* Vendor */}

                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {vendor.companyName || "Unnamed Vendor"}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {formatCompanyType(vendor.companyType)}
                    </p>

                    {vendor.gstNumber && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        GST: {vendor.gstNumber}
                      </p>
                    )}
                  </td>

                  {/* Contact */}

                  <td className="px-5 py-4">
                    {primaryContact ? (
                      <>
                        <p className="text-sm font-semibold text-slate-800">
                          {primaryContact.name || "—"}
                        </p>

                        {primaryContact.designation && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {primaryContact.designation}
                          </p>
                        )}

                        {primaryContact.phone && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
                            <FiPhone size={12} />

                            {primaryContact.phone}
                          </p>
                        )}

                        {primaryContact.email && (
                          <p className="mt-1 flex max-w-[210px] items-center gap-1.5 truncate text-xs text-slate-500">
                            <FiMail size={12} className="shrink-0" />

                            <span className="truncate">
                              {primaryContact.email}
                            </span>
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-slate-400">No contact</span>
                    )}
                  </td>

                  {/* Location */}

                  <td className="px-5 py-4">
                    <div className="flex items-start gap-1.5 text-sm font-medium text-slate-700">
                      <FiMapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div>
                        <p>{vendor.city || "—"}</p>

                        {(vendor.state || vendor.country) && (
                          <p className="mt-0.5 text-xs font-normal text-slate-500">
                            {[vendor.state, vendor.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Requirements */}

                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      {vendor.totalRequirements ?? 0}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">total</p>
                  </td>

                  {/* Assignments */}

                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      {vendor.totalAssignments ?? 0}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">total</p>
                  </td>

                  {/* Status */}

                  <td className="px-5 py-4">
                    <VendorStatus status={vendor.status} />
                  </td>

                  {/* Actions */}

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="View vendor"
                        onClick={() => navigate(`/vendors/${vendor._id}`)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <FiEye size={17} />
                      </button>

                      <button
                        type="button"
                        title="Edit vendor"
                        onClick={() => navigate(`/vendors/${vendor._id}/edit`)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ==========================================================================
   STATUS
============================================================================ */

const VendorStatus = ({ status }) => {
  const styles = {
    ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",

    INACTIVE: "border-slate-200 bg-slate-100 text-slate-600",

    BLOCKED: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
};

export default VendorTable;
