describe("Centre de validations - Admin", () => {
  const mockStats = {
    count: 4,
    projects: 1,
    internships: 1,
    certificates: 2,
    activities: 0,
  };

  const mockValidationsList = {
    items: [
      {
        id: "val_project_1",
        title: "Projet Fin d'Annee - ValiDia",
        targetType: "PROJECT",
        status: "PENDING",
        student: {
          fullName: "Ghizlane Rabii",
          email: "g.rabii@ensa.ma",
        },
      },
      {
        id: "val_certif_2",
        title: "Certification AWS Cloud Practitioner",
        targetType: "CERTIFICATE",
        status: "PENDING",
        student: {
          fullName: "Kholoud Nihal",
          email: "k.nihal@ensa.ma",
        },
        raw: { itemId: "item_aws_99" },
      },
    ],
  };

  const mockDetailedValidation = {
    id: "val_project_1",
    title: "Projet Fin d'Annee - ValiDia (Details Complets)",
    targetType: "PROJECT",
    status: "PENDING",
    student: {
      fullName: "Ghizlane Rabii",
      email: "g.rabii@ensa.ma",
    },
    description: "Implementation des tests QA d'integration sous Cypress.",
  };

  beforeEach(() => {
    cy.intercept("GET", "**/api/admin/validations/pending", {
      data: mockValidationsList,
    }).as("getValidations");
    cy.intercept("GET", "**/api/admin/validations/pending-count", {
      data: mockStats,
    }).as("getStats");

    cy.loginAsAdmin("/admin/validations");
    cy.wait(["@getValidations", "@getStats"]);
  });

  it("charge la page, les statistiques et le tableau", () => {
    cy.get("h1").should("contain", "Centre de validations");
    cy.get(".validations-page").should("contain", "4");
    cy.get(".validations-page").should("contain", "Ghizlane Rabii");
    cy.get(".validations-page").should(
      "contain",
      "Certification AWS Cloud Practitioner",
    );
  });

  it("filtre les lignes du tableau cote client", () => {
    cy.get("input, .validation-toolbar-search").first().type("AWS");
    cy.get(".validations-page").should("contain", "Kholoud Nihal");
    cy.get(".validations-page").should("not.contain", "Ghizlane Rabii");
  });

  it("ouvre le modal de details", () => {
    cy.intercept("GET", "**/api/admin/validations/val_project_1", {
      data: mockDetailedValidation,
    }).as("getDetails");

    cy.get(".validations-page").contains("button", /Voir|Visualiser/i).first().click();
    cy.wait("@getDetails");

    cy.get("body").should(
      "contain",
      "Projet Fin d'Annee - ValiDia (Details Complets)",
    );
    cy.get("body").should(
      "contain",
      "Implementation des tests QA d'integration sous Cypress.",
    );
    cy.get("body").contains("button", /Fermer|Close/i).click();
  });

  it("gere le flux d'approbation", () => {
    cy.intercept("GET", "**/api/admin/validations/val_project_1", {
      data: mockDetailedValidation,
    }).as("getDetails");
    cy.intercept("PATCH", "**/api/admin/validations/val_project_1/approve", {
      statusCode: 200,
    }).as("approveApi");

    cy.get(".validations-page").contains("button", /Voir/i).first().click();
    cy.wait("@getDetails");
    cy.on("window:confirm", () => true);
    cy.get("body").contains("button", /Approuver/i).click();

    cy.wait("@approveApi");
    cy.wait(["@getValidations", "@getStats"]);
  });

  it("demande des corrections a l'etudiant", () => {
    cy.intercept("GET", "**/api/admin/validations/val_project_1", {
      data: mockDetailedValidation,
    }).as("getDetails");
    cy.intercept(
      "PATCH",
      "**/api/admin/validations/val_project_1/request-changes",
      { statusCode: 200 },
    ).as("changesApi");

    cy.get(".validations-page").contains("button", /Voir/i).first().click();
    cy.wait("@getDetails");
    cy.window().then((win) => {
      cy.stub(win, "prompt").returns("Veuillez ajouter le rapport PDF manquant.");
    });
    cy.get("body").contains("button", /Correction/i).click();

    cy.wait("@changesApi");
    cy.wait(["@getValidations", "@getStats"]);
  });

  it("ouvre automatiquement le modal si itemId est present dans l'URL", () => {
    cy.intercept("GET", "**/api/admin/validations/val_certif_2", {
      data: mockDetailedValidation,
    }).as("getTargetedDetails");

    cy.loginAsAdmin("/admin/validations?itemId=item_aws_99");
    cy.wait("@getTargetedDetails");
    cy.get("body").should(
      "contain",
      "Projet Fin d'Annee - ValiDia (Details Complets)",
    );
  });
});
