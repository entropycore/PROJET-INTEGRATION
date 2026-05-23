import api from "./api";

export const getStudentProjects = (params = {}) => {
  return api.get("/projects/me", { params });
};

export const getStudentProjectById = (id) => {
  return api.get(`/projects/${id}`);
};

export const createStudentProject = (data) => {
  return api.post("/projects", data);
};

export const updateStudentProject = (id, data) => {
  return api.put(`/projects/${id}`, data);
};

export const submitStudentProject = (id) => {
  return api.patch(`/projects/${id}/submit`);
};

export const deleteStudentProject = (id) => {
  return api.delete(`/projects/${id}`);
};
export const uploadStudentProjectMedia = (projectId, files = {}) => {
  const formData = new FormData();

  files.screenshots?.forEach((file) => {
    formData.append("screenshots", file);
  });

  files.attachments?.forEach((file) => {
    formData.append("attachments", file);
  });

  return api.post(`/projects/${projectId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteStudentProjectMedia = (projectId, mediaId) => {
  return api.delete(`/projects/${projectId}/media/${mediaId}`);
};