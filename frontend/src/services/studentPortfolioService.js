import api from "./api";

const extractPortfolioData = (response) => response.data?.data || response.data;

export const getStudentPortfolioPreview = () => {
  return api.get("/student/portfolio/preview");
};

export const generateStudentPortfolio = (data) => {
  return api.post("/student/portfolio/generate", data);
};

export const getPublicPortfolioBySlug = (slug) => {
  return api.get(`/portfolio/${slug}`);
};

export const getStudentPortfolioData = async () => {
  const response = await getStudentPortfolioPreview();

  return extractPortfolioData(response);
};

export const getPublicPortfolioData = async (slug) => {
  const response = await getPublicPortfolioBySlug(slug);

  return extractPortfolioData(response);
};
