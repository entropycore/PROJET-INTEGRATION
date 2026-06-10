import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import Hero from '@/components/landing/HeroSection.vue'

describe('Hero - Tests Unitaires', () => {
  it('redirige vers la page de connexion lors du clic sur le bouton principal', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: 'Home' } },
        { path: '/login', component: { template: 'Login' } },
      ],
    })

    const wrapper = mount(Hero, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const loginButton = wrapper.find('.btn-lg')
    await loginButton.trigger('click')
    await router.push(loginButton.attributes('href'))

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('contient les bonnes valeurs pour les statistiques et les ancres de navigation', () => {
    const wrapper = mount(Hero, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.find('.btn-outline').attributes('href')).toBe('#workflow')

    const stats = wrapper.findAll('.hero-product-stats strong')
    expect(stats.map(stat => stat.text())).toEqual(['12', '6', '4', '96'])
  })
})
