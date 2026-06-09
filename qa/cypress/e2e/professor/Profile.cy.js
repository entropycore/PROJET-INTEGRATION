describe("E2E - Profil professeur", () => {
  beforeEach(() => {
    cy.visit("/login");

    cy.get('input[type="email"]').type(Cypress.env("E2E_PROF_EMAIL"));
    cy.get('input[type="password"]').type(Cypress.env("E2E_PROF_PASSWORD"));

    cy.contains("button", /connexion|login/i).click();

    cy.visit("/professor/profile");
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
    cy.contains("Informations académiques").should("be.visible");
    cy.contains("Compte").should("be.visible");
    cy.contains("Stages supervisés").should("be.visible");
    cy.contains("Dernières validations").should("be.visible");
  });

  it("affiche les informations académiques", () => {
    cy.contains("Matricule").should("be.visible");
    cy.contains("Grade").should("be.visible");
    cy.contains("Spécialité").should("be.visible");
    cy.contains("Département").should("be.visible");
  });

  it("affiche les informations du compte", () => {
    cy.contains("Téléphone").should("be.visible");
    cy.contains("Statut").should("be.visible");
    cy.contains("Dernière connexion").should("be.visible");
    cy.contains("Création").should("be.visible");
  });

  it("affiche le statut du compte", () => {
    cy.get(".account-status-pill")
      .should("exist")
      .invoke("text")
      .should("not.be.empty");
  });

  it("affiche les stages supervisés ou un état vide", () => {
    cy.contains("Stages supervisés")
      .parents(".profile-panel")
      .within(() => {
        cy.get("body").then(($body) => {
          if ($body.find(".table-row").length > 0) {
            cy.get(".table-row").first().should("be.visible");
          } else {
            cy.contains(/aucun stage supervisé/i).should("be.visible");
          }
        });
      });
  });

  it("affiche les validations récentes ou un état vide", () => {
    cy.contains("Dernières validations")
      .parents(".profile-panel")
      .within(() => {
        cy.get("body").then(($body) => {
          if ($body.find(".table-row").length > 0) {
            cy.get(".table-row").first().should("be.visible");
          } else {
            cy.contains(/aucune validation récente/i).should("be.visible");
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

    cy.contains(/format image non autorisé/i).should("be.visible");
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
    cy.get("body").then(($body) => {
      if ($body.find(".profile-avatar").length > 0) {
        cy.get(".profile-avatar")
          .invoke("text")
          .should("not.be.empty");
      } else {
        cy.get(".avatar-block img").should("exist");
      }
    });
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
    cy.contains("Dernière connexion")
      .parent()
      .find("strong")
      .invoke("text")
      .should("not.be.empty");
  });
});