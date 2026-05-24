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

const activityStatusClass = computed(() => {
  const statusClasses = {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    CORRECTION_REQUIRED: 'changes-requested',
    REJECTED: 'rejected',
  }

  return statusClasses[activity.value?.validationStatus] || 'draft'
})

const activityStatusMessage = computed(() => {
  const messages = {
    DRAFT: {
      title: 'Activité en brouillon',
      text: 'Vous pouvez encore modifier cette activité avant de la soumettre à validation.',
      icon: 'edit_note',
    },
    PENDING: {
      title: 'Validation en cours',
      text: 'Cette activité a été soumise et attend la réponse du validateur.',
      icon: 'schedule',
    },
    APPROVED: {
      title: 'Activité validée',
      text: 'Cette activité est validée et peut enrichir votre parcours.',
      icon: 'verified',
    },
    REJECTED: {
      title: 'Activité refusée',
      text: 'Cette activité a été refusée par le validateur.',
      icon: 'cancel',
    },
    CORRECTION_REQUIRED: {
      title: 'Correction demandée',
      text: 'Des modifications sont attendues avant une nouvelle soumission.',
      icon: 'rate_review',
    },
  }

  return messages[activity.value?.validationStatus] || messages.DRAFT
})

const validatorName = computed(() =>
  activity.value?.validatorName ||
  activity.value?.validator ||
  '',
)

const certificateUrl = computed(() => activity.value?.certificateUrl || '')
const activityMedia = computed(() => activity.value?.screenshots || activity.value?.media || [])

const validationHistory = computed(() => {
  const history = activity.value?.validationHistory

  if (history?.length) {
    return [...history].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const items = [
    {
      id: 'created',
      title: 'Brouillon créé',
      comment: 'L’activité a été ajoutée à votre espace étudiant.',
      createdAt: activity.value?.createdAt,
      actorName: 'Vous',
      tone: 'draft',
    },
  ]

  if (activity.value?.validationStatus === 'PENDING') {
    items.unshift({
      id: 'submitted',
      title: 'Soumis à validation',
      comment: 'L’activité est en attente de vérification.',
      createdAt: activity.value?.submittedAt || activity.value?.updatedAt,
      actorName: 'Vous',
      tone: 'pending',
    })
  }

  if (activity.value?.validationStatus === 'APPROVED') {
    items.unshift({
      id: 'approved',
      title: 'Activité validée',
      comment: 'L’activité a été validée.',
      createdAt: activity.value?.validatedAt || activity.value?.updatedAt,
      actorName: validatorName.value || 'Validateur',
      tone: 'approved',
    })
  }

  if (activity.value?.validationStatus === 'REJECTED') {
    items.unshift({
      id: 'rejected',
      title: 'Activité refusée',
      comment: activity.value?.validationComment || 'L’activité a été refusée.',
      createdAt: activity.value?.updatedAt,
      actorName: validatorName.value || 'Validateur',
      tone: 'rejected',
    })
  }

  if (activity.value?.validationStatus === 'CORRECTION_REQUIRED') {
    items.unshift({
      id: 'correction',
      title: 'Correction demandée',
      comment: activity.value?.validationComment || 'Des corrections sont demandées.',
      createdAt: activity.value?.updatedAt,
      actorName: validatorName.value || 'Validateur',
      tone: 'changes-requested',
    })
  }

  return items
})

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

const formatDate = (date) => {
  if (!date) return 'Non précisé'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
</script>

<template>
  <section class="activity-details-page project-details-page">
    <div v-if="!activity" class="empty-state">
      <span class="material-icons-round">event_busy</span>
      <h3>Activité introuvable</h3>
      <p>Retournez à la liste et choisissez une activité existante.</p>
    </div>

    <template v-else>
      <div class="project-details-header">
        <div class="project-header-left">
          <button type="button" class="back-link" @click="goBack">
            <span class="material-icons-round">arrow_back</span>
            Retour aux activités
          </button>

          <div class="project-title-row">
            <h1 class="project-title">
              {{ activity.title }}
            </h1>
            <span class="project-type-badge">
              {{ typeLabels[activity.type] || activity.type }}
            </span>
          </div>

          <p v-if="activity.validationStatus === 'APPROVED' && validatorName" class="project-header-validator">
            Validée par <strong>{{ validatorName }}</strong>
          </p>
          <p v-else-if="activity.validationStatus === 'PENDING'" class="project-header-validator pending">
            En attente de validation
          </p>
          <p v-else-if="activity.validationStatus === 'CORRECTION_REQUIRED'" class="project-header-validator changes-requested">
            Corrections demandées par
            <strong>{{ validatorName || 'le validateur' }}</strong>
          </p>
          <p v-else-if="activity.validationStatus === 'REJECTED'" class="project-header-validator rejected">
            Refusée par <strong>{{ validatorName || 'le validateur' }}</strong>
          </p>
          <p v-else class="project-header-validator muted">
            Brouillon non soumis
          </p>
        </div>

        <div class="project-header-actions">
          <button
            v-if="canEditActivity"
            type="button"
            class="secondary-action"
            @click="goToEdit"
          >
            <span class="material-icons-round">edit</span>
            Modifier
          </button>
        </div>
      </div>

      <div class="project-details-layout">
        <main class="project-main-column">
          <section class="details-card project-about-card">
            <h2 class="section-title">À propos de l’activité</h2>

            <p class="project-full-description">
              {{ activity.description }}
            </p>

            <div class="project-about-meta">
              <div>
                <span>Organisme / Club</span>
                <strong>{{ activity.organization || 'Non précisé' }}</strong>
              </div>

              <div>
                <span>Durée</span>
                <strong>{{ activity.duration || 'Non précisée' }}</strong>
              </div>

              <div>
                <span>Lieu</span>
                <strong>{{ activity.location || 'Non précisé' }}</strong>
              </div>
            </div>
          </section>

          <section class="details-card">
            <h2 class="section-title">Attestation</h2>

            <div v-if="activity.certificateName" class="attachment-card">
              <div class="attachment-left">
                <span class="material-icons-round">description</span>
                <div>
                  <strong>{{ activity.certificateName }}</strong>
                  <p>{{ certificateExtension === 'pdf' ? 'Document PDF' : 'Fichier image ou document' }}</p>
                </div>
              </div>

              <div class="certificate-actions">
                <button type="button" class="outline-action" @click="openCertificatePreview">
                  <span class="material-icons-round">visibility</span>
                  Prévisualiser
                </button>

                <a
                  v-if="certificateUrl"
                  class="outline-action"
                  :href="certificateUrl"
                  :download="activity.certificateName"
                >
                  <span class="material-icons-round">download</span>
                  Télécharger
                </a>
              </div>
            </div>

            <div v-else class="empty-section">
              <span class="material-icons-round">upload_file</span>
              <p>Aucune attestation ajoutée pour cette activité.</p>
            </div>
          </section>

          <section class="details-card">
            <h2 class="section-title">Captures / médias de l’activité</h2>

            <div v-if="activityMedia.length" class="screenshots-grid">
              <button
                v-for="media in activityMedia"
                :key="media.id || media.imageUrl || media"
                type="button"
                class="screenshot-card"
              >
                <img
                  v-if="media.imageUrl || media.url || typeof media === 'string'"
                  :src="media.imageUrl || media.url || media"
                  :alt="media.title || 'Média de l’activité'"
                />
              </button>
            </div>

            <div v-else class="empty-section">
              <span class="material-icons-round">photo_library</span>
              <p>Les photos ou captures de l’événement pourront apparaître ici.</p>
            </div>
          </section>

          <section class="details-card">
            <h2 class="section-title">Historique de validation</h2>

            <div class="timeline-list">
              <div
                v-for="item in validationHistory"
                :key="item.id"
                class="timeline-item"
              >
                <div class="timeline-dot" :class="item.tone"></div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <strong>{{ item.title }}</strong>
                    <span class="timeline-date">{{ formatDate(item.createdAt) }}</span>
                  </div>
                  <p>{{ item.comment }}</p>
                  <small>{{ item.actorName }}</small>
                </div>
              </div>
            </div>
          </section>
        </main>

        <aside class="project-sidebar">
          <section class="details-card">
            <div class="section-title">Validation</div>

            <div
              class="details-card project-status-card"
              :class="activityStatusClass"
            >
              <div class="status-card-icon">
                <span class="material-icons-round">
                  {{ activityStatusMessage.icon }}
                </span>
              </div>
              <div>
                <h3>{{ activityStatusMessage.title }}</h3>
                <p>{{ activityStatusMessage.text }}</p>
              </div>
            </div>

            <div class="validator-card">
              <div class="validator-avatar">
                {{ validatorName ? validatorName.charAt(0) : '?' }}
              </div>

              <div>
                <strong>{{ validatorName || 'Non assigné' }}</strong>
                <p>Validateur académique</p>
              </div>
            </div>

            <p v-if="!validatorName" class="validator-warning">
              Veuillez définir un validateur avant de soumettre cette activité.
            </p>

            <p v-if="submitMessage" class="submit-message">
              {{ submitMessage }}
            </p>

            <button
              v-if="canSubmitCurrentActivity"
              type="button"
              class="primary-action validation-submit-btn"
              :disabled="!validatorName"
              @click="submitCurrentActivity"
            >
              <span class="material-icons-round">send</span>
              Soumettre
            </button>
          </section>

          <section class="details-card">
            <div class="section-title">Informations</div>

            <div class="details-info-list">
              <div class="details-info-row">
                <span>Type</span>
                <strong>{{ typeLabels[activity.type] || activity.type }}</strong>
              </div>

              <div class="details-info-row">
                <span>Date</span>
                <strong>{{ formatDate(activity.date) }}</strong>
              </div>

              <div class="details-info-row">
                <span>Statut</span>
                <strong>{{ statusLabels[activity.validationStatus] || activity.validationStatus }}</strong>
              </div>

              <div class="details-info-row">
                <span>Créé le</span>
                <strong>{{ formatDate(activity.createdAt) }}</strong>
              </div>
            </div>
          </section>

          <section
            v-if="canDeleteCurrentActivity"
            class="details-card delete-project-card"
          >
            <div class="delete-project-content">
              <h3>Suppression de l’activité</h3>
              <p>
                Cette action est irréversible. L’activité, l’attestation et les
                médias associés seront supprimés.
              </p>

              <button
                type="button"
                class="delete-project-button"
                @click="deleteCurrentActivity"
              >
                Supprimer l’activité
              </button>
            </div>
          </section>
        </aside>
      </div>
    </template>

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
  gap: 0.4rem;
  min-height: 2.35rem;
  border-radius: 0.55rem;
  padding: 0 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.back-btn {
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
}

.submit-btn {
  background: #2f575d;
  color: #ffffff;
  border: 1px solid #2f575d;
  min-width: 7rem;
  box-shadow: 0 0.35rem 0.8rem rgba(47, 87, 93, 0.12);
}

.edit-btn {
  background: #edf2f0;
  color: #2f575d;
  border: 1px solid #d8e0dc;
}

.preview-btn {
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
}

.delete-btn {
  background: #ffffff;
  color: #c62828;
  border: 1px solid #f0d5d5;
}

.back-btn:hover {
  background: #f8f9f8;
}

.submit-btn:hover {
  background: #26494d;
}

.edit-btn:hover,
.preview-btn:hover {
  background: #f8f9f8;
  border-color: #9fb3b0;
}

.delete-btn:hover {
  background: #fdecea;
  border-color: #efc9c9;
}

.back-btn .material-icons-round {
  color: #2f575d;
}

.edit-btn .material-icons-round,
.submit-btn .material-icons-round {
  color: #ffffff;
}

.edit-btn .material-icons-round,
.preview-btn .material-icons-round {
  color: #2f575d;
}

.delete-btn .material-icons-round {
  color: #c62828;
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

.actions-section {
  margin-top: 1.15rem;
  padding-top: 1rem;
  border-top: 1px solid #edf0ee;
}

.actions-header {
  margin-bottom: 0.65rem;
}

.actions-title {
  color: #99aead;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.details-actions,
.secondary-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
}

.details-actions {
  justify-content: space-between;
}

.secondary-actions {
  justify-content: flex-start;
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

.project-details-page {
  width: 100%;
  color: #24363a;
}

.project-details-page .material-icons-round {
  font-family: 'Material Icons Round';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  direction: ltr;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'liga';
}

.project-details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.3rem;
}

.project-header-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.project-header-left {
  display: flex;
  flex-direction: column;
}

.back-link {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.35rem;
  margin-bottom: 0.65rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: #6f7875;
  text-decoration: none;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
}

.back-link .material-icons-round {
  font-size: 18px;
}

.project-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}

.project-title {
  margin: 0.1rem 0.5rem;
  color: #24363a;
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.025em;
}

.project-type-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: #eef4f1;
  border: 1px solid #d7e3dd;
  color: #2f5a60;
  font-size: 0.78rem;
  font-weight: 800;
}

.project-header-validator {
  margin: 0.2rem 0.8rem 0.2rem 0.5rem;
  color: #577e60;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.25;
}

.project-header-validator strong {
  color: #24363a;
  font-weight: 600;
  padding-left: 3px;
}

.project-header-validator.pending {
  color: #b87518;
}

.project-header-validator.changes-requested {
  color: #b87518;
}

.project-header-validator.rejected {
  color: #c62828;
}

.project-header-validator.muted {
  color: #9aa3a0;
}

.project-details-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 1rem;
}

.project-main-column,
.project-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.details-card {
  background: #ffffff;
  border: 1px solid #deded8;
  border-radius: 0.9rem;
  padding: 1.2rem;
}

.section-title {
  margin: 0 0 0.85rem;
  color: #24363a;
  font-size: 1.02rem;
  font-weight: 600;
  letter-spacing: 0;
}

.project-full-description {
  margin: 0;
  color: #53605d;
  font-size: 0.94rem;
  line-height: 1.8;
}

.project-about-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.project-about-meta div {
  padding: 0.85rem;
  border: 1px solid #eeeeea;
  border-radius: 0.75rem;
  background: #fafaf8;
}

.project-about-meta span {
  color: #6b7471;
  font-size: 0.8rem;
}

.project-about-meta strong {
  display: block;
  margin-top: 0.3rem;
  color: #24363a;
  font-size: 0.9rem;
}

.attachment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem;
  border: 1px solid #eeeeea;
  border-radius: 0.7rem;
  background: #ffffff;
}

.attachment-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.attachment-left strong {
  color: #24363a;
  font-size: 0.92rem;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.attachment-left p {
  margin: 0.2rem 0 0;
  color: #6b7471;
  font-size: 0.82rem;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem;
}

.screenshot-card {
  min-height: 105px;
  border: 0.1px solid #eeeeea;
  border-radius: 0.4rem;
  padding: 0;
  overflow: hidden;
  cursor: default;
  background: transparent;
}

.screenshot-card img {
  width: 100%;
  height: 100%;
  min-height: 105px;
  object-fit: cover;
  display: block;
}

.project-status-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.85rem;
  border-radius: 0.75rem;
  background: #f7fbf8;
  border: 1px solid #dfeee6;
}

.project-status-card h3 {
  margin: 0 0 0.25rem;
  color: #3d8060;
  font-size: 0.9rem;
  font-weight: 800;
}

.project-status-card p {
  margin: 0;
  color: #53605d;
  font-size: 0.82rem;
  line-height: 1.5;
}

.project-status-card.pending {
  background: #fffaf0;
  border-color: #f4e8d1;
}

.project-status-card.pending h3 {
  color: #b87518;
}

.project-status-card.pending .status-card-icon {
  background: #f8ecd6;
  color: #b87518;
}

.project-status-card.rejected {
  background: #fff7f6;
  border-color: #f4e4e1;
}

.project-status-card.rejected h3 {
  color: #c62828;
}

.project-status-card.rejected .status-card-icon {
  background: #f7dfdc;
  color: #c75858;
}

.project-status-card.draft {
  background: #fafaf8;
  border-color: #eeeeea;
}

.project-status-card.draft h3 {
  color: #6b7471;
}

.project-status-card.draft .status-card-icon {
  background: #ececea;
  color: #7b8481;
}

.project-status-card.approved {
  background: #f7fbf8;
  border-color: #dfeee6;
}

.project-status-card.approved h3 {
  color: #3d8060;
}

.project-status-card.approved .status-card-icon {
  background: #dfeee6;
  color: #3d8060;
}

.project-status-card.changes-requested {
  background: #fffaf0;
  border-color: #f4e8d1;
}

.project-status-card.changes-requested h3 {
  color: #b87518;
}

.project-status-card.changes-requested .status-card-icon {
  background: #fff1dc;
  color: #b87518;
}

.activity-details-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.activity-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.activity-title-row h2 {
  margin: 0;
  color: #24363a;
  font-size: clamp(1.7rem, 2.6vw, 2.25rem);
  line-height: 1.1;
  font-weight: 800;
}

.type-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: #eef4f1;
  border: 1px solid #d7e3dd;
  color: #2f575d;
  font-size: 0.78rem;
  font-weight: 800;
}

.header-status {
  margin: 0.45rem 0 0;
  color: #6d9197;
  font-size: 0.94rem;
}

.header-status strong {
  color: #24363a;
}

.header-status.approved {
  color: #1f7a45;
}

.header-status.pending {
  color: #9a6200;
}

.header-status.rejected {
  color: #c62828;
}

.section-title {
  margin: 0 0 0.85rem;
  color: #24363a;
  font-size: 1.02rem;
  font-weight: 600;
  letter-spacing: 0;
}

.activity-description {
  margin: 0;
  color: #526f75;
  font-size: 0.94rem;
  line-height: 1.8;
}

.about-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.about-meta div,
.certificate-card,
.empty-section,
.timeline-content {
  border: 1px solid #eeeeea;
  border-radius: 0.75rem;
  background: #fafaf8;
}

.about-meta div {
  padding: 0.85rem;
}

.about-meta span,
.details-info-row span {
  color: #6b7471;
  font-size: 0.8rem;
}

.about-meta strong {
  display: block;
  margin-top: 0.3rem;
  color: #24363a;
  font-size: 0.9rem;
}

.certificate-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem;
  background: #ffffff;
}

.certificate-left {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.certificate-left > .material-icons-round {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.65rem;
  background: #eef4f1;
  color: #2f575d;
}

.certificate-left strong {
  display: block;
  color: #24363a;
  font-size: 0.92rem;
  overflow-wrap: anywhere;
}

.certificate-left p {
  margin: 0.2rem 0 0;
  color: #6b7471;
  font-size: 0.8rem;
}

.certificate-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.empty-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  color: #6d9197;
}

.empty-section .material-icons-round {
  color: #99aead;
  font-size: 1.5rem;
}

.empty-section p {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.5;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
}

.media-card {
  min-height: 7rem;
  border: 1px solid #eeeeea;
  border-radius: 0.65rem;
  overflow: hidden;
  background: #fafaf8;
}

.media-card img {
  width: 100%;
  height: 100%;
  min-height: 7rem;
  object-fit: cover;
  display: block;
}

.timeline-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-left: 2.2rem;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 0.55rem;
  top: 1rem;
  bottom: 1rem;
  width: 2px;
  background: #d9e2df;
  border-radius: 999px;
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -2.08rem;
  top: 1.05rem;
  z-index: 1;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
  background: #2f575d;
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 2px #d9e2df;
}

.timeline-dot.draft {
  background: #7b8481;
}

.timeline-dot.pending,
.timeline-dot.changes-requested {
  background: #b87518;
}

.timeline-dot.approved {
  background: #3d8060;
}

.timeline-dot.rejected {
  background: #c75858;
}

.timeline-content {
  padding: 0.95rem 1rem;
}

.timeline-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.4rem;
}

.timeline-header strong {
  color: #24363a;
  font-size: 0.92rem;
}

.timeline-header span,
.timeline-content small {
  color: #7d8784;
  font-size: 0.78rem;
  font-weight: 700;
}

.timeline-content p {
  margin: 0;
  color: #5f6b67;
  font-size: 0.88rem;
  line-height: 1.6;
}

.timeline-content small {
  display: block;
  margin-top: 0.55rem;
}

.status-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.85rem;
  border-radius: 0.75rem;
  background: #f7fbf8;
  border: 1px solid #dfeee6;
}

.status-card-icon {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #dfeee6;
  color: #3d8060;
}

.status-card h4 {
  margin: 0 0 0.25rem;
  color: #3d8060;
  font-size: 0.9rem;
}

.status-card p {
  margin: 0;
  color: #53605d;
  font-size: 0.82rem;
  line-height: 1.5;
}

.status-card.pending {
  background: #fffaf0;
  border-color: #f4e8d1;
}

.status-card.pending h4,
.status-card.pending .status-card-icon {
  color: #b87518;
}

.status-card.rejected {
  background: #fff7f6;
  border-color: #f4e4e1;
}

.status-card.rejected h4,
.status-card.rejected .status-card-icon {
  color: #c62828;
}

.status-card.correction_required {
  background: #f5f8ff;
  border-color: #dde8ff;
}

.status-card.correction_required h4,
.status-card.correction_required .status-card-icon {
  color: #2457a6;
}

.validator-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.validator-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #2f575d;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
}

.validator-card strong {
  color: #24363a;
  font-size: 0.95rem;
}

.validator-card p {
  margin: 0.2rem 0 0;
  color: #6b7471;
  font-size: 0.82rem;
}

.validator-warning {
  margin: 0.85rem 0 0;
  padding: 0.8rem;
  border-radius: 0.65rem;
  background: #fffaf0;
  color: #9a6200;
  font-size: 0.82rem;
  line-height: 1.5;
}

.validation-submit-btn {
  width: 100%;
  margin-top: 1rem;
}

.validation-submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.details-info-list,
.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.details-info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.details-info-row strong {
  color: #24363a;
  text-align: right;
  font-size: 0.88rem;
}

.primary-action,
.secondary-action,
.outline-action,
.danger-action {
  min-height: 2.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: 0.55rem;
  padding: 0 0.85rem;
  font-size: 0.82rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.primary-action {
  background: #2f575d;
  border: 1px solid #2f575d;
  color: #ffffff;
}

.primary-action:hover {
  background: #26494d;
}

.secondary-action {
  background: #ffffff;
  border: 1px solid #ddded8;
  color: #24363a;
}

.outline-action {
  background: #ffffff;
  border: 1px solid #c4cdc1;
  color: #2f575d;
}

.danger-action {
  background: #ffffff;
  border: 1px solid #f0d5d5;
  color: #c62828;
}

.secondary-action:hover,
.outline-action:hover {
  background: #f7f7f4;
  border-color: #c4cdc1;
}

.danger-action:hover {
  background: #fdecea;
}

.primary-action .material-icons-round {
  color: #ffffff;
}

.delete-project-card.details-card {
  border: 1px solid #f1d8d8;
  background: rgba(199, 88, 88, 0.05);
}

.delete-project-content h3 {
  margin: 0 0 0.7rem;
  color: #c75858;
  font-size: 1rem;
  font-weight: 700;
}

.delete-project-content p {
  margin: 0 0 1.1rem;
  color: #8a6666;
  font-size: 0.9rem;
  line-height: 1.6;
}

.delete-project-button {
  width: 100%;
  border: none;
  border-radius: 0.7rem;
  background: #cf5f5f;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.9rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.delete-project-button:hover {
  background: #bb4f4f;
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

@media (max-width: 1100px) {
  .project-details-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-header,
  .details-top,
  .header-actions,
  .project-details-header,
  .activity-details-header,
  .certificate-card,
  .timeline-header {
    flex-direction: column;
  }

  .header-actions,
  .project-header-actions,
  .back-btn,
  .edit-btn,
  .preview-btn,
  .delete-btn,
  .submit-btn {
    width: 100%;
  }

  .details-actions,
  .secondary-actions,
  .project-header-actions .secondary-action {
    width: 100%;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .project-about-meta,
  .screenshots-grid {
    grid-template-columns: 1fr;
  }

  .certificate-actions,
  .certificate-actions .outline-action,
  .sidebar-actions .primary-action,
  .sidebar-actions .secondary-action,
  .sidebar-actions .outline-action,
  .sidebar-actions .danger-action {
    width: 100%;
  }
}
</style>
