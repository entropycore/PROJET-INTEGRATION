import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import RequestAccessPage from '@/views/RequestAccessView.vue'

const { requestAccessMock } = vi.hoisted(() => ({
  requestAccessMock: vi.fn(),
}))

vi.mock('@/services/requestAccessService', () => ({
  requestAccess: requestAccessMock,
}))

const flushPromises = async () => {
  await Promise.resolve()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

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