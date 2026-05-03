import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VerifyEmail from '@/views/VerifyEmailView.vue'

const { mockRoute, verifyEmailMock } = vi.hoisted(() => ({
  mockRoute: { query: {} },
  verifyEmailMock: vi.fn(),
}))

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return { ...actual, useRoute: () => mockRoute }
})

vi.mock('@/services/authService', () => ({
  verifyEmail: verifyEmailMock,
}))

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('VerifyEmail - Tests Unitaires', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.query = {}
    verifyEmailMock.mockResolvedValue({})
  })

  it('devrait afficher une erreur si le token est manquant', async () => {
    const wrapper = mount(VerifyEmail)
    await flushPromises()

    expect(wrapper.vm.statusTitle).toBe('Vérification impossible')
    expect(wrapper.vm.statusText).toBe('Token de vérification manquant.')
    expect(verifyEmailMock).not.toHaveBeenCalled()
  })

  it('devrait afficher le message d\'erreur quand la vérification échoue', async () => {
    mockRoute.query = { token: 'test-token' }
    verifyEmailMock.mockRejectedValue({
      response: { data: { message: 'Le lien de vérification est expiré' } },
    })

    const wrapper = mount(VerifyEmail)
    await flushPromises()

    expect(verifyEmailMock).toHaveBeenCalledWith('test-token')
    expect(wrapper.vm.statusText).toBe('Le lien de vérification est expiré')
  })
})