describe("Admin Dashboard - Tests E2E avec backend reel", () => {
  const waitForDashboard = () => {
    cy.wait("@getDashboard", { timeout: 20000 }).then((interception) => {
      const statusCode = interception.response?.statusCode;
      const responseBody = interception.response?.body;

      expect(
        statusCode,
        `GET /api/admin/dashboard doit retourner 200 ou 304. Reponse backend: ${JSON.stringify(responseBody)}`,
      ).to.be.oneOf([200, 304]);

      if (statusCode === 200) {
        expect(responseBody?.data, "payload dashboard").to.have.property("summaryCards");
        expect(responseBody?.data, "payload dashboard").to.have.property("urgentActions");
        expect(responseBody?.data, "payload dashboard").to.have.property("recentRequests");
      }
    });

    cy.contains("Chargement...", { timeout: 15000 }).should("not.exist");
    cy.contains("Erreur lors du chargement du dashboard").should("not.exist");
    cy.get(".stats-grid .stat-card", { timeout: 15000 }).should("have.length", 4);
  };

  beforeEach(() => {
    cy.intercept("GET", "**/api/admin/dashboard*").as("getDashboard");
    cy.loginAsAdminJwt("/admin");
    waitForDashboard();
  });

  it("affiche le dashboard admin avec les donnees du backend", () => {
    cy.get("h1").should("contain.text", "Administration de platform");
    cy.get(".admin-subtitle").should("be.visible");

    cy.get(".stat-card").eq(0).within(() => {
      cy.get(".stat-label").should("contain.text", "UTILISATEURS");
      cy.get(".stat-value")
        .invoke("text")
        .should("match", /^\d+$/);
    });

    cy.get(".stat-card").eq(1).should("contain.text", "TUDIANTS");
    cy.get(".stat-card").eq(2).should("contain.text", "PROFESSEURS");
    cy.get(".stat-card.warning").should("contain.text", "Demandes En Attente");
  });

  it("affiche la zone d'activite recente ou son etat vide", () => {
    cy.get(".recent-requests").should("be.visible");
    cy.get(".recent-requests h3").should("contain.text", "Activit");

    cy.get("body").then(($body) => {
      const hasRecentActivity = $body.find(".request-item").length > 0;

      if (hasRecentActivity) {
        cy.get(".request-item").first().within(() => {
          cy.get(".avatar").should("not.be.empty");
          cy.get(".request-name").should("not.be.empty");
          cy.get(".request-email").should("not.be.empty");
          cy.get(".request-time").should("not.be.empty");
          cy.get(".request-type").should("not.be.empty");
        });
      } else {
        cy.get(".request-empty").should(
          "contain.text",
          "Aucune activit",
        );
      }
    });
  });

  it("redirige au clic sur une activite recente cliquable si elle existe", () => {
    cy.get("body").then(($body) => {
      const hasClickableActivity = $body.find(".request-item.clickable").length > 0;

      if (hasClickableActivity) {
        cy.get(".request-item.clickable").first().click();
        cy.url().should("match", /\/admin\/(users|validations|reports)/);
      } else {
        cy.get(".request-empty, .request-item").should("exist");
      }
    });
  });

  it("affiche les actions urgentes et leurs liens reels", () => {
    cy.get(".urgent-actions").should("be.visible");
    cy.get(".urgent-item").should("have.length", 3);

    cy.get(".urgent-item.orange").within(() => {
      cy.get(".title").should("contain.text", "demandes en attente");
      cy.get("a.urgent-link").should(
        "have.attr",
        "href",
        "/admin/users?role=PROFESSIONAL&status=PENDING",
      );
    });

    cy.get(".urgent-item.green a.urgent-link").should(
      "have.attr",
      "href",
      "/admin/validations",
    );

    cy.get(".urgent-item.red a.urgent-link").should(
      "have.attr",
      "href",
      "/admin/reports",
    );
  });
});
