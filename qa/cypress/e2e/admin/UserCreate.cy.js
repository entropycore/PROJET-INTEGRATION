describe("Creation utilisateur - Admin", () => {
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
    cy.get("h1").should("contain", "Creer un etudiant");

    cy.contains("label", "Prenom").find("input").type("Ghizlane");
    cy.contains("label", "Nom").find("input").type("Rabii");
    cy.contains("label", "Email").find("input").type("g.rabii@ensa.ma");
    cy.contains("label", "Telephone").find("input").type("0612345678");
    cy.contains("label", "Filiere").find("select").select(1);
    cy.contains("label", "Niveau").find("input").type("CI1");
    cy.contains("label", "Apogee").find("input").type("2200345");

    cy.get(".primary-btn").contains("Creer utilisateur").click();
    cy.wait("@createUserApi");

    cy.get(".admin-modal").should("be.visible");
    cy.get(".temporary-password-box").should("contain", "TempPassword2026!");
    cy.get(".admin-modal").contains("button", "Copier").click();
    cy.get(".admin-modal").contains("button", "Copie").should("be.visible");
    cy.get(".admin-modal").contains("button", "Continuer").click();
    cy.url().should("include", "/admin/users/usr_98765");
  });

  it("change dynamiquement les champs selon le role", () => {
    cy.contains("label", "Role").find("select").select("PROFESSOR");
    cy.get("h1").should("contain", "Creer un professeur");
    cy.contains("label", "Employee ID").should("be.visible");
    cy.contains("label", "Departement").should("be.visible");
    cy.contains("label", "Filiere").should("not.exist");

    cy.contains("label", "Role").find("select").select("PROFESSIONAL");
    cy.get("h1").should("contain", "Creer un recruteur");
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

    cy.contains("label", "Prenom").find("input").type("NomTest");
    cy.get(".primary-btn").contains("Creer utilisateur").click();

    cy.wait("@createUserError");
    cy.get(".details-state.error")
      .should("be.visible")
      .and("contain", "Erreur lors de la creation de l'utilisateur.");
  });
});
