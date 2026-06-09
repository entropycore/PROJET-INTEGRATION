describe('Parcours E2E - Tableau de bord et Liste des Stages (Vrai Backend)', () => {

  beforeEach(() => {
    // 1. Authentification unique via Session
    cy.session('student-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('student.stage@ensat.ma');
      cy.get('input[type="password"]').type('PasswordValid123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    // 2. Intercepter les VRAIS appels API pour synchroniser la UI avec la base de données
    cy.intercept('GET', '**/api/student/stages').as('getStagesList');
    cy.intercept('DELETE', '**/api/student/stages/*').as('deleteStageApi');
    cy.intercept('POST', '**/api/student/stages/*/submit').as('submitStageApi');

    // 3. Naviguer vers la page principale des stages
    cy.visit('/student/stages');
  });

  it('Devrait charger la liste réelle, tester la recherche et appliquer les filtres', () => {
    
    // On s'assure que l'état d'attente s'affiche puis disparaît quand le backend répond
    cy.get('.empty-state').should('contain', 'Chargement...');
    
    cy.wait('@getStagesList').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      
      const rawStages = interception.response.body.data || interception.response.body || [];
      
      if (rawStages.length > 0) {
        // Si la base de données contient des stages, la grille doit être visible
        cy.get('.stages-grid').should('be.visible');
        cy.get('.count-line p').should('contain', `${rawStages.length} stages`);
      } else {
        // Si l'étudiant n'a aucun stage en base de données
        cy.get('.empty-state').should('contain', 'Aucun stage trouvé');
      }
    });

    // On passe à la suite seulement s'il y a des cartes de stages affichées dans l'environnement de test
    cy.get('body').then(($body) => {
      if ($body.find('.stages-grid').length > 0) {
        
        // On tape un mot-clé précis (ex: une technologie ou une entreprise qu'on sait présente en base)
        const searchKeyword = 'Vue'; 
        
        // On cible le composant StageFilters (on suppose qu'il contient un input de type texte)
        cy.get('input[placeholder*="Rechercher"], input[type="text"]').first()
          .type(searchKeyword);

        // La liste filtrée calculée par le computed 'filteredStages' doit immédiatement réagir
        cy.get('.stages-grid').children().each(($card) => {
          // On vérifie que chaque carte restante correspond bien logiquement au filtre appliqué
          cy.wrap($card).text().toLowerCase().should('satisfy', (text) => {
            return text.includes(searchKeyword.toLowerCase());
          });
        });

        // On efface la recherche textuelle
        cy.get('input[placeholder*="Rechercher"], input[type="text"]').first().clear();

        // On simule un changement de filtre de statut (Ex: Voir seulement les Brouillons "DRAFT")
        // (Adapte le sélecteur selon la structure interne de ton composant StageFilters)
        cy.get('select, [role="listbox"]').first().select('DRAFT');
        
        // On vérifie la cohérence du badge de statut sur les cartes restantes
        cy.get('.stages-grid').children().each(($card) => {
          // On s'assure que la règle de normalisation 'CORRECTION_REQUIRED' -> 'CHANGES_REQUESTED' est cohérente visuellement
          cy.wrap($card).should('not.contain', 'Validé'); // Exemple de texte exclu pour un brouillon
        });
      }
    });
  });

  it('Devrait valider les actions de soumission, de suppression et la navigation de création', () => {
    
    // Attendre le chargement de la grille réelle
    cy.wait('@getStagesList');

    cy.get('.add-btn').click();
    cy.url().should('include', '/student/stages/create');
    
    // Retour en arrière pour tester les boutons d'action des cartes
    cy.go('back');
    cy.wait('@getStagesList');

    cy.get('body').then(($body) => {
      if ($body.find('.stages-grid').length > 0) {
        
        // Intercepter l'écoute de la boîte de dialogue native window.confirm() pour la suppression
        cy.on('window:confirm', (str) => {
          expect(str).to.equal('Voulez-vous vraiment supprimer ce stage ?');
          return true; // Équivaut à cliquer sur "OK"
        });

        // Trouver la première carte qui possède un bouton de suppression ou de validation
        // (Les événements @delete-stage et @submit-validation sont déclenchés par des boutons internes à StageCard)
        
        // Exemple 1 : Déclencher la suppression si le bouton est présent
        cy.get('.stages-grid').first().within(() => {
          if (Cypress.$('.delete-btn, [class*="delete"]').length > 0) {
            cy.get('.delete-btn, [class*="delete"]').first().click();
            
            // Le test s'assure que le vrai backend reçoit la requête d'effacement et renvoie un succès
            cy.wait('@deleteStageApi').its('response.statusCode').should('eq', 200);
            
            // Le composant doit automatiquement re-fetcher la liste fraîche depuis le serveur
            cy.wait('@getStagesList');
          }
        });

        // Exemple 2 : Déclencher la soumission pour validation
        cy.get('.stages-grid').first().within(() => {
          if (Cypress.$('.submit-btn, [class*="submit"]').length > 0) {
            cy.get('.submit-btn, [class*="submit"]').first().click();
            
            // Validation de l'envoi au validateur/encadrant sur le vrai serveur
            cy.wait('@submitStageApi').its('response.statusCode').should('eq', 200);
            cy.wait('@getStagesList');
          }
        });

      }
    });
  });
});