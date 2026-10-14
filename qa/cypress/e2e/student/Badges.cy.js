describe("E2E - Mes badges", () => {
  beforeEach(() => {
    cy.loginAsStudent("/student/badges");
  });

  it("affiche la page badges", () => {
    cy.contains("Mes badges").should("be.visible");

    cy.contains("Badges obtenus").should("be.visible");
    cy.contains("À débloquer").should("be.visible");
    cy.contains("En cours").should("be.visible");
  });

  it("affiche les filtres", () => {
    cy.contains("Tous").should("be.visible");
    cy.contains("Obtenus").should("be.visible");
    cy.contains("À débloquer").should("be.visible");
  });

  it("filtre les badges obtenus", () => {
    cy.contains("Obtenus").click();

    cy.get("body").should(($body) => {
      const hasBadge = $body.find(".badge-card").length > 0;
      const hasEmpty = /aucun badge obtenu/i.test($body.text());
      expect(hasBadge || hasEmpty).to.eq(true);
    });
  });

  it("filtre les badges verrouillés", () => {
    cy.contains("À débloquer").click();

    cy.get("body").should(($body) => {
      const hasBadge = $body.find(".badge-card").length > 0;
      const hasEmpty = /aucun badge dans cette catégorie/i.test($body.text());
      expect(hasBadge || hasEmpty).to.eq(true);
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

      cy.contains(/règle/i).should("exist");

      cy.contains(/progression|obtenu le/i).should("exist");
    });
  });

  it("affiche la progression des badges", () => {
    cy.get(".progress-track").should("exist");

    cy.get(".progress-fill").should("exist");
  });

  it("affiche les statistiques", () => {
    cy.get(".obtained-summary").should("be.visible");

    cy.contains("Badges obtenus")
      .parent()
      .find("strong")
      .should("exist");
  });

  it("affiche les badges chargés", () => {
    cy.get(".badge-card").should("have.length.greaterThan", 0);
  });

  it("vérifie qu'un badge possède un statut", () => {
    cy.get(".badge-card").each(($card) => {
      cy.wrap($card).within(() => {
        cy.contains(/progression|obtenu le/i).should("exist");
      });
    });
  });
});
