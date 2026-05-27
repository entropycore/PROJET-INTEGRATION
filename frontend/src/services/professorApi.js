import api from "./api";

export const getProfessorDashboard = async () => {
  const response = await api.get("/professor/dashboard");
  return response.data.data;
};

export const getProfessorProfile = async () => {
  const response = await api.get("/professor/profile");
  return response.data.data;
};

export const getProfessorValidations = async (params = {}) => {
  const response = await api.get("/professor/validations", { params });
  return response.data.data;
};

export const getProfessorValidationStats = async () => {
  const response = await api.get("/professor/validations/stats");
  return response.data.data;
};

export const getProfessorValidationDetails = async (validation) => {
  const response = await api.get(
    `/professor/validations/${validation.targetType}/${validation.targetId}`,
  );

  return response.data.data;
};

export const approveProfessorValidation = async (validation, payload = {}) => {
  const response = await api.patch(
    `/professor/validations/${validation.targetType}/${validation.targetId}/approve`,
    payload,
  );

  return response.data.data;
};

export const rejectProfessorValidation = async (validation, payload = {}) => {
  const response = await api.patch(
    `/professor/validations/${validation.targetType}/${validation.targetId}/reject`,
    payload,
  );

  return response.data.data;
};

export const requestProfessorValidationChanges = async (
  validation,
  payload = {},
) => {
  const response = await api.patch(
    `/professor/validations/${validation.targetType}/${validation.targetId}/request-changes`,
    payload,
  );

  return response.data.data;
};
