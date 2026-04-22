import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import LoginView from '../views/LoginView.vue'

// Simulation du routeur pour éviter les erreurs de navigation pendant le test
const mockRouter = { push: vi.fn() }
vi.mock('vue-router', () => ({ useRouter: () => mockRouter }))

describe('Smoke Test - Page de Connexion', () => {
  it('Vérifie la présence des éléments essentiels du DOM', () => {
    const pinia = createPinia()
    const wrapper = mount(LoginView, {
      global: { plugins: [pinia] }
    })

    // Vérifie si le logo de l'application est bien rendu [cite: 33]
    expect(wrapper.findComponent({ name: 'AppLogo' }).exists()).toBe(true)
    
    // Vérifie que les champs de saisie (Email et Mot de passe) sont présents [cite: 33]
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    
    // Vérifie que le bouton de soumission est affiché avec le bon texte [cite: 33]
    expect(wrapper.find('.submit-btn').text()).toContain('Se connecter')
  })
})