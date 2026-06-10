import api from "./api";

export const getProfessionalDashboard = async () => {
  const response = await api.get("/professional/dashboard");
  return response.data.data;
};

export const getProfessionalProfile = async () => {
  const response = await api.get("/professional/profile");
  return response.data.data;
};

export const getProfessionalProfiles = async (params = {}) => {
  const response = await api.get("/professional/profiles", { params });
  return response.data.data;
};

export const createProfessionalRecommendation = async (data) => {
  const response = await api.post("/professional/recommendations", data);
  return response.data.data;
};
