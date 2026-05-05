import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getPendingValidations(params = {}) {
  const res = await axios.get(`${API_URL}/api/admin/validations/pending`, {
    params,
    withCredentials: true,
  });

  return res.data.data;
}

export async function getPendingValidationsCount() {
  const res = await axios.get(`${API_URL}/api/admin/validations/pending-count`, {
    withCredentials: true,
  });

  return res.data.data;
}

export async function getValidationDetails(validationId) {
  const res = await axios.get(`${API_URL}/api/admin/validations/${validationId}`, {
    withCredentials: true,
  });

  return res.data.data;
}

export async function approveValidation(validationId) {
  const res = await axios.patch(
    `${API_URL}/api/admin/validations/${validationId}/approve`,
    {},
    { withCredentials: true }
  );

  return res.data;
}

export async function rejectValidation(validationId, payload) {
  const res = await axios.patch(
    `${API_URL}/api/admin/validations/${validationId}/reject`,
    payload,
    { withCredentials: true }
  );

  return res.data;
}

export async function requestValidationChanges(validationId, payload) {
  const res = await axios.patch(
    `${API_URL}/api/admin/validations/${validationId}/request-changes`,
    payload,
    { withCredentials: true }
  );

  return res.data;
}