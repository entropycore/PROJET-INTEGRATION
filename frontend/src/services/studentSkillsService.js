import api from "./api";

export const getMySkills = async () => {
  const response = await api.get("/students/me/skills");
  return response.data;
};

export const addSkill = async (data) => {
  const response = await api.post("/students/me/skills", data);
  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await api.delete(`/students/me/skills/${id}`);
  return response.data;
};

export const getSkillsCatalog = async (search = "") => {
  const response = await api.get(`/skills?search=${search}`);
  return response.data;
};

export const getSoftSkills = async () => {
  const response = await api.get("/student/soft-skills");
  return response.data;
};

export const addSoftSkill = async (data) => {
  const response = await api.post("/student/soft-skills", data);
  return response.data;
};

export const deleteSoftSkill = async (id) => {
  const response = await api.delete(`/student/soft-skills/${id}`);
  return response.data;
};
