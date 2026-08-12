import api from "./axios";

/*
|--------------------------------------------------------------------------
| Build Request Body
|--------------------------------------------------------------------------
|
| If `data` includes a logoFile (a real File object, added by
| CompanySettingsPage's file input), this builds a FormData payload
| instead of plain JSON:
|
| - "bankDetails" (object) gets JSON.stringify()'d — the backend parses
|   it back automatically for multipart requests (parseJsonIfString in
|   companySettings.controller.js).
| - Plain string fields are appended as-is.
| - logoFile -> "logo" field, the name the backend's
|   companySettingsUpload multer middleware expects.
|
| When no file is present, this returns the payload untouched as plain
| JSON — the common case (editing text fields only) is unaffected.
|--------------------------------------------------------------------------
*/

const buildSettingsRequestBody = (data = {}) => {
  const { logoFile, ...rest } = data;

  if (!logoFile) {
    return { body: rest, isFormData: false };
  }

  const formData = new FormData();

  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });

  formData.append("logo", logoFile);

  return { body: formData, isFormData: true };
};

const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };

const companySettingsApi = {
  /*
  |--------------------------------------------------------------------------
  | Get Company Settings
  |--------------------------------------------------------------------------
  */

  get: async () => {
    const response = await api.get("/company-settings");

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | Update Company Settings
  |--------------------------------------------------------------------------
  */

  update: async (data) => {
    const { body, isFormData } = buildSettingsRequestBody(data);

    const response = await api.patch(
      "/company-settings",
      body,
      isFormData ? multipartConfig : undefined,
    );

    return response.data;
  },
};

export default companySettingsApi;
