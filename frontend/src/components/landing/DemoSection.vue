<template>
  <section class="portfolio-demo" id="demo">
    <div class="section-label">Démo interactive</div>
    <h2 class="section-title reveal">Le tableau de bord étudiant</h2>
    <p class="section-sub reveal" style="margin-bottom:32px;">Gérez tous vos projets, stages et compétences depuis une interface unifiée.</p>

    
    <div class="tabs reveal">
      <button :class="['tab-btn', { active: activeTab === 'projects' }]" @click="activeTab = 'projects'">Mes projets</button>
      <button :class="['tab-btn', { active: activeTab === 'stages' }]" @click="activeTab = 'stages'">Stages</button>
      <button :class="['tab-btn', { active: activeTab === 'competences' }]" @click="activeTab = 'competences'">Compétences</button>
    </div>

   
    <div class="reveal">
      <img src="../../assets/demo.png" alt="Aperçu du Tableau de Bord" class="demo-image-replacement" />
    </div>

  </section>
</template>

<script setup>
import { ref } from 'vue'


const activeTab = ref('projects')
</script>

<style scoped>
/* Style special pour image */
.demo-image-replacement {
  width: 70%;
  max-width: 80%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: block; /* Bach maykhalich l'espace lte7t */
}
</style>