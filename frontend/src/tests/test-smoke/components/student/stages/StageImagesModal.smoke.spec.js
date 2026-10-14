import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import StageImagesModal from '@/components/student/stages/StageImagesModal.vue'

describe('StageImagesModal.vue - Smoke Test', () => {
  it('devrait monter la modale avec succès et afficher la structure de la grille sans planter', () => {
    const mockImages = [
      { id: 10, url: 'http://validia.ma/ss1.png', title: 'Rendu final' }
    ]

    const wrapper = mount(StageImagesModal, {
      props: { images: mockImages }
    })

    // 1. Vérification des éléments de structure indispensables
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
    expect(wrapper.find('.modal-card').exists()).toBe(true)
    expect(wrapper.find('.images-grid').exists()).toBe(true)

    // 2. Vérification que la structure d'une carte image est bien générée
    const imageCard = wrapper.find('.image-card')
    expect(imageCard.exists()).toBe(true)
    
    // 3. Vérification des liaisons d'attributs de l'image (src et alt)
    const imgElement = imageCard.find('img')
    expect(imgElement.attributes('src')).toBe('http://validia.ma/ss1.png')
    expect(imgElement.attributes('alt')).toBe('Rendu final')
    expect(imageCard.find('span').text()).toBe('Rendu final')
  })
})