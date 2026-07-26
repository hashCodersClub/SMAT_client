import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

import VendorStats from "../../../components/admin/vendors/VendorStats";
import VendorFilters from "../../../components/admin/vendors/VendorFilters";
import VendorTable from "../../../components/admin/vendors/VendorTable";

import { vendors } from "../../../data/vendors";

const VendorsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const filteredVendors = useMemo(() => {
    const query = search.toLowerCase().trim();

    return vendors.filter((vendor) => {
      const matchesSearch =
        !query ||
        vendor.companyName.toLowerCase().includes(query) ||
        vendor.primaryContact.name.toLowerCase().includes(query) ||
        vendor.primaryContact.email.toLowerCase().includes(query) ||
        vendor.city.toLowerCase().includes(query);

      const matchesStatus = !status || vendor.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const resetFilters = () => {
    setSearch("");
    setStatus("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage companies and partners sending training requirements.
          </p>
        </div>

        <button
          onClick={() => navigate("/vendors/add")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FiPlus />
          Add Vendor
        </button>
      </div>

      <VendorStats vendors={vendors} />

      <VendorFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        resetFilters={resetFilters}
      />

      <div className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {filteredVendors.length}
        </span>{" "}
        vendors
      </div>

      <VendorTable vendors={filteredVendors} />
    </div>
  );
};

export default VendorsPage;
