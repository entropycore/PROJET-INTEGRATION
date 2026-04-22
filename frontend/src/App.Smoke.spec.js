import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import LoginPage from '@/views/LoginView.vue'
import RequestAccessPage from '@/views/RequestAccessView.vue'
// Simulation du routeur pour éviter les erreurs de navigation pendant le test
const mockRouter = { push: vi.fn() }
vi.mock('vue-router', () => ({ useRouter: () => mockRouter }))

describe('Smoke Test - Page de Connexion', () => {
  it('Vérifie la présence des éléments essentiels du DOM', () => {
    const pinia = createPinia()
    const wrapper = mount(LoginPage, {
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
describe('Smoke Tests - Demande d\'accès', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(RequestAccessPage, {
      global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
    })
  })

  // TEST 1: Validation des mots de passe différents
  it('doit afficher une erreur si les mots de passe ne correspondent pas', async () => {
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('TechCo')
    await wrapper.find('#jobTitle').setValue('Dev')
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#passwordConfirmation').setValue('611122') // DIFFÉRENT

    await wrapper.find('form').trigger('submit.prevent')

    // Vérifie l'erreur
    expect(wrapper.find('.error-message').text()).toBe('Les mots de passe ne correspondent pas.')
  })

  // TEST 2: Succès de l'envoi
  it('doit changer le texte du bouton pendant l\'envoi', async () => {
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('TechCo')
    await wrapper.find('#jobTitle').setValue('Dev')
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#passwordConfirmation').setValue('123456') // IDENTIQUE

    await wrapper.find('form').trigger('submit.prevent')

    // Vérifie l'état du bouton
    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.text()).toContain('Envoi...')
    expect(submitBtn.attributes()).toHaveProperty('disabled')
  })
})