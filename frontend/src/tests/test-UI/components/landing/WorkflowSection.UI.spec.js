import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Workflow from '@/components/landing/WorkflowSection.vue'

describe('Workflow - Tests UI', () => {
  it('structure le rendu visuel de la section processus correctement', () => {
    const wrapper = mount(Workflow)

    expect(wrapper.find('section').attributes('id')).toBe('workflow')
    expect(wrapper.find('.section-label').text()).toBe('Processus de validation')
    expect(wrapper.find('.section-title').text()).toBe('De la soumission à la certification')
    expect(wrapper.find('.section-sub').exists()).toBe(true)

    const animatedElements = wrapper.findAll('.reveal')
    expect(animatedElements.length).toBeGreaterThan(0)

    const descriptions = wrapper.findAll('.step-desc')
    expect(descriptions.length).toBe(5)
  })
})
