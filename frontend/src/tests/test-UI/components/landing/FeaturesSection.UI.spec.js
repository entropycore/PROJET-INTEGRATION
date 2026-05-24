import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Features from '@/components/landing/FeaturesSection.vue'

describe('Features - Tests UI', () => {
  it("structure correctement l'en-tete et la grille de presentation", () => {
    const wrapper = mount(Features)

    expect(wrapper.find('section').attributes('id')).toBe('features')
    expect(wrapper.find('.section-label').text()).toBe('Fonctionnalités')
    expect(wrapper.find('.section-title').text()).toContain('Une plateforme complète')

    expect(wrapper.find('.features-grid').exists()).toBe(true)

    const icons = wrapper.findAll('.feature-icon svg')
    expect(icons.length).toBe(6)

    const descriptions = wrapper.findAll('.feature-desc')
    expect(descriptions.length).toBe(6)
    expect(descriptions.some((description) => description.text().includes('Connexion à votre compte GitHub'))).toBe(true)
  })
})
