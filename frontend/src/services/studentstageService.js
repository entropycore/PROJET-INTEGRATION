import api from "./api";

// Routes utilisées par l'espace étudiant pour gérer les stages.

// get stages
export const getStudentStages = (params = {}) => {
  return api.get("/student/stages", { params });
};

// get available professor validators
export const getStudentValidators = () => {
  return api.get("/student/validators");
};

// get stage by id
export const getStudentStageById = (id) => {
  return api.get(`/student/stages/${id}`);
};

// create stage
export const createStudentStage = (data) => {
  return api.post("/student/stages", data);
};

// update stage
export const updateStudentStage = (id, data) => {
  return api.put(`/student/stages/${id}`, data);
};

// delete stage
export const deleteStudentStage = (id) => {
  return api.delete(`/student/stages/${id}`);
};

// submit validation
export const submitStudentStageValidation = (id) => {
  return api.post(`/student/stages/${id}/submit-validation`);
};

// change visibility
export const updateStudentStageVisibility = (id, visibility) => {
  return api.patch(`/student/stages/${id}/visibility`, { visibility });
};

// upload report
export const uploadStudentStageReport = (id, report) => {
  const formData = report instanceof FormData ? report : new FormData();

  if (!(report instanceof FormData) && report) {
    formData.append("report", report);
  }

  return api.post(`/student/stages/${id}/report`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// download report
export const downloadStudentStageReport = (id) => {
  return api.get(`/student/stages/${id}/report/download`, {
    responseType: "blob",
  });
};

// upload images
export const uploadStudentStageImages = (id, images = []) => {
  const formData = images instanceof FormData ? images : new FormData();

  if (!(images instanceof FormData)) {
    images.forEach((image) => {
      formData.append("images", image);
    });
  }

  return api.post(`/student/stages/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// get image content
export const getStudentStageImageContent = (id, mediaId) => {
  return api.get(`/student/stages/${id}/images/${mediaId}/content`, {
    responseType: "blob",
  });
};

// delete image
export const deleteStudentStageImage = (id, mediaId) => {
  return api.delete(`/student/stages/${id}/images/${mediaId}`);
};

// validation history
export const getStudentStageValidationHistory = (id) => {
  return api.get(`/student/stages/${id}/validation-history`);
};

// add technologies
export const addStudentStageTechnologies = (id, technologyIds) => {
  return api.post(`/student/stages/${id}/technologies`, { technologyIds });
};

// remove technology
export const removeStudentStageTechnology = (id, technologyId) => {
  return api.delete(`/student/stages/${id}/technologies/${technologyId}`);
};
