const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const buildBackendUrl = (url) => {
  if (!url) return "";

  const value = String(url);

  if (/^(https?:|data:|blob:)/i.test(value)) {
    return value;
  }

  const normalizedBase = apiBaseUrl.replace(/\/$/, "");

  if (!normalizedBase) {
    return value;
  }

  return `${normalizedBase}${value.startsWith("/") ? value : `/${value}`}`;
};
