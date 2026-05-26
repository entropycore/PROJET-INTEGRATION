import api from "./api";

export async function getReports(params = {}) {
  const res = await api.get("/admin/reports", {
    params,
  });

  return res.data.data;
}

export async function getPendingReportsCount() {
  const res = await api.get("/admin/reports/pending-count");

  return res.data.data;
}

export async function getReportDetails(id) {
  const res = await api.get(`/admin/reports/${id}`);

  return res.data.data;
}

export async function resolveReport(id) {
  const res = await api.patch(`/admin/reports/${id}/resolve`, {});

  return res.data;
}

export async function rejectReport(id, payload) {
  const res = await api.patch(`/admin/reports/${id}/reject`, payload);

  return res.data;
}

export async function deleteReportedTarget(id) {
  const res = await api.delete(`/admin/reports/${id}/target`);

  return res.data;
}
