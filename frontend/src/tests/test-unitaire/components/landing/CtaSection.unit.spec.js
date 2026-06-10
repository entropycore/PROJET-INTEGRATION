import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import CtaSection from '@/components/landing/CtaSection.vue'

describe('CtaSection.vue - Tests Unitaires', () => {
  const globalOptions = {
    stubs: {
      RouterLink: {
        template: '<a><slot /></a>',
      },
    },
  }

  it('rend correctement le titre et le sous-titre', () => {
    const wrapper = mount(CtaSection, { global: globalOptions })

    expect(wrapper.find('.cta-title').text()).toContain('\u00c0 la recherche de')
    expect(wrapper.find('.cta-title em').text()).toBe('nouveaux talents')
    expect(wrapper.find('.cta-sub').text()).toContain("Rejoignez notre r\u00e9seau d'entreprises partenaires")
  })

  it('contient un lien de contact par email valide', () => {
    const wrapper = mount(CtaSection, { global: globalOptions })
    const mailtoLink = wrapper.find('.btn-cta-ghost')

    expect(mailtoLink.exists()).toBe(true)
    expect(mailtoLink.attributes('href')).toBe('mailto:contact@ensa.ma')
  })

  it('possede les classes CSS requises pour les animations/styles', () => {
    const wrapper = mount(CtaSection, { global: globalOptions })

    expect(wrapper.find('.cta-box').classes()).toContain('reveal')
    expect(wrapper.find('.btn-cta-primary').exists()).toBe(true)
  })
})
