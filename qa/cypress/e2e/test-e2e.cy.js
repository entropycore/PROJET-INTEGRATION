describe('Demonstration E2E - Plateforme ValiDia', () => {

  const remplirFormulaireDemandeAcces = ({
    lastName = 'Rabii',
    firstName = 'Ghizlane',
    email = 'ghizlane.rabii@ensa.ac.ma',
    companyName = 'OCP',
    jobTitle = 'Stagiaire IT',
    password = 'Password123!',
    passwordConfirmation = 'Password123!',
  } = {}) => {
    cy.get('#lastName').should('be.visible').clear().type(lastName);
    cy.get('#firstName').should('be.visible').clear().type(firstName);
    cy.get('#email').should('be.visible').clear().type(email);
    cy.get('#companyName').should('be.visible').clear().type(companyName);
    cy.get('#jobTitle').should('be.visible').clear().type(jobTitle);
    cy.get('#password').should('be.visible').clear().type(password);
    cy.get('#passwordConfirmation').should('be.visible').clear().type(passwordConfirmation);
  };

  // ==========================================
  // SECTION 1 : LOGIN
  // ==========================================
  describe('1. Page Login', () => {

    beforeEach(() => {
      cy.visit('http://localhost:5173/login');
      cy.url().should('include', '/login');
    });

    it('toggle password', () => {
      cy.get('#password')
        .should('exist')
        .and('have.attr', 'type', 'password');

      cy.get('.toggle-icon')
        .should('be.visible')
        .click();

      cy.get('#password')
        .should('have.attr', 'type', 'text');
    });

    it('validation champs vides', () => {
      cy.get('.submit-btn')
        .should('be.visible')
        .click();

      cy.get('.error-message')
        .should('exist')
        .and('be.visible');
    });

    it('navigation vers request access', () => {
      cy.get('.access-request-link')
        .should('be.visible')
        .click();

      cy.url().should('include', '/request-access');
    });
  });

  // ==========================================
  // SECTION 2 : REQUEST ACCESS
  // ==========================================
  describe('2. Request Access', () => {

    beforeEach(() => {
      cy.visit('http://localhost:5173/request-access');
      cy.url().should('include', '/request-access');
    });

    it('remplir formulaire et succès', () => {

      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 200,
        body: { message: 'Demande validée avec succès' }
      }).as('submitReq');

      remplirFormulaireDemandeAcces();

      cy.get('.submit-btn')
        .should('be.visible')
        .and('not.be.disabled')
        .click();

      cy.wait('@submitReq');

      cy.get('.success-message', { timeout: 6000 })
        .should('be.visible')
        .and('contain', 'validée');
    });

    it('retour vers login', () => {
      cy.get('.login-link span')
        .should('be.visible')
        .click();

      cy.url().should('include', '/login');
    });

    it('erreur mots de passe différents', () => {
      remplirFormulaireDemandeAcces({
        password: 'Pass123!',
        passwordConfirmation: 'Pass456!',
      });

      cy.get('.submit-btn').click();

      cy.get('.error-message')
        .should('exist')
        .and('be.visible');
    });

    it('test XSS champ nom', () => {
      const xss = '<script>alert("xss")</script>';

      cy.get('#lastName')
        .should('be.visible')
        .type(xss)
        .should('have.value', xss);
    });

    it('etat isSubmitting', () => {

      cy.intercept('POST', '**/api/auth/register', (req) => {
        req.reply({
          delay: 1000, // simulation lenteur
          statusCode: 200,
          body: { message: 'Demande validée avec succès' }
        });
      }).as('slowRequest');

      remplirFormulaireDemandeAcces();

      cy.get('.submit-btn').click();

      // état loading
      cy.get('.submit-btn')
        .should('be.disabled')
        .and('contain', 'Envoi');

      cy.wait('@slowRequest');

      cy.get('.submit-btn').should('not.be.disabled');
    });
  });
});