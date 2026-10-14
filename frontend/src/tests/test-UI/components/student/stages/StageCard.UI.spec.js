import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import StageCard from '@/components/student/stages/StageCard.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

describe('StageCard.vue - Tests UI et d\'interaction', () => {
  const sampleStage = {
    id: 42,
    title: 'Stage Web QA',
    company: 'ValiDia Corp',
    validationStatus: 'DRAFT',
    startDate: '2026-04-15',
    endDate: '2026-05-15',
    duration: '1 mois',
    supervisor: { fullName: 'Nihal Kholoud' },
    reportUrl: 'http://validia.ma/report'
  }

  it('devrait émettre l\'événement "delete-stage" avec l\'ID correct lorsque le bouton supprimer est cliqué', async () => {
    const wrapper = mount(StageCard, { props: { stage: sampleStage } })
    
    // N9lbo 3la l-bouton dyal delete ou n-cliquew 3lih
    const deleteBtn = wrapper.find('.delete-btn')
    await deleteBtn.trigger('click')

    // N-ta9do bli l-event t-emitta m3a l-id dyal l-stage s7i7
    expect(wrapper.emitted('delete-stage')).toBeTruthy()
    expect(wrapper.emitted('delete-stage')[0]).toEqual([42])
  })

  it('devrait afficher le bouton Modifier uniquement si le stage est à l\'état DRAFT', async () => {
    // Cas 1: DRAFT -> Khssou i-ban
    let wrapper = mount(StageCard, { props: { stage: sampleStage } })
    const actionButtons = wrapper.findAll('.action-btn')
    const hasModifier = actionButtons.some(btn => btn.text().includes('Modifier'))
    expect(hasModifier).toBe(true)

    // Cas 2: APPROVED -> Ma khssouch i-ban (canEditStage rj3at false)
    const approvedStage = { ...sampleStage, validationStatus: 'APPROVED' }
    wrapper = mount(StageCard, { props: { stage: approvedStage } })
    
    // N-chofo ga3 les boutons action-btn wash fihom كلمة Modifier
    const buttons = wrapper.findAll('.action-btn')
    const hasModifierBtn = buttons.some(btn => btn.text().includes('Modifier'))
    expect(hasModifierBtn).toBe(false)
  })
})