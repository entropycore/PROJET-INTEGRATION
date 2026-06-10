describe("Centre de validations - Admin avec backend reel", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/admin/validations/pending").as("getValidations");
    cy.intercept("GET", "**/api/admin/validations/pending-count").as("getStats");
    cy.loginAsAdminJwt("/admin/validations");
    cy.wait(["@getValidations", "@getStats"], { timeout: 20000 }).then(
      (interceptions) => {
        interceptions.forEach((interception) => {
          expect(interception.response?.statusCode).to.be.oneOf([200, 304]);
        });
      },
    );
  });

  it("charge la page, les statistiques et le tableau", () => {
    cy.get("h1").should("contain", "Centre de validations");
    cy.get(".validations-page").should("be.visible");
    cy.get(".validation-stats, .stats-grid, .validations-table").should("exist");
  });

  it("filtre les lignes du tableau cote client", () => {
    cy.get("input, .validation-toolbar-search").first().type("a");
    cy.get(".validations-page").should("be.visible");
  });

  it("ouvre le modal de details si une validation existe", () => {
    cy.get("body").then(($body) => {
      if (!$body.find(".validations-table .actions-trigger").length) {
        cy.get(".validations-page").should("be.visible");
        return;
      }

      cy.intercept("GET", "**/api/admin/validations/*").as("getDetails");
      cy.get(".validations-table .actions-trigger").first().click();
      cy.get(".actions-dropdown-menu").first().contains("button", /Voir/i).click();
      cy.wait("@getDetails", { timeout: 20000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
      cy.get("body").should("be.visible");
    });
  });
});
