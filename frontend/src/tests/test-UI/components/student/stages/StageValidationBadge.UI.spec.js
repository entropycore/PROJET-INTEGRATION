import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ValidationBadge from '@/components/student/stages/StageValidationBadge.vue'

describe('ValidationBadge.vue - Tests d\'Interface (Rendu du badge)', () => {
  it('devrait appliquer la classe "approved" et afficher "Validé" pour le statut APPROVED', () => {
    const wrapper = mount(ValidationBadge, {
      props: { status: 'APPROVED' }
    })

    const badge = wrapper.find('.validation-badge')
    expect(badge.text()).toBe('Validé')
    expect(badge.classes()).toContain('approved')
  })

  it('devrait appliquer la classe "draft" et afficher "Brouillon" pour le statut DRAFT', () => {
    const wrapper = mount(ValidationBadge, {
      props: { status: 'DRAFT' }
    })

    const badge = wrapper.find('.validation-badge')
    expect(badge.text()).toBe('Brouillon')
    expect(badge.classes()).toContain('draft')
  })

  it('devrait afficher "Correction demandée" avec la classe "correction" pour le statut CHANGES_REQUESTED', () => {
    const wrapper = mount(ValidationBadge, {
      props: { status: 'CHANGES_REQUESTED' }
    })

    const badge = wrapper.find('.validation-badge')
    expect(badge.text()).toBe('Correction demandée')
    expect(badge.classes()).toContain('correction')
  })
})