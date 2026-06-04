import axios from "axios";
import { useAuthStore } from "../stores/auth";

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const apiBaseUrl = `${backendBaseUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const csrfApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const methodsWithCsrf = ["post", "put", "patch", "delete"];

const getCsrfToken = async () => {
  const response = await csrfApi.get("/auth/csrf-token");
  return response.data?.csrfToken;
};

api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();

  if (methodsWithCsrf.includes(method)) {
    const csrfToken = await getCsrfToken();

    if (csrfToken) {
      config.headers = config.headers || {};
      config.headers["x-csrf-token"] = csrfToken;
    }
  }

  return config;
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
