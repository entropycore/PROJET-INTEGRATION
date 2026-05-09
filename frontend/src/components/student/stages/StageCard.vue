<script setup>
import { useRouter } from 'vue-router'
import StageValidationBadge from './StageValidationBadge.vue'

const props = defineProps({
  stage: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete-stage', 'submit-validation'])

const router = useRouter()

const goToDetails = () => {
  router.push(`/student/stages/${props.stage.id}`)
}

const goToEdit = () => {
  router.push(`/student/stages/${props.stage.id}/edit`)
}

const canEditStage = () => {
  return ['DRAFT', 'PENDING', 'CORRECTION_REQUIRED'].includes(
    props.stage.validationStatus,
  )
}

const canSubmitValidation = () => {
  return ['DRAFT', 'CORRECTION_REQUIRED'].includes(
    props.stage.validationStatus,
  )
}

const submitButtonLabel = () => {
  return props.stage.validationStatus === 'CORRECTION_REQUIRED'
    ? 'Resoumettre'
    : 'Soumettre'
}

const submitValidation = () => {
  emit('submit-validation', props.stage.id)
}

const deleteCurrentStage = () => {
  emit('delete-stage', props.stage.id)
}
</script>

<template>
  <article class="stage-card">
    <div class="card-top">
      <h3>{{ stage.title }}</h3>

      <StageValidationBadge :status="stage.validationStatus" />
    </div>

    <div class="company">
      <span class="material-icons-round">business_center</span>
      <strong>{{ stage.company }}</strong>
    </div>

    <p class="description">
      {{ stage.description }}
    </p>

    <div class="separator"></div>

    <div class="info-grid">
      <div class="info-item">
        <span>Durée</span>
        <strong>
          <span class="material-icons-round small-icon">schedule</span>
          {{ stage.duration }}
        </strong>
      </div>

      <div class="info-item">
        <span>Période</span>
        <strong>
          <span class="material-icons-round small-icon">calendar_month</span>
          {{ stage.startDate }} → {{ stage.endDate }}
        </strong>
      </div>

      <div class="info-item">
        <span>Encadrant</span>
        <strong>
          <span class="material-icons-round small-icon">person</span>
          {{ stage.supervisor.fullName }}
        </strong>
      </div>

      <div class="info-item">
        <span>Visibilité</span>
        <strong>
          <span class="material-icons-round small-icon">
            {{ stage.visibility === 'PUBLIC' ? 'public' : 'lock' }}
          </span>
          {{ stage.visibility === 'PUBLIC' ? 'Publique' : 'Privée' }}
        </strong>
      </div>
    </div>

    <div class="technologies-box">
      <div class="tech-title">
        <span class="material-icons-round">code</span>
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
        <span class="material-icons-round">visibility</span>
        Détails
      </button>

      <button
        v-if="canEditStage()"
        class="action-btn"
        @click="goToEdit"
      >
        <span class="material-icons-round">edit</span>
        Modifier
      </button>

      <button
        v-if="canSubmitValidation()"
        class="submit-btn"
        @click="submitValidation"
      >
        <span class="material-icons-round">send</span>
        {{ submitButtonLabel() }}
      </button>

      <button class="delete-btn" @click="deleteCurrentStage">
        <span class="material-icons-round">delete</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.stage-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 1rem;
  padding: 1.375rem;
  min-height: 26.875rem;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.stage-card:hover {
  border-color: #c4cdc1;
  box-shadow: 0 0.625rem 1.5rem rgba(47, 87, 93, 0.08);
  transform: translateY(-0.125rem);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.875rem;
  margin-bottom: 0.875rem;
}

h3 {
  color: #28363d;
  font-size: 1.25rem;
  line-height: 1.35;
  font-weight: 700;
}

.company {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2f575d;
  margin-bottom: 0.875rem;
}

.company strong {
  font-size: 0.875rem;
  color: #2f575d;
  font-weight: 700;
}

.description {
  color: #526f75;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 0.875rem;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.separator {
  height: 1px;
  background: #edf0ee;
  margin-bottom: 0.875rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8125rem 1.125rem;
  margin-bottom: 1rem;
}

.info-item {
  min-width: 0;
}

.info-item span:first-child {
  display: block;
  color: #99aead;
  font-size: 0.75rem;
  margin-bottom: 0.3125rem;
}

.info-item strong {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #28363d;
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.35;
}

.technologies-box {
  border: 1px solid #dee1dd;
  border-radius: 0.75rem;
  padding: 0.8125rem;
  background: #ffffff;
  margin-top: auto;
  margin-bottom: 1rem;
}

.tech-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #28363d;
  font-size: 0.8125rem;
  font-weight: 700;
  margin-bottom: 0.6875rem;
}

.tech-title .material-icons-round {
  font-size: 1.0625rem;
  color: #2f575d;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4375rem;
}

.tech-tag {
  background: #edf2f0;
  color: #2f575d;
  padding: 0.375rem 0.6875rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: auto;
}

.action-btn,
.submit-btn,
.delete-btn {
  height: 2.55rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  border-radius: 0.625rem;
  padding: 0 0.85rem;

  font-size: 0.8125rem;
  font-weight: 700;

  cursor: pointer;
  transition: 0.2s ease;
  white-space: nowrap;
}

.action-btn {
  min-width: 6rem;
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
}

.submit-btn {
  min-width: 6.8rem;
  background: #2f575d;
  border: 1px solid #2f575d;
  color: #ffffff;
}

.delete-btn {
  width: 2.55rem;
  min-width: 2.55rem;
  padding: 0;
  background: #ffffff;
  color: #c62828;
  border: 1px solid #efc9c9;
}

.action-btn:hover {
  background: #f8f9f8;
}

.submit-btn:hover {
  background: #26494d;
}

.delete-btn:hover {
  background: #fdecea;
}

.action-btn .material-icons-round,
.submit-btn .material-icons-round,
.delete-btn .material-icons-round {
  font-size: 1rem;
}

.action-btn .material-icons-round {
  color: #2f575d;
}

.submit-btn .material-icons-round {
  color: #ffffff;
}

.delete-btn .material-icons-round {
  color: #c62828;
}

.company .material-icons-round,
.small-icon {
  font-size: 1rem;
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
    flex-wrap: wrap;
  }

  .action-btn,
  .submit-btn {
    flex: 1;
  }
}
</style>