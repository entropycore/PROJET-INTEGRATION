import axios from "axios";
import { useAuthStore } from "../stores/auth";
const apiBaseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    const isLoginRequest = originalRequest?.url === "/auth/login";
    const isRefreshRequest = originalRequest?.url === "/auth/refresh-token";
    const isRegisterRequest = originalRequest?.url === "/auth/register";

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refresh-token");
        return api(originalRequest);
      } catch {
        authStore.clearAuthSession();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    if (
      error.response?.status === 403 &&
      !isLoginRequest &&
      !isRegisterRequest &&
      !isRefreshRequest
    ) {
      window.location.href = "/403";
    }

    return Promise.reject(error);
  },
);

export default api;
