<template>
  <div class="landing-wrapper">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <WorkflowSection />
    <RolesSection />
    <ScoringSection />
    <DemoSection />
    <CtaSection />
    <FooterSection />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'

/* Imports des composants de la page */
import Navbar from '../components/landing/Navbar.vue'
import HeroSection from '../components/landing/HeroSection.vue'
import FeaturesSection from '../components/landing/FeaturesSection.vue'
import WorkflowSection from '../components/landing/WorkflowSection.vue'
import RolesSection from '../components/landing/RolesSection.vue'
import ScoringSection from '../components/landing/ScoringSection.vue'
import DemoSection from '../components/landing/DemoSection.vue'
import CtaSection from '../components/landing/CtaSection.vue'
import FooterSection from '../components/landing/FooterSection.vue'

/* Importation des styles (m7ssourin ghir f .landing-wrapper) */
import '../assets/styles/landing.css'

let observer = null

onMounted(async () => {
  await nextTick()

  /* Initialisation des animations au scroll */
  setTimeout(() => {
    const reveals = document.querySelectorAll('.reveal')
    
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible')
          }, entry.target.dataset.delay || 0)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

    reveals.forEach((el, i) => {
      el.dataset.delay = (i % 4) * 80
      observer.observe(el)
    })
  }, 100)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>