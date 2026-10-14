import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Hero from '@/components/landing/HeroSection.vue'

describe('Hero - Tests UI', () => {
  it('affiche correctement tous les blocs visuels de la section principale', () => {
    const wrapper = mount(Hero, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.find('.hero-badge').text()).toBe('Plateforme acad\u00e9mique certifi\u00e9e')
    expect(wrapper.find('.hero-title').text()).toContain('Votre portfolio,certifi\u00e9 &reconnu.')
    expect(wrapper.find('.hero-desc').exists()).toBe(true)

    expect(wrapper.find('.hero-validation-notice').text()).toContain(
      'Validation effectuée',
    )

    const image = wrapper.find('.hero-product-project img')
    expect(image.exists()).toBe(true)
    expect(image.attributes('alt')).toBe(
      'Aperçu du projet Plateforme Credencia',
    )

    expect(wrapper.find('.hero-product-preview').exists()).toBe(true)
    expect(wrapper.findAll('.hero-product-stats > span').length).toBe(4)
  })
})
