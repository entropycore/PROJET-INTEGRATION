describe('E2E - Page Login', () => {
  
  // Fonction utilitaire pour ralentir les actions
  const delay = 500; // délai réduit

  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
    cy.get('.submit-btn', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/login');
  });

  it('doit basculer la visibilité du mot de passe (toggle password)', () => {
    cy.get('#password')
      .should('exist')
      .and('have.attr', 'type', 'password');

    cy.get('.toggle-icon')
      .should('be.visible')
      .click();

    cy.get('#password')
      .should('have.attr', 'type', 'text');
  });

  it('doit afficher une erreur lors de la validation de champs vides', () => {
    cy.get('.submit-btn')
      .should('be.visible')
      .click();

    // Attendre que le message d'erreur apparaisse et vérifier son contenu
    cy.get('.error-message', { timeout: 5000 })
      .should('be.visible')
      .and('contain', 'Veuillez remplir tous les champs');
  });

  it('doit naviguer vers la page de demande d’accès', () => {
    cy.get('.access-request-link')
      .should('be.visible')
      .click();

    cy.url({ timeout: 5000 })
      .should('include', '/request-access');
  });
});