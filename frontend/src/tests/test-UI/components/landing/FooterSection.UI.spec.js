import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Footer from '@/components/landing/FooterSection.vue'

describe('Footer - Tests UI', () => {
  it('structure le rendu visuel et la liste des liens correctement', () => {
    const wrapper = mount(Footer)
    
    expect(wrapper.find('footer').exists()).toBe(true)
    expect(wrapper.find('.footer-brand').exists()).toBe(true)
    expect(wrapper.find('.footer-copy').exists()).toBe(true)
    
    const links = wrapper.findAll('.footer-links li a')
    expect(links.length).toBe(4)
    expect(links[0].text()).toBe('À propos')
    expect(links[1].text()).toBe('Confidentialité')
    expect(links[2].text()).toBe('Contact')
    expect(links[3].text()).toBe('Documentation')
  })
})
