describe('E2E - Demande d’accès', () => {
  let API_BASE_URL;

  before(() => {
    API_BASE_URL = Cypress.env('API_BASE_URL') || 'http://localhost:3000';
  });

  beforeEach(() => {
    cy.visiterClairement('/request-access');
    cy.url().should('include', '/request-access');
  });

  // Fonction utilitaire
  const remplirFormulaire = (overrides = {}) => {
    const defaults = {
      lastName: 'Rabii',
      firstName: 'Ghizlane',
      email: 'ghizlane.rabii@ensa.ac.ma',
      companyName: 'OCP',
      jobTitle: 'Stagiaire IT',
      password: 'Password123!',
      passwordConfirmation: 'Password123!',
    };
    const data = { ...defaults, ...overrides };
    
    cy.get('#lastName').clear().taperClairement(data.lastName);
    cy.get('#firstName').clear().taperClairement(data.firstName);
    cy.get('#email').clear().taperClairement(data.email);
    cy.get('#companyName').clear().taperClairement(data.companyName);
    cy.get('#jobTitle').clear().taperClairement(data.jobTitle);
    cy.get('#password').clear().taperClairement(data.password);
    cy.get('#passwordConfirmation').clear().taperClairement(data.passwordConfirmation);
    cy.attendreInterface();
  };

  it('doit remplir le formulaire et afficher un message de succès', () => {
    cy.intercept('POST', `${API_BASE_URL}/api/auth/register`, {
      statusCode: 201,
      body: { 
        success: true,
        message: 'Demande envoyée. Veuillez vérifier votre boîte de réception.' 
      }
    }).as('submitReq');

    remplirFormulaire();
    cy.get('.submit-btn').click();
    cy.attendreInterface();

    cy.wait('@submitReq');
    cy.attendreInterface();
    cy.get('.success-message', { timeout: 6000 })
      .should('be.visible')
      .and('contain', 'Demande envoyée');
  });

  it('doit retourner vers la page de connexion après soumission', () => {
    cy.intercept('POST', `${API_BASE_URL}/api/auth/register`, {
      statusCode: 201,
      body: { success: true }
    }).as('register');

    remplirFormulaire();
    cy.get('.submit-btn').click();
    cy.attendreInterface();
    cy.wait('@register');
    cy.attendreInterface();

    cy.get('.login-link span').click();
    cy.attendreInterface();
    cy.url().should('include', '/login');
  });

  it('doit afficher une erreur si les mots de passe sont différents', () => {
    remplirFormulaire({ passwordConfirmation: 'WrongPass123!' });
    cy.get('.submit-btn').click();
    cy.attendreInterface();
    cy.get('.error-message').should('be.visible');
  });

  it('doit protéger contre les injections simples (test XSS)', () => {
    const xss = '<script>alert("xss")</script>';
    cy.get('#lastName').taperClairement(xss).should('have.value', xss);
    cy.attendreInterface();
  });

  it('doit gérer l’état de chargement (isSubmitting)', () => {
    cy.intercept('POST', `${API_BASE_URL}/api/auth/register`, {
      delay: 1000,
      statusCode: 201,
      body: { success: true }
    }).as('slowRequest');

    remplirFormulaire();
    cy.get('.submit-btn').click();
    cy.attendreInterface();
    
    cy.get('.submit-btn')
      .should('be.disabled')
      .and('contain', 'Envoi');

    cy.wait('@slowRequest');
    cy.attendreInterface();
    cy.get('.submit-btn').should('not.be.disabled');
  });
});
