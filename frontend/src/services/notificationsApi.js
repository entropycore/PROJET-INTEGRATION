import api from "./api";

const normalizeBaseApi = (baseApi = "") => {
  const normalizedBaseApi = String(baseApi || "").replace(/\/$/, "");
  return normalizedBaseApi.startsWith("/api")
    ? normalizedBaseApi.slice(4) || "/"
    : normalizedBaseApi;
};

export async function getNotifications(baseApi, params = {}) {
  const res = await api.get(`${normalizeBaseApi(baseApi)}/notifications`, {
    params,
  });

  return res.data.data;
}

export async function getUnreadCount(baseApi) {
  const res = await api.get(
    `${normalizeBaseApi(baseApi)}/notifications/unread-count`,
  );

  return res.data.data;
}

export async function markAsRead(baseApi, id) {
  await api.patch(`${normalizeBaseApi(baseApi)}/notifications/${id}/read`, {});
}

export async function markAllAsRead(baseApi) {
  await api.patch(`${normalizeBaseApi(baseApi)}/notifications/read-all`, {});
}

export async function deleteNotif(baseApi, id) {
  await api.delete(`${normalizeBaseApi(baseApi)}/notifications/${id}`);
}
