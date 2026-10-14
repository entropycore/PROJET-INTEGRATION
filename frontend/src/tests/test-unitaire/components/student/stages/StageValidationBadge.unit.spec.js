import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ValidationBadge from '@/components/student/stages/StageValidationBadge.vue'

describe('ValidationBadge.vue - Tests Unitaires (Logique de configuration)', () => {
  it('devrait normaliser correctement le statut "CORRECTION_REQUIRED" en "CHANGES_REQUESTED"', () => {
    const wrapper = mount(ValidationBadge, {
      props: { status: 'CORRECTION_REQUIRED' }
    })
    
    // Test de la fonction de normalisation interne
    const normalized = wrapper.vm.normalizeStatus('CORRECTION_REQUIRED')
    expect(normalized).toBe('CHANGES_REQUESTED')
  })

  it('devrait nettoyer les espaces et passer en majuscules le statut fourni', () => {
    const wrapper = mount(ValidationBadge, {
      props: { status: '  pending  ' }
    })
    
    const normalized = wrapper.vm.normalizeStatus('  pending  ')
    expect(normalized).toBe('PENDING')
  })

  it('devrait retourner la configuration par défaut (PENDING) si le statut est inconnu', () => {
    const wrapper = mount(ValidationBadge, {
      props: { status: 'STATUT_INEXISTANT' }
    })

    const config = wrapper.vm.getStatusConfig('STATUT_INEXISTANT')
    expect(config.label).toBe('En attente')
    expect(config.class).toBe('pending')
  })
})