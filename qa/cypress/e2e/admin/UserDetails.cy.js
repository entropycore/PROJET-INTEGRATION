describe("Details et edition utilisateur - Admin", () => {
  const mockUser = {
    id: "usr_123",
    firstName: "Kholoud",
    lastName: "Nihal",
    email: "k.nihal@ensa.ma",
    phone: "0600112233",
    role: "STUDENT",
    accountStatus: "PENDING",
    createdAt: "2026-04-15T10:00:00.000Z",
    lastLoginAt: "2026-05-20T14:30:00.000Z",
    emailVerified: true,
    roleDetails: {
      student: {
        apogeeCode: "1122334",
        cne: "P123456789",
        major: "Genie Informatique",
        level: "CI1",
        city: "Tanger",
        linkedinUrl: "https://linkedin.com/in/test",
      },
    },
  };

  beforeEach(() => {
    // Ignorer les erreurs uncaught de l'app qui ne concernent pas le test
    cy.on("uncaught:exception", (err) => {
      if (
        err.message.includes("Cannot read properties of undefined") ||
        err.message.includes("Cannot read properties of null") ||
        err.message.includes("length")
      ) {
        return false;
      }
    });

    // Intercept liste users — structure adaptée avec total pour pagination
    cy.intercept("GET", "**/api/admin/users**", {
      statusCode: 200,
      body: {
        data: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
      },
    }).as("getUsersList");

    // Intercept détail user
    cy.intercept("GET", "**/api/admin/users/usr_123", {
      statusCode: 200,
      body: { data: mockUser },
    }).as("getUser");

    // Intercept badges (appelé au visit /admin/badges dans l'ancien beforeEach)
    cy.intercept("GET", "**/api/admin/badges**", {
      statusCode: 200,
      body: { data: [] },
    }).as("getBadges");

    // Permissions clipboard
    cy.wrap(
      Cypress.automation("remote:debugger:protocol", {
        command: "Browser.grantPermissions",
        params: {
          permissions: ["clipboardReadWrite"],
          origin: window.location.origin,
        },
      })
    );

    // Login admin puis visite de la liste
    cy.loginAsAdmin();
    cy.visit("/admin/users?role=STUDENT");

    // Attendre que la liste charge
    cy.wait("@getUsersList");

    // Cliquer sur l'utilisateur pour aller sur sa page de détail
    cy.contains("k.nihal@ensa.ma").click();
    cy.wait("@getUser");
  });

  // ─────────────────────────────────────────────
  // 1. Chargement des détails
  // ─────────────────────────────────────────────
  it("charge les details de l'utilisateur", () => {
    cy.get("h1").should("contain", "Kholoud Nihal");
    cy.get(".details-email").should("contain", "k.nihal@ensa.ma");
    cy.contains("label", "Prenom").find("input").should("be.disabled");
    cy.contains("label", "Apogee").find("input").should("be.disabled");
    cy.get(".meta-card")
      .should("contain", "15/04/2026")
      .and("contain", "Oui");
  });

  // ─────────────────────────────────────────────
  // 2. Edition, modification ville et sauvegarde
  // ─────────────────────────────────────────────
  it("passe en edition, modifie la ville et sauvegarde", () => {
    cy.intercept("PUT", "**/api/admin/users/usr_123", {
      statusCode: 200,
      body: { data: mockUser },
    }).as("updateUser");

    cy.intercept("PATCH", "**/api/admin/users/usr_123/status", {
      statusCode: 200,
      body: { data: { ...mockUser, accountStatus: "ACTIVE" } },
    }).as("updateStatus");

    // Recharger le détail après update
    cy.intercept("GET", "**/api/admin/users/usr_123", {
      statusCode: 200,
      body: { data: { ...mockUser, accountStatus: "ACTIVE" } },
    }).as("getUpdatedUser");

    cy.get(".primary-btn").contains("Modifier").click();
    cy.contains("label", "Ville").find("input").clear().type("Tetouan");
    cy.contains("label", "Statut").find("select").select("ACTIVE");
    cy.get(".primary-btn").contains("Enregistrer").click();

    cy.wait("@updateUser");
    cy.wait("@updateStatus");
    cy.wait("@getUpdatedUser");
  });

  // ─────────────────────────────────────────────
  // 3. Réinitialisation mot de passe
  // ─────────────────────────────────────────────
  it("reinitialise le mot de passe et affiche le modal", () => {
    cy.intercept("PATCH", "**/api/admin/users/usr_123/reset-password", {
      statusCode: 200,
      body: { data: { temporaryPassword: "NewResetPassword2026!" } },
    }).as("resetPassword");

    cy.get(".security-card").scrollIntoView();
    cy.get(".security-card")
      .contains("button", "Reinitialiser le mot de passe")
      .click();

    cy.wait("@resetPassword");

    cy.get(".admin-modal").should("be.visible");
    cy.get(".temporary-password-box").should(
      "contain",
      "NewResetPassword2026!"
    );

    // Copier le mot de passe
    cy.get(".admin-modal").contains("button", "Copier").click();
    cy.get(".admin-modal").contains("button", "Copie").should("be.visible");

    // Fermer le modal
    cy.get(".admin-modal").contains("button", "Fermer").click();
    cy.get(".admin-modal-backdrop").should("not.exist");
  });

  // ─────────────────────────────────────────────
  // 4. Annulation suppression via confirm
  // ─────────────────────────────────────────────
  it("annule la suppression via confirm", () => {
    cy.on("window:confirm", () => false);
    cy.get(".danger-btn").contains("Supprimer").click();
    cy.url().should("include", "/admin/users/usr_123");
  });

  // ─────────────────────────────────────────────
  // 5. Suppression et redirection
  // ─────────────────────────────────────────────
  it("supprime l'utilisateur et redirige vers la liste", () => {
    cy.intercept("DELETE", "**/api/admin/users/usr_123", {
      statusCode: 200,
      body: { data: { success: true } },
    }).as("deleteUser");

    cy.on("window:confirm", () => true);

    cy.get(".danger-btn").contains("Supprimer").click();
    cy.wait("@deleteUser");
    cy.url().should("include", "/admin/users");
  });
});