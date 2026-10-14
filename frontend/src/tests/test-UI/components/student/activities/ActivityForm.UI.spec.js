import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import ActivityForm from '@/components/student/activities/ActivityForm.vue'

describe('ActivityForm.vue - Tests Intégration UI', () => {

  it('doit pré-remplir les champs si une activité initiale est fournie', () => {
    const initialActivity = {
      title: 'Conférence DevOps',
      type: 'EVENT',
      organization: 'ENSA Tangier',
      date: '2026-06-01',
      duration: '1 jour',
      location: 'Amphi A',
      description: 'Introduction aux pipelines CI/CD.'
    }

    const wrapper = mount(ActivityForm, {
      props: { initialActivity, submitLabel: 'Modifier' }
    })

    expect(wrapper.find('input[placeholder*="Hackathon"]').element.value).toBe('Conférence DevOps')
    expect(wrapper.find('select').element.value).toBe('EVENT')
    expect(wrapper.find('.btn-primary').text()).toContain('Modifier')
  })

  it('doit émettre save-activity avec les données saisies lors de la soumission', async () => {
    const wrapper = mount(ActivityForm, {
      props: { initialActivity: null }
    })

    // Remplissage des champs obligatoires via v-model
    await wrapper.find('input[placeholder*="Hackathon"]').setValue('SOLI-Hackathon')
    await wrapper.find('select').setValue('COMPETITION')
    await wrapper.find('input[placeholder*="Informatique"]').setValue('Club Humanitaire')
    await wrapper.find('input[type="date"]').setValue('2026-05-20')
    await wrapper.find('input[placeholder*="jours"]').setValue('2 jours')
    await wrapper.find('input[placeholder*="Casablanca"]').setValue('Tangier')
    await wrapper.find('textarea').setValue('Participation réussie.')

    // Soumission du formulaire
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('save-activity')).toBeTruthy()
    expect(wrapper.emitted('save-activity')[0][0]).toEqual(expect.objectContaining({
      title: 'SOLI-Hackathon',
      type: 'COMPETITION',
      organization: 'Club Humanitaire'
    }))
  })

  it('doit émettre l\'événement cancel lors du clic sur le bouton Annuler', async () => {
    const wrapper = mount(ActivityForm)
    
    await wrapper.find('.btn-secondary').trigger('click')
    
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('doit afficher le nom de l\'attestation si elle est présente dans le formulaire', async () => {
    const initialActivity = {
      title: 'A', type: 'CLUB', organization: 'B', date: '2026-01-01', duration: '1h', location: 'C', description: 'D',
      certificateName: 'mon_diplome.pdf'
    }
    
    const wrapper = mount(ActivityForm, { props: { initialActivity } })
    
    const fileInfo = wrapper.find('.file-info')
    expect(fileInfo.exists()).toBe(true)
    expect(fileInfo.text()).toBe('mon_diplome.pdf')
  })
})