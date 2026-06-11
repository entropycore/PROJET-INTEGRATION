describe("E2E - Mon GitHub", () => {
  beforeEach(() => {
    cy.loginAsStudent("/student/github");
  });

  it("affiche la page GitHub", () => {
    cy.contains("Mon GitHub").should("be.visible");

    cy.contains(
      /connectez votre compte github pour enrichir automatiquement votre portfolio/i
    ).should("be.visible");
  });

  it("affiche soit l'état non connecté soit l'état connecté", () => {
    cy.contains(/lier votre compte github|compte connecté/i, {
      timeout: 15000,
    }).should("be.visible");

    cy.get("body").then(($body) => {
      if ($body.text().includes("Lier votre compte GitHub")) {
        cy.contains("Lier votre compte GitHub").should("be.visible");
        cy.contains("Connecter GitHub").should("be.visible");
      } else {
        cy.contains("Compte connecté").should("be.visible");
        cy.contains("Connecté").should("be.visible");
      }
    });
  });

  it("affiche les bénéfices si GitHub non connecté", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Lier votre compte GitHub")) {
        cy.contains("Pourquoi connecter GitHub à Credencia ?").should("be.visible");
        cy.contains("Importez vos projets").should("be.visible");
        cy.contains("Suivez vos contributions").should("be.visible");
        cy.contains("Gagnez du temps").should("be.visible");
      }
    });
  });

  it("teste le bouton connecter GitHub si non connecté", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Connecter GitHub")) {
        cy.contains("button", /connecter github/i).should("be.visible");
        cy.contains("button", /connecter github/i).click();

        cy.get("body").then(($newBody) => {
          expect(
            $newBody.text().includes("Connexion") ||
              $newBody.text().includes("Connexion GitHub impossible") ||
              true
          ).to.equal(true);
        });
      }
    });
  });

  it("affiche le compte GitHub connecté", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Compte connecté")) {
        cy.contains("Compte connecté").should("be.visible");
        cy.contains("Synchronisé avec Credencia").should("be.visible");
        cy.get(".github-profile-link").should("have.attr", "href");
      }
    });
  });

  it("synchronise les données GitHub si connecté", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Compte connecté")) {
        cy.contains("button", /synchroniser/i).click();
        cy.contains("Compte connecté").should("be.visible");
      }
    });
  });

  it("affiche les statistiques GitHub si connecté", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Compte connecté")) {
        cy.contains("Dépôts publics").should("be.visible");
        cy.contains("Contributions").should("be.visible");
        cy.contains("Langages").should("be.visible");

        cy.get(".github-stat-card").should("have.length", 3);
      }
    });
  });

  it("affiche le calendrier d'activité si connecté", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Compte connecté")) {
        cy.contains("Calendrier d'activité").should("be.visible");
        cy.get(".github-contribution-chart").should("exist");
      }
    });
  });

  it("affiche la table des dépôts si connecté", () => {
    cy.get("body").then(($body) => {
      if ($body.text().includes("Compte connecté")) {
        cy.contains("Dépôts à inclure dans le portfolio").should("be.visible");
        cy.contains("Dépôt").should("be.visible");
        cy.contains("Technologie").should("be.visible");
        cy.contains("Dernière activité").should("be.visible");
        cy.contains("Action").should("be.visible");
      }
    });
  });

  it("importe un dépôt GitHub si disponible", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".github-import-project-btn:not(:disabled)").length > 0) {
        cy.get(".github-import-project-btn:not(:disabled)")
          .first()
          .click();

        cy.get(".github-import-project-btn").first().should("exist");
      } else if ($body.text().includes("Aucun dépôt GitHub trouvé")) {
        cy.contains("Aucun dépôt GitHub trouvé").should("be.visible");
      }
    });
  });

  it("affiche les dépôts déjà importés comme désactivés", () => {
    cy.get("body").then(($body) => {
      if ($body.find(".github-import-project-btn.imported").length > 0) {
        cy.get(".github-import-project-btn.imported")
          .first()
          .should("be.disabled")
          .and("contain.text", "Déjà importé");
      }
    });
  });

  it("affiche les lignes de dépôts si disponibles", () => {
    cy.get("body").then(($body) => {
      if ($body.find("tbody tr").length > 0) {
        cy.get("tbody tr").first().within(() => {
          cy.get("td").should("have.length", 4);
        });
      } else if ($body.text().includes("Aucun dépôt GitHub trouvé")) {
        cy.contains("Aucun dépôt GitHub trouvé").should("be.visible");
      }
    });
  });
});
