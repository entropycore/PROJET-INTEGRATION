describe("E2E - Details activite etudiant", () => {
  let activityId;

  beforeEach(() => {
    cy.session("student-session", () => {
      cy.visit("/login");
      cy.get('input[type="email"]').type(Cypress.env("E2E_EMAIL") || "etudiant@credencia.ma");
      cy.get('input[type="password"]').type(Cypress.env("E2E_PASSWORD") || "Password123!");
      cy.get('button[type="submit"]').click();
      cy.url().should("include", "/student");
    });

    cy.request("/api/student/activities").then((response) => {
      const activities = response.body.data?.items || response.body.data || response.body.items || [];
      expect(activities, "activites existantes pour le test details").to.have.length.greaterThan(0);
      activityId = activities[0].id;
    });
  });

  it("affiche les details de l'activite", () => {
    cy.visit(`/student/activities/${activityId}`);

    cy.contains(/activit/i).should("be.visible");
    cy.contains(/validation|informations|attestation/i).should("exist");
  });

  it("bouton retour redirige vers la liste des activites", () => {
    cy.visit(`/student/activities/${activityId}`);

    cy.contains("button", /retour/i).click();
    cy.url().should("match", /\/student\/activities$/);
  });

  it("bouton modifier redirige vers la page edit si disponible", () => {
    cy.visit(`/student/activities/${activityId}`);

    cy.get("body").then(($body) => {
      const editButton = [...$body.find("button")].find((button) =>
        /modifier/i.test(button.innerText),
      );

      if (editButton) {
        cy.wrap(editButton).click();
        cy.url().should("include", `/student/activities/${activityId}/edit`);
      }
    });
  });

  it("telechargement attestation existe si attestation disponible", () => {
    cy.visit(`/student/activities/${activityId}`);

    cy.get("body").then(($body) => {
      const downloadLink = [...$body.find("a")].find((link) =>
        /telecharger|télécharger/i.test(link.innerText),
      );

      if (downloadLink) {
        cy.wrap(downloadLink).should("have.attr", "href").and("not.be.empty");
      }
    });
  });

  it("affiche erreur si activite introuvable", () => {
    cy.visit("/student/activities/999999999");

    cy.contains(/impossible de charger cette activit|activit.*introuvable/i).should("exist");
  });
});
