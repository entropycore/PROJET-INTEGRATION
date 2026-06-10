import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Roles from '@/components/landing/RolesSection.vue'

describe('Roles - Tests UI', () => {
  it('structure le rendu visuel de la grille des roles correctement', () => {
    const wrapper = mount(Roles)

    expect(wrapper.find('section').attributes('id')).toBe('roles')
    expect(wrapper.find('.section-label').text()).toBe('Écosystème de confiance')
    expect(wrapper.find('.section-title').text()).toBe(
      'Quatre rôles, une même plateforme',
    )
    expect(wrapper.find('.section-sub').exists()).toBe(true)

    expect(wrapper.find('.roles-grid').exists()).toBe(true)

    const cards = wrapper.findAll('.role-card')
    expect(cards.length).toBe(4)

    const avatars = wrapper.findAll('.role-avatar')
    expect(avatars.length).toBe(4)
    expect(avatars.some((avatar) => avatar.find('svg').exists())).toBe(true)

    const descriptions = wrapper.findAll('.role-desc')
    expect(descriptions.length).toBe(4)
  })
})
