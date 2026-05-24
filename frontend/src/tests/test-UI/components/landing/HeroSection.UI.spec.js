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

    const cards = wrapper.findAll('.float-card')
    expect(cards.length).toBe(2)
    expect(cards[0].text()).toContain("Projet valid\u00e9 par l'institution")
    expect(cards[1].text()).toContain('Pr. Alami a valid\u00e9 votre stage')

    const image = wrapper.find('.portfolio-image-demo')
    expect(image.exists()).toBe(true)
    expect(image.attributes('alt')).toBe('Aper\u00e7u du portfolio Credencia')
  })
})
