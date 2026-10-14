import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import StageCard from '@/components/student/stages/StageCard.vue'

// Mocking vue-router bach l-composant i-mounta bla machakil
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

describe('StageCard.vue - Tests unitaires (Logique)', () => {
  const baseStage = {
    id: 1,
    title: 'Stage Test',
    company: 'OCP',
    validationStatus: 'DRAFT',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    duration: '1 mois',
    supervisor: { fullName: 'Prof El Ghailani' },
    reportUrl: 'http://link.com'
  }

  it('devrait normaliser le statut CORRECTION_REQUIRED en CHANGES_REQUESTED', () => {
    const wrapper = mount(StageCard, {
      props: { stage: { ...baseStage, validationStatus: 'CORRECTION_REQUIRED' } }
    })
    // stageStatus dial computed khssou i-koun CHANGES_REQUESTED
    expect(wrapper.vm.stageStatus).toBe('CHANGES_REQUESTED')
  })

  it('devrait retourner true pour canEditStage quand le statut est DRAFT', () => {
    const wrapper = mount(StageCard, {
      props: { stage: { ...baseStage, validationStatus: 'DRAFT' } }
    })
    expect(wrapper.vm.canEditStage).toBe(true)
  })

  it('devrait retourner false pour isStageCompleteForSubmission si reportUrl est manquant', () => {
    const wrapper = mount(StageCard, {
      props: { stage: { ...baseStage, reportUrl: '' } }
    })
    expect(wrapper.vm.isStageCompleteForSubmission).toBe(false)
  })
})