import api from "./api";
import { studentPortfolioMock } from "@/mockData/studentPortfolio.mock";

const GENERATED_PORTFOLIO_CONFIG_KEY = "student.generatedPortfolioConfig";

export const getMyPortfolio = () => {
  return api.get("/portfolios/me");
};

export const getStudentPortfolioConfig = () => {
  return api.get("/student/portfolio/config");
};

export const getStudentPortfolioPreview = () => {
  return api.get("/student/portfolio/preview");
};

export const getStudentPortfolioPublicPreview = () => {
  return api.get("/student/portfolio/public-preview");
};

export const generateStudentPortfolio = (data) => {
  return api.post("/student/portfolio/generate", data);
};

export const regenerateStudentPortfolio = (data = {}) => {
  return api.post("/student/portfolio/regenerate", data);
};

export const publishMyPortfolio = () => {
  return api.post("/portfolios/me/publish");
};

export const exportMyPortfolioPdf = () => {
  return api.get("/portfolios/me/export-pdf");
};

export const createPortfolioShareLink = (data = {}) => {
  return api.post("/portfolios/me/share-link", data);
};

export const saveGeneratedPortfolioConfig = (config) => {
  localStorage.setItem(GENERATED_PORTFOLIO_CONFIG_KEY, JSON.stringify(config));
};

export const getGeneratedPortfolioConfig = () => {
  const storedConfig = localStorage.getItem(GENERATED_PORTFOLIO_CONFIG_KEY);

  if (!storedConfig) return null;

  try {
    return JSON.parse(storedConfig);
  } catch {
    localStorage.removeItem(GENERATED_PORTFOLIO_CONFIG_KEY);
    return null;
  }
};

export const getStudentPortfolioData = async () => {
  try {
    const response = await getStudentPortfolioPreview();

    return response.data?.data || response.data;
  } catch (error) {
    console.warn("Portfolio backend indisponible, utilisation du mock data.");
    return studentPortfolioMock;
  }
};
