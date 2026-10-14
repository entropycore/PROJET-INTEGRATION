describe('Parcours E2E - Liste des activites parascolaires avec vrai backend', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/student/activities').as('getActivities');
    cy.intercept('DELETE', '**/api/student/activities/*').as('deleteActivityApi');
    cy.intercept('POST', '**/api/student/activities/*/submit-validation').as('submitActivityApi');

    cy.loginAsStudent('/student/activities');
  });

  it('charge les donnees reelles et valide le filtrage par recherche', () => {
    cy.wait('@getActivities').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);

      cy.get('body').should(($body) => {
        const hasGrid = $body.find('.activities-grid').length > 0;
        const hasEmptyState = $body.find('.empty-state').length > 0;
        expect(hasGrid || hasEmptyState).to.eq(true);
      });

      cy.get('body').then(($body) => {
        if ($body.find('.activities-grid').length === 0) {
          cy.get('.empty-state').should('contain.text', 'Aucune');
          return;
        }

        cy.get('.activities-grid').should('be.visible');
        cy.get('.activity-card h3')
          .first()
          .invoke('text')
          .then((title) => {
            const searchValue = title.trim();

            cy.get('input[placeholder*="Rechercher"], input[type="text"]')
              .first()
              .clear()
              .type(searchValue);

            cy.get('.activities-grid').should('contain.text', searchValue);
          });
      });
    });
  });

  it.skip('teste la regle metier de soumission avec la reponse du vrai backend', () => {
    cy.wait('@getActivities');

    cy.get('body').then(($body) => {
      if ($body.find('.activities-grid').length === 0) return;

      cy.get('.activities-grid').first().within(() => {
        if (Cypress.$('.submit-btn').length > 0) {
          cy.get('.submit-btn').first().click();
        }
      });

      cy.get('.submit-message, .error-message, .success-message, .activity-message').should('be.visible').and(($msg) => {
        const text = $msg.text();
        const missingFile = text.includes('Veuillez ajouter une attestation avant de soumettre');
        const invalidStatus = text.includes('Seules les activites en brouillon peuvent etre soumises');
        const realSuccess = text.includes('Activite soumise a validation') || text.includes('soumise');

        expect(missingFile || invalidStatus || realSuccess).to.be.true;
      });
    });
  });

  it.skip('valide la suppression avec le vrai backend si une activite existe', () => {
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
    cy.wait('@getActivities')
      .its('response.statusCode')
      .should('be.oneOf', [200, 304]);

    cy.get('body').should(($body) => {
      const hasGrid = $body.find('.activities-grid').length > 0;
      const hasEmptyState = $body.find('.empty-state').length > 0;
      expect(hasGrid || hasEmptyState).to.eq(true);
    });
  });
});
