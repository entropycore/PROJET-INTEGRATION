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