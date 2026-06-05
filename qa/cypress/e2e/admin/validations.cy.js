describe('Centre de Validations - Admin E2E Tests (Mode Ralenti)', () => {
  const DELAY = 1500;

  const mockStats = {
    count: 4,
    projects: 1,
    internships: 1,
    certificates: 2,
    activities: 0
  };

  const mockValidationsList = {
    items: [
      {
        id: 'val_project_1',
        title: 'Projet Fin d’Année - ValiDia',
        targetType: 'PROJECT',
        status: 'PENDING',
        student: {
          fullName: 'Ghizlane Rabii',
          email: 'g.rabii@ensa.ma'
        }
      },
      {
        id: 'val_certif_2',
        title: 'Certification AWS Cloud Practitioner',
        targetType: 'CERTIFICATE',
        status: 'PENDING',
        student: {
          fullName: 'Kholoud Nihal',
          email: 'k.nihal@ensa.ma'
        },
        raw: { itemId: 'item_aws_99' }
      }
    ]
  };

  const mockDetailedValidation = {
    id: 'val_project_1',
    title: 'Projet Fin d’Année - ValiDia (Détails Complets)',
    targetType: 'PROJECT',
    status: 'PENDING',
    student: {
      fullName: 'Ghizlane Rabii',
      email: 'g.rabii@ensa.ma'
    },
    description: 'Implémentation des tests QA d’intégration sous Cypress.'
  };

  beforeEach(() => {
    // Intercepter les appels parallèles du montage (fetchValidations)
    cy.intercept('GET', '**/services/adminValidationsApi/pending', mockValidationsList).as('getValidations');
    cy.intercept('GET', '**/services/adminValidationsApi/pending/count', mockStats).as('getStats');

    // Visite par défaut de la page
    cy.visit('/admin/validations');
    cy.wait(['@getValidations', '@getStats']);
    cy.wait(DELAY);
  });

  it('devrait charger la page, afficher les statistiques et injecter le tableau', () => {
    cy.get('h1').should('contain', 'Centre de validations');
    
    // Vérifier que le sous-composant Stats a bien reçu les données
    cy.get('.validations-page').should('contain', '4'); // Total des demandes
    
    // Vérifier la présence des lignes dans le tableau
    cy.get('.validations-page').should('contain', 'Ghizlane Rabii');
    cy.get('.validations-page').should('contain', 'Certification AWS Cloud Practitioner');
    cy.wait(DELAY);
  });

  it('devrait filtrer les lignes du tableau via le computed côté client', () => {
    // Pas besoin de mock d'API ici car le filtrage est un computed purement Vue
    // On tape "AWS" dans la toolbar de recherche
    // (On suppose que ValidationToolbar contient un input standard ou identifiable)
    cy.get('input, .validation-toolbar-search').first().type('AWS');
    cy.wait(DELAY); // Laisser le temps d'observer le filtrage visuel

    // Le tableau doit cacher le projet et ne laisser que la certification AWS
    cy.get('.validations-page').should('contain', 'Kholoud Nihal');
    cy.get('.validations-page').should('not.contain', 'Ghizlane Rabii');
  });

  it('devrait ouvrir le modal de détails lors du clic sur "Voir"', () => {
    // Mock de la récupération des détails spécifiques d'une validation
    cy.intercept('GET', '**/services/adminValidationsApi/val_project_1', mockDetailedValidation).as('getDetails');

    // On clique sur l'action de visualisation (émise par ValidationsTable)
    // On cible le premier bouton ou la ligne correspondante
    cy.get('.validations-page').contains('button', /Voir|Visualiser/i).first().click();
    cy.wait('@getDetails');
    cy.wait(DELAY); // Observer l'ouverture du modal

    // Vérifier que le modal est ouvert avec les détails complets
    cy.get('body').should('contain', 'Projet Fin d’Année - ValiDia (Détails Complets)');
    cy.get('body').should('contain', 'Implémentation des tests QA d’intégration sous Cypress.');
    
    // Fermeture du modal
    cy.get('body').contains('button', /Fermer|Close/i).click();
    cy.wait(DELAY);
  });

  it('devrait gérer le flux d’approbation après confirmation window.confirm', () => {
    cy.intercept('GET', '**/services/adminValidationsApi/val_project_1', mockDetailedValidation).as('getDetails');
    cy.intercept('POST', '**/services/adminValidationsApi/val_project_1/approve', { statusCode: 200 }).as('approveApi');

    // Ouvrir le modal
    cy.get('.validations-page').contains('button', /Voir/i).first().click();
    cy.wait('@getDetails');

    // Simuler le clic sur "Accepter" (OK) sur le window.confirm
    cy.on('window:confirm', () => true);

    // Clic sur le bouton d'approbation à l'intérieur du modal ou du tableau
    cy.get('body').contains('button', /Approuver/i).click();
    
    cy.wait('@approveApi');
    cy.wait(['@getValidations', '@getStats']); // Re-fetch automatique après action
    cy.wait(DELAY);
  });

  it('devrait demander des corrections à l’étudiant via un window.prompt', () => {
    cy.intercept('GET', '**/services/adminValidationsApi/val_project_1', mockDetailedValidation).as('getDetails');
    cy.intercept('POST', '**/services/adminValidationsApi/val_project_1/request-changes', { statusCode: 200 }).as('changesApi');

    // Ouvrir le modal
    cy.get('.validations-page').contains('button', /Voir/i).first().click();
    cy.wait('@getDetails');

    // Simuler la saisie du message dans le prompt
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('Veuillez ajouter le rapport PDF manquant.');
    });

    // Déclencher l'action de demande de corrections
    cy.get('body').contains('button', /Correction/i).click();
    
    cy.wait('@changesApi');
    cy.wait(['@getValidations', '@getStats']);
    cy.wait(DELAY);
  });

  it('devrait ouvrir automatiquement le modal si un itemId est présent dans l’URL (Query Params)', () => {
    // On mock la recherche directe de détails demandée par openTargetedValidation()
    cy.intercept('GET', '**/services/adminValidationsApi/item_aws_99', mockDetailedValidation).as('getTargetedDetails');

    // On visite la page directement avec le paramètre de ciblage dans la route
    cy.visit('/admin/validations?itemId=item_aws_99');
    
    // Le composant va s'exécuter, voir l'itemId, et appeler getValidationDetails
    cy.wait('@getTargetedDetails');
    cy.wait(DELAY);

    // Le modal doit s'ouvrir tout seul dès le chargement de la page
    cy.get('body').should('contain', 'Projet Fin d’Année - ValiDia (Détails Complets)');
  });
});