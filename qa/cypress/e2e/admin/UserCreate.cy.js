describe("Creation utilisateur - Admin", () => {
  const field = (label) => cy.contains("label", label);

  beforeEach(() => {
    cy.intercept("POST", "**/api/admin/users", {
      statusCode: 201,
      body: {
        data: {
          temporaryPassword: "TempPassword2026!",
          user: {
            id: "usr_98765",
            role: "STUDENT",
            firstName: "Ghizlane",
            lastName: "Rabii",
          },
        },
      },
    }).as("createUserApi");

    cy.wrap(
      Cypress.automation("remote:debugger:protocol", {
        command: "Browser.grantPermissions",
        params: {
          permissions: ["clipboardReadWrite"],
          origin: window.location.origin,
        },
      }),
    );

    cy.loginAsAdmin("/admin/users/create?role=STUDENT");
  });

  it("remplit le formulaire et affiche le mot de passe temporaire", () => {
    cy.get("h1").should("contain", "tudiant");

    field(/Pr.nom/).find("input").type("Ghizlane");
    field("Nom").find("input").type("Rabii");
    field("Email").find("input").type("g.rabii@ensa.ma");
    field(/T.l.phone/).find("input").type("0612345678");
    field(/Fili.re/).find("select").select(1);
    field("Niveau").find("input").type("CI1");
    field(/Apog.e/).find("input").type("2200345");

    cy.get(".primary-btn").contains("utilisateur").click();
    cy.wait("@createUserApi");

    cy.get(".admin-modal").should("be.visible");
    cy.get(".temporary-password-box").should("contain", "TempPassword2026!");
    cy.get(".admin-modal").contains("button", "Copier").click();
    cy.get(".admin-modal").contains("button", /Cop/).should("be.visible");
    cy.get(".admin-modal").contains("button", "Continuer").click();
    cy.url().should("include", "/admin/users/usr_98765");
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

  it("affiche un message d'erreur si l'API echoue", () => {
    cy.intercept("POST", "**/api/admin/users", {
      statusCode: 400,
      body: { message: "Bad Request" },
    }).as("createUserError");

    field(/Pr.nom/).find("input").type("NomTest");
    cy.get(".primary-btn").contains("utilisateur").click();

    cy.wait("@createUserError");
    cy.get(".details-state.error")
      .should("be.visible")
      .and("contain", "Erreur lors de la");
  });
});
