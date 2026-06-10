import api from "./api";

export const getProfessionalDashboard = async () => {
  const response = await api.get("/professional/dashboard");
  return response.data.data;
};

export const getProfessionalProfile = async () => {
  const response = await api.get("/professional/profile");
  return response.data.data;
};

export const updateProfessionalProfile = async (payload) => {
  const response = await api.put("/professional/profile", payload);
  return response.data.data;
};

export const uploadProfessionalProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append("profilePicture", file);

  const response = await api.post("/professional/profile-picture", formData);
  return response.data.data;
};

export const getProfessionalProfiles = async (params = {}) => {
  const response = await api.get("/professional/profiles", { params });
  return response.data.data;
};
