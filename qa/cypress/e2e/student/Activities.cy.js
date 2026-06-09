describe('Parcours E2E - Liste des activites parascolaires avec vrai backend', () => {
  beforeEach(() => {
    cy.session('student-activity-session', () => {
      cy.visit('/login');
      cy.get('input[type="email"]').type('student.activity@ensat.ma');
      cy.get('input[type="password"]').type('PasswordValid123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    cy.intercept('GET', '**/api/student/activities').as('getActivities');
    cy.intercept('DELETE', '**/api/student/activities/*').as('deleteActivityApi');
    cy.intercept('POST', '**/api/student/activities/*/submit').as('submitActivityApi');

    cy.visit('/student/activities');
  });

  it('charge les donnees reelles et valide le filtrage par recherche', () => {
    cy.get('.empty-state').should('contain', 'Chargement...');

    cy.wait('@getActivities').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);

      const list = interception.response.body.data || interception.response.body || [];

      if (list.length > 0) {
        cy.get('.activities-grid').should('be.visible');

        const searchWord = list[0].title;
        cy.get('input[placeholder*="Rechercher"], input[type="text"]').first().type(searchWord);

        cy.get('.activities-grid').children().should('have.length.at.least', 1);
        cy.get('.activities-grid').first().should('contain', searchWord);
      } else {
        cy.get('.empty-state').should('contain', 'Aucune activite trouvee');
      }
    });
  });

  it('teste la regle metier de soumission avec la reponse du vrai backend', () => {
    cy.wait('@getActivities');

    cy.get('body').then(($body) => {
      if ($body.find('.activities-grid').length === 0) return;

      cy.get('.activities-grid').first().within(() => {
        if (Cypress.$('.submit-btn').length > 0) {
          cy.get('.submit-btn').first().click();
        }
      });

      cy.get('.submit-message').should('be.visible').and(($msg) => {
        const text = $msg.text();
        const missingFile = text.includes('Veuillez ajouter une attestation avant de soumettre');
        const invalidStatus = text.includes('Seules les activites en brouillon peuvent etre soumises');
        const realSuccess = text.includes('Activite soumise a validation');

        expect(missingFile || invalidStatus || realSuccess).to.be.true;
      });
    });
  });

  it('valide la suppression avec le vrai backend si une activite existe', () => {
    cy.wait('@getActivities');

    cy.get('body').then(($body) => {
      if ($body.find('.activities-grid').length === 0) return;

      cy.on('window:confirm', (message) => {
        expect(message).to.equal('Voulez-vous vraiment supprimer cette activite ?');
        return true;
      });

      cy.get('.activities-grid').first().within(() => {
        if (Cypress.$('.delete-btn').length > 0) {
          cy.get('.delete-btn').first().click();
        }
      });

      cy.wait('@deleteActivityApi').its('response.statusCode').should('eq', 200);
      cy.wait('@getActivities');
    });
  });

  it('recharge les activites depuis le vrai backend sans reponse simulee', () => {
    cy.visit('/student/activities');
    cy.wait('@getActivities').its('response.statusCode').should('eq', 200);

    cy.get('body').should(($body) => {
      const hasGrid = $body.find('.activities-grid').length > 0;
      const hasEmptyState = $body.find('.empty-state').length > 0;
      expect(hasGrid || hasEmptyState).to.eq(true);
    });
  });
});
