import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginPage from '@/views/LoginView.vue'

const { mockRouter, mockRoute, loginMock, getMeMock } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn() },
  mockRoute: { path: '/login', name: 'login', params: {}, query: {} },
  loginMock: vi.fn(),
  getMeMock: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}))

vi.mock('@/services/authService', () => ({
  login: loginMock,
  getMe: getMeMock,
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
      data: { data: { id: 1, email: 'test@ensa.ac.ma' } },
    })

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
  })

  it('doit desactiver le bouton et changer le texte lors de clics rapides', async () => {
    let resolveLogin
    loginMock.mockImplementation(() => new Promise((resolve) => { resolveLogin = resolve }))

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