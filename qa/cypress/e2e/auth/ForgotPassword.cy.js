describe("Page Mot de passe oublié - Tests E2E", () => {
  beforeEach(() => {
    // Visiter la page de mot de passe oublié.
    cy.visiterClairement("/forgot-password")
  })

  it("1. doit afficher une erreur de validation si l'email est vide", () => {
    // Soumettre directement le formulaire.
    cy.get("form.auth-form").submit()
    cy.attendreInterface()

    // Vérifier que le message d'erreur de validation reste visible.
    cy.get(".error-message")
      .should("be.visible")
      .and("contain.text", "Veuillez renseigner votre adresse email.")
  })

  it("2. doit gérer une demande de réinitialisation réussie", () => {
    // Intercepter l'appel API de demande de réinitialisation.
    cy.intercept("POST", "**/forgot-password**", {
      delay: 1000,
      statusCode: 200,
      body: { message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." }
    }).as("forgotPasswordRequest")

    // Saisir l'email dans le champ.
    cy.get("#email").taperClairement("test.student@ensa.ac.ma")
    cy.attendreInterface()

    // Soumettre le formulaire.
    cy.get("form.auth-form").submit()

    // Vérifier que le bouton est désactivé pendant l'envoi.
    cy.get(".submit-btn").should("be.disabled")
    cy.attendreInterface()

    // Attendre l'appel API.
    cy.wait("@forgotPasswordRequest")
    cy.attendreInterface()

    // Vérifier l'apparition du message de succès.
    cy.get(".success-message")
      .should("be.visible")
      .and("contain.text", "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.")
  })

  it("3. doit afficher proprement les erreurs retournées par l'API", () => {
    // Intercepter l'appel API et simuler une erreur 400.
    cy.intercept("POST", "**/forgot-password**", {
      delay: 1000,
      statusCode: 400,
      body: { message: "Impossible d'envoyer l'email de réinitialisation." }
    }).as("forgotPasswordError")

    cy.get("#email").taperClairement("wrong.email@ensa.ac.ma")
    cy.attendreInterface()
    cy.get("form.auth-form").submit()

    cy.get(".submit-btn").should("be.disabled")
    cy.attendreInterface()

    cy.wait("@forgotPasswordError")
    cy.attendreInterface()

    // Vérifier que l'erreur API est affichée.
    cy.get(".error-message")
      .should("be.visible")
      .and("contain.text", "Impossible d'envoyer l'email de réinitialisation.")
  })

  it("4. doit revenir vers la page de connexion au clic sur le lien", () => {
    // Cliquer sur le lien de retour à la connexion.
    cy.get(".login-link span").click()
    cy.attendreInterface()

    // Vérifier la redirection vers la page de connexion.
    cy.url().should("include", "/login")
  })
})
