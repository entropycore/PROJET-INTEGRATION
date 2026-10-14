import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import LandingPage from '@/views/LandingView.vue'

// 1. Définition des mocks pour les méthodes de l'instance
const mockDisconnect = vi.fn()
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()

beforeEach(() => {
  // On crée un mock constructible (une vraie classe / fonction standard)
  const MockIntersectionObserver = vi.fn(function () {
    this.observe = mockObserve
    this.disconnect = mockDisconnect
    this.unobserve = mockUnobserve
  })

  // On injecte ce mock globalement
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  
  // Utilisation de faux timers pour gérer les setTimeout du composant
  vi.useFakeTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('Test de fumee - Page d accueil', () => {
  
  it('doit monter le composant et afficher toutes les sections sans planter', async () => {
    // Act: On monte le composant
    const wrapper = mount(LandingPage)
    
    // Assert: On vérifie que le wrapper principal existe
    expect(wrapper.find('.landing-wrapper').exists()).toBe(true)
    
    // Vérification de la présence de chaque section essentielle
    expect(wrapper.findComponent({ name: 'Navbar' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'HeroSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'FeaturesSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'WorkflowSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'RolesSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ScoringSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'DemoSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'CtaSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'FooterSection' }).exists()).toBe(true)
  })

  it('doit initialiser l IntersectionObserver après le montage', async () => {
    const wrapper = mount(LandingPage)
    
    // 1. On attend que le nextTick() interne de Vue se résolve
    await flushPromises()
    
    // 2. On force l'exécution du setTimeout de 100ms
    vi.advanceTimersByTime(100)
    
    // Vérifie que le constructeur de l'IntersectionObserver a bien été appelé avec "new"
    expect(global.IntersectionObserver).toHaveBeenCalled()
  })

  it('doit nettoyer l IntersectionObserver lors du demontage', async () => {
    const wrapper = mount(LandingPage)
    
    // 1. On attend la résolution du cycle de vie et du timer pour activer l'observer
    await flushPromises()
    vi.advanceTimersByTime(100)
    
    // Act: On démonte le composant
    wrapper.unmount()
    
    // Assert: On vérifie que la méthode disconnect a bien été appelée
    expect(mockDisconnect).toHaveBeenCalled()
  })
})
