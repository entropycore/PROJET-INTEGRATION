describe("E2E - Mes compétences", () => {
  const openTechnicalSkillForm = () => {
    cy.contains(".content-card", "Compétences techniques")
      .contains("button", /ajouter/i)
      .click();
  };

  const withinSoftSkillsCard = (callback) => {
    cy.contains(".content-card", "Compétences comportementales").within(callback);
  };

  beforeEach(() => {
    cy.loginAsStudent("/student/competances");
  });

  it("affiche la page compétences", () => {
    cy.contains("Mes compétences").should("be.visible");
    cy.contains("Compétences techniques").should("be.visible");
    cy.contains("Compétences comportementales").should("be.visible");
    cy.contains("Aperçu du profil technique").should("be.visible");
    cy.contains("Suggestions d'amélioration").should("be.visible");
  });

  it.skip("ouvre le formulaire ajout compétence technique", () => {
    openTechnicalSkillForm();

    cy.contains("Ajouter une compétence technique").should("exist");
    cy.get('input[type="search"]').should("exist");
    cy.contains("button", /^Ajouter$/).should("exist");
    cy.contains("button", /annuler/i).should("exist");
  });

  it("annule ajout compétence technique", () => {
    openTechnicalSkillForm();

    cy.contains("button", /annuler/i).click();

    cy.contains("Ajouter une compétence technique").should("not.exist");
  });

  it("cherche une compétence technique dans le catalogue", () => {
    openTechnicalSkillForm();

    cy.get('input[type="search"]').type("JavaScript");

    cy.get("body").then(($body) => {
      if ($body.find(".catalog-suggestion").length > 0) {
        cy.get(".catalog-suggestion").first().should("exist");
      } else {
        cy.contains(/aucune compétence technique disponible/i).should("exist");
      }
    });
  });

  it.skip("ajoute une compétence technique si disponible", () => {
    openTechnicalSkillForm();

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

  it.skip("supprime une compétence technique si elle existe", () => {
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

  it.skip("ouvre formulaire ajout soft skill", () => {
    withinSoftSkillsCard(() => {
      cy.contains("button", /ajouter/i).click();
      cy.get('input[placeholder="Ex: Leadership"]').should("exist");
      cy.contains("button", /^OK$/).should("exist");
    });
  });

  it.skip("ajoute une soft skill", () => {
    withinSoftSkillsCard(() => {
      cy.contains("button", /ajouter/i).click();

      cy.get('input[placeholder="Ex: Leadership"]')
        .clear()
        .type(`Leadership E2E ${Date.now()}`);

      cy.contains("button", /^OK$/).click();
    });

    cy.contains(/Leadership E2E/i).should("be.visible");
  });

  it("annule ajout soft skill", () => {
    withinSoftSkillsCard(() => {
      cy.contains("button", /ajouter/i).click();
      cy.contains("button", "✕").click();
      cy.get('input[placeholder="Ex: Leadership"]').should("not.exist");
    });
  });

  it.skip("supprime une soft skill si elle existe", () => {
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
      cy.root().should(($card) => {
        const hasSuggestion = $card.find(".suggestion-item").length > 0;
        const hasEmptyState = /aucune suggestion prioritaire/i.test($card.text());
        expect(hasSuggestion || hasEmptyState).to.eq(true);
      });
    });
  });
});
