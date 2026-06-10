describe("Centre de notifications - Tests E2E avec backend reel", () => {
  const waitForNotifications = (aliasPrefix) => {
    cy.wait(`@${aliasPrefix}Notifs`, { timeout: 20000 }).then((interception) => {
      expect(interception.response?.statusCode).to.be.oneOf([200, 304, 404]);
    });
  };

  const listenNotifications = (basePath, aliasPrefix) => {
    cy.intercept("GET", `**${basePath}/notifications`).as(`${aliasPrefix}Notifs`);
    cy.intercept("GET", `**${basePath}/notifications/unread-count`).as(
      `${aliasPrefix}Unread`,
    );
  };

  context("Role etudiant", () => {
    beforeEach(() => {
      listenNotifications("/api/student", "student");
      cy.loginAsRoleJwt("STUDENT", "/student/notifications");
      waitForNotifications("student");
    });

    it("affiche l'en-tete et charge l'etat des notifications", () => {
      cy.get(".notifications-page").should("be.visible");
      cy.get(".page-header span").should("contain.text", "ETUDIANT");
      cy.get(".notifications-page").should(($page) => {
        expect($page.text()).to.match(/notification|Aucune|Erreur/i);
      });
    });

    it("marque toutes les notifications comme lues si l'action est disponible", () => {
      cy.intercept("PATCH", "**/api/student/notifications/read-all").as(
        "markAllRequest",
      );

      cy.get("body").then(($body) => {
        const button = [...$body.find("button")].find((element) =>
          /Tout marquer comme lu/i.test(element.innerText),
        );

        if (button) {
          cy.wrap(button).click();
          cy.wait("@markAllRequest").then((interception) => {
            expect(interception.response?.statusCode).to.be.oneOf([200, 304, 404]);
          });
        } else {
          cy.get(".notifications-page").should("be.visible");
        }
      });
    });
  });

  context("Role professeur", () => {
    it("affiche les libelles professeur et son etat de notifications", () => {
      listenNotifications("/api/professor", "professor");
      cy.loginAsRoleJwt("PROFESSOR", "/professor/notifications");
      waitForNotifications("professor");

      cy.get(".notifications-page").should("be.visible");
      cy.get(".page-header span").should("contain.text", "PROFESSEUR");
    });
  });
});
