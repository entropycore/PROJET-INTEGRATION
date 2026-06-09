describe("Creation utilisateur - Admin avec backend reel", () => {
  const field = (label) => cy.contains("label", label);

  beforeEach(() => {
    cy.loginAsAdminJwt("/admin/users/create?role=STUDENT");
    cy.get("h1", { timeout: 15000 }).should("be.visible");
  });

  it("remplit le formulaire et soumet la creation au backend reel", () => {
    const timestamp = Date.now();

    cy.intercept("POST", "**/api/admin/users").as("createUserApi");

    field(/Pr.nom/).find("input").type("Cypress");
    field("Nom").find("input").type("Student");
    field("Email").find("input").type(`cypress.student.${timestamp}@ensa.ma`);
    field(/T.l.phone/).find("input").type("0612345678");
    field(/Fili.re/).find("select").select(1);
    field("Niveau").find("input").type("CI1");
    field(/Apog.e/).find("input").type(`${timestamp}`.slice(-7));

    cy.get(".primary-btn").contains("utilisateur").click();
    cy.wait("@createUserApi", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([201, 409, 422]);
    });
    cy.get("body").should("be.visible");
  });

  it("change dynamiquement les champs selon le role", () => {
    field(/R.le/).find("select").select("PROFESSOR");
    cy.get("h1").should("contain", "professeur");
    cy.contains("label", "Employee ID").should("be.visible");
    field(/D.partement/).should("be.visible");
    cy.contains("label", /Fili.re/).should("not.exist");

    field(/R.le/).find("select").select("PROFESSIONAL");
    cy.get("h1").should("contain", "recruteur");
    cy.contains("label", "Entreprise").should("be.visible");
    cy.contains("label", "Bio").should("be.visible");
  });

  it("affiche et masque le mot de passe", () => {
    const selector = ".password-input-wrapper input";

    cy.get(selector).type("MonMotDePasseSecret123");
    cy.get(selector).should("have.attr", "type", "password");
    cy.get(".password-toggle").click();
    cy.get(selector).should("have.attr", "type", "text");
    cy.get(".password-toggle").click();
    cy.get(selector).should("have.attr", "type", "password");
  });

  it("reste sur la page si le formulaire est incomplet", () => {
    cy.get(".primary-btn").contains("utilisateur").click();
    cy.get("body").should("be.visible");
    cy.url().should("include", "/admin/users/create");
  });
});
