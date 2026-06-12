import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Workflow from '@/components/landing/WorkflowSection.vue'

describe('Workflow - Tests Unitaires', () => {
  it('valide le contenu textuel et l ordre des 5 etapes du processus', () => {
    const wrapper = mount(Workflow)
    const steps = wrapper.findAll('.workflow-step')

    expect(steps.length).toBe(5)

    const titles = steps.map(step => step.find('.step-title').text())
    expect(titles).toEqual([
      'Documenter',
      'Soumettre',
      'Vérifier',
      'Valoriser',
      'Partager',
    ])
  })

  it('attribue les bons indicateurs d etat aux cercles des etapes', () => {
    const wrapper = mount(Workflow)
    const circles = wrapper.findAll('.step-circle')

    expect(circles[0].classes()).toContain('active')
    expect(circles[0].text()).toBe('1')

    expect(circles[1].classes()).not.toContain('active')
    expect(circles[1].text()).toBe('2')

    expect(circles[2].text()).toBe('3')
    expect(circles[4].classes()).toContain('done')
    expect(circles[4].text()).toBe('5')
  })
})
