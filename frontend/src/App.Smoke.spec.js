import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginPage from '@/views/LoginView.vue'
import RequestAccessPage from '@/views/RequestAccessView.vue'

// Simulation du routeur (Mock)
const mockRouter = {
  push: vi.fn(),
}
const mockRoute = {
  path: '/login',
  name: 'login',
  params: {},
  query: {},
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}))

describe('Smoke Test - Page de Connexion', () => {
  let wrapper;

  beforeEach(() => {
    // Réinitialisation du mock avant chaque test
    vi.clearAllMocks()

    // Montage du composant avec un Pinia de test
    wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          // On remplace AppLogo par un composant vide pour simplifier le test
          AppLogo: true 
        }
      }
    })
  })

  it('doit confirmer que les éléments essentiels du DOM sont présents', () => {
    // 1. Vérifie si le logo de l'application est présent (via son composant)

    expect(wrapper.findComponent({ name: 'AppLogo' }).exists()).toBe(true)

    // 2. Vérifie la présence du titre principal (H1)
    expect(wrapper.find('h1').text()).toContain('Votre identité')

    // 3. Vérifie que les champs de saisie (Email et Mot de passe) sont présents via leurs IDs
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)

    // 4. Vérifie que le bouton de soumission existe et affiche le texte initial
    const submitBtn = wrapper.find('.submit-btn')
    expect(submitBtn.exists()).toBe(true)
    expect(submitBtn.text()).toBe('Se connecter')
  })

  it('doit vérifier la présence du lien de demande d\'accès', () => {
    // Vérifie que le texte cliquable pour demander l'accès est bien là
    const requestLink = wrapper.find('.access-request-link')
    expect(requestLink.exists()).toBe(true)
    expect(requestLink.text()).toBe("Demandez l'accès")
  })

  it('doit vérifier que les messages d\'erreur ne sont pas visibles par défaut', () => {
    // Au chargement, aucun message d'erreur ou de succès ne doit être dans le DOM
    expect(wrapper.find('.error-message').exists()).toBe(false)
    expect(wrapper.find('.success-message').exists()).toBe(false)
  })
})


// Simulation du service d'accès pour tester la soumission sans backend réel
vi.mock('../services/requestAccessService', () => ({
  requestAccess: vi.fn(() => new Promise(resolve => setTimeout(() => resolve({ message: 'Succès' }), 100))),
}))

describe('Smoke Tests - Demande d\'accès', () => {
  let wrapper;

  beforeEach(() => {
    // Initialisation du composant avant chaque test
    wrapper = mount(RequestAccessPage, {
      global: { 
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: ['AppLogo'] // On ignore le logo pour se concentrer sur la logique
      },
    })
  })

  // TEST 1 : Vérifier la validation lorsque les mots de passe sont différents
  it('doit afficher une erreur si les mots de passe ne correspondent pas', async () => {
    // Remplissage de tous les champs obligatoires
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('TechCo')
    await wrapper.find('#jobTitle').setValue('Dev')
    
    // Saisie de mots de passe différents
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#passwordConfirmation').setValue('611122') 

    // Soumission du formulaire
    await wrapper.find('form').trigger('submit.prevent')

    // Vérification que le message d'erreur correct s'affiche
    const error = wrapper.find('.error-message')
    expect(error.text()).toBe('Les mots de passe ne correspondent pas.')
  })

  // TEST 2 : Vérifier l'état du bouton pendant le processus d'envoi
  it('doit changer le texte du bouton pendant l\'envoi', async () => {
    // Remplissage correct de tous les champs
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('TechCo')
    await wrapper.find('#jobTitle').setValue('Dev')
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#passwordConfirmation').setValue('123456') 

    // Soumission du formulaire
    await wrapper.find('form').trigger('submit.prevent')

    // Vérification que le bouton passe en mode "Envoi..." et devient désactivé
    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.text()).toContain('Envoi...')
    expect(submitBtn.attributes()).toHaveProperty('disabled')
  })
})