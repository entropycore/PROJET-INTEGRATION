import api from "./api";

export const getStudentRecommendations = (params = {}) => {
  return api.get("/student/recommendations", { params });
};

export const getRecommendationDetails = (id) => {
  return api.get(`/recommendations/${id}`);
};

export const updateRecommendationVisibility = (id, visibility) => {
  return api.patch(`/student/recommendations/${id}/visibility`, {
    visibility,
  });
};

export const updateRecommendationStatus = (id, status) => {
  return api.patch(`/student/recommendations/${id}/status`, {
    status,
  });
};

export const reportRecommendation = (id, reason) => {
  return api.post("/reports", {
    targetType: "RECOMMENDATION",
    targetId: id,
    reason,
  });
};

export const getStudentRecommendationsData = async (params = {}) => {
  const response = await getStudentRecommendations(params);
  const payload = response.data?.data ?? response.data;

  return {
    stats: {
      received: payload?.stats?.received || 0,
      pending: payload?.stats?.pending || 0,
      rejected: payload?.stats?.rejected || 0,
    },
    recommendations: payload?.recommendations || [],
  };
};
