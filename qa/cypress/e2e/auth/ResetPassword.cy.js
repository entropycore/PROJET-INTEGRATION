describe('Reset Password Page - E2E Tests', () => {

  it('1. Should block the form and show error if token is missing', () => {
    // Visiter la page sans les paramètres de requête (query params)
    cy.visit('/reset-password')

    // Vérifier l'apparition du message d'erreur initialisé dans le hook onMounted
    cy.get('.error-message')
      .should('be.visible')
      .and('contain.text', 'Lien de réinitialisation manquant ou invalide.')

    // Les champs de saisie et le bouton doivent être désactivés
    cy.get('#newPassword').should('be.disabled')
    cy.get('#confirmPassword').should('be.disabled')
    cy.get('.submit-btn').should('be.disabled')
  })

  it('2. Should show error if passwords do not match', () => {
    // Visiter la page avec un jeton (token) valide dans l'URL
    cy.visit('/reset-password?token=valid-test-token-123')

    // Les champs de saisie ne doivent plus être désactivés
    cy.get('#newPassword').should('not.be.disabled').type('Password123!')
    cy.get('#confirmPassword').should('not.be.disabled').type('DifferentPassword123!')

    // Soumettre le formulaire
    cy.get('form.auth-form').submit()

    // La validation front-end doit afficher l'erreur
    cy.get('.error-message')
      .should('be.visible')
      .and('contain.text', 'Les mots de passe ne correspondent pas.')
  })

  it('3. Should toggle password visibility when clicking icons', () => {
    cy.visit('/reset-password?token=valid-test-token-123')

    // Par défaut, le type de l'attribut doit être 'password'
    cy.get('#newPassword').should('have.attr', 'type', 'password')

    // Cliquer sur la première icône de bascule (toggle) à l'intérieur du conteneur
    cy.get('.input-wrapper .toggle-icon').first().click()

    // Le type de l'attribut doit changer pour devenir 'text'
    cy.get('#newPassword').should('have.attr', 'type', 'text')
  })

  it('4. Should handle successful reset and redirect to login with query', () => {
    // Intercepter l'appel API (authService.resetPassword)
    cy.intercept('POST', '**/reset-password**', {
      statusCode: 200,
      body: { message: "Mot de passe réinitialisé avec succès." }
    }).as('resetPasswordApi')

    cy.visit('/reset-password?token=valid-test-token-123')

    cy.get('#newPassword').type('StrongPassword123!')
    cy.get('#confirmPassword').type('StrongPassword123!')

    cy.get('form.auth-form').submit()

    // Le bouton doit devenir désactivé et son texte doit changer pour "Validation..."
    cy.get('.submit-btn').should('be.disabled').and('contain.text', 'Validation...')

    // Attendre la réponse de l'API simulée (mockée)
    cy.wait('@resetPasswordApi')

    // Vérifier la redirection automatique vers la page de connexion avec le paramètre de succès
    cy.url().should('include', '/login')
    cy.url().should('include', 'reset=success')
  })
})