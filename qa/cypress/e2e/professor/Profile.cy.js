describe("E2E - Profil professeur", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/professor/profile", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            fullName: "Professor Cypress",
            firstName: "Professor",
            lastName: "Cypress",
            email: "professor.test@ensat.ma",
            phone: "",
            accountStatus: "ACTIVE",
            lastLoginAt: null,
            createdAt: null,
            profilePicture: "",
          },
          profile: {
            employeeId: "",
            grade: "",
            specialty: "",
            department: "",
          },
          supervisedInternships: [],
          recentProjectValidations: [],
          recentInternshipValidations: [],
        },
      },
    }).as("getProfessorProfile");

    cy.loginAsRoleSession("PROFESSOR", "/professor/profile");
    cy.wait("@getProfessorProfile");
  });

  it("affiche la page profil professeur", () => {
    cy.contains(/profil professeur/i).should("be.visible");
  });

  it("affiche les informations principales", () => {
    cy.get(".profile-identity").should("exist");

    cy.get(".profile-identity h1")
      .invoke("text")
      .should("not.be.empty");

    cy.get(".profile-identity p")
      .invoke("text")
      .should("contain", "@");
  });

  it("affiche les badges professeur", () => {
    cy.get(".profile-badges").should("exist");
    cy.get(".profile-badges span").should("have.length.at.least", 1);
  });

  it("affiche les sections du profil", () => {
    cy.contains(/informations acad/i).scrollIntoView().should("be.visible");
    cy.contains("Compte").scrollIntoView().should("be.visible");
    cy.contains(/stages supervis/i).scrollIntoView().should("be.visible");
    cy.contains(/derni.res validations/i).scrollIntoView().should("exist");
  });

  it("affiche les informations académiques", () => {
    cy.contains("Matricule").should("be.visible");
    cy.contains("Grade").should("be.visible");
    cy.contains(/sp.cialit/i).should("be.visible");
    cy.contains(/d.partement/i).should("be.visible");
  });

  it("affiche les informations du compte", () => {
    cy.contains(/t.l.phone/i).should("be.visible");
    cy.contains("Statut").should("be.visible");
    cy.contains(/derni.re connexion/i).should("be.visible");
    cy.contains(/cr.ation/i).should("be.visible");
  });

  it("affiche le statut du compte", () => {
    cy.get(".account-status-pill")
      .should("exist")
      .invoke("text")
      .should("not.be.empty");
  });

  it("affiche les stages supervisés ou un état vide", () => {
    cy.contains(".profile-panel", /stages supervis/i)
      .scrollIntoView()
      .within(() => {
        cy.root().then(($panel) => {
          if ($panel.find(".table-row").length > 0) {
            cy.get(".table-row").first().should("be.visible");
          } else {
            cy.contains(/aucun stage supervis/i).should("be.visible");
          }
        });
      });
  });

  it("affiche les validations récentes ou un état vide", () => {
    cy.contains(".profile-panel", /derni.res validations/i)
      .scrollIntoView()
      .within(() => {
        cy.root().then(($panel) => {
          if ($panel.find(".table-row").length > 0) {
            cy.get(".table-row").first().should("be.visible");
          } else {
            cy.contains(/aucune validation r.cente/i).should("exist");
          }
        });
      });
  });

  it("ouvre le sélecteur de photo", () => {
    cy.contains("button", /changer la photo/i).should("be.visible");
  });

  it("refuse un format de fichier invalide", () => {
    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("fake content"),
        fileName: "test.pdf",
        mimeType: "application/pdf",
      },
      { force: true }
    );

    cy.contains(/format image non autoris/i).should("be.visible");
  });

  it("refuse une image supérieure à 3Mo", () => {
    const bigFile = Cypress.Buffer.alloc(4 * 1024 * 1024);

    cy.get('input[type="file"]').selectFile(
      {
        contents: bigFile,
        fileName: "big-image.png",
        mimeType: "image/png",
      },
      { force: true }
    );

    cy.contains(/moins de 3 mo/i).should("be.visible");
  });

  it("affiche une photo ou des initiales", () => {
    cy.get(".avatar-block")
      .find("img, .profile-avatar")
      .should("be.visible");
  });

  it("affiche les statuts des validations", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".status-pill").length > 0) {
        cy.get(".status-pill").each(($status) => {
          cy.wrap($status).should("be.visible");
        });
      }
    });
  });

  it("vérifie les dates affichées", () => {
    cy.contains(/derni.re connexion/i)
      .parent()
      .find("strong")
      .invoke("text")
      .should("not.be.empty");
  });
});
