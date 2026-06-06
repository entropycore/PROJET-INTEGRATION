import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StageImagesModal from '@/components/student/stages/StageImagesModal.vue'

describe('StageImagesModal.vue - Tests d\'Interface et d\'Interaction', () => {
  const mockImages = [{ id: 1, url: 'test.png', title: 'Capture 1' }]

  it('devrait émettre l\'événement "close" lors du clic sur le bouton de fermeture', async () => {
    const wrapper = mount(StageImagesModal, {
      props: { images: mockImages }
    })

    // Déclenchement du clic sur le bouton de fermeture (close-btn)
    await wrapper.find('.close-btn').trigger('click')

    // Vérification de la transmission de l'événement vers le parent
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('devrait émettre l\'événement "close" lors du clic sur l\'overlay d\'arrière-plan', async () => {
    const wrapper = mount(StageImagesModal, {
      props: { images: mockImages }
    })

    // Déclenchement du clic directement sur le conteneur principal (l'overlay)
    await wrapper.find('.modal-overlay').trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('ne devrait PAS émettre l\'événement "close" si le clic provient d\'un élément enfant à l\'intérieur de la carte', async () => {
    const wrapper = mount(StageImagesModal, {
      props: { images: mockImages }
    })

    // Un clic sur la carte de la modale elle-même ne doit pas déclencher la fermeture (.self)
    await wrapper.find('.modal-card').trigger('click')

    expect(wrapper.emitted('close')).toBeFalsy()
  })
})