describe("E2E - Modification activité étudiant", () => {
  let activityId;
  const editableButtonLabel = /enregistrer les modifications/i;

  const getEditableButton = () =>
    cy.contains("button", editableButtonLabel, { timeout: 15000 });

  const assertEditableOrUnavailable = () => {
    cy.contains(/modification indisponible|enregistrer les modifications/i, {
      timeout: 15000,
    }).should("exist");

    return cy.get("body").then(($body) => {
      if ($body.text().includes("Modification indisponible")) {
        return cy.contains(/modification indisponible/i).should("be.visible").then(() => false);
      }

      cy.get(".dashboard-content").scrollTo("bottom", { ensureScrollable: false });
      return getEditableButton().should("be.visible").then(() => true);
    });
  };

  beforeEach(() => {
    cy.loginAsStudent("/student");

    cy.apiRequest("GET", "/api/student/activities").then((response) => {
      const activities = response.body.data?.items || response.body.data || response.body.items || [];
      expect(activities, "activites existantes pour le test edition").to.have.length.greaterThan(0);
      activityId = Cypress.env("E2E_ACTIVITY_ID") || activities[0].id;
    });
  });

  it("affiche la page modification activité", () => {
    cy.visit(`/student/activities/${activityId}/edit`);

    cy.contains("h1", /modifier une activité/i).should("be.visible");
    cy.contains(/ajustez les informations/i).should("be.visible");
  });

  it("bouton retour redirige vers la liste des activités", () => {
    cy.visit(`/student/activities/${activityId}/edit`);

    cy.contains("button", /retour/i).click();

    cy.url().should("match", /\/student\/activities$/);
  });

  it("affiche le formulaire si activité modifiable", () => {
    cy.visit(`/student/activities/${activityId}/edit`);

    assertEditableOrUnavailable();
  });

  it("modifie une activité", () => {
    cy.visit(`/student/activities/${activityId}/edit`);

    assertEditableOrUnavailable().then((canEdit) => {
      if (!canEdit) return;

      cy.get('input[name="title"], input[placeholder*="titre" i]').first()
        .clear()
        .type(`Activité E2E modifiée ${Date.now()}`);

      cy.get('textarea[name="description"], textarea[placeholder*="description" i]').first()
        .clear()
        .type("Description modifiée par test E2E");

      cy.get(".dashboard-content").scrollTo("bottom", { ensureScrollable: false });
      getEditableButton().click();

      cy.url().should("match", new RegExp(`/student/activities/${activityId}$`));
    });
  });

  it("annule la modification", () => {
    cy.visit(`/student/activities/${activityId}/edit`);

    cy.get("body").then(($body) => {
      if ($body.text().includes("Annuler")) {
        cy.contains("button", /annuler/i).click();
        cy.url().should("match", /\/student\/activities$/);
      }
    });
  });

  it("affiche erreur si activité introuvable", () => {
    cy.visit("/student/activities/999999999/edit");

    cy.contains(
      /impossible de charger cette activité|activité introuvable/i
    ).should("be.visible");
  });
});
