describe("Page Erreur 403 - Test E2E", () => {
  it("affiche la page avec le style graphique correct", () => {
    cy.visit("/403");
    cy.get("main").should("have.class", "forbidden-page");
    cy.get(".status-badge")
      .should("have.css", "color", "rgb(159, 47, 36)")
      .should("have.css", "background-color", "rgb(248, 231, 227)");
  });

  it("le bouton Retour ramene l'utilisateur a la page precedente", () => {
    cy.visit("/dashboard");
    cy.visit("/403");
    cy.get(".secondary-button").click();
    cy.url().should("match", /\/dashboard/);
  });

  it("redirige l'etudiant vers son espace specifique", () => {
    cy.visit("/403", {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          "auth",
          JSON.stringify({
            user: { role: "STUDENT" },
            isAuthenticated: true,
          }),
        );
      },
    });

    cy.get(".primary-button").should("contain.text", "espace").click();
    cy.url().should("match", /\/student/);
  });

  it("propose de se connecter si l'utilisateur est anonyme", () => {
    cy.visit("/403", {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
    });

    cy.get(".primary-button").should("contain.text", "connecter").click();
    cy.url().should("match", /\/login/);
  });

  it("adapte le layout sur mobile", () => {
    cy.viewport(390, 844);
    cy.visit("/403");
    cy.get(".forbidden-actions").should(
      "have.css",
      "flex-direction",
      "column-reverse",
    );
    cy.get(".primary-button").then(($btn) => {
      expect($btn[0].getBoundingClientRect().width).to.be.greaterThan(300);
    });
  });
});
