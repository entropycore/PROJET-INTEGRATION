import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getBadges(params = {}) {
  const res = await axios.get(`${API_URL}/api/admin/badges`, {
    params,
    withCredentials: true,
  });

  return res.data.data;
}

export async function createBadge(payload) {
  const res = await axios.post(`${API_URL}/api/admin/badges`, payload, {
    withCredentials: true,
  });

  return res.data;
}

export async function updateBadge(id, payload) {
  const res = await axios.put(`${API_URL}/api/admin/badges/${id}`, payload, {
    withCredentials: true,
  });

  return res.data;
}

export async function deleteBadge(id) {
  const res = await axios.delete(`${API_URL}/api/admin/badges/${id}`, {
    withCredentials: true,
  });

  return res.data;
}