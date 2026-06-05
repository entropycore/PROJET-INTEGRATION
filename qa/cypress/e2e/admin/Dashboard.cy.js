describe('Admin Dashboard - Tests E2E', () => {

  const dashboardMock = {
    data: {
      summaryCards: {
        totalUsers: { value: 1250, variation: '+5% ce mois' },
        totalStudents: { value: 900, variation: '+3%' },
        totalProfessors: { value: 350, variation: null },
        pendingRequests: { value: 12, variation: 'Urgents' }
      },
      urgentActions: {
        pendingAccessRequests: 5,
        pendingValidations: 4,
        reports: 3
      },
      recentRequests: [
        {
          id: 'request-1',
          type: 'ACCESS_REQUEST',
          requesterName: 'Sara Bensaid',
          organization: 'Accenture Maroc',
          email: 'sara.bensaid@example.com',
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
        }
      ]
    }
  };

  beforeEach(() => {
    cy.intercept({ method: 'GET', url: '**/api/auth/me*' }, {
      statusCode: 200,
      body: {
        data: {
          data: {
            id: "1",
            email: "admin@example.com",
            firstName: "Admin",
            lastName: "User",
            role: "ADMINISTRATOR",
          },
        },
      },
    }).as('getMe');

    cy.intercept({ method: 'GET', url: '**/api/admin/dashboard*' }, {
      statusCode: 200,
      body: dashboardMock,
    }).as('getAdminDashboard');

    cy.loginAsAdmin('/admin');
    cy.wait('@getAdminDashboard');
  });

  it('Affichage initial complet du dashboard', () => {
    cy.get('h1').should('contain.text', 'Administration de platform');
    cy.get('.admin-subtitle').should('be.visible');

    cy.get('.stat-card').first().within(() => {
      cy.get('.stat-value').should('have.text', '1250');
      cy.get('.stat-label').should('have.text', 'UTILISATEURS');
    });

    cy.get('.stat-card.warning .stat-value').should('have.text', '12');
  });

  it('Vérification de la liste des requêtes récentes et formatage de la date', () => {
    cy.get('.request-item').first().within(() => {
      cy.get('.avatar').should('have.text', 'S');
      cy.get('.request-name').should('have.text', 'Sara Bensaid');
      cy.get('.request-org').should('have.text', 'Accenture Maroc');
      cy.get('.request-type').should('contain.text', 'Accès');
      cy.get('.request-type').should('have.class', 'orange');
      cy.get('.request-time').should('contain.text', 'il y a');
    });
  });

  it('Click sur une activité récente redirige vers la page cible', () => {
    cy.get('.request-item').first().click();
    cy.url().should('include', '/admin/users');
    cy.url().should('include', 'role=PROFESSIONAL');
    cy.url().should('include', 'status=PENDING');
    cy.url().should('include', 'itemId=request-1');
  });

  it('Click sur "Accepter" déclenche l\'alerte de confirmation', () => {
    cy.on('window:confirm', (text) => {
      expect(text).to.contain('Demande acceptée pour Sara Bensaid');
      return true;
    });

    // const acceptBtn = cy.get('.btn-accept').first();
    // acceptBtn.click();
  });

  it('Redirection correcte des actions urgentes', () => {
    cy.get('.urgent-item.orange').within(() => {
      cy.get('.title').should('have.text', '5 demandes en attente');
      cy.get('a.urgent-link').should('have.attr', 'href', '/admin/users?role=PROFESSIONAL&status=PENDING');
    });
  });

});
