import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import StudentHero from '@/components/student/portfolio/PortfolioHero.vue'

describe('StudentHero.vue - Tests Intégration UI', () => {
  let studentData
  let scoreData

  beforeEach(() => {
    vi.useFakeTimers()

    studentData = {
      firstName: 'Ghizlane',
      lastName: 'Rabii',
      fullName: 'Ghizlane Rabii',
      role: 'Étudiante Ingénieure',
      major: 'Génie Informatique',
      school: 'ENSA Tangier',
      city: 'Tangier',
      email: 'ghizlane@ensa.ma',
      phone: '+21260000000',
      profilePicture: 'https://example.com/avatar.jpg',
      githubUrl: 'https://github.com/ghizlane',
      linkedinUrl: 'https://linkedin.com/in/ghizlane'
    }

    scoreData = {
      score: 85,
      label: 'Excellent profil'
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('doit afficher correctement les informations de l\'étudiant et appliquer le thème CSS', () => {
    const wrapper = mount(StudentHero, {
      props: { student: studentData, credibilityScore: scoreData, theme: 'modern-academic' }
    })

    expect(wrapper.find('h1').text()).toBe('Ghizlane Rabii')
    expect(wrapper.find('.hero-title').text()).toContain('Génie Informatique')
    expect(wrapper.find('.hero-school').text()).toContain('ENSA Tangier · Tangier')
    
    // Vérification de l'injection de la classe CSS du thème
    expect(wrapper.find('.hero-section').classes()).toContain('theme-modern-academic')
  })

  it('doit basculer entre l\'image de profil et les initiales selon la présence de profilePicture', async () => {
    // Cas 1 : Image présente
    let wrapper = mount(StudentHero, {
      props: { student: studentData, credibilityScore: scoreData }
    })
    expect(wrapper.find('.avatar-frame img').exists()).toBe(true)
    expect(wrapper.find('.avatar-frame span').exists()).toBe(false)

    // Cas 2 : Image absente, affichage du fallback (initiales)
    studentData.profilePicture = ''
    wrapper = mount(StudentHero, {
      props: { student: studentData, credibilityScore: scoreData }
    })
    expect(wrapper.find('.avatar-frame img').exists()).toBe(false)
    expect(wrapper.find('.avatar-frame span').exists()).toBe(true)
  })

  it('doit masquer les liens de réseaux sociaux si les URLs sont vides', () => {
    studentData.githubUrl = ''
    studentData.linkedinUrl = ''

    const wrapper = mount(StudentHero, {
      props: { student: studentData, credibilityScore: scoreData }
    })

    expect(wrapper.find('a[href*="github"]').exists()).toBe(false)
    expect(wrapper.find('a[href*="linkedin"]').exists()).toBe(false)
  })

  it('doit mettre à jour le style CSS de la jauge après l\'écoulement du timeout d\'animation', async () => {
    const wrapper = mount(StudentHero, {
      props: { student: studentData, credibilityScore: { score: 50, label: 'Bon' } }
    })


    await vi.advanceTimersByTimeAsync(300)

    const circle = wrapper.find('.score-circle')
    // On s'assure que l'attribut style contient bien la propriété conic-gradient générée par scoreStyle
    expect(circle.attributes('style')).toContain('background:')
  })
})