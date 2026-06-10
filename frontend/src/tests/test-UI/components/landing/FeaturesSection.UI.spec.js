import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Features from '@/components/landing/FeaturesSection.vue'

describe('Features - Tests UI', () => {
  it("structure correctement l'en-tete et la grille de presentation", () => {
    const wrapper = mount(Features)

    expect(wrapper.find('section').attributes('id')).toBe('features')
    expect(wrapper.find('.section-label').text()).toBe('Réalisations documentées')
    expect(wrapper.find('.section-title').text()).toContain(
      'Des expériences visibles, structurées et vérifiables',
    )

    expect(wrapper.find('.product-evidence-grid').exists()).toBe(true)

    const cards = wrapper.findAll('.evidence-card')
    expect(cards.length).toBe(3)

    const images = wrapper.findAll('.evidence-media img')
    expect(images.length).toBe(3)

    const statuses = wrapper.findAll('.evidence-status.approved')
    expect(statuses.length).toBe(3)
    expect(cards.some((card) => card.text().includes('Plateforme de suivi académique'))).toBe(true)
  })
})
