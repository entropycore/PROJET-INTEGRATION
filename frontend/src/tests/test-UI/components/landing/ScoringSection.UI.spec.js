import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Scoring from '@/components/landing/Scoring.vue'

describe('Scoring - Tests UI', () => {
  it('structure correctement l’affichage graphique du score et des barres', () => {
    const wrapper = mount(Scoring)

    expect(wrapper.find('section').attributes('id')).toBe('scoring')
    expect(wrapper.find('.score-ring-container svg').exists()).toBe(true)

    const fillBars = wrapper.findAll('.score-bar-fill')
    expect(fillBars.length).toBe(6)
    expect(fillBars.attributes('style')).toContain('width: 85%')
    expect(fillBars.attributes('style')).toContain('width: 60%')
  })

  it('affiche la section des distinctions avec les six badges de compétences', () => {
    const wrapper = mount(Scoring)

    expect(wrapper.find('.section-label').text()).toBe('Score & Badges')
    expect(wrapper.find('.badges-section-title').text()).toBe('Valorisez chaque compétence acquise')

    const badgeCards = wrapper.findAll('.badge-card')
    expect(badgeCards.length).toBe(6)

    const badgeIcons = wrapper.findAll('.badge-card svg')
    expect(badgeIcons.length).toBe(6)
  })
})