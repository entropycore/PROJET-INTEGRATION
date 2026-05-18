import api from "./api";
import { studentDashboardMock } from "@/mockData/studentDashboard.mock";

export const getStudentDashboard = (params = {}) => {
  return api.get("/student/dashboard", { params });
};

export const getStudentCredibilityScore = () => {
  return api.get("/student/credibility-score");
};

export const getStudentCredibilityScoreDetails = () => {
  return api.get("/student/credibility-score/details");
};

export const getStudentProfileCompletion = () => {
  return api.get("/student/profile-completion");
};

export const getStudentTimeline = (params = {}) => {
  return api.get("/student/timeline", { params });
};

export const getStudentBadges = (params = {}) => {
  return api.get("/student/badges", { params });
};

export const getStudentUnreadNotifications = () => {
  return api.get("/notifications/me/unread");
};

export const getStudentDashboardData = async () => {
  try {
    const response = await getStudentDashboard({
      limitRecentProjects: 4,
      limitNotifications: 4,
    });

    return {
      ...studentDashboardMock,
      ...response.data.data,
    };
  } catch (error) {
    console.warn("Dashboard backend indisponible, utilisation du mock data.");
    return studentDashboardMock;
  }
};
