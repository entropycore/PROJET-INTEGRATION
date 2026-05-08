<script setup>
import { useRouter } from 'vue-router'
import StageValidationBadge from './StageValidationBadge.vue'

const props = defineProps({
  stage: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

const goToDetails = () => {
  router.push(`/student/stages/${props.stage.id}`)
}

const goToEdit = () => {
  router.push(`/student/stages/${props.stage.id}/edit`)
}

const submitValidation = () => {
  // BACKEND PLUS TARD :
  // submitStudentStageValidation(props.stage.id)
  console.log('Soumettre validation :', props.stage.id)
}
</script>

<template>
  <article class="stage-card">
    <div class="card-top">
      <StageValidationBadge :status="stage.validationStatus" />

      <div class="company-icon">
        🏢
      </div>
    </div>

    <h3>{{ stage.title }}</h3>

    <div class="company">
      <span>💼</span>
      <strong>{{ stage.company }}</strong>
    </div>

    <p class="description">
      {{ stage.description }}
    </p>

    <div class="separator"></div>

    <div class="info-grid">
      <div class="info-item">
        <span>Durée</span>
        <strong>📅 {{ stage.duration }}</strong>
      </div>

      <div class="info-item">
        <span>Période</span>
        <strong>📅 {{ stage.startDate }} → {{ stage.endDate }}</strong>
      </div>

      <div class="info-item">
        <span>Encadrant</span>
        <strong>👤 {{ stage.supervisor.fullName }}</strong>
      </div>

      <div class="info-item">
        <span>Visibilité</span>
        <strong>
          {{ stage.visibility === 'PUBLIC' ? '🌐 Publique' : '🔒 Privée' }}
        </strong>
      </div>
    </div>

    <div class="technologies-box">
      <div class="tech-title">
        <span>&lt;/&gt;</span>
        Technologies
      </div>

      <div class="tech-list">
        <span
          v-for="tech in stage.technologies"
          :key="tech"
          class="tech-tag"
        >
          {{ tech }}
        </span>
      </div>
    </div>

    <div class="actions">
      <button class="action-btn" @click="goToDetails">
        👁 Détails
      </button>

      <button class="action-btn" @click="goToEdit">
        ✎ Modifier
      </button>

      <button
        v-if="stage.validationStatus === 'DRAFT'"
        class="submit-btn"
        @click="submitValidation"
      >
        ➤ Se mettre pour validation
      </button>
    </div>
  </article>
</template>

<style scoped>
.stage-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 16px;
  padding: 22px;
  min-height: 430px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.stage-card:hover {
  border-color: #c4cdc1;
  box-shadow: 0 10px 24px rgba(47, 87, 93, 0.08);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.company-icon {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  background: #f1f4f3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

h3 {
  color: #28363d;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
  margin-bottom: 12px;
}

.company {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2f575d;
  margin-bottom: 14px;
}

.company strong {
  font-size: 14px;
  color: #2f575d;
  font-weight: 700;
}

.description {
  color: #526f75;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 14px;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.separator {
  height: 1px;
  background: #edf0ee;
  margin-bottom: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px 18px;
  margin-bottom: 16px;
}

.info-item {
  min-width: 0;
}

.info-item span {
  display: block;
  color: #99aead;
  font-size: 12px;
  margin-bottom: 5px;
}

.info-item strong {
  display: block;
  color: #28363d;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}

.technologies-box {
  border: 1px solid #dee1dd;
  border-radius: 12px;
  padding: 13px;
  background: #ffffff;
  margin-top: auto;
  margin-bottom: 16px;
}

.tech-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #28363d;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 11px;
}

.tech-title span {
  color: #2f575d;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.tech-tag {
  background: #edf2f0;
  color: #2f575d;
  padding: 6px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn,
.submit-btn {
  border-radius: 9px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  min-height: 40px;
}

.action-btn {
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
}

.action-btn:hover {
  background: #f8f9f8;
}

.submit-btn {
  background: #2f575d;
  border: 1px solid #2f575d;
  color: #ffffff;
  flex: 1;
}

.submit-btn:hover {
  background: #26494d;
}

@media (max-width: 760px) {
  .stage-card {
    min-height: auto;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }
}
</style>