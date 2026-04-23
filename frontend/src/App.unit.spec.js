import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '@/views/LoginView.vue'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createWebHistory } from 'vue-router'
/**
 * Configuration du routeur pour simuler la navigation
 **/
const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/dashboard', name: 'dashboard', component: { template: '<div></div>' } }],
})
describe('LoginPage.vue - Tests d\'authentification', () => {
  let wrapper;
  const allowedDomain = 'ensa.ac.ma';

  beforeEach(() => {
    // Simulation de la variable d'environnement pour le domaine autorisé
    vi.stubEnv('VITE_ALLOWED_EMAIL_DOMAIN', allowedDomain);

    // Montage du composant avec les plugins nécessaires (Pinia, Router)
    wrapper = mount(LoginPage, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn }),
          router
        ],
      },
    })
  })

  it('doit afficher une erreur si les champs sont vides', async () => {
    // On déclenche le formulaire sans rien remplir
    await wrapper.find('form').trigger('submit.prevent')
    
    // Vérification du message d'erreur
    expect(wrapper.find('.error-message').text()).toBe('Veuillez remplir tous les champs.')
  })

  it('doit rejeter un email qui n\'appartient pas au domaine autorisé', async () => {
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    
    // Saisie d'un email hors domaine (ex: gmail)
    await emailInput.setValue('user@gmail.com')
    await passwordInput.setValue('password123')
    
    await wrapper.find('form').trigger('submit.prevent')
    
    // Vérification que l'erreur de domaine est affichée
    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toContain(`L'adresse e-mail doit se terminer par @${allowedDomain}`)
  })

  it('doit accepter un email valide du domaine configuré', async () => {
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    
    // Saisie d'un email correct
    await emailInput.setValue('etudiant@ensa.ac.ma')
    await passwordInput.setValue('password123')
    
    await wrapper.find('form').trigger('submit.prevent')

    // L'erreur de domaine ne doit pas apparaître
    const error = wrapper.find('.error-message')
    if (error.exists()) {
      expect(error.text()).not.toContain(`@${allowedDomain}`)
    }
  })

  it('doit afficher "Connexion..." et désactiver le bouton pendant le chargement', async () => {
    const emailInput = wrapper.find('#email')
    const passwordInput = wrapper.find('#password')
    const submitBtn = wrapper.find('.submit-btn')

    await emailInput.setValue('user@ensa.ac.ma')
    await passwordInput.setValue('12345678')
    
    // On déclenche la soumission
    await wrapper.find('form').trigger('submit.prevent')
    
    // Vérification de l'état visuel du bouton de chargement
    expect(submitBtn.text()).toContain('Connexion...')
    expect(submitBtn.attributes()).toHaveProperty('disabled')
  })

  it('doit naviguer vers la page de mot de passe oublié au clic', async () => {
    // Espionner la fonction de navigation
    const pushSpy = vi.spyOn(router, 'push')
    
    // Cliquer sur le bouton "Mot de passe oublié ?"
    await wrapper.find('.forgot-password').trigger('click')
    
    // Vérifier si la redirection vers la bonne route est appelée
    expect(pushSpy).toHaveBeenCalledWith('/forgot-password')
  })
})
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import RequestAccessPage from './views/RequestAccessView.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Unit Tests - Demande d\'accès', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(RequestAccessPage, {
      global: { plugins: [createTestingPinia()] },
    })
  })
it('doit valider que les mots de passe ne correspondent pas', async () => {
    // 1. On remplit TOUS les champs requis par ton validateForm()
    await wrapper.find('#lastName').setValue('Berrada')
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('#email').setValue('amina@email.ma')
    await wrapper.find('#companyName').setValue('Ma Société') 
    await wrapper.find('#jobTitle').setValue('Développeur')      
    
    // 2. On met des mots de passe différents
    await wrapper.find('#password').setValue('Password123')
    await wrapper.find('#passwordConfirmation').setValue('Diff123')
    
    // 3. On soumet
    await wrapper.find('form').trigger('submit.prevent')
    
    // 4. Maintenant, ça va passer !
    expect(wrapper.find('.error-message').text()).toBe('Les mots de passe ne correspondent pas.')
})
  it('doit afficher une erreur si un champ obligatoire est vide', async () => {
    // On laisse lastName vide et on soumet
    await wrapper.find('#firstName').setValue('Amina')
    await wrapper.find('form').trigger('submit.prevent')
    
    expect(wrapper.find('.error-message').text()).toBe('Veuillez remplir tous les champs.')
  })
})