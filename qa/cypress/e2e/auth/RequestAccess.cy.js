describe('E2E - Request Access', () => {
  let API_BASE_URL;

  before(() => {
    API_BASE_URL = Cypress.env('API_BASE_URL') || 'http://localhost:3000';
  });

  beforeEach(() => {
    cy.visit('http://localhost:5173/request-access');
    cy.url().should('include', '/request-access');
  });

  // Helper function
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
    
    cy.get('#lastName').clear().type(data.lastName);
    cy.get('#firstName').clear().type(data.firstName);
    cy.get('#email').clear().type(data.email);
    cy.get('#companyName').clear().type(data.companyName);
    cy.get('#jobTitle').clear().type(data.jobTitle);
    cy.get('#password').clear().type(data.password);
    cy.get('#passwordConfirmation').clear().type(data.passwordConfirmation);
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

    cy.wait('@submitReq');
    cy.get('.success-message', { timeout: 6000 })
      .should('be.visible')
      .and('contain', 'Demande envoyée');
  });

  it('doit retourner vers la page login après soumission', () => {
    cy.intercept('POST', `${API_BASE_URL}/api/auth/register`, {
      statusCode: 201,
      body: { success: true }
    }).as('register');

    remplirFormulaire();
    cy.get('.submit-btn').click();
    cy.wait('@register');

    cy.get('.login-link span').click();
    cy.url().should('include', '/login');
  });

  it('doit afficher une erreur si les mots de passe sont différents', () => {
    remplirFormulaire({ passwordConfirmation: 'WrongPass123!' });
    cy.get('.submit-btn').click();
    cy.get('.error-message').should('be.visible');
  });

  it('doit protéger contre les injections simples (XSS test)', () => {
    const xss = '<script>alert("xss")</script>';
    cy.get('#lastName').type(xss).should('have.value', xss);
  });

  it('doit gérer l’état de chargement (isSubmitting)', () => {
    cy.intercept('POST', `${API_BASE_URL}/api/auth/register`, {
      delay: 1000,
      statusCode: 201,
      body: { success: true }
    }).as('slowRequest');

    remplirFormulaire();
    cy.get('.submit-btn').click();
    
    cy.get('.submit-btn')
      .should('be.disabled')
      .and('contain', 'Envoi');

    cy.wait('@slowRequest');
    cy.get('.submit-btn').should('not.be.disabled');
  });
});