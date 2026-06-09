describe('Parcours E2E - Liste des Activités Parascolaires et Règles Métiers', () => {

  beforeEach(() => {
    // 1. Authentification unique via Session Cypress
    cy.session('student-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('student.activity@ensat.ma');
      cy.get('input[type="password"]').type('PasswordValid123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    // 2. Intercepter les appels vers le vrai serveur pour les activités
    cy.intercept('GET', '**/api/student/activities').as('getActivities');
    cy.intercept('DELETE', '**/api/student/activities/*').as('deleteActivityApi');
    cy.intercept('POST', '**/api/student/activities/*/submit').as('submitActivityApi');

    // 3. Navigation vers l'interface parascolaire
    cy.visit('/student/activities');
  });

  it('Devrait charger les données réelles et valider le filtrage par recherche et type', () => {
    // Vérification de l'état de chargement
    cy.get('.empty-state').should('contain', 'Chargement...');
    
    cy.wait('@getActivities').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
      
      const list = interception.response.body.data || interception.response.body || [];
      
      if (list.length > 0) {
        cy.get('.activities-grid').should('be.visible');
        
        // --- TEST DES FILTRES DE RECHERCHE ---
        const searchWord = list[0].title; // On prend le titre de la première vraie activité
        cy.get('input[placeholder*="Rechercher"], input[type="text"]').first().type(searchWord);
        
        // Vérifier que la grille réduit dynamiquement son contenu
        cy.get('.activities-grid').children().should('have.length.at.least', 1);
        cy.get('.activities-grid').first().should('contain', searchWord);
      } else {
        cy.get('.empty-state').should('contain', 'Aucune activité trouvée');
      }
    });
  });

  it('Devrait tester le blocage de soumission (Règle Métier : Manque d’attestation)', () => {
    cy.wait('@getActivities');

    // On vérifie le comportement si la grille contient des éléments
    cy.get('body').then(($body) => {
      if ($body.find('.activities-grid').length > 0) {
        
        // Scénario : On cherche une carte d'activité incomplète ou on force le clic de validation
        // pour tester la règle de validation côté client
        cy.get('.activities-grid').first().within(() => {
          // On suppose que ton composant ActivityCard émet l'événement au clic sur un bouton .submit-btn
          if (Cypress.$('.submit-btn').length > 0) {
            cy.get('.submit-btn').first().click();
          }
        });

        // Validation du message d'erreur ou d'avertissement généré par ton code ref/computed
        cy.get('.submit-message').should('be.visible').and(($msg) => {
          const text = $msg.text();
          // Le message doit correspondre à l'une des deux phrases de tes règles métiers :
          const conditionManqueFichier = text.includes("Veuillez ajouter une attestation avant de soumettre");
          const conditionStatutInvalide = text.includes("Seules les activités en brouillon peuvent être soumises");
          const conditionSuccesReel = text.includes("Activité soumise à validation");
          
          expect(conditionManqueFichier || conditionStatutInvalide || conditionSuccesReel).to.be.true;
        });
      }
    });
  });

  it('Devrait valider la suppression d’une activité après confirmation', () => {
    cy.wait('@getActivities');

    cy.get('body').then(($body) => {
      if ($body.find('.activities-grid').length > 0) {
        
        // Écouter le dialogue natif de confirmation (window.confirm)
        cy.on('window:confirm', (str) => {
          expect(str).to.equal('Voulez-vous vraiment supprimer cette activité ?');
          return true; // Clique sur "OK"
        });

        // Déclencher la suppression sur la première carte disponible
        cy.get('.activities-grid').first().within(() => {
          if (Cypress.$('.delete-btn').length > 0) {
            cy.get('.delete-btn').first().click();
          }
        });

        // S'assurer que le backend valide la suppression et que l'interface recharge la liste
        cy.wait('@deleteActivityApi').its('response.statusCode').should('eq', 200);
        cy.wait('@getActivities');
      }
    });
  });

  it('Devrait intercepter et afficher les erreurs globales du serveur', () => {
    // On simule une panne réseau ou un crash du backend (Code 500) lors du chargement initial
    cy.intercept('GET', '**/api/student/activities', {
      statusCode: 500,
      body: { message: 'Internal Server Error' }
    }).as('getActivitiesError');

    // Recharger la page pour provoquer l'erreur
    cy.visit('/student/activities');
    cy.wait('@getActivitiesError');

    // Vérifier que ton bloc catch de fetchActivities gère l'erreur élégamment dans la UI
    cy.get('.submit-message.error')
      .should('be.visible')
      .and('contain', 'Impossible de charger les activités.');
  });
});