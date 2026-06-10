describe('Page de gestion des badges - Tests E2E', () => {

  beforeEach(() => {
    // Connexion en tant qu'administrateur et accès à la page des badges
    cy.loginAsAdmin()
  })

  it('1. Devrait afficher la liste initiale des badges correctement', () => {
    // Vérifier l'en-tête de la page
    cy.get('.page-header h1').should('contain.text', 'Système de badges')

    // Vérifier que la grille contient bien les badges par défaut (6 au total dans le mock)
    cy.get('.badges-grid .badge-card').should('have.length', 6)

    // Vérifier le contenu spécifique du premier badge (Web Developer)
    cy.get('.badge-card').first().within(() => {
      cy.get('h3').should('contain.text', 'Web Developer')
        // Vérification du nom du badge uniquement
    })
      cy.attendreInterface();
  })

  it('2. Devrait ouvrir la modale, réinitialiser le formulaire et créer un nouveau badge localement', () => {
      cy.attendreInterface();
    // Cliquer sur le bouton pour ajouter un nouveau badge
    cy.get('.primary-btn').click()

    // La boîte modale doit être visible avec le bon titre
    cy.get('.modal-overlay').should('be.visible')
    cy.get('.modal-header h2').should('contain.text', 'Nouveau badge')

    // Remplir les champs du formulaire
    cy.get('.form-group input[placeholder*="Web Developer"]').type('Nouveau Badge Test')
    cy.get('.form-group input[placeholder*="Courte description"]').type('Description du badge de test')
    cy.get('.form-group textarea').type('Avoir validé l\'examen E2E')

    // Soumettre le formulaire
    cy.get('.modal-actions .create-btn').click()

    // La modale doit se fermer
    cy.get('.modal-overlay').should('not.exist')

    // Le nouveau badge doit être ajouté en haut de la liste (unshift)
    cy.get('.badges-grid .badge-card').should('have.length', 7)
    cy.get('.badge-card').first().within(() => {
      cy.get('h3').should('contain.text', 'Nouveau Badge Test')
      cy.get('.rule').should('contain.text', 'Avoir validé l\'examen E2E')
      cy.get('.count').should('contain.text', '0 attributions')
    })
  })

  it('3. Devrait bloquer la soumission et afficher une alerte si les champs obligatoires manquent', () => {
      cy.attendreInterface();
    // Ouvrir la modale
    cy.get('.primary-btn').click()

    // Tenter de sauvegarder sans remplir les champs
    cy.get('.modal-actions .create-btn').click()

    // Intercepter l'alerte du navigateur
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Veuillez remplir au moins le nom et la règle d’attribution.')
    })

    // La modale doit rester ouverte car le formulaire est invalide
    cy.get('.modal-overlay').should('be.visible')
  })

  it('4. Devrait ouvrir la modale en mode édition et mettre à jour un badge existant', () => {
      cy.attendreInterface();
    // Cliquer sur le bouton modifier (✎) du premier badge
    cy.get('.badge-card').first().find('.edit-btn').click()

    // La modale doit s'ouvrir en mode édition
    cy.get('.modal-overlay').should('be.visible')
    cy.get('.modal-header h2').should('contain.text', 'Modifier le badge')

    // Modifier le nom du badge
    cy.get('.form-group input[placeholder*="Web Developer"]')
      .clear()
      .type('Web Developer Pro')

    // Enregistrer les modifications
    cy.get('.modal-actions .create-btn').click()

    // Vérifier que le badge a bien été mis à jour dans la liste
    cy.get('.badge-card').first().find('h3').should('contain.text', 'Web Developer Pro')
  })

  it('5. Devrait supprimer un badge après confirmation de l\'utilisateur', () => {
      cy.attendreInterface();
    // Confirmer automatiquement la boîte de dialogue de confirmation (window:confirm)
    cy.on('window:confirm', () => true)

    // Cliquer sur le bouton supprimer (🗑) du premier badge
    cy.get('.badge-card').first().find('.delete-btn').click()

    // Le nombre total de badges doit passer de 6 à 5
    cy.get('.badges-grid .badge-card').should('have.length', 5)

    // Le badge "Web Developer" ne doit plus exister
    cy.get('.badges-grid').should('not.contain.text', 'Web Developer')
  })

  // --- TESTS FUTURS (À ACTIVER QUAND LE BACKEND SERA PRÊT) ---
  /*
  it('6. Devrait gérer les états de chargement et les erreurs de l\'API', () => {
    // Simuler une erreur 500 lors de la récupération des badges
    cy.intercept('GET', '/api/admin/badges', {
      statusCode: 500
    }).as('getBadgesError')

    cy.visit('/admin/badges')

    // Attendre la réponse de l'API interceptée
    cy.wait('@getBadgesError')

    // Vérifier l'affichage du message d'erreur de l'application
    cy.get('.state-box.error')
      .should('be.visible')
      .and('contain.text', 'Impossible de charger les badges.')
  })
  */
})
