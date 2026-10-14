import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReportsToolbar from '@/components/admin/reports/ReportsToolbar.vue'

describe('ReportsToolbar - Tests UI', () => {

  it('doit initialiser les champs avec les valeurs des props', () => {
    const wrapper = mount(ReportsToolbar, {
      props: {
        search: 'Contenu suspect',
        selectedType: 'PORTFOLIO',
        selectedStatus: 'RESOLVED'
      }
    })

    // Vérification de l'input de recherche
    expect(wrapper.find('input').element.value).toBe('Contenu suspect')

    // Vérification des deux selects
    const selects = wrapper.findAll('select')
    expect(selects[0].element.value).toBe('PORTFOLIO')
    expect(selects[1].element.value).toBe('RESOLVED')
  })

  it('doit émettre l\'événement de recherche lors de la saisie', async () => {
    const wrapper = mount(ReportsToolbar, {
      props: { search: '' }
    })

    const input = wrapper.find('input')
    await input.setValue('Nouveau motif')

    // Vérifie que update:search a été déclenché avec la bonne valeur
    expect(wrapper.emitted()['update:search']).toBeTruthy()
    expect(wrapper.emitted()['update:search'][0][0]).toBe('Nouveau motif')
  })

  it('doit émettre l\'événement de changement de type', async () => {
    const wrapper = mount(ReportsToolbar, {
      props: { selectedType: 'ALL' }
    })

    const selectType = wrapper.findAll('select')[0]
    await selectType.setValue('USER')

    // Vérifie le déclenchement de update:selectedType
    expect(wrapper.emitted()['update:selectedType']).toBeTruthy()
    expect(wrapper.emitted()['update:selectedType'][0][0]).toBe('USER')
  })

  it('doit émettre l\'événement de changement de statut', async () => {
    const wrapper = mount(ReportsToolbar, {
      props: { selectedStatus: 'ALL' }
    })

    const selectStatus = wrapper.findAll('select')[1]
    await selectStatus.setValue('REJECTED')

    // Vérifie le déclenchement de update:selectedStatus
    expect(wrapper.emitted()['update:selectedStatus']).toBeTruthy()
    expect(wrapper.emitted()['update:selectedStatus'][0][0]).toBe('REJECTED')
  })
})
