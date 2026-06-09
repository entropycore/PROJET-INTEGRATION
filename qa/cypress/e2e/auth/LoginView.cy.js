describe('E2E - Page Login', () => {
  
  // Fonction utilitaire pour ralentir les actions
  const delay = 1000; // 1 seconde entre chaque étape

  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
    cy.wait(delay); 
    cy.url().should('include', '/login');
  });

  it('doit basculer la visibilité du mot de passe (toggle password)', () => {
    cy.get('#password')
      .should('exist')
      .and('have.attr', 'type', 'password');
    
    cy.wait(delay);

    cy.get('.toggle-icon')
      .should('be.visible')
      .click();

    cy.wait(delay);

    cy.get('#password')
      .should('have.attr', 'type', 'text');
  });

  it('doit afficher une erreur lors de la validation de champs vides', () => {
    cy.wait(delay);

    cy.get('.submit-btn')
      .should('be.visible')
      .click();

    cy.wait(delay);

    cy.get('.error-message')
      .should('exist')
      .and('be.visible');
  });

  it('doit naviguer vers la page de demande d’accès', () => {
    cy.wait(delay);

    cy.get('.access-request-link')
      .should('be.visible')
      .click();

    cy.wait(delay);

    cy.url().should('include', '/request-access');
  });
});

describe("E2E - Authentification avec le backend et la base de données", () => {
  const apiBaseUrl = Cypress.env("API_BASE_URL");
  const studentEmail = "etudiant@credencia.ma";
  const password = "Password123!";

  before(function () {
    cy.task("db:isAvailable").then((isAvailable) => {
      if (!isAvailable) {
        cy.log("La base de données n'est pas disponible, ces tests sont ignorés.");
        this.skip();
      }
    });
  });

  beforeEach(() => {
    cy.task("db:deleteRefreshSessionsByEmail", studentEmail);
  });

  afterEach(() => {
    cy.task("db:deleteRefreshSessionsByEmail", studentEmail);
  });

  it("vérifie que l'utilisateur étudiant de test existe dans la base", () => {
    cy.task("db:findUserByEmail", studentEmail).then((user) => {
      expect(user).to.exist;
      expect(user.email).to.eq(studentEmail);
      expect(user.role).to.eq("STUDENT");
      expect(user.accountStatus).to.eq("ACTIVE");
      expect(user.student).to.include({
        major: "Genie Informatique",
        level: "GINF1",
      });
    });
  });

  it("refuse un mauvais mot de passe sans créer de session en base", () => {
    cy.request({
      method: "POST",
      url: `${apiBaseUrl}/api/auth/login`,
      failOnStatusCode: false,
      body: {
        email: studentEmail,
        password: "wrong-password",
      },
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.include({
        success: false,
        message: "Identifiants invalides.",
      });
    });

    cy.task("db:countRefreshSessionsByEmail", studentEmail).should("eq", 0);
  });

  it("crée une session en base après la connexion puis la révoque à la déconnexion", () => {
    cy.request({
      method: "POST",
      url: `${apiBaseUrl}/api/auth/login`,
      body: {
        email: studentEmail,
        password,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.include({
        success: true,
        role: "STUDENT",
      });
      expect(response.headers["set-cookie"].join(";")).to.contain(
        "refreshToken="
      );
    });

    cy.task("db:countActiveRefreshSessionsByEmail", studentEmail).should(
      "eq",
      1
    );

    cy.request(`${apiBaseUrl}/api/auth/me`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.include({
        email: studentEmail,
        role: "STUDENT",
        accountStatus: "ACTIVE",
      });
    });

    cy.request("POST", `${apiBaseUrl}/api/auth/logout`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.include({
        success: true,
        message: "Déconnexion réussie.",
      });
    });

    cy.task("db:countActiveRefreshSessionsByEmail", studentEmail).should(
      "eq",
      0
    );
  });
});
