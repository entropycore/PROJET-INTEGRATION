import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StageForm from '@/components/student/stages/StageForm.vue'

describe('StageForm.vue - Smoke Test', () => {
  it('devrait instancier le formulaire et charger toutes les sections sans planter', () => {
    const mockValidators = [
      { id: '1', fullName: 'Prof El Ghailani', department: 'Génie Informatique' }
    ]

    const wrapper = mount(StageForm, {
      props: { initialStage: null, validators: mockValidators }
    })

    // 1. Le composant racine du formulaire est bien monté
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('form.stage-form').exists()).toBe(true)

    // 2. Les en-têtes principaux des sections sont bien rendus
    const headings = wrapper.findAll('h2')
    const titlesText = headings.map(h => h.text())
    
    expect(titlesText.some(title => title.includes('Informations principales'))).toBe(true)
    expect(titlesText.some(title => title.includes('Encadrant'))).toBe(true)
    expect(titlesText.some(title => title.includes('Technologies utilisées'))).toBe(true)
    expect(titlesText.some(title => title.includes('Captures d’écran'))).toBe(true)
    expect(titlesText.some(title => title.includes('Rapport PDF'))).toBe(true)

    // 3. Les principaux boutons d'action vitaux sont présents f l'interface
    expect(wrapper.find('.btn-secondary').text()).toContain('Sauveg. brouillon')
    expect(wrapper.find('.btn-primary').exists()).toBe(true)
  })
})
