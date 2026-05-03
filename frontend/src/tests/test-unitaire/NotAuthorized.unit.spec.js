import { describe, it, expect } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import NotAuthorized from '@/views/NotAuthorized.vue'

describe('NotAuthorized - Tests Unitaires', () => {
  it('devrait calculer le chemin correct pour le role ADMINISTRATOR', () => {
    const wrapper = mount(NotAuthorized, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: {
              user: { role: 'ADMINISTRATOR' },
              isAuthenticated: true
            }
          }
        })]
      }
    })
    expect(wrapper.vm.homePath).toBe('/admin')
  })

  it("devrait retourner au login si l'utilisateur n'est pas authentifie", () => {
    const wrapper = mount(NotAuthorized, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: {
              isAuthenticated: false
            }
          }
        })]
      }
    })
    expect(wrapper.vm.homePath).toBe('/login')
    expect(wrapper.vm.homeLabel).toBe('Se connecter')
  })
})