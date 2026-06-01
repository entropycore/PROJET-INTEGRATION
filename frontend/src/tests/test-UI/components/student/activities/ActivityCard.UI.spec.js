import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ActivityCard from '@/components/student/activities/ActivityCard.vue'
import { nextTick, h } from 'vue'

// Mocking des règles d'activité pour contrôler l'affichage UI
const mockCanEditActivity = vi.fn()
const mockCanDeleteActivity = vi.fn()
const mockCanSubmitActivity = vi.fn()

vi.mock('@/components/student/activities/activityRules', () => ({
  canEditActivity: (act) => mockCanEditActivity(act),
  canDeleteActivity: (act) => mockCanDeleteActivity(act),
  canSubmitActivity: (act) => mockCanSubmitActivity(act),
}))

// Stub pour simuler RouterLink sans charger tout l'environnement de routage
const RouterLinkStub = {
  props: ['to'],
  render() {
    return h('a', this.$attrs, this.$slots.default && this.$slots.default())
  }
}

import ActivityCard from '@/components/student/activities/ActivityCard.vue'

describe('ActivityCard.vue - Tests Intégration UI', () => {
  let activityData

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Données de test de base
    activityData = {
      id: 42,
      title: 'Hackathon IT WAVE',
      type: 'COMPETITION',
      validationStatus: 'DRAFT',
      organization: 'Club Humanitaire ENSAT',
      description: 'Développement d’une plateforme solidaire.',
      date: '2026-05-20',
      duration: '48h',
      location: 'Tangier',
      certificateUrl: 'https://example.com/certif.pdf',
      certificateType: 'application/pdf',
      certificateName: 'attestation.pdf'
    }
  })

  // ==========================================
  // AFFICHAGE DES DONNÉES ET DES LABELS
  // ==========================================
  it('doit afficher correctement les détails de l\'activité avec les labels mappés', () => {
    const wrapper = mount(ActivityCard, {
      props: { activity: activityData },
      global: { stubs: { RouterLink: RouterLinkStub } }
    })

    expect(wrapper.find('h3').text()).toBe('Hackathon IT WAVE')
    expect(wrapper.find('.organization strong').text()).toBe('Club Humanitaire ENSAT')
    expect(wrapper.find('.description').text()).toBe('Développement d’une plateforme solidaire.')
    
    // Vérification du mapping du type (COMPETITION -> Compétition)
    expect(wrapper.find('.type-label').text()).toBe('Compétition')
  })

  // ==========================================
  // VÉRIFICATION DYNAMIQUE DU STYLE CSS
  // ==========================================
  it('doit appliquer dynamiquement les classes CSS appropriées selon le statut de validation', async () => {
    const statusScenarios = [
      { code: 'DRAFT', label: 'Brouillon', expectedClass: 'draft' },
      { code: 'PENDING', label: 'En attente', expectedClass: 'pending' },
      { code: 'APPROVED', label: 'Validée', expectedClass: 'approved' },
      { code: 'REJECTED', label: 'Refusée', expectedClass: 'rejected' },
      { code: 'CORRECTION_REQUIRED', label: 'Correction demandée', expectedClass: 'correction_required' }
    ]

    for (const scenario of statusScenarios) {
      activityData.validationStatus = scenario.code
      const wrapper = mount(ActivityCard, {
        props: { activity: activityData },
        global: { stubs: { RouterLink: RouterLinkStub } }
      })

      const badge = wrapper.find('.status-badge')
      expect(badge.text()).toBe(scenario.label)
      // Vérification de la présence de la classe CSS du fichier de style
      expect(badge.classes()).toContain(scenario.expectedClass)
    }
  })

  // ==========================================
  // AFFICHAGE CONDITIONNEL DES BOUTONS (v-if)
  // ==========================================
  it('doit afficher ou masquer les boutons d\'action selon les permissions CSS/v-if', async () => {
    // Cas 1 : Autorisations accordées
    mockCanEditActivity.mockReturnValue(true)
    mockCanDeleteActivity.mockReturnValue(true)
    mockCanSubmitActivity.mockReturnValue(true)

    let wrapper = mount(ActivityCard, {
      props: { activity: activityData },
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    await nextTick()
    expect(wrapper.find('.action-btn.icon-only').exists()).toBe(true)

    // Cas 2 : Autorisations refusées
    mockCanEditActivity.mockReturnValue(false)
    mockCanDeleteActivity.mockReturnValue(false)
    mockCanSubmitActivity.mockReturnValue(false)

    wrapper = mount(ActivityCard, {
      props: { activity: activityData },
      global: { stubs: { RouterLink: RouterLinkStub } }
    })
    await nextTick()

    expect(wrapper.find('.action-btn.icon-only').exists()).toBe(false)
  })

  // ==========================================
  // INTERACTIONS ETÉMISSION D'ÉVÉNEMENTS
  // ==========================================
  it('doit émettre l\'événement delete-activity lors du clic sur supprimer', async () => {
    mockCanDeleteActivity.mockReturnValue(true)
    const wrapper = mount(ActivityCard, {
      props: { activity: activityData },
      global: { stubs: { RouterLink: RouterLinkStub } }
    })

    await wrapper.find('.delete-btn').trigger('click')
    
    expect(wrapper.emitted('delete-activity')).toBeTruthy()
    expect(wrapper.emitted('delete-activity')[0]).toEqual([activityData.id])
  })

  // ==========================================
  // MODAL ET VISUALISATION (TELEPORT / STRUCTURE)
  // ==========================================
  it('doit basculer l\'affichage de la modal et afficher l\'iframe ou l\'image selon le fichier', async () => {
    const wrapper = mount(ActivityCard, {
      props: { activity: activityData },
      global: { stubs: { RouterLink: RouterLinkStub } }
    })

    // Ouverture forcée de la prévisualisation
    wrapper.vm.isCertificatePreviewOpen = true
    await nextTick()

    // Le document est un PDF, l'iframe doit être présente (Teleport -> vérifier document.body)
    expect(document.body.querySelector('.certificate-modal')).not.toBeNull()
    expect(document.body.querySelector('.certificate-preview iframe')).not.toBeNull()
    expect(document.body.querySelector('.certificate-preview img')).toBeNull()
  })
})