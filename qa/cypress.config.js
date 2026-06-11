const { defineConfig } = require("cypress");
const crypto = require("crypto");
const http = require("http");
const https = require("https");

const base64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const signJwt = (payload, secret) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    iat: now,
    exp: now + 15 * 60,
    ...payload,
  };
  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(body),
  )}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(unsignedToken)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signature}`;
};

const isBackendAvailable = (apiBaseUrl) => {
  const healthUrl = new URL("/api/health", apiBaseUrl);
  return checkUrl(healthUrl);
};

const isCsrfAvailable = (apiBaseUrl) => {
  const csrfUrl = new URL("/api/auth/csrf-token", apiBaseUrl);
  return checkExactOkUrl(csrfUrl);
};

const isApiEndpointAvailable = (apiBaseUrl, path) => {
  const endpointUrl = new URL(path, apiBaseUrl);
  return checkApiEndpoint(endpointUrl);
};

const checkUrl = (url) => {
  const healthUrl = url instanceof URL ? url : new URL(url);
  const client = healthUrl.protocol === "https:" ? https : http;

  return new Promise((resolve) => {
    const request = client.get(
      healthUrl,
      {
        timeout: 2000,
      },
      (response) => {
        response.resume();
        resolve(response.statusCode >= 200 && response.statusCode < 500);
      },
    );

    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });

    request.on("error", () => {
      resolve(false);
    });
  });
};

const checkExactOkUrl = (url) => {
  const healthUrl = url instanceof URL ? url : new URL(url);
  const client = healthUrl.protocol === "https:" ? https : http;

  return new Promise((resolve) => {
    const request = client.get(
      healthUrl,
      {
        timeout: 2000,
      },
      (response) => {
        response.resume();
        resolve(response.statusCode === 200);
      },
    );

    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });

    request.on("error", () => {
      resolve(false);
    });
  });
};

const checkApiEndpoint = (url) => {
  const endpointUrl = url instanceof URL ? url : new URL(url);
  const client = endpointUrl.protocol === "https:" ? https : http;

  return new Promise((resolve) => {
    const request = client.get(
      endpointUrl,
      {
        timeout: 2000,
      },
      (response) => {
        response.resume();
        resolve(response.statusCode !== 404 && response.statusCode < 500);
      },
    );

    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });

    request.on("error", () => {
      resolve(false);
    });
  });
};

module.exports = defineConfig({
  allowCypressEnv: true,

  e2e: {
    baseUrl: "http://localhost:5173",
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      on("task", {
        signAccessToken(payload) {
          return signJwt(payload, config.env.ACCESS_TOKEN_SECRET);
        },
        isBackendAvailable(apiBaseUrl = config.env.API_BASE_URL) {
          return isBackendAvailable(apiBaseUrl);
        },
        isCsrfAvailable(apiBaseUrl = config.env.API_BASE_URL) {
          return isCsrfAvailable(apiBaseUrl);
        },
        areApiEndpointsAvailable(paths, apiBaseUrl = config.env.API_BASE_URL) {
          return Promise.all(
            paths.map((path) => isApiEndpointAvailable(apiBaseUrl, path)),
          ).then((results) =>
            paths.reduce((availability, path, index) => {
              availability[path] = results[index];
              return availability;
            }, {}),
          );
        },
      });
      return config;
    },
    env: {
      API_BASE_URL: "http://localhost:3000",
      ADMIN_EMAIL: "admin@credencia.ma",
      ADMIN_PASSWORD: "Password123!",
      E2E_EMAIL: "etudiant@credencia.ma",
      E2E_PASSWORD: "Password123!",
      E2E_PROF_EMAIL: "professeur@credencia.ma",
      E2E_PROF_PASSWORD: "Password123!",
      E2E_STAGE_ID: "",
      E2E_PROJECT_ID: "",
      E2E_EDIT_STAGE_ID: "",
      E2E_EDIT_PROJECT_ID: "",
      ACCESS_TOKEN_SECRET: "un_code_secret_tres_long_et_complexe_pour_access_2026!",
      DELAI_INTERFACE: 700,
      DELAI_SAISIE: 45,
    },
  },
});
