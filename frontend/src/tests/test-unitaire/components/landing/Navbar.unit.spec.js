import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import Navbar from '@/components/landing/Navbar.vue'

describe('Navbar - Tests Unitaires', () => {
  it('contient des liens internes valides pour le defilement de la page', () => {
    const wrapper = mount(Navbar, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    const links = wrapper.findAll('.nav-links a')
    expect(links[0].attributes('href')).toBe('#features')
    expect(links[1].attributes('href')).toBe('#workflow')
    expect(links[2].attributes('href')).toBe('#roles')
    expect(links[3].attributes('href')).toBe('#scoring')
    expect(links[4].attributes('href')).toBe('#demo')
  })

  it('gere correctement les redirections de la plateforme', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: 'Home' } },
        { path: '/login', component: { template: 'Login' } },
        { path: '/request-access', component: { template: 'Access' } },
      ],
    })

    const wrapper = mount(Navbar, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const loginButton = wrapper.find('.btn-ghost')
    await loginButton.trigger('click')
    await router.push(loginButton.attributes('href'))
    expect(router.currentRoute.value.path).toBe('/login')

    const accessButton = wrapper.find('.btn-primary')
    await accessButton.trigger('click')
    await router.push(accessButton.attributes('href'))
    expect(router.currentRoute.value.path).toBe('/request-access')
  })
})
