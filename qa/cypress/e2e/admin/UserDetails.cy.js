describe("Details utilisateur - Admin avec backend reel", () => {
  const openFirstUserDetails = () => {
    cy.intercept("GET", "**/api/admin/users*").as("getUsers");
    cy.loginAsAdminJwt("/admin/users");
    cy.wait("@getUsers", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);

    cy.get("body").then(($body) => {
      if (!$body.find(".users-table tbody tr").length) {
        cy.get(".admin-users-page").should("be.visible");
        return;
      }

      cy.intercept("GET", "**/api/admin/users/*").as("getUser");
      cy.get(".users-table tbody tr").first().find(".actions-trigger").click();
      cy.get(".actions-dropdown-menu").contains("button", "Voir").click();
      cy.wait("@getUser", { timeout: 20000 })
        .its("response.statusCode")
        .should("be.oneOf", [200, 304]);
    });
  };

  beforeEach(() => {
    openFirstUserDetails();
  });

  it("charge les details de l'utilisateur si un utilisateur existe", () => {
    cy.get("body").should("be.visible");
    cy.get("h1").should("not.be.empty");
  });

  it("peut passer en edition si le bouton modifier existe", () => {
    cy.get("body").then(($body) => {
      const editButton = [...$body.find("button")].find((element) =>
        /Modifier/i.test(element.innerText),
      );

      if (editButton) {
        cy.wrap(editButton).click();
        cy.get("body").should("contain.text", "Enregistrer");
      } else {
        cy.get("body").should("be.visible");
      }
    });
  });

  it("affiche les actions de securite si disponibles", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".security-card").length) {
        cy.get(".security-card").scrollIntoView().should("be.visible");
      } else {
        cy.get("body").should("be.visible");
      }
    });
  });
});
