import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import LoginPage from '@/views/LoginView.vue'
import RequestAccessPage from '@/views/RequestAccessView.vue'

const { mockRouter, mockRoute, loginMock, getMeMock, requestAccessMock } = vi.hoisted(() => ({
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
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')

  return {
    ...actual,
    useRouter: () => mockRouter,
    useRoute: () => mockRoute,
  }
})

vi.mock('./services/authService', () => ({
  login: loginMock,
  getMe: getMeMock,
}))

vi.mock('./services/requestAccessService', () => ({
  requestAccess: requestAccessMock,
}))

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('LoginPage.vue - Tests unitaires de la page de connexion', () => {
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

    wrapper = mount(LoginPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: { AppLogo: true },
      },
    })
  })

  it('doit afficher une erreur si les champs email ou mot de passe sont vides', async () => {
    await wrapper.find('form').trigger('submit.prevent')

    const error = wrapper.find('.error-message')
    expect(error.exists()).toBe(true)
    expect(error.text()).toBe('Veuillez remplir tous les champs.')
  })

  it("doit changer le type de l'input mot de passe lors du clic sur l'icone", async () => {
    const passwordInput = wrapper.find('#password')
    const toggleIcon = wrapper.find('.toggle-icon')

    expect(passwordInput.attributes('type')).toBe('password')

    await toggleIcon.trigger('click')

    expect(passwordInput.attributes('type')).toBe('text')
  })

  it('doit desactiver le bouton et afficher "Connexion..." pendant le chargement', async () => {
    let resolveLogin
    loginMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve
        }),
    )

    await wrapper.find('#email').setValue('test@ensa.ac.ma')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const submitBtn = wrapper.find('.submit-btn')
    expect(submitBtn.text()).toContain('Connexion...')
    expect(submitBtn.attributes()).toHaveProperty('disabled')

    resolveLogin({})
    await flushPromises()
  })

  it("doit rediriger l'utilisateur vers la page de demande d'acces", async () => {
    await wrapper.find('.access-request-link').trigger('click')

    expect(mockRouter.push).toHaveBeenCalledWith('/request-access')
  })

  it('doit afficher un message de succes apres une connexion reussie', async () => {
    await wrapper.find('#email').setValue('test@ensa.ac.ma')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const successBox = wrapper.find('.success-message')
    expect(successBox.exists()).toBe(true)
    expect(successBox.text()).toBe('Connexion réussie.')
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
