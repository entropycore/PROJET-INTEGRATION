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
//fct pour modifier que si le porjet nest pas encore valide
const canEditStage = () => {
  return ['DRAFT', 'PENDING', 'CORRECTION_REQUIRED'].includes(
    props.stage.validationStatus,
  )
}
</script>

<template>
  <article class="stage-card">
    <div class="card-top">
      <h3>{{ stage.title }}</h3>

      <StageValidationBadge
        :status="stage.validationStatus"
      />
    </div>

    <div class="company">
      <span class="material-icons-round">
        business_center
      </span>

      <strong>
        {{ stage.company }}
      </strong>
    </div>

    <p class="description">
      {{ stage.description }}
    </p>

    <div class="separator"></div>

    <div class="info-grid">
      <div class="info-item">
        <span>Durée</span>

        <strong>
          <span class="material-icons-round small-icon">
            schedule
          </span>

          {{ stage.duration }}
        </strong>
      </div>

      <div class="info-item">
        <span>Période</span>

        <strong>
          <span class="material-icons-round small-icon">
            calendar_month
          </span>

          {{ stage.startDate }}
          →
          {{ stage.endDate }}
        </strong>
      </div>

      <div class="info-item">
        <span>Encadrant</span>

        <strong>
          <span class="material-icons-round small-icon">
            person
          </span>

          {{ stage.supervisor.fullName }}
        </strong>
      </div>

      <div class="info-item">
        <span>Visibilité</span>

        <strong>
          <span class="material-icons-round small-icon">
            {{
              stage.visibility === 'PUBLIC'
                ? 'public'
                : 'lock'
            }}
          </span>

          {{
            stage.visibility === 'PUBLIC'
              ? 'Publique'
              : 'Privée'
          }}
        </strong>
      </div>
    </div>

    <div class="technologies-box">
      <div class="tech-title">
        <span class="material-icons-round">
          code
        </span>

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
      <button
        class="action-btn"
        @click="goToDetails"
      >
        <span class="material-icons-round">
          visibility
        </span>

        Détails
      </button>

      <button
        v-if="canEditStage()"
        class="action-btn"
        @click="goToEdit"
      >
        <span class="material-icons-round">
          edit
        </span>

        Modifier
      </button>

      <button
        v-if="stage.validationStatus === 'DRAFT'"
        class="submit-btn"
        @click="submitValidation"
      >
        <span class="material-icons-round">
          send
        </span>

        Soumettre
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
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.stage-card:hover {
  border-color: #c4cdc1;
  box-shadow: 0 10px 24px rgba(47, 87, 93, 0.08);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

h3 {
  color: #28363d;
  font-size: 20px;
  line-height: 1.35;
  font-weight: 700;
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

.info-item span:first-child {
  display: block;
  color: #99aead;
  font-size: 12px;
  margin-bottom: 5px;
}

.info-item strong {
  display: flex;
  align-items: center;
  gap: 6px;
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

.tech-title .material-icons-round {
  font-size: 17px;
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
  margin-top: auto;
}

.action-btn,
.submit-btn {
  flex: 0 1 120px;
  max-width: 120px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  border-radius: 10px;
  padding: 0 10px;

  font-size: 12.5px;
  font-weight: 600;

  cursor: pointer;
  transition: 0.2s ease;
  white-space: nowrap;
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
}

.submit-btn:hover {
  background: #26494d;
}

.action-btn .material-icons-round,
.submit-btn .material-icons-round {
  font-size: 16px;
}

.action-btn .material-icons-round {
  color: #2f575d;
}

.submit-btn .material-icons-round {
  color: #ffffff;
}

.company .material-icons-round,
.small-icon {
  font-size: 16px;
  color: #2f575d;
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

  .action-btn,
  .submit-btn {
    max-width: 100%;
    width: 100%;
    flex-basis: auto;
  }
}
</style>