import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getReports(params = {}) {
  const res = await axios.get(`${API_URL}/api/admin/reports`, {
    params,
    withCredentials: true,
  });

  return res.data.data;
}

export async function getPendingReportsCount() {
  const res = await axios.get(`${API_URL}/api/admin/reports/pending-count`, {
    withCredentials: true,
  });

  return res.data.data;
}

export async function getReportDetails(id) {
  const res = await axios.get(`${API_URL}/api/admin/reports/${id}`, {
    withCredentials: true,
  });

  return res.data.data;
}

export async function resolveReport(id) {
  const res = await axios.patch(
    `${API_URL}/api/admin/reports/${id}/resolve`,
    {},
    { withCredentials: true }
  );

  return res.data;
}

export async function rejectReport(id, payload) {
  const res = await axios.patch(
    `${API_URL}/api/admin/reports/${id}/reject`,
    payload,
    { withCredentials: true }
  );

  return res.data;
}

export async function deleteReportedTarget(id) {
  const res = await axios.delete(`${API_URL}/api/admin/reports/${id}/target`, {
    withCredentials: true,
  });

  return res.data;
}