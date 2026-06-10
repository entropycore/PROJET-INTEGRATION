import api from "./api";

const normalizeAuthor = (author = {}) => ({
  ...author,
  fullName: author.fullName || author.name || "Auteur non renseigné",
  department: author.department || "",
  specialty: author.specialty || author.role || "",
});

const normalizeLetter = (letter) => ({
  ...letter,
  author: normalizeAuthor(letter.author),
  letterContent: letter.letterContent || letter.content || "",
  requestMessage: letter.requestMessage || letter.content || "",
});

export const getStudentRecommendationLetters = async (params = {}) => {
  const response = await api.get("/student/recommendation-letters", {
    params,
  });
  const payload = response.data?.data || response.data;

  return (payload.recommendationLetters || []).map(normalizeLetter);
};

export const updateStudentRecommendationLetterVisibility = async (
  id,
  visibility,
) => {
  const response = await api.patch(
    `/student/recommendation-letters/${id}/visibility`,
    { visibility },
  );

  return normalizeLetter(response.data?.data || response.data);
};

export const updateStudentRecommendationLetterDownloadable = async (
  id,
  downloadable,
) => {
  const response = await api.patch(
    `/student/recommendation-letters/${id}/downloadable`,
    { downloadable },
  );

  return normalizeLetter(response.data?.data || response.data);
};
