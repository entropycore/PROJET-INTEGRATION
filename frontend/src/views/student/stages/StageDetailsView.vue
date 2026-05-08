<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { studentStages } from '@/mockData/studentStages.mock'
import StageValidationBadge from '@/components/student/stages/StageValidationBadge.vue'

const route = useRoute()
const router = useRouter()

const stage = computed(() => {
  return studentStages.find((item) => item.id === route.params.id)
})

const goBack = () => {
  router.push('/student/stages')
}

const goToEdit = () => {
  router.push(`/student/stages/${route.params.id}/edit`)
}
</script>

<template>
  <section v-if="stage" class="details-page">
    <button class="back-btn" @click="goBack">
      ← Retour aux stages
    </button>

    <div class="details-header">
      <div>
        <h1>{{ stage.title }}</h1>
        <p>{{ stage.company }}</p>
      </div>

      <div class="header-actions">
        <StageValidationBadge :status="stage.validationStatus" />
        <button class="btn-secondary" @click="goToEdit">
          Modifier
        </button>
      </div>
    </div>

    <div class="details-grid">
      <div class="main-column">
        <div class="content-card">
          <h2>Description complète</h2>
          <p class="text">
            {{ stage.description }}
          </p>
        </div>

        <div class="content-card">
          <h2>Missions réalisées</h2>

          <ul>
            <li v-for="mission in stage.missions" :key="mission">
              {{ mission }}
            </li>
          </ul>
        </div>

        <div class="content-card">
          <h2>Technologies utilisées</h2>

          <div class="technologies">
            <span
              v-for="tech in stage.technologies"
              :key="tech"
              class="tech"
            >
              {{ tech }}
            </span>
          </div>
        </div>

        <div class="content-card">
          <h2>Historique de validation</h2>

          <div class="timeline">
            <div
              v-for="item in stage.validationHistory"
              :key="item.createdAt"
              class="timeline-item"
            >
              <div class="timeline-date">{{ item.createdAt }}</div>
              <StageValidationBadge :status="item.status" />
              <p>{{ item.comment }}</p>
            </div>
          </div>
        </div>
      </div>

      <aside class="side-column">
        <div class="content-card">
          <h2>Informations générales</h2>

          <div class="info-item">
            <span>Durée</span>
            <strong>{{ stage.duration }}</strong>
          </div>

          <div class="info-item">
            <span>Date début</span>
            <strong>{{ stage.startDate }}</strong>
          </div>

          <div class="info-item">
            <span>Date fin</span>
            <strong>{{ stage.endDate }}</strong>
          </div>

          <div class="info-item">
            <span>Visibilité</span>
            <strong>
              {{ stage.visibility === 'PUBLIC' ? 'Publique' : 'Privée' }}
            </strong>
          </div>
        </div>

        <div class="content-card">
          <h2>Encadrant</h2>

          <div class="info-item">
            <span>Nom</span>
            <strong>{{ stage.supervisor.fullName }}</strong>
          </div>

          <div class="info-item">
            <span>Département</span>
            <strong>{{ stage.supervisor.department }}</strong>
          </div>
        </div>

        <div class="content-card">
          <h2>Rapport PDF</h2>

          <a class="report-link" :href="stage.reportUrl" target="_blank">
            Voir le rapport
          </a>
        </div>
      </aside>
    </div>
  </section>

  <section v-else class="not-found">
    <h1>Stage introuvable</h1>
    <button class="btn-secondary" @click="goBack">
      Retour aux stages
    </button>
  </section>
</template>

<style scoped>
.details-page {
  padding: 4px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #2f575d;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 18px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

h1 {
  color: #28363d;
  font-size: 28px;
  margin-bottom: 4px;
}

h2 {
  color: #28363d;
  font-size: 17px;
  margin-bottom: 12px;
}

.details-header p {
  color: #99aead;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
}

.content-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
}

.text,
li {
  color: #658b6f;
  font-size: 14px;
  line-height: 1.7;
}

ul {
  padding-left: 20px;
}

.technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech {
  padding: 5px 10px;
  background: #f8f9f8;
  border: 1px solid #c4cdc1;
  border-radius: 6px;
  color: #2f575d;
  font-size: 12.5px;
}

.info-item {
  padding: 10px 0;
  border-bottom: 1px solid #dee1dd;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item span {
  display: block;
  color: #99aead;
  font-size: 12px;
  margin-bottom: 3px;
}

.info-item strong {
  color: #28363d;
  font-size: 13.5px;
}

.timeline-item {
  padding: 14px 0;
  border-bottom: 1px solid #dee1dd;
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-date {
  color: #99aead;
  font-size: 12px;
  margin-bottom: 8px;
}

.timeline-item p {
  margin-top: 8px;
  color: #658b6f;
  font-size: 13.5px;
}

.report-link,
.btn-secondary {
  display: inline-flex;
  text-decoration: none;
  background: white;
  color: #2f575d;
  border: 1px solid #c4cdc1;
  padding: 9px 14px;
  border-radius: 8px;
  font-size: 13.5px;
  cursor: pointer;
}

.not-found {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 14px;
  padding: 40px;
  text-align: center;
}

@media (max-width: 900px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .details-header {
    flex-direction: column;
  }

  .header-actions {
    align-items: flex-start;
  }
}
</style>