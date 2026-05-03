import { mount } from '@vue/test-utils'
import { it, expect } from 'vitest'
import NotAuthorized from '@/views/NotAuthorized.vue'
import { createTestingPinia } from '@pinia/testing'

describe('NotAuthorized - Smoke Test', () => {
  it('devrait monter le composant sans planter', () => {
    const wrapper = mount(NotAuthorized, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.forbidden-panel').exists()).toBe(true)
  })
})