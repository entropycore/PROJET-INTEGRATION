import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppLogo from '@/components/AppLogo.vue'

describe('AppLogo - Test de fumee', () => {
  it('se monte et rend le logo', () => {
    const wrapper = mount(AppLogo)

    expect(wrapper.find('img.app-logo').exists()).toBe(true)
    expect(wrapper.find('img').attributes('alt')).toBe('ValiDia logo')
  })
})
