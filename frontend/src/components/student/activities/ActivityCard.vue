<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

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
  return props.activity.validationStatus === "DRAFT";
};

const canEditActivity = () => {
  return ["DRAFT", "CORRECTION_REQUIRED"].includes(
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
  emit("delete-activity", props.activity.id);
};

const isCertificatePreviewOpen = ref(false);

const certificateUrl = computed(() => props.activity.certificateUrl || "");

const certificateExtension = computed(() => {
  const value = (
    props.activity.certificateType ||
    props.activity.certificateName ||
    certificateUrl.value
  ).toLowerCase();

  if (value.includes("pdf")) return "pdf";
  if (value.includes("png")) return "image";
  if (value.includes("jpg") || value.includes("jpeg")) return "image";

  return "";
});

const isPdfCertificate = computed(() => certificateExtension.value === "pdf");
const isImageCertificate = computed(
  () => certificateExtension.value === "image",
);

const closeCertificatePreview = () => {
  isCertificatePreviewOpen.value = false;
};
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
      <RouterLink
        class="action-btn"
        :to="`/student/activities/${activity.id}`"
      >
        <span class="material-icons-round">visibility</span>
        Voir détails
      </RouterLink>

      <RouterLink
        v-if="canEditActivity()"
        class="action-btn icon-only"
        :to="`/student/activities/${activity.id}/edit`"
        title="Modifier"
      >
        <span class="material-icons-round">edit</span>
      </RouterLink>

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
  flex-wrap: wrap;
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
  text-decoration: none;
}

.action-btn {
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
}

.action-btn.icon-only {
  width: 2.55rem;
  min-width: 2.55rem;
  padding: 0;
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
