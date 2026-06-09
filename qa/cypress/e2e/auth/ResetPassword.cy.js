describe("Reset Password Page - E2E avec backend reel", () => {
  it("bloque le formulaire si le token est manquant", () => {
    cy.visit("/reset-password");
    cy.get(".error-message")
      .should("be.visible")
      .and("contain.text", "Lien de");
    cy.get("#newPassword").should("be.disabled");
    cy.get("#confirmPassword").should("be.disabled");
    cy.get(".submit-btn").should("be.disabled");
  });

  it("affiche une erreur si les mots de passe ne correspondent pas", () => {
    cy.visit("/reset-password?token=invalid-token-cypress");
    cy.get("#newPassword").should("not.be.disabled").type("Password123!");
    cy.get("#confirmPassword").should("not.be.disabled").type("DifferentPassword123!");
    cy.get("form.auth-form").submit();
    cy.get(".error-message")
      .should("be.visible")
      .and("contain.text", "ne correspondent pas");
  });

  it("appelle le vrai backend avec un token invalide", () => {
    cy.intercept("POST", "**/reset-password**").as("resetPasswordApi");
    cy.visit("/reset-password?token=invalid-token-cypress");
    cy.get("#newPassword").type("StrongPassword123!");
    cy.get("#confirmPassword").type("StrongPassword123!");
    cy.get("form.auth-form").submit();
    cy.wait("@resetPasswordApi", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [400, 401]);
    cy.get(".error-message").should("be.visible");
  });
});
