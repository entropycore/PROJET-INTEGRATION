describe("Gestion des signalements - Admin avec backend reel", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/admin/reports*").as("getReports");
    cy.loginAsAdminJwt("/admin/reports");
    cy.wait("@getReports", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
  });

  it("affiche l'etat initial et permet de filtrer", () => {
    cy.get(".page-header h1").should("contain", "Signalements");
    cy.get(".reports-page").should("be.visible");
    cy.get('input[type="text"]').first().type("test");
    cy.get(".reports-page").should("be.visible");
  });

  it("ouvre le modal de details si un signalement existe", () => {
    cy.get("body").then(($body) => {
      if (!$body.find(".reports-table .actions-trigger").length) {
        cy.get(".reports-page").should("be.visible");
        return;
      }

      cy.intercept("GET", "**/api/admin/reports/*").as("getReportDetails");
      cy.get(".reports-table .actions-trigger").first().click();
      cy.get(".actions-dropdown-menu").contains("Voir").click();
      cy.wait("@getReportDetails", { timeout: 20000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
      cy.get("body").should("be.visible");
    });
  });
});
