describe("E2E - Dashboard étudiant", () => {
  beforeEach(() => {
    cy.loginAsStudent("/student");
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

    cy.get(".stat-card-ui").should("have.length", 4);
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
    cy.visit("/student");

    cy.contains(".dashboard-card h2", "Badges obtenus").scrollIntoView().should("be.visible");

    cy.get("body").then(($body) => {
      const dashboardBadges = $body.find(".dashboard-card .badge-card");
      if (dashboardBadges.length > 0) {
        cy.get(".dashboard-card .badge-card").first().should("be.visible");
      }
    });
  });

  it("redirige vers la page badges", () => {
    cy.visit("/student");

    cy.contains(".dashboard-card", "Badges obtenus")
      .scrollIntoView()
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
    cy.contains(".dashboard-card h2", "Notifications récentes").scrollIntoView().should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.find(".notification-row").length > 0) {
        cy.get(".notification-row").first().should("be.visible");
      }
    });
  });

  it("redirige vers les notifications", () => {
    cy.contains(".dashboard-card", "Notifications récentes")
      .scrollIntoView()
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
    cy.get(".stat-card-ui .stat-card-value").each(($value) => {
      cy.wrap($value)
        .invoke("text")
        .should("not.be.empty");
    });
  });
});
