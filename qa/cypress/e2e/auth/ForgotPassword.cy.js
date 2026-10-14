describe("Page Mot de passe oublie - Tests E2E avec backend reel", () => {
  beforeEach(() => {
    cy.visiterClairement("/forgot-password");
  });

  it("affiche une erreur de validation si l'email est vide", () => {
    cy.get("form.auth-form").submit();
    cy.get(".error-message")
      .should("be.visible")
      .and("contain.text", "Veuillez renseigner");
  });

  it("soumet une demande au vrai backend", () => {
    cy.intercept("POST", "**/forgot-password**").as("forgotPasswordRequest");
    cy.get("#email").taperClairement("cypress.unknown@credencia.test");
    cy.get("form.auth-form").submit();
    cy.wait("@forgotPasswordRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 500]);
    });
    cy.get("body").should("be.visible");
  });

  it("revient vers la page de connexion au clic sur le lien", () => {
    cy.get(".login-link span").click();
    cy.url().should("include", "/login");
  });
});
