describe("Centre de notifications - Tests E2E", () => {
  const apiBaseUrl = Cypress.env("API_BASE_URL") || "http://localhost:3000";

  const mockSession = (role) => {
    cy.intercept("GET", `${apiBaseUrl}/api/auth/me`, {
      statusCode: 200,
      body: {
        data: {
          id: `${role.toLowerCase()}-user`,
          email: `${role.toLowerCase()}@example.com`,
          role,
        },
      },
    }).as(`getMe${role}`);
  };

  const mockNotifications = (basePath, aliasPrefix, items, unreadCount = 1) => {
    cy.intercept("GET", `${apiBaseUrl}${basePath}/notifications`, {
      statusCode: 200,
      body: { data: { items } },
    }).as(`${aliasPrefix}Notifs`);

    cy.intercept("GET", `${apiBaseUrl}${basePath}/notifications/unread-count`, {
      statusCode: 200,
      body: { data: { count: unreadCount } },
    }).as(`${aliasPrefix}Unread`);
  };

  context("Role etudiant", () => {
    beforeEach(() => {
      mockSession("STUDENT");
      mockNotifications("/api/student", "student", [
        {
          id: "st-1",
          type: "INFO",
          title: "Projet soumis",
          message: "Votre projet a ete soumis.",
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "st-2",
          type: "VALIDATION",
          title: "Badge obtenu",
          message: "Felicitations pour votre badge.",
          read: true,
          createdAt: new Date().toISOString(),
        },
      ]);

      cy.visiterClairement("/student/notifications");
      cy.wait(["@getMeSTUDENT", "@studentNotifs", "@studentUnread"]);
    });

    it("affiche l'en-tete et charge les notifications", () => {
      cy.get(".page-header span").should("contain.text", "ETUDIANT");
      cy.get(".page-header p").should("contain.text", "espace");
      cy.get(".notifications-page").should("contain.text", "Projet soumis");
    });

    it("marque toutes les notifications comme lues", () => {
      cy.intercept("PATCH", `${apiBaseUrl}/api/student/notifications/read-all`, {
        statusCode: 200,
      }).as("markAllRequest");

      cy.contains("button", /Tout marquer comme lu/i).click();
      cy.wait("@markAllRequest");
      cy.get(".item.unread").should("not.exist");
    });

    it("supprime une notification", () => {
      cy.intercept("DELETE", `${apiBaseUrl}/api/student/notifications/st-1`, {
        statusCode: 200,
      }).as("deleteRequest");

      cy.contains(".item", "Projet soumis").contains("button", "Supprimer").click();
      cy.wait("@deleteRequest");
      cy.get(".notifications-page").should("not.contain.text", "Projet soumis");
    });
  });

  context("Role professeur", () => {
    it("affiche les libelles professeur et ses notifications", () => {
      mockSession("PROFESSOR");
      mockNotifications("/api/professor", "professor", [
        {
          id: "pr-1",
          type: "RECOMMENDATION_VALIDATION",
          title: "Nouvelle demande de recommandation",
          message: "Une recommandation attend votre validation.",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]);

      cy.visiterClairement("/professor/notifications");
      cy.wait(["@getMePROFESSOR", "@professorNotifs", "@professorUnread"]);

      cy.get(".page-header span").should("contain.text", "PROFESSEUR");
      cy.get(".page-header p").should("contain.text", "interactions");
      cy.get(".notifications-page").should(
        "contain.text",
        "Nouvelle demande de recommandation",
      );
    });
  });

  context("Scenario d'erreur", () => {
    it("affiche un etat d'erreur si l'API echoue", () => {
      mockSession("STUDENT");

      cy.intercept("GET", `${apiBaseUrl}/api/student/notifications`, {
        statusCode: 500,
        body: { error: "Erreur interne du serveur" },
      }).as("getNotifsError");

      cy.visiterClairement("/student/notifications");
      cy.wait(["@getMeSTUDENT", "@getNotifsError"]);

      cy.get(".state-box.error")
        .should("be.visible")
        .and("contain.text", "Erreur chargement notifications");
    });
  });
});
