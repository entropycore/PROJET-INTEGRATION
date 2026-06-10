const ACTIVITY_ID = Cypress.env("E2E_ACTIVITY_ID") || "1";

describe("E2E - Modification activité étudiant", () => {
  beforeEach(() => {
    cy.visit("/login");

    cy.contains(/email/i).parent().find("input").type(Cypress.env("E2E_EMAIL"));
    cy.contains(/mot de passe|password/i)
      .parent()
      .find("input")
      .type(Cypress.env("E2E_PASSWORD"));

    cy.contains("button", /connexion|login/i).click();
    cy.url().should("include", "/student");
  });

  it("affiche la page modification activité", () => {
    cy.visit(`/student/activities/${ACTIVITY_ID}/edit`);

    cy.contains("h1", /modifier une activité/i).should("be.visible");
    cy.contains(/ajustez les informations/i).should("be.visible");
  });

  it("bouton retour redirige vers la liste des activités", () => {
    cy.visit(`/student/activities/${ACTIVITY_ID}/edit`);

    cy.contains("button", /retour/i).click();

    cy.url().should("match", /\/student\/activities$/);
  });

  it("affiche le formulaire si activité modifiable", () => {
    cy.visit(`/student/activities/${ACTIVITY_ID}/edit`);

    cy.get("body").then(($body) => {
      if ($body.text().includes("Modification indisponible")) {
        cy.contains(/modification indisponible/i).should("be.visible");
      } else {
        cy.contains("button", /enregistrer les modifications/i).should("be.visible");
      }
    });
  });

  it("modifie une activité", () => {
    cy.visit(`/student/activities/${ACTIVITY_ID}/edit`);

    cy.get("body").then(($body) => {
      if ($body.text().includes("Modification indisponible")) return;

      cy.get('input[name="title"], input[placeholder*="titre" i]').first()
        .clear()
        .type(`Activité E2E modifiée ${Date.now()}`);

      cy.get('textarea[name="description"], textarea[placeholder*="description" i]').first()
        .clear()
        .type("Description modifiée par test E2E");

      cy.contains("button", /enregistrer les modifications/i).click();

      cy.url().should("match", new RegExp(`/student/activities/${ACTIVITY_ID}$`));
    });
  });

  it("annule la modification", () => {
    cy.visit(`/student/activities/${ACTIVITY_ID}/edit`);

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