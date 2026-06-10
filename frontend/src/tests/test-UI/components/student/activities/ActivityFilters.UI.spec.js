import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ActivityFilters from '@/components/student/activities/ActivityFilters.vue' // Ajuste le chemin si besoin

describe('ActivityFilters.vue - Tests Intégration UI', () => {

  it('doit lier correctement les valeurs des props aux éléments HTML', () => {
    const wrapper = mount(ActivityFilters, {
      props: {
        search: 'Soli-Hack',
        status: 'PENDING',
        type: 'COMPETITION'
      }
    })

    // Vérification de la valeur de l'input de recherche
    expect(wrapper.find('input[type="text"]').element.value).toBe('Soli-Hack')

    // Vérification des sélections par défaut dans les listes déroulantes
    expect(wrapper.findAll('select')[0].element.value).toBe('PENDING')
    expect(wrapper.findAll('select')[1].element.value).toBe('COMPETITION')
  })

  it('doit émettre l\'événement update:search lors de la saisie utilisateur', async () => {
    const wrapper = mount(ActivityFilters, {
      props: { search: '', status: 'ALL', type: 'ALL' }
    })

    const input = wrapper.find('input[type="text"]')
    // Simulation de la saisie d'un texte par l'étudiant
    await input.setValue('Gaming Expo')

    // Vérification du déclenchement de l'émetteur
    expect(wrapper.emitted('update:search')).toBeTruthy()
    expect(wrapper.emitted('update:search')[0]).toEqual(['Gaming Expo'])
  })

  it('doit émettre l\'événement update:status lors du changement du filtre statut', async () => {
    const wrapper = mount(ActivityFilters, {
      props: { search: '', status: 'ALL', type: 'ALL' }
    })

    const selectStatus = wrapper.findAll('select')[0]
    // Simulation du choix du statut "Validée" (APPROVED)
    await selectStatus.setValue('APPROVED')

    expect(wrapper.emitted('update:status')).toBeTruthy()
    expect(wrapper.emitted('update:status')[0]).toEqual(['APPROVED'])
  })

  it('doit émettre l\'événement update:type lors du changement du filtre type', async () => {
    const wrapper = mount(ActivityFilters, {
      props: { search: '', status: 'ALL', type: 'ALL' }
    })

    const selectType = wrapper.findAll('select')[1]
    // Simulation du choix du type "Bénévolat" (VOLUNTEERING)
    await selectType.setValue('VOLUNTEERING')

    expect(wrapper.emitted('update:type')).toBeTruthy()
    expect(wrapper.emitted('update:type')[0]).toEqual(['VOLUNTEERING'])
  })
})