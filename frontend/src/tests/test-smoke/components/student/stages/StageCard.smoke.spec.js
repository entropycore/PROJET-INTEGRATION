import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import StageCard from '@/components/student/stages/StageCard.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

describe('StageCard.vue - Test de fumée', () => {
  it('devrait se monter correctement et afficher les informations de base sans planter', () => {
    const smokeStage = {
      id: 99,
      title: 'Titre de test smoke',
      company: 'Entreprise de test',
      validationStatus: 'DRAFT',
      startDate: '2026-01-01',
      endDate: '2026-02-01',
      duration: '2 mois',
      supervisor: { fullName: 'Safae Douae' },
      reportUrl: 'http://test.com'
    }

    const wrapper = mount(StageCard, { props: { stage: smokeStage } })

    // 1. Wash l-composant existant f l-DOM?
    expect(wrapper.exists()).toBe(true)

    // 2. Wash l-عناصر l-kbira khdama ou kat-ban?
    expect(wrapper.find('h3').text()).toBe('Titre de test smoke')
    expect(wrapper.find('.company').text()).toContain('Entreprise de test')
    
    // 3. Wash l-HTML l-assassi container dyal l-card mzn?
    expect(wrapper.find('.stage-card').exists()).toBe(true)
  })
})