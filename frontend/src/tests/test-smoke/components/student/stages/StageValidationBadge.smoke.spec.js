import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ValidationBadge from '@/components/student/stages/StageValidationBadge.vue'

describe('ValidationBadge.vue - Smoke Test', () => {
  it('devrait monter le badge avec sa valeur par défaut sans planter', () => {
    const wrapper = mount(ValidationBadge)

    // 1. Vérification que le composant racine est bien présent
    expect(wrapper.exists()).toBe(true)

    // 2. Vérification de l'élément d'affichage principal
    const badge = wrapper.find('.validation-badge')
    expect(badge.exists()).toBe(true)

    // 3. Vérification de la valeur par défaut définie dans les props (PENDING)
    expect(badge.text()).toBe('En attente')
    expect(badge.classes()).toContain('pending')
  })
})
