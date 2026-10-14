import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import StageForm from '@/components/student/stages/StageForm.vue'

describe('StageForm.vue - Tests d\'Interface et d\'Interaction', () => {
  let mockValidators
  let sampleStage

  beforeEach(() => {
    mockValidators = [
      { id: '1', fullName: 'Prof El Ghailani', department: 'Génie Informatique' }
    ]
    sampleStage = {
      id: 10,
      title: 'Stage Backend',
      company: 'OCP',
      startDate: '2026-08-01',
      endDate: '2026-09-01',
      description: 'Contexte du stage',
      missions: ['Mission 1', 'Mission 2'],
      supervisor: { id: '1', fullName: 'Prof El Ghailani', department: 'Génie Informatique' },
      technologies: ['PHP', 'Laravel'],
      visibility: 'PRIVATE',
      reportUrl: 'http://link.com/report.pdf'
    }
  })

  it('devrait ajouter une technologie à la liste lors du clic sur le bouton Ajouter', async () => {
    const wrapper = mount(StageForm, {
      props: { initialStage: sampleStage, validators: mockValidators }
    })

    // Simulation de la saisie d'une nouvelle techno
    wrapper.vm.technologyInput = 'Docker'
    
    // Clic sur le bouton d'ajout de technologie
    await wrapper.find('.add-tech-btn').trigger('click')

    // Vérification de la mise à jour du tableau
    expect(wrapper.vm.form.technologies).toContain('Docker')
  })

  it('devrait afficher la liste des suggestions d\'encadrants lors du focus sur le champ', async () => {
    const wrapper = mount(StageForm, {
      props: { initialStage: null, validators: mockValidators }
    })

    const inputSupervisor = wrapper.find('.autocomplete-field input')
    
    // Déclenchement du focus pour ouvrir l'autocomplétion
    await inputSupervisor.trigger('focus')

    // Vérification que le conteneur des suggestions est bien visible dans le DOM
    expect(wrapper.find('.suggestions-list').exists()).toBe(true)
    expect(wrapper.find('.suggestion-item strong').text()).toBe('Prof El Ghailani')
  })

  it('devrait émettre l\'événement "save-draft" avec le bon payload lors du clic sur Sauvegarder', async () => {
    const wrapper = mount(StageForm, {
      props: { initialStage: sampleStage, validators: mockValidators }
    })

    // Clic sur le bouton de sauvegarde du brouillon
    const saveBtn = wrapper.find('.btn-secondary')
    await saveBtn.trigger('click')

    // Vérification du déclenchement de l'émit avec la structure attendue
    expect(wrapper.emitted('save-draft')).toBeTruthy()
    const payload = wrapper.emitted('save-draft')[0][0]
    expect(payload.title).toBe('Stage Backend')
    expect(payload.company).toBe('OCP')
  })
})