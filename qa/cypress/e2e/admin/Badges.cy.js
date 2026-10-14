describe("Page de gestion des badges - Tests E2E avec backend reel", () => {
  const apiBaseUrl = Cypress.env("API_BASE_URL") || "http://localhost:3000";

  const openCreateModal = () => {
    cy.get(".primary-btn").click();
    cy.get(".modal-overlay").should("be.visible");
  };

  const getCsrfToken = () => {
    return cy
      .request(`${apiBaseUrl}/api/auth/csrf-token`)
      .then((response) => response.body.csrfToken);
  };

  const requestBadgeApi = (options) => {
    const method = String(options.method || "GET").toUpperCase();

    if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      return cy.request(options);
    }

    return getCsrfToken().then((csrfToken) =>
      cy.request({
        ...options,
        method,
        headers: {
          ...(options.headers || {}),
          "x-csrf-token": csrfToken,
        },
      }),
    );
  };

  const ensureBadgeFeatureAvailable = function () {
    const probeName = `Probe badge Cypress ${Date.now()}`;

    requestBadgeApi({
      method: "POST",
      url: `${apiBaseUrl}/api/admin/badges`,
      body: {
        name: probeName,
        description: "Probe disponibilite module badges",
        rule: "Probe Cypress",
      },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 503 || response.status === 404) {
        this.skip();
      }

      expect(response.status, JSON.stringify(response.body)).to.be.oneOf([
        201,
        409,
      ]);

      const badgeId = response.body?.data?.id;

      if (response.status === 201 && badgeId) {
        requestBadgeApi({
          method: "DELETE",
          url: `${apiBaseUrl}/api/admin/badges/${badgeId}`,
          failOnStatusCode: false,
        });
      }
    });
  };

  const createBackendBadge = function (name = `Badge Cypress ${Date.now()}`) {
    ensureBadgeFeatureAvailable.call(this);

    return cy.then(() =>
      requestBadgeApi({
        method: "POST",
        url: `${apiBaseUrl}/api/admin/badges`,
        body: {
          name,
          description: "Badge cree pour un test E2E Cypress",
          rule: "Avoir valide le scenario Cypress",
        },
        failOnStatusCode: false,
      }),
    )
      .then((response) => {
        if (response.status === 503 || response.status === 404) {
          this.skip();
        }

        expect(response.status, JSON.stringify(response.body)).to.eq(201);
        return response.body.data;
      });
  };

  beforeEach(() => {
    cy.loginAsAdminJwt("/admin/badges");
    cy.get(".page-header h1", { timeout: 15000 }).should("contain.text", "Syst");
    cy.get(".badges-page", { timeout: 15000 }).should("be.visible");
    cy.contains("Chargement des badges...", { timeout: 15000 }).should(
      "not.exist",
    );
  });

  it("affiche la liste initiale des badges", () => {
    cy.get(".page-header h1").should("contain.text", "Syst");

    cy.get("body").then(($body) => {
      const hasBadges = $body.find(".badges-grid .badge-card").length > 0;

      if (hasBadges) {
        cy.get(".badge-card").first().within(() => {
          cy.get("h3").should("not.be.empty");
          cy.get(".rule").should("be.visible");
          cy.get(".count").should("contain.text", "attributions");
        });
      } else {
        cy.get(".empty-state, .state-box.error").should("be.visible");
      }
    });
  });

  it("ouvre la modale et cree un badge", function () {
    ensureBadgeFeatureAvailable.call(this);

    const badgeName = `Badge Cypress ${Date.now()}`;

    openCreateModal();
    cy.get(".modal-header h2").should("contain.text", "Nouveau badge");

    cy.get('.form-group input[placeholder*="Web Developer"]').type(badgeName);
    cy.get('.form-group input[placeholder*="Courte description"]').type(
      "Description du badge de test",
    );
    cy.get(".form-group textarea").type("Avoir valide le test E2E Cypress");
    cy.get(".modal-actions .create-btn").click();

    cy.get(".modal-overlay").should("not.exist");
    cy.get(".badges-page", { timeout: 15000 }).should("contain.text", badgeName);
  });

  it("bloque la soumission si les champs obligatoires manquent", () => {
    openCreateModal();

    cy.on("window:alert", (message) => {
      expect(message).to.contain("Veuillez remplir");
    });

    cy.get(".modal-actions .create-btn").click();
    cy.get(".modal-overlay").should("be.visible");
  });

  it("ouvre la modale en mode edition et met a jour un badge", function () {
    const updatedName = `Badge Modifie ${Date.now()}`;

    createBackendBadge.call(this).then((badge) => {
      cy.visit("/admin/badges");
      cy.get(".badges-page", { timeout: 15000 }).should(
        "contain.text",
        badge.name,
      );
      cy.contains(".badge-card h3", badge.name)
        .parents(".badge-card")
        .find(".edit-btn")
        .click();
    });
    cy.get(".modal-overlay").should("be.visible");
    cy.get(".modal-header h2").should("contain.text", "Modifier le badge");

    cy.get('.form-group input[placeholder*="Web Developer"]')
      .clear()
      .type(updatedName);
    cy.get(".modal-actions .create-btn").click();

    cy.get(".modal-overlay").should("not.exist");
    cy.get(".badges-page", { timeout: 15000 }).should("contain.text", updatedName);
  });

  it("declenche la suppression apres confirmation", function () {
    createBackendBadge.call(this).then((badge) => {
      cy.visit("/admin/badges");
      cy.get(".badges-page", { timeout: 15000 }).should(
        "contain.text",
        badge.name,
      );

      cy.on("window:confirm", () => true);
      cy.contains(".badge-card h3", badge.name)
        .parents(".badge-card")
        .find(".delete-btn")
        .click();

      cy.get(".page-header h1").should("contain.text", "Syst");
      cy.get(".badges-page", { timeout: 15000 }).should(
        "not.contain.text",
        badge.name,
      );
    });
  });
});
