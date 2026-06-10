import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Scoring from '@/components/landing/ScoringSection.vue'

describe('Scoring - Tests UI', () => {
  it("structure correctement l'affichage graphique du score et des barres", () => {
    const wrapper = mount(Scoring)

    expect(wrapper.find('section').attributes('id')).toBe('scoring')
    expect(wrapper.find('.preview-ring').exists()).toBe(true)
    expect(wrapper.find('.preview-ring').text()).toContain('82')

    const fillBars = wrapper.findAll('.preview-progress-lines i')
    const fillBarStyles = fillBars.map((fillBar) =>
      fillBar.attributes('style').replace(/\s/g, ''),
    )

    expect(fillBars.length).toBe(3)
    expect(fillBarStyles).toContain('width:88%;')
    expect(fillBarStyles).toContain('width:68%;')
  })

  it('affiche les badges obtenus dans le dashboard étudiant', () => {
    const wrapper = mount(Scoring)

    expect(wrapper.find('.section-label').text()).toBe('Dashboard étudiant')
    expect(wrapper.find('.dashboard-badges-card').exists()).toBe(true)

    const badgeCards = wrapper.findAll('.dashboard-badge-row > span')
    expect(badgeCards.length).toBe(3)
    expect(badgeCards.map((badge) => badge.text())).toEqual([
      'terminalWeb Developer',
      'cloud_syncDevOps Explorer',
      'groupsHackathon',
    ])
  })
})
