<script setup>
const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['delete-activity', 'submit-validation'])

const statusLabels = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  APPROVED: 'Validée',
  REJECTED: 'Refusée',
  CORRECTION_REQUIRED: 'Correction demandée',
}

const typeLabels = {
  CLUB: 'Club',
  EVENT: 'Événement',
  VOLUNTEERING: 'Bénévolat',
  COMPETITION: 'Compétition',
  TRAINING: 'Formation',
  OTHER: 'Autre',
}

const canSubmitValidation = () => {
  return ['DRAFT', 'CORRECTION_REQUIRED'].includes(
    props.activity.validationStatus,
  )
}

const canDeleteActivity = () => {
  return ['DRAFT', 'CORRECTION_REQUIRED', 'REJECTED'].includes(
    props.activity.validationStatus,
  )
}

const submitValidation = () => {
  emit('submit-validation', props.activity.id)
}

const deleteCurrentActivity = () => {
  emit('delete-activity', props.activity.id)
}
</script>

<template>
  <article class="activity-card">
    <div class="card-top">
      <div>
        <span class="type-label">
          {{ typeLabels[activity.type] || activity.type }}
        </span>
        <h3>{{ activity.title }}</h3>
      </div>

      <span
        class="status-badge"
        :class="activity.validationStatus.toLowerCase()"
      >
        {{ statusLabels[activity.validationStatus] || activity.validationStatus }}
      </span>
    </div>

    <div class="organization">
      <span class="material-icons-round">groups</span>
      <strong>{{ activity.organization }}</strong>
    </div>

    <p class="description">
      {{ activity.description }}
    </p>

    <div class="separator"></div>

    <div class="info-grid">
      <div class="info-item">
        <span>Date</span>
        <strong>
          <span class="material-icons-round small-icon">calendar_month</span>
          {{ activity.date }}
        </strong>
      </div>

      <div class="info-item">
        <span>Durée</span>
        <strong>
          <span class="material-icons-round small-icon">schedule</span>
          {{ activity.duration }}
        </strong>
      </div>

      <div class="info-item">
        <span>Lieu</span>
        <strong>
          <span class="material-icons-round small-icon">location_on</span>
          {{ activity.location }}
        </strong>
      </div>

      <div class="info-item">
        <span>Attestation</span>
        <strong>
          <span class="material-icons-round small-icon">
            {{ activity.certificateName ? 'task' : 'description' }}
          </span>
          {{ activity.certificateName || 'Non ajoutée' }}
        </strong>
      </div>
    </div>

    <div class="actions">
      <button
        v-if="activity.certificateName"
        type="button"
        class="action-btn"
      >
        <span class="material-icons-round">visibility</span>
        Attestation
      </button>

      <button
        v-if="canDeleteActivity()"
        type="button"
        class="delete-btn"
        @click="deleteCurrentActivity"
      >
        <span class="material-icons-round">delete</span>
      </button>

      <button
        v-if="canSubmitValidation()"
        type="button"
        class="submit-btn"
        @click="submitValidation"
      >
        <span class="material-icons-round">send</span>
        Soumettre
      </button>
    </div>
  </article>
</template>

<style scoped>
.activity-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 1rem;
  padding: 1.375rem;
  min-height: 23rem;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.activity-card:hover {
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

.type-label {
  display: inline-block;
  color: #6d9197;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

h3 {
  color: #28363d;
  font-size: 1.18rem;
  line-height: 1.35;
  font-weight: 700;
  margin: 0;
}

.status-badge {
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.status-badge.draft {
  background: #edf2f0;
  color: #2f575d;
}

.status-badge.pending {
  background: #fff3d8;
  color: #9a6200;
}

.status-badge.approved {
  background: #e4f6ec;
  color: #1f7a45;
}

.status-badge.rejected {
  background: #fdecea;
  color: #c62828;
}

.status-badge.correction_required {
  background: #eaf1ff;
  color: #2457a6;
}

.organization {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2f575d;
  margin-bottom: 0.875rem;
}

.organization strong {
  font-size: 0.875rem;
  color: #2f575d;
}

.description {
  color: #526f75;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 0.875rem;

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

.small-icon,
.organization .material-icons-round {
  color: #2f575d;
  font-size: 1rem;
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
  min-width: 7rem;
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

.submit-btn .material-icons-round {
  color: #ffffff;
}

@media (max-width: 760px) {
  .activity-card {
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
