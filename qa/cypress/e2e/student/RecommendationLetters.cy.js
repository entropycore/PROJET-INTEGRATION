const studentUser = {
  id: "student-1",
  email: "student@example.com",
  firstName: "Sara",
  lastName: "Bensaid",
  role: "STUDENT",
};

const visitAsStudent = () => {
  cy.visiterClairement("/student/recommendation-letters", {
    onBeforeLoad(win) {
      win.localStorage.setItem(
        "auth",
        JSON.stringify({
          user: studentUser,
          isAuthenticated: true,
        }),
      );
    },
  });
};

describe("Student recommendation letters", () => {
  it("affiche les lettres disponibles", () => {
    visitAsStudent();

    cy.get(".recommendation-letters-page").should("be.visible");
    cy.contains("h1", "Mes lettres de recommandation").should("be.visible");
    cy.get(".letter-card").should("have.length", 2);
    cy.contains(".letter-card", "Lettre pour stage PFE")
      .should("contain.text", "Pr. Karim Moussaoui")
      .and("contain.text", "Disponible");
  });

  it("desactive le telechargement pour les lettres non disponibles", () => {
    visitAsStudent();

    cy.contains(".letter-card", "Recommandation professionnelle")
      .contains("button", "Indisponible")
      .should("be.disabled");
  });
});
