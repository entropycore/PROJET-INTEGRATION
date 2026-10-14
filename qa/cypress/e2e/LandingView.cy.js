describe('Landing Page - E2E Tests', () => {
  beforeEach(() => {
    // 1. Visit l'page d'accueil (URL root '/')
    cy.visit('/')
  })

  it('1. Should render the landing page wrapper and contain all main sections', () => {
    // Vérifier bli l'wrapper central existant f l'DOM
    cy.get('.landing-wrapper').should('be.visible')

    // Vérifier l'existence des composants majeurs à travers leurs balises ou classes
    // (Tqdri tbedli les sélecteurs ila knti dayra des classes spécifiques f وسط kola composant)
    cy.get('nav').should('exist') // Navbar.vue
    cy.get('.landing-wrapper').children().should('have.length.at.least', 5) // Fiha bzaff dyal les sections
  })

  it('2. Should trigger intersection observer animations on scroll', () => {
    // F l'aval, checki bli les éléments `.reveal` ma-fihomch la classe `.visible` (ila kano f taht dial l'page)
    // Ndro un scroll down bach n-déclonchiw l'IntersectionObserver dyal Vue
    cy.scrollTo('bottom', { duration: 1000 })

    // Badd l'scroll ou dik l'délais (100ms + timeout) li 3andek f l'code setup,
    // les éléments khassom i-devener visible
    cy.get('.reveal', { timeout: 3000 }).then(($elements) => {
      // Vérifier au moins 3la un élément bli tzadlih class 'visible' b scroll
      cy.wrap($elements).should('have.class', 'visible')
    })
  })

  it('3. Should have functional layout and look across standard viewports', () => {
    // Test de base dyal responsive (Simuler format mobile)
    cy.viewport('iphone-x')
    cy.get('.landing-wrapper').should('be.visible')

    // Rje3 format desktop standard
    cy.viewport(1280, 720)
    cy.get('.landing-wrapper').should('be.visible')
  })
})