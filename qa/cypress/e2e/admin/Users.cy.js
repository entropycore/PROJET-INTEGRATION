describe("Gestion des utilisateurs - Admin avec backend reel", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/admin/users*").as("getUsers");
    cy.loginAsAdminJwt("/admin/users");
    cy.wait("@getUsers", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
  });

  it("affiche les titres et colonnes de base", () => {
    cy.get("h1").should("contain", "Gestion des utilisateurs");
    cy.get(".users-table thead th").should("contain", "User");
    cy.get(".users-table thead th").should("contain", "Email");
    cy.get(".users-table thead th").should("contain", "Status");
    cy.get(".admin-users-page").should("be.visible");
  });

  it("gere la recherche avec debounce sur le backend reel", () => {
    cy.intercept("GET", "**/api/admin/users*search=*").as("searchUser");
    cy.get(".users-search input").clear().type("a");
    cy.wait("@searchUser", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
    cy.get(".admin-users-page").should("be.visible");
  });

  it("bascule les colonnes selon le role student", () => {
    cy.intercept("GET", "**/api/admin/users*role=STUDENT*").as("getStudentsOnly");
    cy.loginAsAdminJwt("/admin/users?role=STUDENT");
    cy.wait("@getStudentsOnly", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);

    cy.get(".users-table thead th").should("contain", "Major");
    cy.get(".users-table thead th").should("contain", "Level");
  });

  it("ouvre le menu d'actions si des utilisateurs existent", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".users-table tbody tr").length) {
        cy.get(".users-table tbody tr").first().find(".actions-trigger").click();
        cy.get(".actions-dropdown-menu").should("be.visible");
      } else {
        cy.get(".admin-users-page").should("be.visible");
      }
    });
  });

  it("redirige vers la creation d'un nouvel utilisateur", () => {
    cy.get(".primary-action").contains("+ New User").click();
    cy.url().should("include", "/admin/users/create");
  });
});
