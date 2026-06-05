const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: true,

  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "qa/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "qa/cypress/support/e2e.js",
    fixturesFolder: "qa/cypress/fixtures",
    screenshotsFolder: "qa/cypress/screenshots",
    videosFolder: "qa/cypress/videos",
    defaultCommandTimeout: 8000,
    pageLoadTimeout: 30000,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      return config;
    },
    env: {
      API_BASE_URL: "http://localhost:3000",
      DELAI_INTERFACE: 700,
      DELAI_SAISIE: 45,
    },
  },
});
