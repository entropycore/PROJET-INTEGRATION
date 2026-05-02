import { defineConfig } from "cypress";

export default defineConfig({
  allowCypressEnv: true,

  e2e: {
    baseUrl: 'http://localhost:5173', // URL du frontend local
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
