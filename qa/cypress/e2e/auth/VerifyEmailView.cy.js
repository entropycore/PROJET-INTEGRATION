describe('E2E - Vérification d\'Email', () => {
  it('doit confirmer l\'email avec un token valide et rediriger vers login', () => {
    cy.intercept('GET', '**/api/auth/verify-email?token=token_valide_demo', {
      statusCode: 200,
      body: { message: 'Email vérifié' }
    }).as('verifyEmail');

    cy.visit('/verify-email?token=token_valide_demo');

    // Vérifier les messages
    cy.contains('h1', 'Email vérifié avec succès').should('be.visible');
    cy.contains('p', 'Votre demande est en attente de validation').should('be.visible');

    // Redirection
    cy.get('.verify-email-button').click();
    cy.url().should('include', '/login');
  });

  it('doit afficher une erreur pour un token invalide', () => {
    cy.intercept('GET', '**/api/auth/verify-email*', {
      statusCode: 400,
      body: { message: 'Token invalide' }
    }).as('verifyEmailError');

    cy.visit('/verify-email?token=token_invalide');
    
    cy.contains('h1', 'Vérification impossible').should('be.visible');
    cy.get('.status-icon-error').should('be.visible');
  });
});