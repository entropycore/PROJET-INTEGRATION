import api from "./api";

export const getStudentActivities = (params = {}) => {
  return api.get("/student/activities", { params });
};

export const getStudentActivityById = (activityId) => {
  return api.get(`/student/activities/${activityId}`);
};

export const createStudentActivity = (data) => {
  return api.post("/student/activities", data);
};

export const updateStudentActivity = (activityId, data) => {
  return api.put(`/student/activities/${activityId}`, data);
};

export const deleteStudentActivity = (activityId) => {
  return api.delete(`/student/activities/${activityId}`);
};

export const submitStudentActivityValidation = (activityId) => {
  return api.post(`/student/activities/${activityId}/submit-validation`);
};

export const uploadStudentActivityCertificate = (activityId, certificate) => {
  const formData = certificate instanceof FormData ? certificate : new FormData();

  if (!(certificate instanceof FormData) && certificate) {
    formData.append("certificate", certificate);
  }

  return api.post(`/student/activities/${activityId}/certificate`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const downloadStudentActivityCertificate = (activityId) => {
  return api.get(`/student/activities/${activityId}/certificate/download`, {
    responseType: "blob",
  });
};

export const getStudentActivityCertificateDownloadUrl = (activityId) => {
  return `/student/activities/${activityId}/certificate/download`;
};
