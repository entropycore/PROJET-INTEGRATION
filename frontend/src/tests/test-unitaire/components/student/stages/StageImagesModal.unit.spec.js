import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StageImagesModal from '@/components/student/stages/StageImagesModal.vue'

describe('StageImagesModal.vue - Tests Unitaires', () => {
  const mockImages = [
    { id: 1, url: 'img1.png', title: 'Interface Accueil' },
    { id: 2, url: 'img2.png', title: 'Dashboard Statistiques' }
  ]

  it('devrait afficher correctement le nombre total d\'images dans le sous-titre', () => {
    const wrapper = mount(StageImagesModal, {
      props: { images: mockImages }
    })

    // On vérifie que le paragraphe d'en-tête calcule bien la longueur du tableau
    const subtitle = wrapper.find('.modal-header p')
    expect(subtitle.text()).toBe('2 image(s) ajoutée(s)')
  })

  it('devrait initialiser une liste vide sans planter si aucune image n\'est fournie', () => {
    const wrapper = mount(StageImagesModal, {
      props: { images: [] }
    })

    const subtitle = wrapper.find('.modal-header p')
    expect(subtitle.text()).toBe('0 image(s) ajoutée(s)')
    expect(wrapper.findAll('.image-card').length).toBe(0)
  })
})