import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Footer from '@/components/landing/FooterSection.vue'

describe('Footer - Tests Unitaires', () => {
  it('valide le contenu des textes et les attributs des liens', () => {
    const wrapper = mount(Footer)
    
    expect(wrapper.find('.footer-brand').text()).toBe('PortFolio ENSA')
    
    const links = wrapper.findAll('.footer-links li a')
    links.forEach(link => {
      expect(link.attributes('href')).toBe('#')
    })

    const copyright = wrapper.find('.footer-copy').text()
    expect(copyright).toContain('© 2025–2026')
    expect(copyright).toContain('ENSA Tanger')
    expect(copyright).toContain('Pr. M. Ghailani')
  })
})
