describe("E2E - Mes compétences", () => {
  beforeEach(() => {
    cy.visit("/login");

    cy.get('input[type="email"]').type(Cypress.env("E2E_EMAIL"));
    cy.get('input[type="password"]').type(Cypress.env("E2E_PASSWORD"));

    cy.contains("button", /connexion|login/i).click();

    cy.visit("/student/skills");
  });

  it("affiche la page compétences", () => {
    cy.contains("Mes compétences").should("be.visible");
    cy.contains("Compétences techniques").should("be.visible");
    cy.contains("Compétences comportementales").should("be.visible");
    cy.contains("Aperçu du profil technique").should("be.visible");
    cy.contains("Suggestions d'amélioration").should("be.visible");
  });

  it("ouvre le formulaire ajout compétence technique", () => {
    cy.contains("button", /ajouter une compétence/i).click();

    cy.contains("Ajouter une compétence technique").should("be.visible");
    cy.get('input[type="search"]').should("be.visible");
    cy.contains("button", /^Ajouter$/).should("be.visible");
    cy.contains("button", /annuler/i).should("be.visible");
  });

  it("annule ajout compétence technique", () => {
    cy.contains("button", /ajouter une compétence/i).click();

    cy.contains("button", /annuler/i).click();

    cy.contains("Ajouter une compétence technique").should("not.exist");
  });

  it("cherche une compétence technique dans le catalogue", () => {
    cy.contains("button", /ajouter une compétence/i).click();

    cy.get('input[type="search"]').type("JavaScript");

    cy.get("body").then(($body) => {
      if ($body.find(".catalog-suggestion").length > 0) {
        cy.get(".catalog-suggestion").first().should("be.visible");
      } else {
        cy.contains(/aucune compétence technique disponible/i).should("be.visible");
      }
    });
  });

  it("ajoute une compétence technique si disponible", () => {
    cy.contains("button", /ajouter une compétence/i).click();

    cy.get('input[type="search"]').type("JavaScript");

    cy.get("body").then(($body) => {
      if ($body.find(".catalog-suggestion").length > 0) {
        cy.get(".catalog-suggestion").first().click();

        cy.contains("button", /^Ajouter$/).should("not.be.disabled");
        cy.contains("button", /^Ajouter$/).click();

        cy.contains("Ajouter une compétence technique").should("not.exist");
      }
    });
  });

  it("supprime une compétence technique si elle existe", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".skill-card").length > 0) {
        cy.get(".skill-card").first().within(() => {
          cy.get(".icon-btn").click();
        });
      } else {
        cy.contains(/aucune compétence technique/i).should("be.visible");
      }
    });
  });

  it("ouvre formulaire ajout soft skill", () => {
    cy.contains("Compétences comportementales")
      .parents(".content-card")
      .within(() => {
        cy.contains("button", /ajouter/i).click();
        cy.get('input[placeholder="Ex: Leadership"]').should("be.visible");
        cy.contains("button", /^OK$/).should("be.visible");
      });
  });

  it("ajoute une soft skill", () => {
    cy.contains("Compétences comportementales")
      .parents(".content-card")
      .within(() => {
        cy.contains("button", /ajouter/i).click();

        cy.get('input[placeholder="Ex: Leadership"]')
          .clear()
          .type(`Leadership E2E ${Date.now()}`);

        cy.contains("button", /^OK$/).click();
      });

    cy.contains(/Leadership E2E/i).should("be.visible");
  });

  it("annule ajout soft skill", () => {
    cy.contains("Compétences comportementales")
      .parents(".content-card")
      .within(() => {
        cy.contains("button", /ajouter/i).click();
        cy.contains("button", "✕").click();
        cy.get('input[placeholder="Ex: Leadership"]').should("not.exist");
      });
  });

  it("supprime une soft skill si elle existe", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".soft-card").length > 0) {
        cy.get(".soft-card").first().within(() => {
          cy.get(".icon-btn").click();
        });
      } else {
        cy.contains(/aucune compétence comportementale/i).should("be.visible");
      }
    });
  });

  it("affiche le radar ou les statistiques domaines", () => {
    cy.get(".radar-chart").should("exist");
    cy.get(".domain-bars").should("exist");
  });

  it("affiche les suggestions ou l'état vide", () => {
    cy.get(".suggestions-card").within(() => {
      cy.get("body").then(($body) => {
        if ($body.find(".suggestion-item").length > 0) {
          cy.get(".suggestion-item").first().should("be.visible");
        } else {
          cy.contains(/aucune suggestion prioritaire/i).should("be.visible");
        }
      });
    });
  });
});