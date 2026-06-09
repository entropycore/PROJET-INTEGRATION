import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Navbar from '@/components/landing/Navbar.vue'

describe('Navbar - Tests UI', () => {
  it("affiche correctement l'identite de marque et les options du menu", () => {
    const wrapper = mount(Navbar, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    const logoImg = wrapper.find('.nav-logo img')
    expect(logoImg.exists()).toBe(true)
    expect(logoImg.attributes('alt')).toBe('Logo Credencia')
    expect(wrapper.find('.logo-text').text()).toBe('Credencia')

    const menuItems = wrapper.findAll('.nav-links li')
    expect(menuItems.length).toBe(5)

    expect(wrapper.find('.btn-ghost').text()).toBe('Connexion')
    expect(wrapper.find('.btn-primary').text()).toBe('Demander un acc\u00e8s')
  })
})
