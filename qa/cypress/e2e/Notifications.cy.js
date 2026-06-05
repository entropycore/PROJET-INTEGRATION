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

  const mockStudentNotifications = () => {
    cy.intercept("GET", `${apiBaseUrl}/api/student/notifications`, {
      statusCode: 200,
      body: {
        data: {
          items: [
            {
              id: "st-1",
              type: "INFO",
              title: "Projet soumis",
              message: "Votre projet a été soumis.",
              read: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: "st-2",
              type: "VALIDATION",
              title: "Badge obtenu",
              message: "Félicitations pour votre badge.",
              read: true,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      },
    }).as("getStudentNotifs");

    cy.intercept(
      "GET",
      `${apiBaseUrl}/api/student/notifications/unread-count`,
      {
        statusCode: 200,
        body: { data: { count: 1 } },
      },
    ).as("getStudentUnread");
  };

  context("Rôle : étudiant (flux API)", () => {
    beforeEach(() => {
      mockSession("STUDENT");
      mockStudentNotifications();

      cy.visiterClairement("/student/notifications");
    });

    it("affiche l'en-tête étudiant et charge les notifications depuis l'API", () => {
      cy.wait(["@getMeSTUDENT", "@getStudentNotifs", "@getStudentUnread"]);
      cy.attendreInterface();

      cy.get(".page-header span").should("contain.text", "TUDIANT");
      cy.get(".page-header p").should("contain.text", "votre espace");
      cy.get(".notifications-page").should("be.visible");
      cy.get(".state-box").should("not.exist");
      cy.get(".notifications-page").should("contain.text", "Projet soumis");
    });

    it('gère l’action du bouton "Tout marquer comme lu"', () => {
      cy.wait(["@getMeSTUDENT", "@getStudentNotifs", "@getStudentUnread"]);
      cy.attendreInterface();

      cy.intercept(
        "PATCH",
        `${apiBaseUrl}/api/student/notifications/read-all`,
        {
          statusCode: 200,
        },
      ).as("markAllRequest");

      cy.contains("button", /Tout marquer comme lu/i).click();
      cy.attendreInterface();

      cy.wait("@markAllRequest");
      cy.attendreInterface();
      cy.get(".item.unread").should("not.exist");
    });

    it("supprime une notification avec succès", () => {
      cy.wait(["@getMeSTUDENT", "@getStudentNotifs", "@getStudentUnread"]);
      cy.attendreInterface();

      cy.intercept(
        "DELETE",
        `${apiBaseUrl}/api/student/notifications/st-1`,
        {
          statusCode: 200,
        },
      ).as("deleteRequest");

      cy.contains(".item", "Projet soumis")
        .find('button[title="Supprimer"]')
        .click();
      cy.attendreInterface();

      cy.wait("@deleteRequest");
      cy.attendreInterface();
      cy.get(".notifications-page").should("not.contain.text", "Projet soumis");
    });
  });

  context("Rôle : professeur (flux mocké)", () => {
    beforeEach(() => {
      mockSession("PROFESSOR");

      cy.visiterClairement("/professor/notifications");
    });

    it("affiche les libellés professeur et charge les notifications statiques", () => {
      cy.wait("@getMePROFESSOR");
      cy.attendreInterface();

      cy.get(".page-header span").should("contain.text", "PROFESSEUR");
      cy.get(".page-header p").should("contain.text", "interactions");
      cy.get(".notifications-page").should(
        "contain.text",
        "Nouvelle demande de recommandation",
      );
    });
  });

  context("Scénario de gestion d'erreur", () => {
    it("affiche un état d'erreur si l'API échoue pour l'étudiant", () => {
      mockSession("STUDENT");

      cy.intercept("GET", `${apiBaseUrl}/api/student/notifications`, {
        statusCode: 500,
        body: { error: "Erreur interne du serveur" },
      }).as("getNotifsError");

      cy.visiterClairement("/student/notifications");
      cy.wait(["@getMeSTUDENT", "@getNotifsError"]);
      cy.attendreInterface();

      cy.get(".state-box.error")
        .should("be.visible")
        .and("contain.text", "Erreur chargement notifications");
    });
  });
});
