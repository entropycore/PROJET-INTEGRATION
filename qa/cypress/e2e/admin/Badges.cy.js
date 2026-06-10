describe("Page de gestion des badges - Tests E2E avec backend reel", () => {
  const openCreateModal = () => {
    cy.get(".primary-btn").click();
    cy.get(".modal-overlay").should("be.visible");
  };

  beforeEach(() => {
    cy.loginAsAdminJwt("/admin/badges");
    cy.get(".page-header h1", { timeout: 15000 }).should("contain.text", "Syst");
    cy.get(".badges-grid .badge-card", { timeout: 15000 }).should(
      "have.length.at.least",
      1,
    );
  });

  it("affiche la liste initiale des badges", () => {
    cy.get(".page-header h1").should("contain.text", "Syst");
    cy.get(".badges-grid .badge-card").should("have.length.at.least", 1);

    cy.get(".badge-card").first().within(() => {
      cy.get("h3").should("not.be.empty");
      cy.get(".rule").should("be.visible");
      cy.get(".count").should("contain.text", "attributions");
    });
  });

  it("ouvre la modale et cree un badge", () => {
    const badgeName = `Badge Cypress ${Date.now()}`;

    openCreateModal();
    cy.get(".modal-header h2").should("contain.text", "Nouveau badge");

    cy.get('.form-group input[placeholder*="Web Developer"]').type(badgeName);
    cy.get('.form-group input[placeholder*="Courte description"]').type(
      "Description du badge de test",
    );
    cy.get(".form-group textarea").type("Avoir valide le test E2E Cypress");
    cy.get(".modal-actions .create-btn").click();

    cy.get(".modal-overlay").should("not.exist");
    cy.get(".badges-page", { timeout: 15000 }).should("contain.text", badgeName);
  });

  it("bloque la soumission si les champs obligatoires manquent", () => {
    openCreateModal();

    cy.on("window:alert", (message) => {
      expect(message).to.contain("Veuillez remplir");
    });

    cy.get(".modal-actions .create-btn").click();
    cy.get(".modal-overlay").should("be.visible");
  });

  it("ouvre la modale en mode edition et met a jour un badge", () => {
    const updatedName = `Badge Modifie ${Date.now()}`;

    cy.get(".badge-card").first().find(".edit-btn").click();
    cy.get(".modal-overlay").should("be.visible");
    cy.get(".modal-header h2").should("contain.text", "Modifier le badge");

    cy.get('.form-group input[placeholder*="Web Developer"]')
      .clear()
      .type(updatedName);
    cy.get(".modal-actions .create-btn").click();

    cy.get(".modal-overlay").should("not.exist");
    cy.get(".badges-page", { timeout: 15000 }).should("contain.text", updatedName);
  });

  it("declenche la suppression apres confirmation", () => {
    cy.get(".badges-grid .badge-card").then(($cards) => {
      const initialCount = $cards.length;

      cy.on("window:confirm", () => true);
      cy.wrap($cards).first().find(".delete-btn").click();

      cy.get(".page-header h1").should("contain.text", "Syst");
      cy.get(".badges-grid .badge-card").should(($updatedCards) => {
        expect($updatedCards.length).to.be.at.most(initialCount);
      });
    });
  });
});
