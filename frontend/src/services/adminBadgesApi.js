import api from "./api";

export async function getBadges(params = {}) {
  const res = await api.get("/admin/badges", {
    params,
  });

  return res.data.data;
}

export async function createBadge(payload) {
  const res = await api.post("/admin/badges", payload);

  return res.data;
}

export async function updateBadge(id, payload) {
  const res = await api.put(`/admin/badges/${id}`, payload);

  return res.data;
}

export async function deleteBadge(id) {
  const res = await api.delete(`/admin/badges/${id}`);

  return res.data;
}
