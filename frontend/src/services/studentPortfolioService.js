import api from "./api";
import { studentPortfolioMock } from "@/mockData/studentPortfolio.mock";

const extractPortfolioData = (response) => response.data?.data || response.data;

export const getStudentPortfolioPreview = () => {
  return api.get("/student/portfolio/preview");
};

export const generateStudentPortfolio = (data) => {
  return api.post("/student/portfolio/generate", data);
};

export const getPublicPortfolioBySlug = (slug) => {
  return api.get(`/portfolio/${slug}`, {
    skipForbiddenRedirect: true,
  });
};

export const getStudentPortfolioData = async () => {
  try {
    const response = await getStudentPortfolioPreview();
    return extractPortfolioData(response);
  } catch (error) {
    console.warn("Backend portfolio indisponible, utilisation du mock.", error);
    return studentPortfolioMock;
  }
};

export const getPublicPortfolioData = async (slug) => {
  try {
    const response = await getPublicPortfolioBySlug(slug);
    return extractPortfolioData(response);
  } catch (error) {
    console.warn("Portfolio public indisponible, utilisation du mock.", error);
    return studentPortfolioMock;
  }
};
