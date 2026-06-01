import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import ActivityCard from '@/components/student/activities/ActivityCard.vue'
const RouterLinkStub = {
  template: '<slot />',
  props: ['to']
}

describe('ActivityCard.vue - Tests Unitaires isolés', () => {
  let baseActivity

  beforeEach(() => {
    baseActivity = {
      id: 1,
      title: 'Activité Test',
      type: 'CLUB',
      validationStatus: 'DRAFT',
      organization: 'ENSA Tangier'
    }
  })

  // ==========================================
  // LOGIQUE DES PROPRIÉTÉS COMPUTED
  // ==========================================
  describe('Propriété calculée - certificateExtension', () => {
    
    it('doit renvoyer "pdf" si le type contient du PDF', () => {
      const activity = { 
        ...baseActivity, 
        certificateType: 'application/pdf',
        certificateName: 'document.pdf',
        certificateUrl: 'https://link.com/file.pdf'
      }
      const wrapper = mount(ActivityCard, { props: { activity }, global: { stubs: { RouterLink: RouterLinkStub } } })
      
      expect(wrapper.vm.certificateExtension).toBe('pdf')
      expect(wrapper.vm.isPdfCertificate).toBe(true)
      expect(wrapper.vm.isImageCertificate).toBe(false)
    })

    it('doit renvoyer "image" pour les extensions PNG ou JPG/JPEG (Insensibilité à la casse)', () => {
      const activity = { 
        ...baseActivity, 
        certificateType: 'image/png',
        certificateName: 'MON_ATTESTATION.PNG',
        certificateUrl: 'https://link.com/photo.jpg'
      }
      const wrapper = mount(ActivityCard, { props: { activity }, global: { stubs: { RouterLink: RouterLinkStub } } })
      
      expect(wrapper.vm.certificateExtension).toBe('image')
      expect(wrapper.vm.isImageCertificate).toBe(true)
      expect(wrapper.vm.isPdfCertificate).toBe(false)
    })

    it('doit retourner une chaîne vide si le format n\'est pas pris en charge', () => {
      const activity = { 
        ...baseActivity, 
        certificateType: 'unknown/format',
        certificateName: 'archive.zip',
        certificateUrl: ''
      }
      const wrapper = mount(ActivityCard, { props: { activity }, global: { stubs: { RouterLink: RouterLinkStub } } })
      
      expect(wrapper.vm.certificateExtension).toBe('')
      expect(wrapper.vm.isPdfCertificate).toBe(false)
      expect(wrapper.vm.isImageCertificate).toBe(false)
    })
  })

  // ==========================================
  // ÉTAT INTERNE DU COMPOSANT (REFS)
  // ==========================================
  describe('Gestion des états et fonctions internes', () => {
    it('doit initialiser la prévisualisation à false et se fermer correctement', async () => {
      const wrapper = mount(ActivityCard, { 
        props: { activity: baseActivity }, 
        global: { stubs: { RouterLink: RouterLinkStub } } 
      })

      // Valeur initiale
      expect(wrapper.vm.isCertificatePreviewOpen).toBe(false)

      // Changement manuel de l'état
      wrapper.vm.isCertificatePreviewOpen = true
      expect(wrapper.vm.isCertificatePreviewOpen).toBe(true)

      // Appel de la méthode de fermeture
      wrapper.vm.closeCertificatePreview()
      expect(wrapper.vm.isCertificatePreviewOpen).toBe(false)
    })
  })
})