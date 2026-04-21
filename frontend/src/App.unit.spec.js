import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import LoginPage from '@/components/LoginPage.vue'

describe('Scénario de test - Page de connexion', () => {

  it('doit accepter l\'email normalement quand le format est valide', async () => {
    const wrapper = mount(LoginPage)

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('user@validia.ma')

    expect(emailInput.element.value).toBe('user@validia.ma')
    expect(wrapper.find('.error-text').exists()).toBe(false)
  })

  it('doit utiliser le type password pour masquer les caractères', () => {
    const wrapper = mount(LoginPage)

    const passwordInput = wrapper.find('input[name="password"]')
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('doit afficher le spinner lors de la soumission', async () => {
    const wrapper = mount(LoginPage)

    await wrapper.find('input[type="email"]').setValue('user@validia.ma')
    await wrapper.find('input[type="password"]').setValue('password123')

    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect(wrapper.find('.spinner').exists()).toBe(true)
  })

  it('doit rediriger vers la page demander accès', () => {
    const wrapper = mount(LoginPage)

    const link = wrapper.find('a[href="/demander-acces"]')

    expect(link.attributes('href')).toBe('/demander-acces')
    expect(link.text()).toContain('Demander l’accès')
  })

})