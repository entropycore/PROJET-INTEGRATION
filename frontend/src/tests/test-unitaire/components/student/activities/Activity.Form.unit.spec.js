import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ActivityForm from '@/components/student/activities/ActivityForm.vue'

// Mock global pour URL.createObjectURL qui n'existe pas nativement dans l'environnement de test Node
global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-uuid')

describe('ActivityForm.vue - Tests Unitaires de la logique', () => {

  it('doit mettre à jour la réactivité du formulaire via le watch quand initialActivity change', async () => {
    const wrapper = mount(ActivityForm, {
      props: { initialActivity: null }
    })

    expect(wrapper.vm.form.title).toBe('')

    // Simulation du changement de la prop par le composant parent
    const newActivity = { title: 'IT WAVE Hackathon', type: 'COMPETITION' }
    await wrapper.setProps({ initialActivity: newActivity })

    // Vérification que le watch a bien mis à jour l'état réactif interne
    expect(wrapper.vm.form.title).toBe('IT WAVE Hackathon')
    expect(wrapper.vm.form.type).toBe('COMPETITION')
  })

  it('doit réinitialiser toutes les valeurs du formulaire lors de l\'appel à resetForm', () => {
    const wrapper = mount(ActivityForm)
    
    // Modification manuelle de l'état réactif
    wrapper.vm.form.title = 'A changer'
    wrapper.vm.form.type = 'TRAINING'
    
    // Appel direct de la méthode
    wrapper.vm.resetForm()

    expect(wrapper.vm.form.title).toBe('')
    expect(wrapper.vm.form.type).toBe('CLUB') // valeur par défaut
  })

  it('doit traiter correctement le fichier téléversé via handleCertificateUpload', () => {
    const wrapper = mount(ActivityForm)
    
    // Création d'un faux fichier File natif
    const mockFile = new File(['content'], 'attestation_solihack.png', { type: 'image/png' })
    
    // Simulation de l'événement natif du input change
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    }

    wrapper.vm.handleCertificateUpload(mockEvent)

    expect(wrapper.vm.form.certificate).toBe(mockFile)
    expect(wrapper.vm.form.certificateName).toBe('attestation_solihack.png')
    expect(wrapper.vm.form.certificateUrl).toBe('blob:http://localhost/mock-uuid')
  })
})