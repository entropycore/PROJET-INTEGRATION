import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function getNotifications(baseApi, params = {}) {
  const res = await axios.get(`${API_URL}${baseApi}/notifications`, {
    params,
    withCredentials: true,
  });

  return res.data.data;
}

export async function getUnreadCount(baseApi) {
  const res = await axios.get(
    `${API_URL}${baseApi}/notifications/unread-count`,
    {
      withCredentials: true,
    }
  );

  return res.data.data;
}

export async function markAsRead(baseApi, id) {
  await axios.patch(
    `${API_URL}${baseApi}/notifications/${id}/read`,
    {},
    {
      withCredentials: true,
    }
  );
}

export async function markAllAsRead(baseApi) {
  await axios.patch(
    `${API_URL}${baseApi}/notifications/read-all`,
    {},
    {
      withCredentials: true,
    }
  );
}

export async function deleteNotif(baseApi, id) {
  await axios.delete(`${API_URL}${baseApi}/notifications/${id}`, {
    withCredentials: true,
  });
}