<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  canDeleteActivity as canDeleteActivityRule,
  canEditActivity as canEditActivityRule,
  canSubmitActivity,
  hasActivityValidator,
} from '@/components/student/activities/activityRules'
import {
  deleteActivity,
  getActivityById,
  submitActivityValidation,
} from '@/mockData/studentActivities.store'

const route = useRoute()
const router = useRouter()

const activity = computed(() => getActivityById(route.params.id))
const isCertificatePreviewOpen = ref(false)
const submitMessage = ref('')

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

const canEditActivity = computed(() =>
  canEditActivityRule(activity.value),
)
const canDeleteCurrentActivity = computed(() =>
  canDeleteActivityRule(activity.value),
)
const canSubmitCurrentActivity = computed(() =>
  canSubmitActivity(activity.value),
)

const validatorName = computed(() =>
  activity.value?.validatorName ||
  activity.value?.validator ||
  '',
)

const certificateUrl = computed(() => activity.value?.certificateUrl || '')

const certificateExtension = computed(() => {
  const value = (
    activity.value?.certificateType ||
    activity.value?.certificateName ||
    certificateUrl.value
  ).toLowerCase()

  if (value.includes('pdf')) return 'pdf'
  if (value.includes('png')) return 'image'
  if (value.includes('jpg') || value.includes('jpeg')) return 'image'

  return ''
})

const isPdfCertificate = computed(() => certificateExtension.value === 'pdf')
const isImageCertificate = computed(
  () => certificateExtension.value === 'image',
)

const goBack = () => {
  router.push('/student/activities')
}

const goToEdit = () => {
  if (!activity.value) return
  router.push(`/student/activities/${activity.value.id}/edit`)
}

const deleteCurrentActivity = () => {
  if (!activity.value || !canDeleteCurrentActivity.value) return

  const confirmDelete = window.confirm(
    'Voulez-vous vraiment supprimer cette activité ?',
  )

  if (!confirmDelete) return

  deleteActivity(activity.value.id)
  router.push('/student/activities')
}

const submitCurrentActivity = () => {
  if (!activity.value) return

  if (!canSubmitCurrentActivity.value) {
    submitMessage.value = 'Seules les activités en brouillon peuvent être soumises.'
    return
  }

  if (!hasActivityValidator(activity.value)) {
    submitMessage.value =
      'Veuillez définir un validateur avant de soumettre cette activité.'
    return
  }

  submitActivityValidation(activity.value.id)
  submitMessage.value = 'Activité soumise à validation.'
}

const openCertificatePreview = () => {
  isCertificatePreviewOpen.value = true
}

const closeCertificatePreview = () => {
  isCertificatePreviewOpen.value = false
}
</script>

<template>
  <section class="activity-details-page">
    <div class="page-header">
      <div>
        <span class="page-label">PARASCOLAIRE</span>
        <h1>Détail de l’activité</h1>
        <p>Consultez les informations transmises pour cette activité.</p>
      </div>

      <div class="header-actions">
        <button type="button" class="back-btn" @click="goBack">
          <span class="material-icons-round">arrow_back</span>
          Retour
        </button>
      </div>
    </div>

    <div v-if="!activity" class="empty-state">
      <span class="material-icons-round">event_busy</span>
      <h3>Activité introuvable</h3>
      <p>Retournez à la liste et choisissez une activité existante.</p>
    </div>

    <article v-else class="details-card">
      <div class="details-top">
        <div>
          <span class="type-label">
            {{ typeLabels[activity.type] || activity.type }}
          </span>
          <h2>{{ activity.title }}</h2>
        </div>

        <span
          class="status-badge"
          :class="activity.validationStatus.toLowerCase()"
        >
          {{
            statusLabels[activity.validationStatus] ||
            activity.validationStatus
          }}
        </span>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <span>Organisme / Club</span>
          <strong>{{ activity.organization }}</strong>
        </div>

        <div class="detail-item">
          <span>Date</span>
          <strong>{{ activity.date }}</strong>
        </div>

        <div class="detail-item">
          <span>Durée</span>
          <strong>{{ activity.duration }}</strong>
        </div>

        <div class="detail-item">
          <span>Lieu</span>
          <strong>{{ activity.location }}</strong>
        </div>

        <div class="detail-item">
          <span>Validateur</span>
          <strong>{{ validatorName || 'Non défini' }}</strong>
        </div>

        <div class="detail-item">
          <span>Attestation</span>
          <strong>{{ activity.certificateName || 'Non ajoutée' }}</strong>
        </div>
      </div>

      <div class="description-block">
        <span>Description</span>
        <p>{{ activity.description }}</p>
      </div>

      <p v-if="submitMessage" class="submit-message">
        {{ submitMessage }}
      </p>

      <div class="details-actions">
        <button
          v-if="canEditActivity"
          type="button"
          class="edit-btn"
          @click="goToEdit"
        >
          <span class="material-icons-round">edit</span>
          Modifier
        </button>

        <button
          v-if="canDeleteCurrentActivity"
          type="button"
          class="delete-btn"
          @click="deleteCurrentActivity"
        >
          <span class="material-icons-round">delete</span>
          Supprimer
        </button>

        <button
          v-if="canSubmitCurrentActivity"
          type="button"
          class="submit-btn"
          @click="submitCurrentActivity"
        >
          <span class="material-icons-round">send</span>
          Soumettre
        </button>

        <button
          v-if="activity.certificateName"
          type="button"
          class="preview-btn"
          @click="openCertificatePreview"
        >
          <span class="material-icons-round">visibility</span>
          Prévisualiser l’attestation
        </button>
      </div>
    </article>

    <Teleport to="body">
      <div
        v-if="isCertificatePreviewOpen"
        class="certificate-modal-backdrop"
        @click.self="closeCertificatePreview"
      >
        <section class="certificate-modal" role="dialog" aria-modal="true">
          <header class="certificate-modal-header">
            <div>
              <span>Attestation</span>
              <h4>{{ activity.certificateName }}</h4>
            </div>

            <button
              type="button"
              class="modal-close-btn"
              aria-label="Fermer"
              @click="closeCertificatePreview"
            >
              <span class="material-icons-round">close</span>
            </button>
          </header>

          <div class="certificate-preview">
            <iframe
              v-if="certificateUrl && isPdfCertificate"
              :src="certificateUrl"
              title="Prévisualisation de l’attestation"
            ></iframe>

            <img
              v-else-if="certificateUrl && isImageCertificate"
              :src="certificateUrl"
              :alt="activity.certificateName"
            />

            <div v-else class="preview-empty">
              <span class="material-icons-round">description</span>
              <p>Prévisualisation indisponible pour cette attestation.</p>
            </div>
          </div>

          <footer class="certificate-modal-footer">
            <a
              class="download-btn"
              :class="{ disabled: !certificateUrl }"
              :href="certificateUrl || undefined"
              :download="activity.certificateName"
            >
              <span class="material-icons-round">download</span>
              Télécharger
            </a>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.activity-details-page {
  padding: 0;
}

.page-header,
.details-top,
.header-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
}

.page-header {
  margin-bottom: 1.125rem;
}

.header-actions {
  align-items: center;
}

.page-label,
.type-label {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #a8aca8;
  font-size: 0.8rem;
  font-style: italic;
}

.type-label {
  color: #6d9197;
  font-weight: 700;
  font-style: normal;
}

.page-header h1 {
  color: #28363d;
  font-size: 2rem;
  line-height: 1.15;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.page-header p {
  color: #6d9197;
  font-size: 0.875rem;
  font-style: italic;
  margin: 0;
}

.back-btn,
.edit-btn,
.preview-btn,
.delete-btn,
.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5625rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.back-btn {
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
}

.edit-btn,
.preview-btn,
.submit-btn {
  background: #2f575d;
  color: #ffffff;
  border: 1px solid #2f575d;
}

.delete-btn {
  background: #ffffff;
  color: #c62828;
  border: 1px solid #efc9c9;
}

.back-btn:hover {
  background: #f8f9f8;
}

.edit-btn:hover,
.preview-btn:hover,
.submit-btn:hover {
  background: #26494d;
}

.delete-btn:hover {
  background: #fdecea;
}

.back-btn .material-icons-round {
  color: #2f575d;
}

.edit-btn .material-icons-round,
.preview-btn .material-icons-round,
.submit-btn .material-icons-round {
  color: #ffffff;
}

.details-card,
.empty-state {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.875rem;
}

.details-card {
  padding: 1.375rem;
}

.details-top {
  margin-bottom: 1.25rem;
}

.details-top h2 {
  color: #28363d;
  font-size: 1.45rem;
  line-height: 1.3;
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

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.detail-item,
.description-block {
  border: 1px solid #edf0ee;
  border-radius: 0.75rem;
  background: #f8f9f8;
  padding: 0.9rem 1rem;
}

.detail-item span,
.description-block span {
  display: block;
  color: #99aead;
  font-size: 0.75rem;
  margin-bottom: 0.35rem;
}

.detail-item strong {
  color: #28363d;
  font-size: 0.92rem;
}

.description-block {
  margin-top: 1rem;
}

.description-block p {
  color: #526f75;
  line-height: 1.7;
  margin: 0;
}

.submit-message {
  margin: 1rem 0 0;
  padding: 0.85rem 1rem;
  border: 1px solid #c4cdc1;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #2f575d;
  font-size: 0.9rem;
  font-weight: 700;
}

.details-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  color: #6d9197;
}

.empty-state .material-icons-round {
  font-size: 2.4rem;
  color: #99aead;
  margin-bottom: 0.75rem;
}

.empty-state h3 {
  color: #28363d;
  margin: 0 0 0.35rem;
}

.empty-state p {
  margin: 0;
}

.certificate-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(40, 54, 61, 0.48);
}

.certificate-modal {
  width: min(58rem, 100%);
  max-height: 90vh;
  overflow: hidden;
  background: #ffffff;
  border-radius: 0.875rem;
  border: 1px solid #dee1dd;
  box-shadow: 0 1.5rem 3.5rem rgba(40, 54, 61, 0.2);
  display: flex;
  flex-direction: column;
}

.certificate-modal-header,
.certificate-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.125rem;
  border-bottom: 1px solid #edf0ee;
}

.certificate-modal-footer {
  justify-content: flex-end;
  border-top: 1px solid #edf0ee;
  border-bottom: 0;
}

.certificate-modal-header span {
  color: #6d9197;
  font-size: 0.75rem;
  font-weight: 700;
}

.certificate-modal-header h4 {
  color: #28363d;
  font-size: 1rem;
  margin: 0.2rem 0 0;
}

.modal-close-btn {
  width: 2.35rem;
  height: 2.35rem;
  border: 1px solid #c4cdc1;
  border-radius: 0.65rem;
  background: #ffffff;
  color: #2f575d;
  cursor: pointer;
}

.certificate-preview {
  min-height: 28rem;
  background: #f8f9f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.certificate-preview iframe,
.certificate-preview img {
  width: 100%;
  height: 28rem;
  border: 0;
}

.certificate-preview img {
  object-fit: contain;
  padding: 1rem;
}

.preview-empty {
  text-align: center;
  color: #6d9197;
  padding: 2rem;
}

.preview-empty .material-icons-round {
  color: #99aead;
  font-size: 2.4rem;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.55rem;
  padding: 0 1rem;
  border-radius: 0.625rem;
  background: #2f575d;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
}

.download-btn.disabled {
  pointer-events: none;
  opacity: 0.55;
}

.download-btn .material-icons-round {
  color: #ffffff;
  font-size: 1rem;
}

@media (max-width: 760px) {
  .page-header,
  .details-top,
  .header-actions {
    flex-direction: column;
  }

  .header-actions,
  .back-btn,
  .edit-btn,
  .preview-btn,
  .delete-btn,
  .submit-btn {
    width: 100%;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
