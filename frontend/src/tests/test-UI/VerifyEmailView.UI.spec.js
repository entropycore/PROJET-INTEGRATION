import { beforeEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VerifyEmail from '@/views/VerifyEmailView.vue'

const { mockRouter, mockRoute, verifyEmailMock } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn() },
  mockRoute: { query: {} },
  verifyEmailMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}))

vi.mock('@/services/authService', () => ({
  verifyEmail: verifyEmailMock,
}))

describe('VerifyEmail - Tests UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.query = {}
    verifyEmailMock.mockResolvedValue({})
  })
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
    expect(wrapper.find('.verify-email-button').exists()).toBe(false)
    
    wrapper.vm.isLoading = false
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.verify-email-button').exists()).toBe(true)
  })
})