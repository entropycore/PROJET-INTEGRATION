import axios from "axios";
import { useAuthStore } from "../stores/auth";

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
const apiBaseUrl = `${backendBaseUrl.replace(/\/$/, "")}/api`;
const csrfClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

let csrfToken = null;
let csrfTokenRequest = null;

const getCsrfToken = async () => {
  if (csrfToken) return csrfToken;

  if (!csrfTokenRequest) {
    csrfTokenRequest = csrfClient
      .get("/auth/csrf-token")
      .then((response) => {
        csrfToken = response.data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfTokenRequest = null;
      });
  }

  return csrfTokenRequest;
};

const refreshCsrfToken = async () => {
  csrfToken = null;
  return getCsrfToken();
};

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  const url = config.url || "";
  const shouldRefreshBeforeAuth =
    method === "POST" &&
    ["/auth/login", "/auth/register", "/auth/logout"].includes(url);

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    config.headers = config.headers || {};
    config.headers["x-csrf-token"] = shouldRefreshBeforeAuth
      ? await refreshCsrfToken()
      : await getCsrfToken();
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
    const shouldSkipForbiddenRedirect =
      originalRequest?.skipForbiddenRedirect ||
      originalRequest?.headers?.["x-skip-forbidden-redirect"];

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
        csrfToken = null;
        return api(originalRequest);
      } catch {
        authStore.clearAuthSession();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    if (
      error.response?.status === 403 &&
      originalRequest &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      csrfToken = null;

      if (
        ["POST", "PUT", "PATCH", "DELETE"].includes(
          originalRequest.method?.toUpperCase(),
        )
      ) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["x-csrf-token"] = await getCsrfToken();
        return api(originalRequest);
      }
    }

    if (
      error.response?.status === 403 &&
      !isLoginRequest &&
      !isRegisterRequest &&
      !isRefreshRequest &&
      !shouldSkipForbiddenRedirect
    ) {
      window.location.href = "/403";
    }

    return Promise.reject(error);
  },
);

export default api;
