describe("E2E - Mes badges", () => {
  beforeEach(() => {
    cy.visit("/login");

    cy.get('input[type="email"]').type(Cypress.env("E2E_EMAIL"));
    cy.get('input[type="password"]').type(Cypress.env("E2E_PASSWORD"));

    cy.contains("button", /connexion|login/i).click();

    cy.visit("/student/badges");
  });

  it("affiche la page badges", () => {
    cy.contains("Mes badges").should("be.visible");

    cy.contains("Badges obtenus").should("be.visible");
    cy.contains("Progression globale").should("be.visible");
    cy.contains("À débloquer").should("be.visible");
  });

  it("affiche les filtres", () => {
    cy.contains("Tous").should("be.visible");
    cy.contains("Obtenus").should("be.visible");
    cy.contains("À débloquer").should("be.visible");
  });

  it("filtre les badges obtenus", () => {
    cy.contains("Obtenus").click();

    cy.get(".badge-card").each(($card) => {
      cy.wrap($card)
        .find(".badge-status")
        .should("contain.text", "Obtenu");
    });
  });

  it("filtre les badges verrouillés", () => {
    cy.contains("À débloquer").click();

    cy.get(".badge-card").each(($card) => {
      cy.wrap($card)
        .find(".badge-status")
        .should("contain.text", "À débloquer");
    });
  });

  it("retourne à tous les badges", () => {
    cy.contains("À débloquer").click();
    cy.contains("Tous").click();

    cy.get(".badge-card").should("have.length.at.least", 1);
  });

  it("affiche les informations d'un badge", () => {
    cy.get(".badge-card").first().within(() => {
      cy.get("h2").should("exist");

      cy.contains(/règle d’obtention/i).should("exist");

      cy.contains(/progression/i).should("exist");
    });
  });

  it("affiche la progression des badges", () => {
    cy.get(".progress-track").should("exist");

    cy.get(".progress-fill").should("exist");
  });

  it("affiche les statistiques", () => {
    cy.get(".summary-card").should("have.length", 3);

    cy.contains("Badges obtenus")
      .parent()
      .find("strong")
      .should("exist");

    cy.contains("Progression globale")
      .parent()
      .find("strong")
      .should("exist");

    cy.contains("À débloquer")
      .parent()
      .find("strong")
      .should("exist");
  });

  it("affiche les badges chargés", () => {
    cy.get(".badge-card").should("have.length.greaterThan", 0);
  });

  it("vérifie qu'un badge possède un statut", () => {
    cy.get(".badge-status").each(($status) => {
      cy.wrap($status).invoke("text").then((text) => {
        expect(
          text.trim() === "Obtenu" ||
          text.trim() === "À débloquer"
        ).to.equal(true);
      });
    });
  });
});
