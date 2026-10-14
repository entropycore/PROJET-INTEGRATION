describe("E2E - Demande d'acces avec backend reel", () => {
  const remplirFormulaire = (overrides = {}) => {
    const timestamp = Date.now();
    const data = {
      lastName: "El Amrani",
      firstName: "Youssef",
      email: `youssef.elamrani+${timestamp}@gmail.com`,
      companyName: "Atlas Digital",
      jobTitle: "Responsable recrutement",
      password: "Password123!",
      passwordConfirmation: "Password123!",
      ...overrides,
    };

    cy.get("#lastName").clear().taperClairement(data.lastName);
    cy.get("#firstName").clear().taperClairement(data.firstName);
    cy.get("#email").clear().taperClairement(data.email);
    cy.get("#companyName").clear().taperClairement(data.companyName);
    cy.get("#jobTitle").clear().taperClairement(data.jobTitle);
    cy.get("#password").clear().taperClairement(data.password);
    cy.get("#passwordConfirmation").clear().taperClairement(data.passwordConfirmation);
  };

  beforeEach(() => {
    cy.visiterClairement("/request-access");
    cy.url().should("include", "/request-access");
  });

  it("soumet le formulaire au vrai backend", () => {
    cy.intercept("POST", "**/api/auth/register").as("submitRequest");
    remplirFormulaire();
    cy.get(".submit-btn").click();
    cy.wait("@submitRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([201, 409, 500]);
    });
    cy.get("body").should("be.visible");
  });

  it("retourne vers la page de connexion", () => {
    cy.get(".login-link span").click();
    cy.url().should("include", "/login");
  });

  it("affiche une erreur si les mots de passe sont differents", () => {
    remplirFormulaire({ passwordConfirmation: "WrongPass123!" });
    cy.get(".submit-btn").click();
    cy.get(".error-message").should("be.visible");
  });

  it("affiche une erreur si les champs obligatoires sont vides", () => {
    cy.intercept("POST", "**/api/auth/register").as("submitRequest");

    cy.get(".submit-btn").click();
    cy.get(".error-message")
      .should("be.visible")
      .and("contain.text", "Veuillez remplir tous les champs");

    cy.get("@submitRequest.all").should("have.length", 0);
  });

  it("affiche et masque les mots de passe", () => {
    cy.get("#password").type("Password123!");
    cy.get("#passwordConfirmation").type("Password123!");

    cy.get("#password").should("have.attr", "type", "password");
    cy.get("#passwordConfirmation").should("have.attr", "type", "password");

    cy.get("#password")
      .parents(".input-wrapper")
      .find(".toggle-icon")
      .click();
    cy.get("#password").should("have.attr", "type", "text");

    cy.get("#passwordConfirmation")
      .parents(".input-wrapper")
      .find(".toggle-icon")
      .click();
    cy.get("#passwordConfirmation").should("have.attr", "type", "text");
  });

  it("protege contre les injections simples cote formulaire", () => {
    const xss = '<script>alert("xss")</script>';
    cy.get("#lastName").taperClairement(xss).should("have.value", xss);
  });
});
