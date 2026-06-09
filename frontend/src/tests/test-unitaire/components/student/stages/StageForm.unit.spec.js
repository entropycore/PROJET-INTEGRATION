import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import StageForm from '@/components/student/stages/StageForm.vue'

describe('StageForm.vue - Tests Unitaires (Logique interne)', () => {
  let mockValidators

  beforeEach(() => {
    mockValidators = [
      { id: '1', fullName: 'Prof El Ghailani', department: 'Génie Informatique' },
      { id: '2', fullName: 'Prof Najim', department: 'Génie Informatique' }
    ]
  })

  it('devrait calculer correctement la durée en mois entre deux dates', async () => {
    const wrapper = mount(StageForm, {
      props: { initialStage: null, validators: mockValidators }
    })

    // Accès direct à la propriété réactive du formulaire pour simuler la saisie de dates
    wrapper.vm.form.startDate = '2026-08-01'
    wrapper.vm.form.endDate = '2026-10-01'

    // Vérifier la valeur calculée (Computed Property)
    expect(wrapper.vm.calculatedDuration).toBe('2 mois')
  })

  it('devrait identifier les champs manquants requis pour la soumission', async () => {
    const wrapper = mount(StageForm, {
      props: { initialStage: null, validators: mockValidators }
    })

    // Par défaut, le formulaire est vide, plusieurs champs doivent manquer
    expect(wrapper.vm.missingSubmitFields).toContain('titre')
    expect(wrapper.vm.missingSubmitFields).toContain('entreprise')
    expect(wrapper.vm.missingSubmitFields).toContain('rapport PDF')
    expect(wrapper.vm.canSubmitValidation).toBe(false)
  })

  it('devrait retourner le bon libellé de bouton selon le statut initial du stage', () => {
    const stageAvecCorrection = {
      title: 'Stage QA',
      validationStatus: 'CHANGES_REQUESTED'
    }

    const wrapper = mount(StageForm, {
      props: { initialStage: stageAvecCorrection, validators: mockValidators }
    })

    expect(wrapper.vm.submitButtonLabel()).toBe('Resoumettre pour validation')
  })
})