describe("E2E - Verification d'email avec backend reel", () => {
  it("affiche une erreur si le token est manquant", () => {
    cy.visit("/verify-email");
    cy.contains("h1", /Verification impossible|V.rification impossible/i).should(
      "be.visible",
    );
    cy.get(".status-icon-error").should("be.visible");
  });

  it("appelle le vrai backend et affiche une erreur pour un token invalide", () => {
    cy.intercept("GET", "**/api/auth/verify-email*").as("verifyEmail");
    cy.visit("/verify-email?token=token_invalide_cypress");
    cy.wait("@verifyEmail", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [400, 404]);

    cy.contains("h1", /Verification impossible|V.rification impossible/i).should(
      "be.visible",
    );
    cy.get(".status-icon-error").should("be.visible");
  });
});
