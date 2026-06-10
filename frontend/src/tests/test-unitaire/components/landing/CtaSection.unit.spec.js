import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import CtaSection from '@/components/landing/CtaSection.vue'

describe('CtaSection.vue - Tests Unitaires', () => {
  const globalOptions = {
    stubs: {
      RouterLink: {
        props: ['to'],
        template: '<a :href="to"><slot /></a>',
      },
    },
  }

  it('rend correctement le titre et le sous-titre', () => {
    const wrapper = mount(CtaSection, { global: globalOptions })

    expect(wrapper.find('.cta-title').text()).toContain('\u00c0 la recherche de')
    expect(wrapper.find('.cta-title em').text()).toBe('nouveaux talents ?')
    expect(wrapper.find('.cta-sub').text()).toContain('Accédez à des portfolios certifiés')
  })

  it('contient un lien valide vers la connexion', () => {
    const wrapper = mount(CtaSection, { global: globalOptions })
    const loginLink = wrapper.find('.btn-cta-ghost')

    expect(loginLink.exists()).toBe(true)
    expect(loginLink.attributes('href')).toBe('/login')
  })

  it('possede les classes CSS requises pour les animations/styles', () => {
    const wrapper = mount(CtaSection, { global: globalOptions })

    expect(wrapper.find('.cta-box').classes()).toContain('reveal')
    expect(wrapper.find('.btn-cta-primary').exists()).toBe(true)
  })
})
