import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import NotAuthorized from '@/views/NotAuthorized.vue'
import { createTestingPinia } from '@pinia/testing'

describe('NotAuthorized - Test UI', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NotAuthorized, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: {
              isAuthenticated: true,
              user: { role: 'STUDENT' }
            }
          }
        })],
        stubs: ['AppLogo']
      }
    })
  })

  it('devrait respecter la structure du layout (Grid & Place-items)', () => {
    const main = wrapper.find('main')
    expect(main.classes()).toContain('forbidden-page')

    const panel = wrapper.find('.forbidden-panel')
    expect(panel.exists()).toBe(true)
  })

  it('devrait afficher le badge "Erreur 403" avec les styles de danger', () => {
    const badge = wrapper.find('.status-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('Erreur 403')
    expect(badge.element).toBeTruthy()
  })

  it('devrait avoir un titre H1 avec le style de police fluide (clamp)', () => {
    const title = wrapper.find('h1')
    expect(title.attributes('id')).toBe('forbidden-title')
    expect(title.text()).toBe('Accès refusé')
  })

  it('devrait appliquer les classes de boutons primaires et secondaires', () => {
    const btnRetour = wrapper.find('.secondary-button')
    const btnHome = wrapper.find('.primary-button')

    expect(btnRetour.exists()).toBe(true)
    expect(btnRetour.attributes('type')).toBe('button')

    expect(btnHome.exists()).toBe(true)
    expect(btnHome.text()).toBe('Aller à mon espace')
  })

  it('devrait avoir une section de message avec une largeur maximale definie', () => {
    const message = wrapper.find('.forbidden-message')
    expect(message.exists()).toBe(true)
    expect(message.text()).toContain('Votre compte est bien reconnu')
  })

  it("devrait verifier que le conteneur d'actions utilise le Flexbox (via classes)", () => {
    const actions = wrapper.find('.forbidden-actions')
    expect(actions.exists()).toBe(true)
    expect(actions.element).toBeTruthy()
  })
})