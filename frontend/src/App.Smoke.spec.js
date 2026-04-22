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
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RequestAccessPage from './views/RequestAccessView.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Smoke Tests - Demande d\'accès', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(RequestAccessPage, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
    })
  })

  it('doit changer le texte du bouton et le désactiver pendant l\'envoi', async () => {
    const submitBtn = wrapper.find('.submit-btn')
    
    // Simuler le remplissage pour passer la validation
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('TechCo')
    await wrapper.find('#jobTitle').setValue('Dev')
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#passwordConfirmation').setValue('123456')

    // Soumettre le formulaire
    await wrapper.find('form').trigger('submit.prevent')
    
    // Vérifier l'état "isSubmitting" via le texte du bouton
    expect(submitBtn.text()).toContain('Envoi...')
    expect(submitBtn.attributes()).toHaveProperty('disabled')
  })
})