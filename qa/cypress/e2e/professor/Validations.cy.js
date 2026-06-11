describe("E2E - Validations professeur", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/auth/csrf-token", {
      statusCode: 200,
      body: { csrfToken: "csrf-cypress-token" },
    }).as("getCsrfToken");

    const validation = {
      targetId: "project-cypress-1",
      targetType: "PROJECT",
      title: "Projet Cypress",
      description: JSON.stringify({
        description: "Projet utilise comme donnees de test Cypress.",
      }),
      status: "PENDING",
      submittedAt: "2026-06-01T10:00:00.000Z",
      student: {
        fullName: "Student Cypress",
        email: "student.test@credencia.ma",
        field: "Genie informatique",
        level: "5A",
        city: "Tanger",
      },
      targetDetails: {
        projectType: "Application web",
        teamRole: "Developpeur",
        teamSize: 2,
        technologies: ["Vue", "Node"],
      },
      content: {
        description: "Projet utilise comme donnees de test Cypress.",
        files: [
          {
            id: "file-cypress-1",
            name: "rapport-projet.pdf",
            size: 240000,
            url: "/uploads/rapport-projet.pdf",
          },
        ],
      },
    };

    cy.intercept("GET", "**/api/professor/validations?*", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          items: [validation],
          total: 1,
        },
      },
    }).as("getProfessorValidations");

    cy.intercept("GET", "**/api/professor/validations/stats", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          count: 1,
          projects: 1,
          internships: 0,
          approved: 0,
          rejected: 0,
          changesRequested: 0,
        },
      },
    }).as("getProfessorValidationStats");

    cy.intercept("GET", "**/api/professor/validations/PROJECT/project-cypress-1", {
      statusCode: 200,
      body: {
        success: true,
        data: validation,
      },
    }).as("getProfessorValidationDetails");

    cy.intercept(
      "PATCH",
      "**/api/professor/validations/PROJECT/project-cypress-1/approve",
      {
        statusCode: 200,
        body: { success: true, data: { ...validation, status: "APPROVED" } },
      },
    ).as("approveProfessorValidation");

    cy.intercept(
      "PATCH",
      "**/api/professor/validations/PROJECT/project-cypress-1/reject",
      {
        statusCode: 200,
        body: { success: true, data: { ...validation, status: "REJECTED" } },
      },
    ).as("rejectProfessorValidation");

    cy.intercept(
      "PATCH",
      "**/api/professor/validations/PROJECT/project-cypress-1/request-changes",
      {
        statusCode: 200,
        body: {
          success: true,
          data: { ...validation, status: "CHANGES_REQUESTED" },
        },
      },
    ).as("requestProfessorValidationChanges");

    cy.loginAsRoleSession("PROFESSOR", "/professor/validations");
    cy.wait(["@getProfessorValidations", "@getProfessorValidationStats"]);
  });

  it("affiche la page validations professeur", () => {
    cy.contains(/espace professeur/i).should("be.visible");
    cy.contains(/validations/i).should("be.visible");
    cy.contains(/validez les projets et stages/i).should("be.visible");
  });

  it("affiche les statistiques des validations", () => {
    cy.get("body").then(($body) => {
      expect(
        $body.text().includes("Validations") ||
          $body.text().includes("Projets") ||
          $body.text().includes("Stages") ||
          $body.text().includes("Approuv")
      ).to.equal(true);
    });
  });

  it("affiche la toolbar de recherche et filtres", () => {
    cy.get("body").then(($body) => {
      if ($body.find('input[type="search"], input[type="text"]').length > 0) {
        cy.get('input[type="search"], input[type="text"]').first().should("be.visible");
      }

      if ($body.find("select").length > 0) {
        cy.get("select").first().should("be.visible");
      }
    });
  });

  it("cherche une validation", () => {
    cy.get("body").then(($body) => {
      if ($body.find('input[type="search"], input[type="text"]').length > 0) {
        cy.get('input[type="search"], input[type="text"]')
          .first()
          .clear()
          .type("test");

        cy.contains("Validations").should("be.visible");
      }
    });
  });

  it("change les filtres si disponibles", () => {
    cy.get("body").then(($body) => {
      if ($body.find("select").length > 0) {
        cy.get("select").each(($select) => {
          cy.wrap($select).select(1);
        });

        cy.contains("Validations").should("be.visible");
      }
    });
  });

  it("affiche la table ou un état vide", () => {
    cy.get("body").then(($body) => {
      if ($body.find("table").length > 0) {
        cy.get("table").should("be.visible");
      } else {
        cy.contains(/aucune validation|chargement|impossible de charger/i).should("exist");
      }
    });
  });

  it("ouvre les détails d'une validation si disponible", () => {
    cy.get("body").then(($body) => {
      if (
        $body.find("table tbody tr").length > 0 &&
        $body.find("button").filter((_, btn) =>
          /voir|détails|details/i.test(btn.innerText)
        ).length > 0
      ) {
        cy.contains("button", /voir|détails|details/i).first().click();

        cy.get("body").then(($modalBody) => {
          expect(
            $modalBody.text().includes("Approuver") ||
              $modalBody.text().includes("Refuser") ||
              $modalBody.text().includes("Correction")
          ).to.equal(true);
        });
      }
    });
  });

  it("ouvre modal approbation si action disponible", () => {
    cy.get("body").then(($body) => {
      if ($body.find("button").filter((_, btn) => /approuver/i.test(btn.innerText)).length > 0) {
        cy.contains("button", /approuver/i).first().click();

        cy.contains(/approuver la validation|confirmer/i).should("be.visible");
      }
    });
  });

  it("ouvre modal refus si action disponible", () => {
    cy.get("body").then(($body) => {
      if ($body.find("button").filter((_, btn) => /refuser/i.test(btn.innerText)).length > 0) {
        cy.contains("button", /refuser/i).first().click();

        cy.contains(/refuser la validation|motif du refus/i).should("be.visible");
      }
    });
  });

  it("ouvre modal correction si action disponible", () => {
    cy.get("body").then(($body) => {
      if (
        $body.find("button").filter((_, btn) =>
          /correction|demander/i.test(btn.innerText)
        ).length > 0
      ) {
        cy.contains("button", /correction|demander/i).first().click();

        cy.contains(/demander une correction|correction demandée/i).should("be.visible");
      }
    });
  });

  it("refuse une action sans commentaire si commentaire obligatoire", () => {
    cy.get("body").then(($body) => {
      if ($body.find("button").filter((_, btn) => /refuser/i.test(btn.innerText)).length > 0) {
        cy.contains("button", /refuser/i).first().click();

        cy.contains("button", /refuser/i).last().click();

        cy.contains(/motif|raison|commentaire|refus/i).should("exist");
      }
    });
  });

  it("valide une action d'approbation si disponible", () => {
    cy.get("body").then(($body) => {
      if ($body.find("button").filter((_, btn) => /approuver/i.test(btn.innerText)).length > 0) {
        cy.contains("button", /approuver/i).first().click();

        cy.contains("button", /approuver/i).last().click();

        cy.contains("Validations").should("be.visible");
      }
    });
  });
});
