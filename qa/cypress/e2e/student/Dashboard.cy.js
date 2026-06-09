describe("E2E - Dashboard étudiant", () => {
  beforeEach(() => {
    cy.visit("/login");

    cy.get('input[type="email"]').type(Cypress.env("E2E_EMAIL"));
    cy.get('input[type="password"]').type(Cypress.env("E2E_PASSWORD"));

    cy.contains("button", /connexion|login/i).click();

    cy.visit("/student/dashboard");
  });

  it("affiche le dashboard", () => {
    cy.contains(/bonjour/i).should("be.visible");
    cy.contains(/résumé de votre activité académique/i).should("be.visible");
  });

  it("affiche les cartes statistiques", () => {
    cy.contains("Projets validés").should("be.visible");
    cy.contains("Score crédibilité").should("be.visible");
    cy.contains("Badges obtenus").should("be.visible");
    cy.contains("Recommandations").should("be.visible");

    cy.get(".stat-card").should("have.length", 4);
  });

  it("affiche les projets récents", () => {
    cy.contains("Projets récents").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(".project-row").length > 0) {
        cy.get(".project-row").first().should("be.visible");
      }
    });
  });

  it("redirige vers la liste des projets", () => {
    cy.contains("Projets récents")
      .parents(".dashboard-card")
      .within(() => {
        cy.contains("Voir tout").click();
      });

    cy.url().should("include", "/student/projects");
  });

  it("affiche les badges récents", () => {
    cy.visit("/student/dashboard");

    cy.contains("Badges obtenus").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(".badge-card").length > 0) {
        cy.get(".badge-card").first().should("be.visible");
      }
    });
  });

  it("redirige vers la page badges", () => {
    cy.visit("/student/dashboard");

    cy.contains("Badges obtenus")
      .parents(".dashboard-card")
      .within(() => {
        cy.contains("Voir tout").click();
      });

    cy.url().should("include", "/student/badges");
  });

  it("affiche le score de crédibilité", () => {
    cy.contains("Score de crédibilité").should("be.visible");

    cy.get(".score-ring-svg").should("exist");
    cy.get(".ring-center").should("be.visible");
  });

  it("affiche les détails du score", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".score-bar").length > 0) {
        cy.get(".score-bar").first().should("be.visible");
      }
    });
  });

  it("affiche les notifications récentes", () => {
    cy.contains("Notifications récentes").should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(".notification-row").length > 0) {
        cy.get(".notification-row").first().should("be.visible");
      }
    });
  });

  it("redirige vers les notifications", () => {
    cy.contains("Notifications récentes")
      .parents(".dashboard-card")
      .within(() => {
        cy.contains("Voir tout").click();
      });

    cy.url().should("include", "/student/notifications");
  });

  it("affiche les statuts des projets", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".status-chip").length > 0) {
        cy.get(".status-chip").each(($status) => {
          cy.wrap($status).should("be.visible");
        });
      }
    });
  });

  it("vérifie que les animations statistiques sont chargées", () => {
    cy.get(".stat-card h2").each(($value) => {
      cy.wrap($value)
        .invoke("text")
        .should("not.be.empty");
    });
  });
});