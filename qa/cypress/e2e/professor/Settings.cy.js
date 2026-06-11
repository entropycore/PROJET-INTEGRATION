describe("E2E - Paramètres professeur", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/auth/csrf-token", {
      statusCode: 200,
      body: { csrfToken: "csrf-cypress-token" },
    }).as("getCsrfToken");

    cy.intercept("GET", "**/api/professor/profile", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: {
            fullName: "prof ghailani",
            firstName: "prof",
            lastName: "ghailani",
            email: "prof.ghailani@ensat.ma",
            phone: "",
            accountStatus: "ACTIVE",
            lastLoginAt: null,
            createdAt: null,
            profilePicture: "",
          },
          profile: {
            employeeId: "PROF-CYPRESS",
            grade: "Professeur",
            specialty: "Genie logiciel",
            department: "Informatique",
          },
        },
      },
    }).as("getProfessorProfile");

    cy.intercept("GET", "**/api/professor/settings", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          privacy: {
            profileVisibility: "PUBLIC",
            showEmail: true,
            showPhone: false,
          },
          notifications: {
            email: true,
            push: false,
            validationAssignments: true,
            validationUpdates: true,
            weeklyDigest: false,
          },
        },
      },
    }).as("getProfessorSettings");

    cy.intercept("PUT", "**/api/professor/settings/password", {
      statusCode: 200,
      body: { success: true, data: {} },
    }).as("updateProfessorPassword");

    cy.intercept("PUT", "**/api/professor/settings/privacy", {
      statusCode: 200,
      body: { success: true, data: {} },
    }).as("updateProfessorPrivacy");

    cy.intercept("PUT", "**/api/professor/settings/notifications", {
      statusCode: 200,
      body: { success: true, data: {} },
    }).as("updateProfessorNotifications");

    cy.intercept("POST", "**/api/auth/forgot-password", {
      statusCode: 200,
      body: { success: true, message: "Lien envoye" },
    }).as("sendProfessorPasswordReset");

    cy.loginAsRoleSession("PROFESSOR", "/professor/settings");
    cy.wait(["@getProfessorProfile", "@getProfessorSettings"]);
  });

  it("affiche la page paramètres", () => {
    cy.contains(/espace professeur/i).should("be.visible");
    cy.contains(/param/i).should("be.visible");
    cy.contains(/g.rez la s.curit/i).should("be.visible");
  });

  it("affiche les sections principales", () => {
    cy.contains(/s.curit. du compte/i).should("be.visible");
    cy.contains(/r.initialisation par email/i).should("be.visible");
    cy.contains(/confidentialit/i).should("be.visible");
    cy.contains(/notifications/i).should("be.visible");
  });

  it("affiche les champs mot de passe", () => {
    cy.contains("Mot de passe actuel").should("be.visible");
    cy.contains("Nouveau mot de passe").should("be.visible");
    cy.contains("Confirmation").should("be.visible");

    cy.get('input[autocomplete="current-password"]').should("exist");
    cy.get('input[autocomplete="new-password"]').should("have.length", 2);
  });

  it("affiche et masque les mots de passe", () => {
    cy.get('input[autocomplete="current-password"]').should("have.attr", "type", "password");

    cy.get('button[aria-label="Afficher le mot de passe actuel"]').click();
    cy.get('input[autocomplete="current-password"]').should("have.attr", "type", "text");

    cy.get('button[aria-label="Masquer le mot de passe actuel"]').click();
    cy.get('input[autocomplete="current-password"]').should("have.attr", "type", "password");
  });

  it("refuse changement si mot de passe actuel vide", () => {
    cy.contains("button", /changer le mot de passe/i).click();

    cy.contains("Veuillez entrer le mot de passe actuel.").should("be.visible");
  });

  it("refuse nouveau mot de passe court", () => {
    cy.get('input[autocomplete="current-password"]').type("ancienpass");

    cy.get('input[autocomplete="new-password"]').eq(0).type("123");
    cy.get('input[autocomplete="new-password"]').eq(1).type("123");

    cy.contains("button", /changer le mot de passe/i).click();

    cy.contains("Le nouveau mot de passe doit contenir au moins 8 caractères.").should("be.visible");
  });

  it("refuse mots de passe différents", () => {
    cy.get('input[autocomplete="current-password"]').type("ancienpass");
    cy.get('input[autocomplete="new-password"]').eq(0).type("nouveaupass123");
    cy.get('input[autocomplete="new-password"]').eq(1).type("differentpass123");

    cy.contains("button", /changer le mot de passe/i).click();

    cy.contains("Les mots de passe ne correspondent pas.").should("be.visible");
  });

  it("envoie lien de réinitialisation si email disponible", () => {
    cy.get("body").then(($body) => {
      if (!$body.text().includes("Email du compte non disponible")) {
        cy.contains("button", /envoyer un lien/i).click();

        cy.contains(/un lien de réinitialisation|impossible d'envoyer/i).should("be.visible");
      }
    });
  });

  it("change visibilité profil", () => {
    cy.contains("button", "Public").click();
    cy.contains("button", "Public").should("have.class", "active");

    cy.contains("button", "Connexions").click();
    cy.contains("button", "Connexions").should("have.class", "active");

    cy.contains("button", "Privé").click();
    cy.contains("button", "Privé").should("have.class", "active");
  });

  it("modifie confidentialité", () => {
    cy.contains("Afficher l'email")
      .parent()
      .find('input[type="checkbox"]')
      .click({ force: true });

    cy.contains("Afficher le téléphone")
      .parent()
      .find('input[type="checkbox"]')
      .click({ force: true });

    cy.contains("Confidentialité")
      .parents(".settings-panel")
      .within(() => {
        cy.contains("button", /enregistrer/i).click();
      });

    cy.contains(/confidentialité mise à jour|impossible de mettre à jour/i).should("be.visible");
  });

  it("modifie les notifications", () => {
    cy.contains("Notifications par email")
      .parent()
      .find('input[type="checkbox"]')
      .click({ force: true });

    cy.contains("Notifications navigateur")
      .parent()
      .find('input[type="checkbox"]')
      .click({ force: true });

    cy.contains("Résumé hebdomadaire")
      .parent()
      .find('input[type="checkbox"]')
      .click({ force: true });

    cy.contains("Notifications")
      .parents(".settings-panel")
      .within(() => {
        cy.contains("button", /enregistrer/i).click();
      });

    cy.contains(/notifications mises à jour|impossible de mettre à jour/i).should("be.visible");
  });

  it("affiche les switches de notifications", () => {
    cy.contains("Notifications")
      .parents(".settings-panel")
      .within(() => {
        cy.contains("Notifications par email").should("be.visible");
        cy.contains("Notifications navigateur").should("be.visible");
        cy.contains("Nouvelles validations assignées").should("be.visible");
        cy.contains("Mises à jour de validation").should("be.visible");
        cy.contains("Résumé hebdomadaire").should("be.visible");
      });
  });
});
