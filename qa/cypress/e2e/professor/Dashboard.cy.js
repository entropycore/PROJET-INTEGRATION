describe("E2E - Dashboard professeur", () => {
  beforeEach(() => {
    cy.visit("/login");

    cy.get('input[type="email"]').type(Cypress.env("E2E_PROF_EMAIL"));
    cy.get('input[type="password"]').type(Cypress.env("E2E_PROF_PASSWORD"));

    cy.contains("button", /connexion|login/i).click();

    cy.visit("/professor/dashboard");
  });

  it("affiche le dashboard professeur", () => {
    cy.contains("ESPACE PROFESSEUR").should("be.visible");
    cy.contains(/bonjour/i).should("be.visible");
    cy.contains(/suivez les validations/i).should("be.visible");
  });

  it("affiche les cartes résumé", () => {
    cy.get(".summary-card").should("have.length", 4);

    cy.contains("Projets à valider").should("be.visible");
    cy.contains("Stages à valider").should("be.visible");
    cy.contains("Stages supervisés").should("be.visible");
    cy.contains("Avis rendus").should("be.visible");
  });

  it("redirige vers validations depuis le bouton principal", () => {
    cy.contains("a", /voir les validations/i).click();

    cy.url().should("include", "/professor/validations");
  });

  it("affiche validations en attente ou état vide", () => {
    cy.contains("Validations en attente")
      .parents(".dashboard-panel")
      .within(() => {
        cy.get("body").then(($body) => {
          if ($body.find(".list-row").length > 0) {
            cy.get(".list-row").first().should("be.visible");
            cy.get(".type-pill").first().should("be.visible");
          } else {
            cy.contains(/aucune validation en attente/i).should("be.visible");
          }
        });
      });
  });

  it("redirige vers validations depuis Tout voir", () => {
    cy.contains("Validations en attente")
      .parents(".dashboard-panel")
      .within(() => {
        cy.contains("a", /tout voir/i).click();
      });

    cy.url().should("include", "/professor/validations");
  });

  it("affiche stages supervisés ou état vide", () => {
    cy.contains("Stages supervisés")
      .parents(".dashboard-panel")
      .within(() => {
        cy.get("body").then(($body) => {
          if ($body.find(".list-row").length > 0) {
            cy.get(".list-row").first().should("be.visible");
            cy.get(".status-pill").first().should("be.visible");
          } else {
            cy.contains(/aucun stage supervisé/i).should("be.visible");
          }
        });
      });
  });

  it("affiche derniers avis ou état vide", () => {
    cy.contains("Derniers avis")
      .parents(".dashboard-panel")
      .within(() => {
        cy.get("body").then(($body) => {
          if ($body.find(".activity-row").length > 0) {
            cy.get(".activity-row").first().should("be.visible");
          } else {
            cy.contains(/aucun avis rendu récemment/i).should("be.visible");
          }
        });
      });
  });

  it("vérifie les valeurs des cartes résumé", () => {
    cy.get(".summary-card").each(($card) => {
      cy.wrap($card).find("strong").invoke("text").should("match", /^[0-9]+$/);
    });
  });

  it("affiche les statuts des stages si présents", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".status-pill").length > 0) {
        cy.get(".status-pill").each(($status) => {
          cy.wrap($status).should("be.visible");
        });
      }
    });
  });

  it("affiche les types des validations si présents", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".type-pill").length > 0) {
        cy.get(".type-pill").each(($type) => {
          cy.wrap($type)
            .invoke("text")
            .should("match", /Projet|Stage/);
        });
      }
    });
  });
});