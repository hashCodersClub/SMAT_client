import api from "./axios";

/*
|--------------------------------------------------------------------------
| Build Request Body
|--------------------------------------------------------------------------
|
| If `data` includes a profilePhotoFile and/or resumeFile (real File
| objects, added by TrainerForm's file inputs), this builds a FormData
| payload instead of plain JSON:
|
| - Every array/object field gets JSON.stringify()'d (the backend parses
|   these back automatically for multipart requests - see
|   normalizeTrainerPayload/parseJsonIfString in trainer.controller.js).
| - Plain string/number/boolean fields are appended as-is.
| - profilePhotoFile -> "profilePhoto" field, resumeFile -> "resume" field
|   (these are the field names the backend's multer middleware expects).
|
| When neither file is present, this returns the payload untouched as
| plain JSON - the common case (editing text fields only) is unaffected.
|--------------------------------------------------------------------------
*/

const buildRequestBody = (data = {}) => {
  const { profilePhotoFile, resumeFile, ...rest } = data;

  if (!profilePhotoFile && !resumeFile) {
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

  if (profilePhotoFile) {
    formData.append("profilePhoto", profilePhotoFile);
  }

  if (resumeFile) {
    formData.append("resume", resumeFile);
  }

  return { body: formData, isFormData: true };
};

const multipartConfig = { headers: { "Content-Type": "multipart/form-data" } };

const trainersApi = {
  getAll: async (params = {}) => {
    const response = await api.get("/trainers", {
      params,
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trainers/${id}`);

    return response.data;
  },

  create: async (data) => {
    const { body, isFormData } = buildRequestBody(data);

    const response = await api.post(
      "/trainers",
      body,
      isFormData ? multipartConfig : undefined,
    );

    return response.data;
  },

  update: async (id, data) => {
    const { body, isFormData } = buildRequestBody(data);

    const response = await api.patch(
      `/trainers/${id}`,
      body,
      isFormData ? multipartConfig : undefined,
    );

    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/trainers/${id}`);

    return response.data;
  },
  /*
|--------------------------------------------------------------------------
| Trainer Self Profile
|--------------------------------------------------------------------------
*/

  getMyProfile: async () => {
    const response = await api.get("/trainers/me");

    return response.data;
  },

  updateMyProfile: async (payload) => {
    const { body, isFormData } = buildRequestBody(payload);

    const response = await api.patch(
      "/trainers/me",
      body,
      isFormData ? multipartConfig : undefined,
    );

    return response.data;
  },

  parseDocument: async (file) => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await api.post(
      "/trainers/parse-document",
      formData,
      multipartConfig,
    );

    return response.data;
  },
};

export default trainersApi;
