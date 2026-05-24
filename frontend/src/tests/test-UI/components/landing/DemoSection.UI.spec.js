import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import DemoSection from '@/components/DemoSection.vue'

describe('DemoSection - Tests UI', () => {
  it('affiche correctement le titre principal de la section', () => {
    const wrapper = mount(DemoSection)
    
    expect(wrapper.text()).toContain('Le tableau de bord étudiant')
  })

  it('affiche les trois onglets avec leurs intitulés respectifs', () => {
    const wrapper = mount(DemoSection)
    const buttons = wrapper.findAll('button')

    expect(buttons.length).toBe(3)
    expect(buttons.text()).toBe('Mes projets')
    expect(buttons.text()).toBe('Stages')
    expect(buttons.text()).toBe('Compétences')
  })

  it('affiche l’image de démonstration avec sa description alternative', () => {
    const wrapper = mount(DemoSection)
    const image = wrapper.find('img')

    expect(image.exists()).toBe(true)
    expect(image.attributes('alt')).toBe('Aperçu du Tableau de Bord')
  })
})