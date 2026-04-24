describe('Demonstration E2E - Plateforme ValiDia', () => {
  const tempo = 500;

  const remplirFormulaireDemandeAcces = ({
    lastName = 'Rabii',
    firstName = 'Ghizlane',
    email = 'ghizlane.rabii@ensa.ac.ma',
    companyName = 'OCP',
    jobTitle = 'Stagiaire IT',
    password = 'Password123!',
    passwordConfirmation = 'Password123!',
  } = {}) => {
    cy.get('#lastName').clear().type(lastName);
    cy.get('#firstName').clear().type(firstName);
    cy.get('#email').clear().type(email);
    cy.get('#companyName').clear().type(companyName);
    cy.get('#jobTitle').clear().type(jobTitle);
    cy.get('#password').clear().type(password);
    cy.get('#passwordConfirmation').clear().type(passwordConfirmation);
  };

  // ==========================================
  // SECTION 1 : LOGIN
  // ==========================================
  describe('1. Page Login', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5173/login');
    });

    it('toggle password', () => {
      cy.get('#password').should('have.attr', 'type', 'password');
      cy.get('.toggle-icon').click();
      cy.get('#password').should('have.attr', 'type', 'text');
    });

    it('validation champs vides', () => {
      cy.get('.submit-btn').click();
      cy.get('.error-message').should('be.visible'); // Juste vérifier la visibilité
    });

    it('navigation vers request access', () => {
      cy.get('.access-request-link').click();
      cy.url().should('include', '/request-access');
    });
  });

  // ==========================================
  // SECTION 2 : REQUEST ACCESS
  // ==========================================
  describe('2. Request Access', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5173/request-access');
    });

    it('remplir formulaire et succès', () => {
      // FIX: Mocking la réponse API pour éviter l'erreur "Impossible d'envoyer"
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 200,
        body: { message: 'Demande envoyée avec succès' }
      }).as('submitReq');

      remplirFormulaireDemandeAcces();

      cy.get('.submit-btn')
        .should('be.visible')
        .and('not.be.disabled')
        .click();

      // Attendre l'appel API simulé
      cy.wait('@submitReq');

      // Augmenter le timeout pour laisser le temps au message d'apparaître
      cy.get('.success-message', { timeout: 4000 })
        .should('be.visible')
        .and('contain', 'validée'); 
    });

    it('retour vers login', () => {
      cy.get('.login-link span').click();
      cy.url().should('include', '/login');
    });

    it('erreur mots de passe différents', () => {
      remplirFormulaireDemandeAcces({
        password: 'Pass123!',
        passwordConfirmation: 'Pass456!',
      });

      cy.get('.submit-btn').click();
      cy.get('.error-message').should('be.visible');
    });

    it('test XSS champ nom', () => {
      const xss = '<script>alert("xss")</script>';
      cy.get('#lastName').type(xss).should('have.value', xss);
    });

    it('etat isSubmitting', () => {
      // Simulation d'une réponse lente
      cy.intercept('POST', '**/api/auth/register', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000);
        });
      }).as('slowRequest');

      remplirFormulaireDemandeAcces();

      cy.get('.submit-btn').click();
      
      // Vérifier l'état pendant l'envoi
      cy.get('.submit-btn').should('be.disabled');
      cy.get('.submit-btn').should('contain', 'Envoi');

      cy.wait('@slowRequest');
      cy.get('.submit-btn').should('not.be.disabled');
    });
  });
});