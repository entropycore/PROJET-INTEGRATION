import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import CtaSection from '@/components/landing/CtaSection.vue'

describe('CtaSection.vue - Tests UI & Integration Router', () => {
  it("redirige vers '/request-access' lors du clic sur le bouton principal", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: 'Home' } },
        { path: '/request-access', component: { template: 'AccessPage' } },
      ],
    })

    const wrapper = mount(CtaSection, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const actionLink = wrapper.find('.btn-cta-primary')
    expect(actionLink.exists()).toBe(true)

    await actionLink.trigger('click')
    await router.push(actionLink.attributes('href'))

    expect(router.currentRoute.value.path).toBe('/request-access')
  })
})
