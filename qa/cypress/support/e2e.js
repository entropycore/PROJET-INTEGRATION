import "./commands";

const normalizeSpecPath = (value = "") => value.replace(/\\/g, "/");

const backendSpecNames = new Set([
  "cypress/e2e/Notifications.cy.js",
  "cypress/e2e/student/ActivityDetails.cy.js",
  "cypress/e2e/student/ActivityEdit.cy.js",
  "cypress/e2e/student/Badges.cy.js",
  "cypress/e2e/student/Dashboard.cy.js",
  "cypress/e2e/student/Github.cy.js",
  "cypress/e2e/student/RecommendationLetters.cy.js",
  "cypress/e2e/student/competances.cy.js",
  "cypress/e2e/student/Projects/ProjetEdit.cy.js",
  "cypress/e2e/student/stages/StageFormView.cy.js",
  "qa/cypress/e2e/Notifications.cy.js",
  "qa/cypress/e2e/student/ActivityDetails.cy.js",
  "qa/cypress/e2e/student/ActivityEdit.cy.js",
  "qa/cypress/e2e/student/Badges.cy.js",
  "qa/cypress/e2e/student/Dashboard.cy.js",
  "qa/cypress/e2e/student/Github.cy.js",
  "qa/cypress/e2e/student/RecommendationLetters.cy.js",
  "qa/cypress/e2e/student/competances.cy.js",
  "qa/cypress/e2e/student/Projects/ProjetEdit.cy.js",
  "qa/cypress/e2e/student/stages/StageFormView.cy.js",
]);

const backendTestTitlePatterns = [
  /vrai backend/i,
  /backend reel/i,
  /appelle le vrai backend/i,
  /soumet .*backend/i,
];

const csrfSpecNames = new Set([
  "cypress/e2e/Notifications.cy.js",
  "qa/cypress/e2e/Notifications.cy.js",
]);

const csrfTestTitlePatterns = [
  /appelle le vrai backend/i,
  /soumet/i,
  /cree/i,
  /crée/i,
  /creation/i,
  /création/i,
  /edition/i,
  /édition/i,
  /met a jour/i,
  /met à jour/i,
  /suppression/i,
  /supprime/i,
  /marque/i,
  /modifie/i,
  /change/i,
  /upload/i,
];

const testNeedsBackend = (test) => {
  const specPath = normalizeSpecPath(Cypress.spec.relative || "");
  const title = test?.fullTitle?.() || test?.title || "";

  if (backendSpecNames.has(specPath)) return true;

  return backendTestTitlePatterns.some((pattern) => pattern.test(title));
};

const testNeedsCsrf = (test) => {
  const specPath = normalizeSpecPath(Cypress.spec.relative || "");
  const title = test?.fullTitle?.() || test?.title || "";

  if (csrfSpecNames.has(specPath)) return true;

  return csrfTestTitlePatterns.some((pattern) => pattern.test(title));
};

beforeEach(function () {
  if (!testNeedsBackend(this.currentTest)) return;

  const cachedAvailability = Cypress.env("BACKEND_AVAILABLE");

  if (typeof cachedAvailability === "boolean") {
    if (!cachedAvailability) this.skip();
    return;
  }

  cy.task("isBackendAvailable").then((isAvailable) => {
    Cypress.env("BACKEND_AVAILABLE", isAvailable);

    if (!isAvailable) {
      Cypress.log({
        name: "backend",
        message: "API absente sur localhost:3000, test backend ignore",
      });
      this.skip();
    }
  });
});

beforeEach(function () {
  if (!testNeedsBackend(this.currentTest) || !testNeedsCsrf(this.currentTest)) {
    return;
  }

  const cachedAvailability = Cypress.env("CSRF_AVAILABLE");

  if (typeof cachedAvailability === "boolean") {
    if (!cachedAvailability) this.skip();
    return;
  }

  cy.task("isCsrfAvailable").then((isAvailable) => {
    Cypress.env("CSRF_AVAILABLE", isAvailable);

    if (!isAvailable) {
      Cypress.log({
        name: "csrf",
        message: "CSRF indisponible, test mutation/login ignore",
      });
      this.skip();
    }
  });
});
