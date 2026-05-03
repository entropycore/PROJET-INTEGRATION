import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginPage from '@/views/LoginView.vue'

// Mock de Vue Router
const mockRouter = { push: vi.fn() }
const mockRoute = { path: '/login', name: 'login', params: {}, query: {} }

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}))

describe('Smoke Test - Page de Connexion', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          AppLogo: true 
        }
      }
    })
  })

  it('doit confirmer que les éléments essentiels du DOM sont présents', () => {
    expect(wrapper.findComponent({ name: 'AppLogo' }).exists()).toBe(true)
    expect(wrapper.find('h1').text()).toContain('Votre identité')
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    
    const submitBtn = wrapper.find('.submit-btn')
    expect(submitBtn.exists()).toBe(true)
    expect(submitBtn.text()).toBe('Se connecter')
  })

  it('doit vérifier la présence du lien de demande d\'accès', () => {
    const requestLink = wrapper.find('.access-request-link')
    expect(requestLink.exists()).toBe(true)
    expect(requestLink.text()).toBe("Demandez l'accès")
  })

  it('doit vérifier que les messages d\'erreur ne sont pas visibles par défaut', () => {
    expect(wrapper.find('.error-message').exists()).toBe(false)
    expect(wrapper.find('.success-message').exists()).toBe(false)
  })
})