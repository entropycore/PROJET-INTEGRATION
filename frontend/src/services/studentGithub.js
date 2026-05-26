import api from "./api";

export const connectGithub = () => {
  return api.get("/student/github/auth");
};

export const getGithubStats = () => {
  return api.get("/student/github/stats");
};

export const importGithubRepository = (data) => {
  return api.post("/student/github/import", data);
};
