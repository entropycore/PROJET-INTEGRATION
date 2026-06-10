describe('Parcours E2E - Tableau de bord et Liste des Projets (Vrai Backend)', () => {

  beforeEach(() => {
    // 1. Session d'authentification étudiante pour persister le token
    cy.session('student-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type(Cypress.env('E2E_EMAIL') || 'etudiant@credencia.ma');
      cy.get('input[type="password"]').type(Cypress.env('E2E_PASSWORD') || 'Password123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/student');
    });

    // 2. Intercepter l'appel API réel de récupération globale pour synchroniser l'UI
    cy.intercept('GET', '**/api/projects/me*').as('getAllProjects');
    cy.intercept('PATCH', '**/api/projects/*/submit').as('submitProjectApi');

    // 3. Accéder à la page de la liste des projets
    cy.visit('/student/projects');
  });

  it('Devrait charger la liste réelle, valider la structure des cartes et tester le filtrage combiné', () => {
    
    // ---------------------------------------------------
    // 1. CHARGEMENT INITIAL DEPUIS LE SERVEUR
    // ---------------------------------------------------
    cy.get('.projects-state').should('contain.text', 'Chargement des projets...');
    
    // Attendre que le vrai backend réponde
    cy.wait('@getAllProjects').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    // S'assurer que l'état de chargement disparait
    cy.get('.projects-state').should('not.exist');

    // Vérifier si la base de données contient des projets ou est vide
    cy.get('.projects-card').then(($card) => {
      if ($card.find('.project-card').length === 0) {
        // Fallback si la base de données de test est totalement vide
        cy.get('.projects-state').should('contain.text', 'Aucun projet trouvé.');
        return;
      }

      // ---------------------------------------------------
      // 2. VÉRIFICATION DE LA STRUCTURE D'UNE CARTE REELLE
      // ---------------------------------------------------
      cy.get('.project-card').first().within(() => {
        cy.get('.project-type-pill').should('be.visible');
        cy.get('.project-status-pill').should('be.visible');
        cy.get('h2').should('not.be.empty');
        cy.get('.project-description').should('be.visible');
        cy.get('.project-meta').should('be.visible'); // Date formatée
        cy.get('.secondary-action').contains('Voir détails').should('be.visible');
      });

      // ---------------------------------------------------
      // 3. TEST DE FILTRAGE COMBINÉ (SEARCH & SELECTS)
      // ---------------------------------------------------
      // A. Filtrage par Type : Sélectionner "Intégration"
      cy.get('select').first().select('Integration'); // value="Integration" ou label, Cypress gère
      cy.wait(100); // Laisse le computed recalculer

      // S'assurer que toutes les cartes visibles après filtrage sont bien des projets d'Intégration
      cy.get('.project-card').each(($el) => {
        cy.wrap($el).find('.project-type-pill').should('contain.text', 'Intégration');
      });

      // B. Filtrage Textuel : Taper un mot-clé spécifique (ex: "Vue.js" ou une techno connue)
      const keyword = 'Vue.js';
      cy.get('.projects-search input').type(keyword);
      
      // Valider que le DOM s'est mis à jour de manière cohérente
      cy.get('.project-card').each(($el) => {
        // Soit le titre, la description ou les badges techno contiennent le mot-clé
        cy.wrap($el).text().toLowerCase().should('include', keyword.toLowerCase());
      });

      // C. Reset des filtres pour retrouver l'état initial
      cy.get('.projects-search input').clear();
      cy.get('select').first().select(''); // Tous les types
    });
  });

  it('Devrait respecter les règles métiers de modification et soumission selon le statut réel', () => {
    cy.wait('@getAllProjects');

    cy.get('.projects-card').then(($card) => {
      if ($card.find('.project-card').length === 0) return;

      // 1. Vérification des projets en Brouillon (DRAFT) ou Corrections demandées
      cy.get('.project-card').each(($cardEl) => {
        const text = $cardEl.text();
        
        // Si la carte affiche "Brouillon" ou "Corrections demandées"
        if (text.includes('Brouillon') || text.includes('Corrections demandées')) {
          // Le bouton Modifier doit obligatoirement exister
          cy.wrap($cardEl).find('.secondary-action').contains('Modifier').should('exist');
        }

        // Si la carte est "Validé" (APPROVED) ou "En attente" (PENDING)
        if (text.includes('Validé') || text.includes('En attente')) {
          // Le bouton Modifier ne doit PAS exister dans le DOM (v-if)
          cy.wrap($cardEl).find('.secondary-action').contains('Modifier').should('not.exist');
        }
      });

      // 2. Test du déclenchement d'une soumission directe via l'icône "send" (si éligible)
      cy.get('body').then(($body) => {
        // Trouver la première carte qui possède le bouton soumettre (icône "send")
        const submitBtn = $body.find('.project-actions button .material-icons-round:contains("send")');
        
        if (submitBtn.length > 0) {
          // Cliquer sur le bouton de soumission
          cy.wrap(submitBtn).closest('button').click();

          // S'assurer que la requête POST réelle part au backend et recharge les données
          cy.wait('@submitProjectApi').then((interception) => {
            expect(interception.response.statusCode).to.be.oneOf([200, 204]);
          });
          
          // L'application rafraîchit la liste avec fetchProjects()
          cy.wait('@getAllProjects');
        }
      });
    });
  });
});
