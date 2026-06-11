import "./commands";

const normalizeSpecPath = (value = "") => value.replace(/\\/g, "/");

const backendSpecNames = new Set([
  "cypress/e2e/Notifications.cy.js",
  "cypress/e2e/student/Activities.cy.js",
  "cypress/e2e/student/ActivityCreate.cy.js",
  "cypress/e2e/student/ActivityDetails.cy.js",
  "cypress/e2e/student/ActivityEdit.cy.js",
  "cypress/e2e/student/Badges.cy.js",
  "cypress/e2e/student/Dashboard.cy.js",
  "cypress/e2e/student/Github.cy.js",
  "cypress/e2e/student/RecommendationLetters.cy.js",
  "cypress/e2e/student/Recommendations.cy.js",
  "cypress/e2e/student/competances.cy.js",
  "cypress/e2e/student/Projects/ProjectCreate.cy.js",
  "cypress/e2e/student/Projects/Projects.cy.js",
  "cypress/e2e/student/Projects/ProjetDetails.cy.js",
  "cypress/e2e/student/Projects/ProjetEdit.cy.js",
  "cypress/e2e/student/portfolio/PortfolioFullView.cy.js",
  "cypress/e2e/student/portfolio/PortfolioPreviewView.cy.js",
  "cypress/e2e/student/stages/StageDetailsView.cy.js",
  "cypress/e2e/student/stages/StageFormView.cy.js",
  "cypress/e2e/student/stages/StagesView.cy.js",
  "qa/cypress/e2e/Notifications.cy.js",
  "qa/cypress/e2e/student/Activities.cy.js",
  "qa/cypress/e2e/student/ActivityCreate.cy.js",
  "qa/cypress/e2e/student/ActivityDetails.cy.js",
  "qa/cypress/e2e/student/ActivityEdit.cy.js",
  "qa/cypress/e2e/student/Badges.cy.js",
  "qa/cypress/e2e/student/Dashboard.cy.js",
  "qa/cypress/e2e/student/Github.cy.js",
  "qa/cypress/e2e/student/RecommendationLetters.cy.js",
  "qa/cypress/e2e/student/Recommendations.cy.js",
  "qa/cypress/e2e/student/competances.cy.js",
  "qa/cypress/e2e/student/Projects/ProjectCreate.cy.js",
  "qa/cypress/e2e/student/Projects/Projects.cy.js",
  "qa/cypress/e2e/student/Projects/ProjetDetails.cy.js",
  "qa/cypress/e2e/student/Projects/ProjetEdit.cy.js",
  "qa/cypress/e2e/student/portfolio/PortfolioFullView.cy.js",
  "qa/cypress/e2e/student/portfolio/PortfolioPreviewView.cy.js",
  "qa/cypress/e2e/student/stages/StageDetailsView.cy.js",
  "qa/cypress/e2e/student/stages/StageFormView.cy.js",
  "qa/cypress/e2e/student/stages/StagesView.cy.js",
]);

const apiPathsBySpecName = {
  "cypress/e2e/Notifications.cy.js": ["/api/student/notifications"],
  "cypress/e2e/student/Activities.cy.js": ["/api/student/activities"],
  "cypress/e2e/student/ActivityCreate.cy.js": ["/api/student/activities"],
  "cypress/e2e/student/ActivityDetails.cy.js": ["/api/student/activities"],
  "cypress/e2e/student/ActivityEdit.cy.js": ["/api/student/activities"],
  "cypress/e2e/student/Badges.cy.js": ["/api/student/badges"],
  "cypress/e2e/student/Dashboard.cy.js": ["/api/student/dashboard"],
  "cypress/e2e/student/Github.cy.js": ["/api/student/github/stats"],
  "cypress/e2e/student/RecommendationLetters.cy.js": ["/api/student/recommendation-letters"],
  "cypress/e2e/student/Recommendations.cy.js": ["/api/student/recommendations"],
  "cypress/e2e/student/competances.cy.js": ["/api/student/me/skills", "/api/student/soft-skills"],
  "cypress/e2e/student/Projects/ProjectCreate.cy.js": ["/api/student/validators", "/api/projects/me"],
  "cypress/e2e/student/Projects/Projects.cy.js": ["/api/projects/me"],
  "cypress/e2e/student/Projects/ProjetDetails.cy.js": ["/api/projects/me"],
  "cypress/e2e/student/Projects/ProjetEdit.cy.js": ["/api/student/validators", "/api/projects/me"],
  "cypress/e2e/student/portfolio/PortfolioFullView.cy.js": ["/api/student/portfolio/preview"],
  "cypress/e2e/student/portfolio/PortfolioPreviewView.cy.js": ["/api/student/portfolio/preview"],
  "cypress/e2e/student/stages/StageDetailsView.cy.js": ["/api/student/stages"],
  "cypress/e2e/student/stages/StageFormView.cy.js": ["/api/student/validators", "/api/student/stages"],
  "cypress/e2e/student/stages/StagesView.cy.js": ["/api/student/stages"],
  "qa/cypress/e2e/Notifications.cy.js": ["/api/student/notifications"],
  "qa/cypress/e2e/student/Activities.cy.js": ["/api/student/activities"],
  "qa/cypress/e2e/student/ActivityCreate.cy.js": ["/api/student/activities"],
  "qa/cypress/e2e/student/ActivityDetails.cy.js": ["/api/student/activities"],
  "qa/cypress/e2e/student/ActivityEdit.cy.js": ["/api/student/activities"],
  "qa/cypress/e2e/student/Badges.cy.js": ["/api/student/badges"],
  "qa/cypress/e2e/student/Dashboard.cy.js": ["/api/student/dashboard"],
  "qa/cypress/e2e/student/Github.cy.js": ["/api/student/github/stats"],
  "qa/cypress/e2e/student/RecommendationLetters.cy.js": ["/api/student/recommendation-letters"],
  "qa/cypress/e2e/student/Recommendations.cy.js": ["/api/student/recommendations"],
  "qa/cypress/e2e/student/competances.cy.js": ["/api/student/me/skills", "/api/student/soft-skills"],
  "qa/cypress/e2e/student/Projects/ProjectCreate.cy.js": ["/api/student/validators", "/api/projects/me"],
  "qa/cypress/e2e/student/Projects/Projects.cy.js": ["/api/projects/me"],
  "qa/cypress/e2e/student/Projects/ProjetDetails.cy.js": ["/api/projects/me"],
  "qa/cypress/e2e/student/Projects/ProjetEdit.cy.js": ["/api/student/validators", "/api/projects/me"],
  "qa/cypress/e2e/student/portfolio/PortfolioFullView.cy.js": ["/api/student/portfolio/preview"],
  "qa/cypress/e2e/student/portfolio/PortfolioPreviewView.cy.js": ["/api/student/portfolio/preview"],
  "qa/cypress/e2e/student/stages/StageDetailsView.cy.js": ["/api/student/stages"],
  "qa/cypress/e2e/student/stages/StageFormView.cy.js": ["/api/student/validators", "/api/student/stages"],
  "qa/cypress/e2e/student/stages/StagesView.cy.js": ["/api/student/stages"],
};

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
  const specPath = normalizeSpecPath(Cypress.spec.relative || "");
  const requiredPaths = apiPathsBySpecName[specPath] || [];

  if (!requiredPaths.length) return;

  cy.task("areApiEndpointsAvailable", requiredPaths).then((availability) => {
    const missingPaths = Object.entries(availability)
      .filter(([, isAvailable]) => !isAvailable)
      .map(([path]) => path);

    if (missingPaths.length) {
      Cypress.log({
        name: "api",
        message: `Endpoint(s) API indisponible(s): ${missingPaths.join(", ")}`,
      });
      this.skip();
    }
  });
});

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
  if (!testNeedsBackend(this.currentTest)) {
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
