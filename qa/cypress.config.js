const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: true,

  e2e: {
    baseUrl: 'http://localhost:5173', // URL du frontend
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      API_BASE_URL: 'http://localhost:3000', // URL du backend en développement
    },
  },
});
