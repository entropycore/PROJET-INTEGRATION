describe('Page Erreur 403 - Test E2E', () => {

  // Scénario 1 : Vérification de l'identité visuelle
  it('devrait afficher la page avec le style graphique correct', () => {
    cy.visit('/403')

    cy.get('main').should('have.class', 'forbidden-page')

    cy.get('.status-badge')
      .should('have.css', 'color', 'rgb(159, 47, 36)')
      .should('have.css', 'background-color', 'rgb(248, 231, 227)')
  })

  // Scénario 2 : Test du bouton "Retour" (Historique du navigateur)
  it('le bouton Retour devrait ramener l utilisateur a la page precedente', () => {
    cy.visit('/dashboard')
    cy.visit('/403')

    cy.get('.secondary-button').click()

    cy.url().should('match', /\/dashboard/)
  })

  // Scénario 3 : Test dynamique du rôle (STUDENT)
  it('devrait rediriger l etudiant vers son espace specifique', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('auth', JSON.stringify({
        user: { role: 'STUDENT' },
        isAuthenticated: true
      }))
    })

    cy.visit('/403')

    cy.get('.primary-button')
      .should('have.text', 'Aller à mon espace')
      .click()

    cy.url().should('match', /\/student/)
  })

  // Scénario 4 : Test de l'utilisateur non connecté (Redirection Login)
  it('devrait proposer de se connecter si l utilisateur est anonyme', () => {
    cy.window().then((win) => {
      win.localStorage.clear()
    })

    cy.visit('/403')

    cy.get('.primary-button')
      .should('have.text', 'Se connecter')
      .click()

    cy.url().should('match', /\/login/)
  })

  // Scénario 5 : Responsive Design (Mobile)
  it('devrait adapter le layout sur mobile', () => {
    cy.viewport(390, 844)

    cy.visit('/403')

    cy.get('.forbidden-actions')
      .should('have.css', 'flex-direction', 'column-reverse')

    cy.get('.primary-button').then(($btn) => {
      const width = $btn[0].getBoundingClientRect().width
      expect(width).to.be.greaterThan(300)
    })
  })

})