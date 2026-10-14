import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StageFilters from '@/components/student/stages/StageFilters.vue'

describe('StageFilters.vue - Tests UI et d\'interaction', () => {
  it('devrait émettre "update:search" quand l\'utilisateur tape dans le champ de recherche', async () => {
    const wrapper = mount(StageFilters, { props: { search: '' } })
    const input = wrapper.find('input')

    // N-simuliw bli l-user kteb 'React'
    await input.setValue('React')

    // N-ta9do bli l-event dyal v-model (update:search) t-emitta s7i7
    expect(wrapper.emitted('update:search')).toBeTruthy()
    expect(wrapper.emitted('update:search')[0]).toEqual(['React'])
  })

  it('devrait émettre "update:status" lorsque l\'utilisateur change le statut', async () => {
    const wrapper = mount(StageFilters, { props: { status: 'ALL' } })
    const statusSelect = wrapper.findAll('select')[0]

    // N-simuliw bli l-user khtar 'APPROVED' (Validé)
    await statusSelect.setValue('APPROVED')

    expect(wrapper.emitted('update:status')).toBeTruthy()
    expect(wrapper.emitted('update:status')[0]).toEqual(['APPROVED'])
  })

  it('devrait émettre "update:visibility" lorsque l\'utilisateur change la visibilité', async () => {
    const wrapper = mount(StageFilters, { props: { visibility: 'ALL' } })
    const visibilitySelect = wrapper.findAll('select')[1]

    // N-simuliw bli l-user khtar 'PRIVATE' (Privée)
    await visibilitySelect.setValue('PRIVATE')

    expect(wrapper.emitted('update:visibility')).toBeTruthy()
    expect(wrapper.emitted('update:visibility')[0]).toEqual(['PRIVATE'])
  })
})