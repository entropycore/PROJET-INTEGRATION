describe("Student recommendation letters", () => {
  beforeEach(() => {
    cy.loginAsStudent("/student/recommendation-letters");
  });

  it("affiche la page des lettres de recommandation", () => {
    cy.contains("RecommendationLetters").should("be.visible");
    cy.url().should("include", "/student/recommendation-letters");
  });
});
