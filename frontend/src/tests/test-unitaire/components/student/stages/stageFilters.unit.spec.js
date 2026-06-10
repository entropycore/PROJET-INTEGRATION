import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StageFilters from '@/components/student/stages/StageFilters.vue'

describe('StageFilters.vue - Tests unitaires (liaison de props)', () => {
  it('devrait lier correctement les valeurs des props aux éléments input et select', () => {
    const wrapper = mount(StageFilters, {
      props: {
        search: 'DevOps',
        status: 'PENDING',
        visibility: 'PUBLIC'
      }
    })

    // N-chofo wash l-input dyal search fih dik l-valeur dyal l-prop
    expect(wrapper.find('input').element.value).toBe('DevOps')

    // N-chofo les selects hta huma wash chadin les props s7i s7i7
    const selects = wrapper.findAll('select')
    expect(selects[0].element.value).toBe('PENDING')
    expect(selects[1].element.value).toBe('PUBLIC')
  })
})