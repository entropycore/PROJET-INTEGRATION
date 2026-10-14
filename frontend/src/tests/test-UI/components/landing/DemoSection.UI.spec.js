import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import DemoSection from '@/components/landing/DemoSection.vue'

describe('DemoSection - Tests UI', () => {
  it('affiche correctement le titre principal de la section', () => {
    const wrapper = mount(DemoSection)

    expect(wrapper.find('.section-label').text()).toBe('Portfolio certifié')
    expect(wrapper.find('.section-title').text()).toContain(
      'Le portfolio est le résultat de tout le parcours',
    )
  })

  it('affiche les sources utilisées pour générer le portfolio', () => {
    const wrapper = mount(DemoSection)
    const sources = wrapper.findAll('.portfolio-source-list > span')

    expect(sources.length).toBe(3)
    expect(sources.map((source) => source.text())).toEqual([
      'verifiedInformations validées',
      'auto_awesomeGénération automatique',
      'languagePortfolio public',
    ])
  })

  it('affiche un aperçu structuré du portfolio public', () => {
    const wrapper = mount(DemoSection)

    expect(wrapper.find('.compact-portfolio-window').exists()).toBe(true)
    expect(wrapper.find('.compact-profile h3').text()).toBe('Amina Berrada')
    expect(wrapper.findAll('.compact-achievement-stats > span').length).toBe(3)
  })
})
