describe("Gestion des signalements - Admin", () => {
  const reportsResponse = {
    data: {
      items: [
        {
          id: "1",
          targetType: "PROJECT",
          targetId: "project_1",
          status: "PENDING",
          reason: "Contenu inapproprie",
          description: "Contenu inapproprie",
          createdAt: "2026-06-01T10:00:00.000Z",
          reportedBy: {
            fullName: "Utilisateur123",
            email: "user123@example.com",
          },
        },
        {
          id: "2",
          targetType: "COMMENT",
          targetId: "comment_2",
          status: "RESOLVED",
          reason: "Insulte textuelle",
          description: "Insulte textuelle",
          createdAt: "2026-06-02T10:00:00.000Z",
          reportedBy: {
            fullName: "Moderateur Test",
            email: "moderateur@example.com",
          },
        },
        {
          id: "3",
          targetType: "USER",
          targetId: "user_3",
          status: "REJECTED",
          reason: "Faux profil",
          description: "Faux profil",
          createdAt: "2026-06-03T10:00:00.000Z",
          reportedBy: {
            fullName: "Signalant Test",
            email: "signalant@example.com",
          },
        },
      ],
    },
  };

  const reportDetails = {
    data: {
      id: "1",
      targetType: "PROJECT",
      targetId: "project_1",
      status: "PENDING",
      reason: "Contenu inapproprie",
      description: "Contenu inapproprie",
      createdAt: "2026-06-01T10:00:00.000Z",
      reportedBy: {
        fullName: "Utilisateur123",
        email: "user123@example.com",
      },
    },
  };

  const openFirstActionsMenu = () => {
    cy.get(".reports-table .actions-trigger").first().click();
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

    openFirstActionsMenu();
    cy.get(".actions-dropdown-menu").contains("Voir details").click();
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

    openFirstActionsMenu();
    cy.get(".actions-dropdown-menu").contains("Voir details").click();
    cy.wait("@getReportDetails");
    cy.contains("button", /rejeter/i).click();
    cy.wait("@rejectReport");
    cy.wait("@getReports");
  });
});
