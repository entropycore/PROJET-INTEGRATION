import api from "./api";

export async function getPendingValidations(params = {}) {
  const res = await api.get("/admin/validations/pending", {
    params,
  });

  return res.data.data;
}

export async function getPendingValidationsCount() {
  const res = await api.get("/admin/validations/pending-count");

  return res.data.data;
}

export async function getValidationDetails(validationId) {
  const res = await api.get(`/admin/validations/${validationId}`);

  return res.data.data;
}

export async function approveValidation(validationId) {
  const res = await api.patch(`/admin/validations/${validationId}/approve`, {});

  return res.data;
}

export async function rejectValidation(validationId, payload) {
  const res = await api.patch(`/admin/validations/${validationId}/reject`, payload);

  return res.data;
}

export async function requestValidationChanges(validationId, payload) {
  const res = await api.patch(
    `/admin/validations/${validationId}/request-changes`,
    payload,
  );

  return res.data;
}
