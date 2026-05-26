import api from "./api";
import { studentRecommendationsMock } from "@/mockData/studentRecommendations.mock";

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
  try {
    const response = await getStudentRecommendations(params);
    const payload = response.data?.data ?? response.data;

    return {
      ...studentRecommendationsMock,
      ...payload,
      stats: {
        ...studentRecommendationsMock.stats,
        ...(payload?.stats || {}),
      },
      recommendations:
        payload?.recommendations || studentRecommendationsMock.recommendations,
    };
  } catch (error) {
    console.warn("Mock recommendations utilisé.");
    return studentRecommendationsMock;
  }
};
