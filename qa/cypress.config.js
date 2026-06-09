const { defineConfig } = require("cypress");
const crypto = require("crypto");

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
      });
      return config;
    },
    env: {
      API_BASE_URL: "http://localhost:3000",
      ADMIN_EMAIL: "admin@credencia.ma",
      ADMIN_PASSWORD: "Password123!",
      E2E_EMAIL: "student.test@ensat.ma",
      E2E_PASSWORD: "PasswordValid123!",
      E2E_PROF_EMAIL: "professor.test@ensat.ma",
      E2E_PROF_PASSWORD: "PasswordValid123!",
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
