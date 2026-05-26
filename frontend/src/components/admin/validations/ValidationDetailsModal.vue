<script setup>
const props = defineProps({
  validation: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "approve", "reject", "request-changes"]);

const getInitials = (name) => {
  if (!name) return "?";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
/*
  =====================================================
  BACKEND NOTE
  =====================================================

  Quand le backend sera prêt, validation peut contenir :

  validation.student.profilePicture
  validation.student.field
  validation.student.level
  validation.student.city

  validation.content.title
  validation.content.description
  validation.content.files

  validation.targetDetails selon le type :
  - PROJECT : technologies, visibility, createdAt
  - INTERNSHIP : company, startDate, endDate
  - CERTIFICATE : issuer, issueDate, expirationDate, credentialUrl
  - ACTIVITY : organization, role, description

  Pour le moment, on utilise les données mockées.
*/

const files = props.validation.content?.files || props.validation.files || [];
const targetDetails = props.validation.targetDetails || {};
const student = props.validation.student || {};
const content = props.validation.content || props.validation;
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <div>
          <h2>
            Détail de la validation
          </h2>
        </div>

        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="modal-body">
        <aside class="student-panel">
          <h3>
            <span class="material-icons-round section-icon">person</span>
            Informations étudiant
          </h3>

          <div class="student-header">
            <img
              v-if="student.profilePicture"
              :src="student.profilePicture"
              alt="Photo étudiant"
              class="student-avatar"
            />

            <div v-else class="student-avatar initials">
              {{ getInitials(student.fullName) }}
            </div>

            <div>
              <strong>{{ student.fullName }}</strong>
              <p>{{ student.email || "Email non fourni" }}</p>
            </div>
          </div>

          <div class="info-list">
            <div>
              <span>Filière</span>
              <strong>{{ student.field || "Non renseignée" }}</strong>
            </div>

            <div>
              <span>Niveau</span>
              <strong>{{ student.level || "Non renseigné" }}</strong>
            </div>

            <div>
              <span>Ville</span>
              <strong>{{ student.city || "Non renseignée" }}</strong>
            </div>
          </div>
        </aside>

        <main class="details-panel">
          <h3>
            <span class="material-icons-round section-icon">
              {{
                validation.targetType === "PROJECT"
                  ? "folder_open"
                  : validation.targetType === "INTERNSHIP"
                    ? "business_center"
                    : validation.targetType === "CERTIFICATE"
                      ? "workspace_premium"
                      : "stars"
              }}
            </span>

            Détails
            {{
              validation.targetType === "PROJECT"
                ? "du projet"
                : validation.targetType === "INTERNSHIP"
                  ? "du stage"
                  : validation.targetType === "CERTIFICATE"
                    ? "du certificat"
                    : "de l’activité"
            }}
          </h3>

          <div class="detail-row">
            <span>Titre</span>
            <strong>{{ content.title || validation.title }}</strong>
          </div>

          <div class="detail-row description">
            <span>Description</span>
            <p>{{ content.description || validation.description }}</p>
          </div>

          <template v-if="validation.targetType === 'PROJECT'">
            <div class="detail-row" v-if="targetDetails.technologies?.length">
              <span>Technologies</span>

              <div class="chips">
                <span
                  v-for="tech in targetDetails.technologies"
                  :key="tech"
                  class="chip"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <div class="detail-row">
              <span>Visibilité</span>
              <strong>{{ targetDetails.visibility || "Non renseignée" }}</strong>
            </div>

            <div class="detail-row">
              <span>Date de création</span>
              <strong>{{ formatDate(targetDetails.createdAt) }}</strong>
            </div>
          </template>

          <template v-if="validation.targetType === 'INTERNSHIP'">
            <div class="detail-row">
              <span>Entreprise</span>
              <strong>{{ targetDetails.company || "Non renseignée" }}</strong>
            </div>

            <div class="detail-row">
              <span>Période</span>
              <strong>
                {{ targetDetails.startDate || "-" }} →
                {{ targetDetails.endDate || "-" }}
              </strong>
            </div>
          </template>

          <template v-if="validation.targetType === 'CERTIFICATE'">
            <div class="detail-row">
              <span>Émetteur</span>
              <strong>{{ targetDetails.issuer || "Non renseigné" }}</strong>
            </div>

            <div class="detail-row">
              <span>Date d’obtention</span>
              <strong>{{ targetDetails.issueDate || "Non renseignée" }}</strong>
            </div>

            <div class="detail-row">
              <span>Expiration</span>
              <strong>{{ targetDetails.expirationDate || "Aucune" }}</strong>
            </div>

            <div class="detail-row" v-if="targetDetails.credentialUrl">
              <span>Lien certificat</span>
              <a :href="targetDetails.credentialUrl" target="_blank">
                Ouvrir le lien
              </a>
            </div>
          </template>

          <template v-if="validation.targetType === 'ACTIVITY'">
            <div class="detail-row">
              <span>Organisation</span>
              <strong>{{ targetDetails.organization || "Non renseignée" }}</strong>
            </div>

            <div class="detail-row">
              <span>Rôle</span>
              <strong>{{ targetDetails.role || "Non renseigné" }}</strong>
            </div>
          </template>
        </main>
      </div>

      <section class="files-section">
        <h3>
          <span class="material-icons-round section-icon">attach_file</span>
          Fichiers joints
        </h3>

        <div v-if="files.length" class="files-list">
          <a
            v-for="file in files"
            :key="file.id || file.name"
            :href="file.url"
            target="_blank"
            class="file-item"
          >
            <span>📄 {{ file.name }}</span>
            <small>{{ file.size || "" }}</small>
          </a>
        </div>

        <p v-else class="no-files">Aucun fichier joint.</p>
      </section>

      <div class="modal-actions">
        <button class="changes-btn" @click="emit('request-changes', validation)">
          Demander correction
        </button>

        <button class="reject-btn" @click="emit('reject', validation)">
          Refuser
        </button>

        <button class="approve-btn" @click="emit('approve', validation)">
          Approuver
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  width: min(55rem, 94vw);
  max-height: 92vh;
  overflow-y: auto;
  background: var(--app-surface, #ffffff);
  border-radius: 1.5rem;
  padding: 1.625rem;
  box-shadow: var(--app-shadow-popover, 0 1.5rem 3.75rem rgba(15, 23, 42, 0.25));
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 1.125rem;
  margin-bottom: 1.375rem;
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  color: var(--app-heading, #102a33);
  font-size: 1.55rem;
  font-weight: 800;
}

.title-icon,
.section-icon {
  color: var(--app-primary);
  font-size: 1.15rem;
  line-height: 1;
}

.close-btn {
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-muted);
  font-size: 1.8rem;
  cursor: pointer;
}

.modal-body {
  display: grid;
  grid-template-columns: 17.5rem 1fr;
  gap: 1.125rem;
}

.student-panel,
.details-panel,
.files-section {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 1.125rem;
  padding: 1.125rem;
}

.student-panel h3,
.details-panel h3,
.files-section h3 {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0 0 1.15rem;
  color: var(--app-heading);
  font-size: 1rem;
  font-weight: 800;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 1.35rem;
}

.student-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.initials {
  display: grid;
  place-items: center;
  background: var(--app-primary);
  color: white;
  font-weight: 800;
}

.student-header strong {
  color: var(--app-heading);
}

.student-header p {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: 0.85rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-list div,
.detail-row {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 1rem;
  align-items: start;
}

.info-list span,
.detail-row span {
  color: var(--app-subtle);
  font-size: 0.83rem;
  font-weight: 700;
}

.info-list strong,
.detail-row strong {
  color: var(--app-heading);
  font-size: 0.9rem;
}

.detail-row {
  margin-bottom: 1rem;
}

.description p {
  margin: 0;
  color: var(--app-muted);
  line-height: 1.5;
  font-size: 0.9rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  padding: 0.3rem 0.65rem;
  border-radius: var(--app-radius-pill);
  background: var(--app-active-bg, #e6f1ee);
  color: var(--app-primary);
  font-weight: 700;
  font-size: 0.78rem;
}

.detail-row a {
  color: var(--app-primary);
  font-weight: 700;
  text-decoration: none;
}

.files-section {
  margin-top: 1.125rem;
}

.files-list {
  display: grid;
  gap: 0.625rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.75rem;
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
  color: var(--app-heading);
  text-decoration: none;
  font-weight: 700;
}

.file-item small {
  color: var(--app-muted);
}

.no-files {
  margin: 0;
  color: var(--app-subtle);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.25rem;
  margin-top: 1.375rem;
  border-top: 1px solid var(--app-border);
}

.changes-btn,
.reject-btn,
.approve-btn {
  border-radius: var(--app-radius-md);
  padding: 0.7rem 1.1rem;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.changes-btn {
  background: var(--app-surface);
  color: var(--app-primary);
  border-color: var(--app-border-strong);
}

.reject-btn {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.approve-btn {
  background: var(--app-primary);
  color: white;
  border-color: var(--app-primary);
}

.approve-btn:hover {
  background: var(--app-primary-hover);
  border-color: var(--app-primary-hover);
}

@media (max-width: 53.125rem) {
  .modal-body {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .info-list div,
  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>