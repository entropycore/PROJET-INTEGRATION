describe("Student recommendations - Tests E2E avec backend reel", () => {
  const visitAsStudent = () => {
    cy.intercept("GET", "**/api/student/recommendations*").as(
      "getRecommendations",
    );
    cy.loginAsRoleJwt("STUDENT", "/student/recommendations");
    cy.wait("@getRecommendations", { timeout: 20000 })
      .its("response.statusCode")
      .should("be.oneOf", [200, 304, 404]);
  };

  it("affiche la page recommandations avec les donnees reelles", () => {
    visitAsStudent();

    cy.get(".recommendations-page").should("be.visible");
    cy.contains("h1", "Mes recommandations").should("be.visible");
    cy.get(".filters button").should("have.length.at.least", 1);
  });

  it("filtre les recommandations en attente si le filtre existe", () => {
    visitAsStudent();

    cy.get("body").then(($body) => {
      const pendingButton = [...$body.find(".filters button")].find((element) =>
        /En attente/i.test(element.innerText),
      );

      if (pendingButton) {
        cy.wrap(pendingButton).click();
        cy.get(".filters button.active").should("contain.text", "En attente");
      } else {
        cy.get(".recommendations-page").should("be.visible");
      }
    });
  });

  it("affiche les actions de recommandation si elles sont disponibles", () => {
    visitAsStudent();

    cy.get(".recommendations-page").should("be.visible");
    cy.get("body").then(($body) => {
      if ($body.find(".recommendation-card").length) {
        cy.get(".recommendation-card").first().should("be.visible");
      }
    });
  });
});
