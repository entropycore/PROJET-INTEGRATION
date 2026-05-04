import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import VerifyEmailView from '@/views/VerifyEmailView.vue'

const { mockRouter, mockRoute, verifyEmailMock } = vi.hoisted(() => ({
  mockRouter: {
    push: vi.fn(),
  },
  mockRoute: {
    path: '/verify-email',
    name: 'verify-email',
    params: {},
    query: { token: 'test-token' },
  },
  verifyEmailMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}))

vi.mock('@/services/authService', () => ({
  verifyEmail: verifyEmailMock,
}))

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('VerifyEmail - Tests Smoke', () => {
  let wrapper;

  beforeEach(async () => {
    vi.clearAllMocks()
    verifyEmailMock.mockResolvedValue({})

    wrapper = mount(VerifyEmailView, {
      global: {
        stubs: { AppLogo: true },
      },
    })

    await flushPromises()
  })

  it('devrait monter le composant sans erreur', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('devrait afficher le logo de l\'application', () => {
    const logo = wrapper.findComponent({ name: 'AppLogo' })
    expect(logo.exists()).toBe(true)
  })
})