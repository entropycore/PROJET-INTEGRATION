describe("E2E - Modification activité étudiant", () => {
  let activityId;
  const editableButtonLabel = /enregistrer les modifications/i;

  const getEditableButton = () =>
    cy.contains("button", editableButtonLabel, { timeout: 15000 });

  const createEditableActivity = () => {
    const timestamp = Date.now();

    return cy.apiRequest({
      method: "POST",
      url: "/api/student/activities",
      body: {
        title: `Activité E2E édition ${timestamp}`,
        type: "HACKATHON",
        organization: "ENSA Tanger",
        date: "2026-04-15",
        duration: "3 jours",
        location: "Tanger",
        description: "Activité complète créée pour le test de modification.",
        visibility: "PRIVATE",
      },
    }).then((response) => {
      expect(
        response.status,
        `Creation activite de test: ${JSON.stringify(response.body)}`,
      ).to.eq(201);

      activityId = response.body.data?.id || response.body.id;
      expect(activityId, "id de l'activite de test").to.be.a("string").and.not.be.empty;
    });
  };

  beforeEach(() => {
    activityId = null;
    cy.loginAsStudent("/student");
    createEditableActivity();
  });

  afterEach(() => {
    if (!activityId) return;

    cy.apiRequest({
      method: "DELETE",
      url: `/api/student/activities/${activityId}`,
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404]);
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

    cy.get("form.activity-form").should("be.visible");
    cy.get("form.activity-form select").should("have.value", "HACKATHON");
    getEditableButton().scrollIntoView().should("be.visible");
  });

  it("modifie une activité", () => {
    cy.visit(`/student/activities/${activityId}/edit`);

    cy.intercept("PUT", `**/api/student/activities/${activityId}`).as(
      "updateActivityApi",
    );

    cy.contains(".form-group", /titre de l’activité/i)
      .find("input")
      .clear()
      .type(`Activité E2E modifiée ${Date.now()}`);

    cy.contains(".form-group", /description/i)
      .find("textarea")
      .clear()
      .type("Description modifiée par test E2E");

    cy.get("form.activity-form").then(($form) => {
      expect(
        $form[0].checkValidity(),
        "le formulaire de modification doit etre valide avant soumission",
      ).to.eq(true);
    });
    getEditableButton().scrollIntoView().should("be.visible").click();

    cy.wait("@updateActivityApi", { timeout: 30000 }).then((interception) => {
      expect(
        interception.response?.statusCode,
        `Reponse modification activite: ${JSON.stringify(interception.response?.body)}`,
      ).to.eq(200);
    });

    cy.location("pathname", { timeout: 30000 }).should(
      "eq",
      `/student/activities/${activityId}`,
    );
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
