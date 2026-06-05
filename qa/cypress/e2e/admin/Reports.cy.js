describe("Gestion des signalements - Admin", () => {
  const reportsResponse = {
    data: {
      items: [
        { id: "1", type: "POST", status: "PENDING", description: "Contenu inapproprie" },
        { id: "2", type: "COMMENT", status: "RESOLVED", description: "Insulte textuelle" },
        { id: "3", type: "USER", status: "REJECTED", description: "Faux profil" },
      ],
    },
  };

  const reportDetails = {
    data: {
      id: "1",
      type: "POST",
      status: "PENDING",
      description: "Contenu inapproprie",
      user: "Utilisateur123",
    },
  };

  beforeEach(() => {
    cy.intercept("GET", "**/api/admin/reports*", reportsResponse).as("getReports");
    cy.intercept("GET", "**/api/admin/reports/1", reportDetails).as("getReportDetails");

    cy.loginAsAdmin("/admin/reports");
    cy.wait("@getReports");
  });

  it("affiche l'etat initial et filtre", () => {
    cy.get(".page-header h1").should("contain", "Signalements");
    cy.get(".reports-page").should("contain", "3");
    cy.get('input[type="text"]').first().type("Insulte");
  });

  it("ouvre le modal et traite un signalement", () => {
    cy.intercept("PATCH", "**/api/admin/reports/1/resolve", { statusCode: 200 }).as(
      "resolveReport",
    );
    cy.on("window:confirm", () => true);

    cy.get(".table-card").contains("voir", { matchCase: false }).first().click();
    cy.wait("@getReportDetails");
    cy.contains("button", /traite|traiter/i).click();
    cy.wait("@resolveReport");
    cy.wait("@getReports");
  });

  it("rejette un signalement avec un motif", () => {
    cy.intercept("PATCH", "**/api/admin/reports/1/reject", { statusCode: 200 }).as(
      "rejectReport",
    );

    cy.window().then((win) => {
      cy.stub(win, "prompt").returns("Ce contenu ne viole pas nos conditions.");
    });

    cy.get(".table-card").contains("voir", { matchCase: false }).first().click();
    cy.wait("@getReportDetails");
    cy.contains("button", /rejeter/i).click();
    cy.wait("@rejectReport");
    cy.wait("@getReports");
  });
});
