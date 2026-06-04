import api from "./api";

export const getSettings = () => api.get("/student/settings");

export const updatePassword = (payload) =>
  api.put("/student/settings/password", payload);

export const updatePrivacy = (payload) =>
  api.put("/student/settings/privacy", payload);

export const updateNotifications = (payload) =>
  api.put("/student/settings/notifications", payload);
