describe('Gestion des Signalements - Admin E2E Tests (Mode Ralenti)', () => {
  const DELAY = 1500; // Délai en millisecondes pour ralentir l'exécution

  beforeEach(() => {
    // Mock de l'appel initial pour charger les signalements
    cy.intercept('GET', '**/services/adminReportsApi*', {
      statusCode: 200,
      body: {
        items: [
          { id: '1', type: 'POST', status: 'PENDING', description: 'Contenu inapproprié' },
          { id: '2', type: 'COMMENT', status: 'RESOLVED', description: 'Insulte textuelle' },
          { id: '3', type: 'USER', status: 'REJECTED', description: 'Faux profil' }
        ]
      }
    }).as('getReports');

    // Mock du détail d'un signalement spécifique
    cy.intercept('GET', '**/services/adminReportsApi/1', {
      statusCode: 200,
      body: { id: '1', type: 'POST', status: 'PENDING', description: 'Contenu inapproprié', user: 'Utilisateur123' }
    }).as('getReportDetails');

    // Visite de la page
    cy.visit('/admin/reports');
    cy.wait('@getReports');
    cy.wait(DELAY); // Pause pour admirer l'affichage initial
  });

  it('devrait afficher correctement l’état initial et filtrer', () => {
    cy.get('.page-header h1').should('contain', 'Signalements');
    cy.get('.reports-page').within(() => {
      cy.contains('3').should('be.visible'); 
    });
    
    // Simulation de recherche ralentie (on tape lettre par lettre avec un délai)
    cy.get('input[type="text"]').first().type('Insulte', { delay: 150 });
    cy.wait(DELAY);
  });

  it('devrait ouvrir le modal et traiter le signalement (Resolve)', () => {
    cy.intercept('POST', '**/services/adminReportsApi/1/resolve', { statusCode: 200 }).as('resolveReport');
    cy.on('window:confirm', () => true);

    // Mettre en surbrillance ou scroller vers la ligne avant de cliquer (optionnel mais visuel)
    cy.get('.table-card').contains('voir', { matchCase: false }).first().scrollIntoView();
    cy.wait(DELAY);

    // Clic pour ouvrir le modal
    cy.get('.table-card').contains('voir', { matchCase: false }).first().click();
    cy.wait('@getReportDetails');
    cy.wait(DELAY); // Pause pour voir le modal ouvert

    // Clic sur le bouton de résolution dans le modal
    cy.contains('traité', { matchCase: false }).click();
    
    cy.wait('@resolveReport');
    cy.wait('@getReports');
    cy.wait(DELAY); // Pause finale
  });

  it('devrait rejeter un signalement en demandant un motif (Prompt)', () => {
    cy.intercept('POST', '**/services/adminReportsApi/1/reject', { statusCode: 200 }).as('rejectReport');

    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('Ce contenu ne viole pas nos conditions de service.');
    });

    // Ouvrir les détails
    cy.get('.table-card').contains('voir', { matchCase: false }).first().click();
    cy.wait(DELAY); // Pause pour voir le modal avant le rejet

    // Clic sur rejeter
    cy.contains('rejeter', { matchCase: false }).click();
    
    cy.wait('@rejectReport');
    cy.wait('@getReports');
    cy.wait(DELAY);
  });
});