import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StageFilters from '@/components/student/stages/StageFilters.vue'

describe('StageFilters.vue - Test de fumée', () => {
  it('devrait rendre tous les éléments de filtre sans planter', () => {
    const wrapper = mount(StageFilters, {
      props: { search: '', status: 'ALL', visibility: 'ALL' }
    })

    // 1. Wash l-card container o l-icon dyal l-loupe baynin?
    expect(wrapper.find('.filters-card').exists()).toBe(true)
    expect(wrapper.find('.search-icon').text()).toBe('⌕')

    // 2. Wash l-input ou les 2 selects existants?
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.findAll('select').length).toBe(2)

    // 3. Verification khfifa bli l-options l-assassiya t-chargat
    expect(wrapper.text()).toContain('Tous les statuts')
    expect(wrapper.text()).toContain('Toutes les visibilités')
  })
})