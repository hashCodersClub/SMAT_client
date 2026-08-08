import api from "./axios";

/*
|--------------------------------------------------------------------------
| Build Request Body (Self-Service Profile)
|--------------------------------------------------------------------------
|
| If `data` includes a logoFile (a real File object, added by
| VendorProfilePage's file input), this builds a FormData payload instead
| of plain JSON:
|
| - "contacts" (array) gets JSON.stringify()'d — the backend parses it
|   back automatically for multipart requests (parseJsonIfString in
|   vendor.controller.js).
| - Plain string fields are appended as-is.
| - logoFile -> "logo" field, the name the backend's vendorUpload
|   multer middleware expects.
|
| When no file is present, this returns the payload untouched as plain
| JSON — the common case (editing text fields only) is unaffected.
|--------------------------------------------------------------------------
*/

const buildProfileRequestBody = (data = {}) => {
  const { logoFile, ...rest } = data;

  if (!logoFile) {
    return { body: rest, isFormData: false };
  }

  const formData = new FormData();

  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  formData.append("logo", logoFile);

  return { body: formData, isFormData: true };
};

const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };

const vendorsApi = {
  /*
  |--------------------------------------------------------------------------
  | Get Vendors
  |--------------------------------------------------------------------------
  */

  getAll: async (params = {}) => {
    const response = await api.get("/vendors", {
      params,
    });

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Get Vendor By ID
  |--------------------------------------------------------------------------
  */

  getById: async (id) => {
    const response = await api.get(`/vendors/${id}`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Create Vendor
  |--------------------------------------------------------------------------
  */

  create: async (data) => {
    const response = await api.post("/vendors", data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Vendor
  |--------------------------------------------------------------------------
  */

  update: async (id, data) => {
    const response = await api.patch(`/vendors/${id}`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Vendor
  |--------------------------------------------------------------------------
  */

  delete: async (id) => {
    const response = await api.delete(`/vendors/${id}`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Get My Vendor Profile (Self-Service)
  |--------------------------------------------------------------------------
  */

  getMyProfile: async () => {
    const response = await api.get("/vendors/me");

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update My Vendor Profile (Self-Service)
  |--------------------------------------------------------------------------
  */

  updateMyProfile: async (data) => {
    const { body, isFormData } = buildProfileRequestBody(data);

    const response = await api.patch(
      "/vendors/me",
      body,
      isFormData ? multipartConfig : undefined,
    );

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Get Vendor Portal Users
  |--------------------------------------------------------------------------
  */

  getUsers: async (vendorId) => {
    const response = await api.get(`/vendors/${vendorId}/users`);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Create Vendor Portal User
  |--------------------------------------------------------------------------
  */

  createUser: async (vendorId, data) => {
    const response = await api.post(`/vendors/${vendorId}/users`, data);

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Vendor Portal User Status
  |--------------------------------------------------------------------------
  */

  updateUserStatus: async (vendorId, userId, isActive) => {
    const response = await api.patch(
      `/vendors/${vendorId}/users/${userId}/status`,
      { isActive },
    );

    return response.data;
  },
};

export default vendorsApi;
