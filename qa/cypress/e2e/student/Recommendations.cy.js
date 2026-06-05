const API_BASE_URL = Cypress.env("API_BASE_URL") || "http://localhost:3000";

const studentUser = {
  id: "student-1",
  email: "student@example.com",
  firstName: "Sara",
  lastName: "Bensaid",
  role: "STUDENT",
};

const recommendationsPayload = {
  stats: {
    received: 1,
    pending: 1,
    rejected: 1,
  },
  recommendations: [
    {
      id: "rec-1",
      author: {
        id: "teacher-1",
        name: "Pr. Karim Moussaoui",
        role: "Enseignant",
        organization: "ENSA Tanger",
        profilePicture: "",
        initials: "KM",
      },
      content: "Etudiante serieuse et impliquee dans les projets academiques.",
      status: "RECEIVED",
      visibility: "PUBLIC",
      read: true,
      createdAt: "2026-05-11T15:20:00.000Z",
    },
    {
      id: "rec-2",
      author: {
        id: "recruiter-1",
        name: "Nadia El Amrani",
        role: "Recruteuse",
        organization: "Orange Digital Center",
        profilePicture: "",
        initials: "NA",
      },
      content: "Profil prometteur avec une bonne maitrise des outils DevOps.",
      status: "PENDING",
      visibility: "PRIVATE",
      read: false,
      createdAt: "2026-05-05T13:45:00.000Z",
    },
    {
      id: "rec-3",
      author: {
        id: "visitor-1",
        name: "Utilisateur signale",
        role: "Visiteur",
        organization: "Portfolio public",
        profilePicture: "",
        initials: "US",
      },
      content: "Recommandation refusee par moderation.",
      status: "REJECTED",
      visibility: "PRIVATE",
      read: true,
      createdAt: "2026-05-01T18:10:00.000Z",
    },
  ],
};

const visitAsStudent = () => {
  cy.intercept("GET", `${API_BASE_URL}/api/auth/me`, {
    statusCode: 200,
    body: { data: studentUser },
  }).as("getMe");

  cy.intercept("GET", `${API_BASE_URL}/api/student/recommendations*`, {
    statusCode: 200,
    body: { data: recommendationsPayload },
  }).as("getRecommendations");

  cy.visiterClairement("/student/recommendations", {
    onBeforeLoad(win) {
      win.localStorage.setItem(
        "auth",
        JSON.stringify({
          user: studentUser,
          isAuthenticated: true,
        }),
      );
    },
  });

  cy.wait("@getRecommendations");
};

describe("Student recommendations", () => {
  it("affiche les recommandations et les compteurs", () => {
    visitAsStudent();

    cy.get(".recommendations-page").should("be.visible");
    cy.contains("h1", "Mes recommandations").should("be.visible");
    cy.get(".recommendation-card").should("have.length", 3);
    cy.contains(".recommendation-card", "Pr. Karim Moussaoui").should(
      "contain.text",
      "Etudiante serieuse",
    );
    cy.contains(".filters button", "Toutes").should("contain.text", "3");
    cy.contains(".filters button", "En attente").should("contain.text", "1");
  });

  it("filtre les recommandations en attente", () => {
    visitAsStudent();

    cy.contains(".filters button", "En attente").click();
    cy.get(".recommendation-card").should("have.length", 1);
    cy.contains(".recommendation-card", "Nadia El Amrani").should("be.visible");
    cy.contains(".recommendation-card", "Accepter").should("be.visible");
    cy.contains(".recommendation-card", "Refuser").should("be.visible");
  });

  it("accepte une recommandation en attente", () => {
    cy.intercept(
      "PATCH",
      `${API_BASE_URL}/api/student/recommendations/rec-2/status`,
      {
        statusCode: 200,
        body: { data: { id: "rec-2", status: "APPROVED" } },
      },
    ).as("acceptRecommendation");

    visitAsStudent();

    cy.contains(".recommendation-card", "Nadia El Amrani")
      .contains("button", "Accepter")
      .click();

    cy.wait("@acceptRecommendation")
      .its("request.body")
      .should("deep.equal", { status: "APPROVED" });
  });
});
