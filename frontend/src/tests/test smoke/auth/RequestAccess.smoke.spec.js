import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import RequestAccessPage from '@/views/RequestAccessView.vue'

// Simulation du service d'accès
vi.mock('@/services/requestAccessService', () => ({
  requestAccess: vi.fn(() => new Promise(resolve => setTimeout(() => resolve({ message: 'Succès' }), 100))),
}))

describe('Smoke Tests - Demande d\'accès', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(RequestAccessPage, {
      global: { 
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: ['AppLogo'] 
      },
    })
  })

  it('doit afficher une erreur si les mots de passe ne correspondent pas', async () => {
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('TechCo')
    await wrapper.find('#jobTitle').setValue('Dev')
    
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#passwordConfirmation').setValue('611122') 

    await wrapper.find('form').trigger('submit.prevent')

    const error = wrapper.find('.error-message')
    expect(error.text()).toBe('Les mots de passe ne correspondent pas.')
  })

  it('doit changer le texte du bouton pendant l\'envoi', async () => {
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('TechCo')
    await wrapper.find('#jobTitle').setValue('Dev')
    await wrapper.find('#password').setValue('123456')
    await wrapper.find('#passwordConfirmation').setValue('123456') 

    await wrapper.find('form').trigger('submit.prevent')

    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.text()).toContain('Envoi...')
    expect(submitBtn.attributes()).toHaveProperty('disabled')
  })
})