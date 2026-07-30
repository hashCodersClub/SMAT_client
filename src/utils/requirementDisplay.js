export const getVendorName = (requirement) => {
  if (requirement?.vendorId && typeof requirement.vendorId === "object") {
    return (
      requirement.vendorId.companyName ||
      requirement.vendorId.name ||
      "Unknown Vendor"
    );
  }

  return requirement?.vendorName || "Unknown Vendor";
};

export const getVendorId = (requirement) => {
  if (requirement?.vendorId && typeof requirement.vendorId === "object") {
    return requirement.vendorId._id || "";
  }

  return requirement?.vendorId || "";
};

/*
|--------------------------------------------------------------------------
| Normalize Trainer
|--------------------------------------------------------------------------
|
| Backend trainers use `_id`. All of the matching/outreach UI (already
| written against the earlier dummy data) expects `id`. Every other field
| name already matches the Trainer model, so we only need to add `id`.
|
*/

export const normalizeTrainer = (trainer = {}) => ({
  ...trainer,
  id: trainer._id || trainer.id || "",
});

export const normalizeRequirement = (requirement = {}) => ({
  ...requirement,
  id: requirement._id || requirement.id || "",
  vendorName: getVendorName(requirement),
});
