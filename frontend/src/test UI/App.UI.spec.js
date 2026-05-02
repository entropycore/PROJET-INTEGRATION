import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import LoginPage from '@/views/LoginView.vue'
import RequestAccessPage from '@/views/RequestAccessView.vue'
import VerifyEmail from '@/views/VerifyEmailView.vue'

const { mockRouter, mockRoute, loginMock, getMeMock, requestAccessMock, verifyEmailMock } = vi.hoisted(() => ({
  mockRouter: {
    push: vi.fn(),
  },
  mockRoute: {
    path: '/login',
    name: 'login',
    params: {},
    query: {},
  },
  loginMock: vi.fn(),
  getMeMock: vi.fn(),
  requestAccessMock: vi.fn(),
  verifyEmailMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}))

vi.mock('./services/authService', () => ({
  login: loginMock,
  getMe: getMeMock,
  verifyEmail: verifyEmailMock,
}))

vi.mock('./services/requestAccessService', () => ({
  requestAccess: requestAccessMock,
}))

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('Tests UI & Logique - Page de Connexion', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    loginMock.mockResolvedValue({})
    getMeMock.mockResolvedValue({
      data: {
        data: {
          id: 1,
          email: 'test@ensa.ac.ma',
        },
      },
    })
    verifyEmailMock.mockResolvedValue({})

    wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: { AppLogo: true },
      },
    })
  })

  it('doit respecter la conformite visuelle et structurelle', () => {
    expect(wrapper.find('.auth-page').exists()).toBe(true)
    expect(wrapper.find('.auth-card').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toContain('Votre identité')
    expect(wrapper.find('.submit-btn').text()).toBe('Se connecter')
  })

  it('doit basculer la visibilite du mot de passe', async () => {
    const passwordInput = wrapper.find('#password')
    const toggleIcon = wrapper.find('.toggle-icon')

    expect(passwordInput.attributes('type')).toBe('password')

    await toggleIcon.trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')

    await toggleIcon.trigger('click')
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it("doit afficher l'indicateur d'erreur rouge si les champs sont vides", async () => {
    await wrapper.find('form').trigger('submit.prevent')

    const errorLabel = wrapper.find('.error-message')
    expect(errorLabel.exists()).toBe(true)
    expect(errorLabel.text()).toBe('Veuillez remplir tous les champs.')
    expect(errorLabel.classes()).toContain('error-message')
  })

  it('doit rester stable visuellement avec un mot de passe extremement long', async () => {
    const passwordInput = wrapper.find('#password')
    const longPassword = 'p'.repeat(2000)

    await passwordInput.setValue(longPassword)

    expect(passwordInput.element.value).toBe(longPassword)
    expect(wrapper.find('.auth-card').exists()).toBe(true)
  })

  it('doit desactiver le bouton et changer le texte lors de clics rapides', async () => {
    let resolveLogin
    loginMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve
        }),
    )

    await wrapper.find('#email').setValue('test@ensa.ac.ma')
    await wrapper.find('#password').setValue('12345678')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const submitBtn = wrapper.find('.submit-btn')
    expect(submitBtn.attributes()).toHaveProperty('disabled')
    expect(submitBtn.text()).toBe('Connexion...')

    resolveLogin({})
    await flushPromises()
  })

  it("doit naviguer vers la demande d'acces via le lien dedie", async () => {
    await wrapper.find('.access-request-link').trigger('click')

    expect(mockRouter.push).toHaveBeenCalledWith('/request-access')
  })
})

describe("Tests Unitaires - Page Demande d'acces", () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    requestAccessMock.mockResolvedValue({ message: 'Demande envoyee.' })

    wrapper = mount(RequestAccessPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: { AppLogo: true },
      },
    })
  })

  it('doit afficher une erreur si un champ obligatoire est vide', async () => {
    await wrapper.find('form').trigger('submit.prevent')

    const error = wrapper.find('.error-message')
    expect(error.exists()).toBe(true)
    expect(error.text()).toBe('Veuillez remplir tous les champs.')
  })

  it('doit valider que les mots de passe ne correspondent pas', async () => {
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('Ma Société')
    await wrapper.find('#jobTitle').setValue('Développeur')
    await wrapper.find('#password').setValue('Password123')
    await wrapper.find('#passwordConfirmation').setValue('Diff123')
    await wrapper.find('form').trigger('submit.prevent')

    const error = wrapper.find('.error-message')
    expect(error.text()).toBe('Les mots de passe ne correspondent pas.')
  })

  it('doit basculer la visibilite du mot de passe', async () => {
    const passwordInput = wrapper.find('#password')
    const toggleIcon = wrapper.findAll('.toggle-icon')[0]

    expect(passwordInput.attributes('type')).toBe('password')

    await toggleIcon.trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')

    await toggleIcon.trigger('click')
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('doit basculer la visibilite de la confirmation du mot de passe', async () => {
    const confirmInput = wrapper.find('#passwordConfirmation')
    const toggleIcon = wrapper.findAll('.toggle-icon')[1]

    expect(confirmInput.attributes('type')).toBe('password')

    await toggleIcon.trigger('click')
    expect(confirmInput.attributes('type')).toBe('text')

    await toggleIcon.trigger('click')
    expect(confirmInput.attributes('type')).toBe('password')
  })

  it('doit afficher un message de succes apres une soumission valide', async () => {
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('Ma Société')
    await wrapper.find('#jobTitle').setValue('Développeur')
    await wrapper.find('#password').setValue('Password123')
    await wrapper.find('#passwordConfirmation').setValue('Password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const success = wrapper.find('.success-message')
    expect(success.exists()).toBe(true)
    expect(success.text()).toContain('Demande envoyee.')
  })
})

describe('VerifyEmail - Tests UI', () => {
  it('devrait afficher le spinner pendant le chargement', () => {
    const wrapper = mount(VerifyEmail)
    expect(wrapper.find('.status-spinner').exists()).toBe(true)
  })

  it('devrait appliquer la classe de succès quand l\'email est vérifié', async () => {
    const wrapper = mount(VerifyEmail)
    wrapper.vm.isLoading = false
    wrapper.vm.isSuccess = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.status-icon-success').exists()).toBe(true)
  })

  it('devrait afficher le bouton de retour seulement après le chargement', async () => {
    const wrapper = mount(VerifyEmail)
    // Au début (loading: true), le bouton n'existe pas
    expect(wrapper.find('.verify-email-button').exists()).toBe(false)
    
    // Après le chargement
    wrapper.vm.isLoading = false
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.verify-email-button').exists()).toBe(true)
  })
})
