<script setup>
import { buildBackendUrl } from "@/services/backendUrl";

defineProps({
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

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatFileSize = (size) => {
  if (!size) return "";

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} Ko`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
};

const formatDescription = (value) => {
  if (!value) return "-";

  try {
    const content = JSON.parse(value);
    return content?.description || value;
  } catch {
    return value;
  }
};
</script>

<template>
  <div class="modal-overlay">
    <section
      class="professor-validation-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="professor-validation-details-title"
    >
      <header class="modal-header">
        <div>
          <h2 id="professor-validation-details-title">
            Détail de la validation
          </h2>
        </div>

        <button
          type="button"
          class="close-btn"
          aria-label="Fermer le détail"
          @click="emit('close')"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </header>

      <div class="modal-layout">
        <aside class="student-panel">
          <h3>
            <span class="material-icons-round section-icon">person</span>
            Informations étudiant
          </h3>

          <div class="student-line">
            <img
              v-if="validation.student?.profilePicture"
              :src="buildBackendUrl(validation.student.profilePicture)"
              alt="Photo étudiant"
            />
            <div v-else class="student-avatar">
              {{ getInitials(validation.student?.fullName) }}
            </div>

            <div>
              <strong>{{ validation.student?.fullName }}</strong>
              <p>{{ validation.student?.email || "Email non renseigné" }}</p>
            </div>
          </div>

          <div class="info-list">
            <div>
              <span>Filière</span>
              <strong>{{ validation.student?.field || "-" }}</strong>
            </div>
            <div>
              <span>Niveau</span>
              <strong>{{ validation.student?.level || "-" }}</strong>
            </div>
            <div>
              <span>Ville</span>
              <strong>{{ validation.student?.city || "-" }}</strong>
            </div>
          </div>
        </aside>

        <main class="details-panel">
          <h3>
            <span class="material-icons-round section-icon">
              {{
                validation.targetType === "PROJECT"
                  ? "folder_open"
                  : "business_center"
              }}
            </span>
            {{
              validation.targetType === "PROJECT"
                ? "Détails du projet"
                : "Détails du stage"
            }}
          </h3>

          <div class="detail-row">
            <span>Titre</span>
            <strong>{{ validation.title }}</strong>
          </div>

          <div class="detail-row">
            <span>Description</span>
            <p>
              {{
                formatDescription(
                  validation.content?.description || validation.description,
                )
              }}
            </p>
          </div>

          <template v-if="validation.targetType === 'PROJECT'">
            <div class="detail-row">
              <span>Type</span>
              <strong>{{
                validation.targetDetails?.projectType || "-"
              }}</strong>
            </div>
            <div class="detail-row">
              <span>Rôle</span>
              <strong>{{ validation.targetDetails?.teamRole || "-" }}</strong>
            </div>
            <div class="detail-row">
              <span>Équipe</span>
              <strong>{{ validation.targetDetails?.teamSize || "-" }}</strong>
            </div>
          </template>

          <template v-if="validation.targetType === 'INTERNSHIP'">
            <div class="detail-row">
              <span>Entreprise</span>
              <strong>{{ validation.targetDetails?.company || "-" }}</strong>
            </div>
            <div class="detail-row">
              <span>Période</span>
              <strong>
                {{ formatDate(validation.targetDetails?.startDate) }} -
                {{ formatDate(validation.targetDetails?.endDate) }}
              </strong>
            </div>
            <div class="detail-row">
              <span>Durée</span>
              <strong>{{ validation.targetDetails?.duration || "-" }}</strong>
            </div>
          </template>

          <div
            v-if="validation.targetDetails?.technologies?.length"
            class="detail-row"
          >
            <span>Technologies</span>
            <div class="chips">
              <span
                v-for="tech in validation.targetDetails.technologies"
                :key="tech"
              >
                {{ tech }}
              </span>
            </div>
          </div>

          <div class="detail-row">
            <span>Soumis le</span>
            <strong>{{ formatDate(validation.submittedAt) }}</strong>
          </div>
        </main>
      </div>

      <section class="files-panel">
        <h3>
          <span class="material-icons-round section-icon">attach_file</span>
          Fichiers joints
        </h3>

        <div v-if="validation.content?.files?.length" class="files-list">
          <a
            v-for="file in validation.content.files"
            :key="file.id || file.url"
            :href="buildBackendUrl(file.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="file-row"
          >
            <span class="material-icons-round">attach_file</span>
            <strong>{{ file.name }}</strong>
            <small>{{ formatFileSize(file.size) }}</small>
          </a>
        </div>

        <p v-else>Aucun fichier joint.</p>
      </section>

      <footer v-if="validation.status === 'PENDING'" class="modal-actions">
        <button
          type="button"
          class="secondary-btn"
          @click="emit('request-changes', validation)"
        >
          Demander une correction
        </button>
        <button
          type="button"
          class="danger-btn"
          @click="emit('reject', validation)"
        >
          Refuser
        </button>
        <button
          type="button"
          class="primary-btn"
          @click="emit('approve', validation)"
        >
          Approuver
        </button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.45);
}

.professor-validation-modal {
  width: min(58rem, 100%);
  max-height: 92vh;
  overflow: auto;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  padding: 1.15rem;
  box-shadow: var(--app-shadow-popover);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.modal-header h2 {
  margin: 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: 1.55rem;
  font-weight: 800;
}

.modal-subtitle {
  margin: 0.4rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  line-height: 1.5;
}

.close-btn {
  width: 2.4rem;
  height: 2.4rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-muted);
  font-family: var(--app-font-body);
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.close-btn:hover {
  border-color: var(--app-active-border);
  background: var(--app-active-bg);
  color: var(--app-primary);
}

.modal-layout {
  display: grid;
  grid-template-columns: 18rem 1fr;
  gap: 0.8rem;
}

.student-panel,
.details-panel,
.files-panel {
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  padding: 1rem;
  background: var(--app-surface);
}

h3 {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin: 0 0 0.85rem;
  color: var(--app-heading);
  font-family: var(--app-font-body);
  font-size: 1rem;
  font-weight: 800;
}

.section-icon {
  color: var(--app-primary);
  font-size: 1.15rem;
  line-height: 1;
}

.student-line {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.45rem;
  padding: 0.65rem;
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.student-line img,
.student-avatar {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  border: 2px solid var(--app-active-border);
}

.student-line img {
  object-fit: cover;
}

.student-avatar {
  display: grid;
  place-items: center;
  background: var(--app-primary);
  color: #ffffff;
  font-weight: 800;
}

.student-line strong {
  color: var(--app-heading);
  font-size: var(--app-text-md);
  font-weight: 800;
}

.student-line p,
.files-panel p {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
}

.info-list,
.details-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-list > div,
.detail-row {
  display: grid;
  grid-template-columns: 7.5rem minmax(0, 1fr);
  gap: 0.8rem;
  align-items: start;
  padding: 0.6rem 0;
}

.info-list span,
.detail-row span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.info-list strong,
.detail-row strong,
.detail-row p {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-text-md);
  font-weight: 700;
  line-height: 1.55;
}

.detail-row p {
  color: var(--app-text);
  font-weight: 500;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chips span {
  padding: 0.35rem 0.65rem;
  border-radius: var(--app-radius-pill);
  background: var(--app-active-bg);
  color: var(--app-primary);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.files-panel {
  margin-top: 0.8rem;
}

.files-list {
  display: grid;
  gap: 0;
}

.file-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.6rem;
  align-items: center;
  min-height: 2.9rem;
  padding: 0.4rem 0.65rem;
  border-bottom: 1px solid var(--app-neutral-bg);
  border-radius: var(--app-radius-sm);
  background: var(--app-surface);
  color: var(--app-text);
  text-decoration: none;
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.file-row:last-child {
  border-bottom: 0;
}

.file-row:hover {
  background: var(--app-surface-soft);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.file-row strong {
  min-width: 0;
  color: var(--app-heading);
  font-size: var(--app-text-sm);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.file-row .material-icons-round {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--app-active-bg);
  color: var(--app-primary);
  font-size: 1rem;
}

.file-row small {
  color: var(--app-muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  margin-top: 0.9rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--app-border);
}

.primary-btn,
.secondary-btn,
.danger-btn {
  min-height: 2.6rem;
  border-radius: var(--app-radius-md);
  padding: 0 1rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;
}

.primary-btn {
  border: 1px solid var(--app-primary);
  background: var(--app-primary);
  color: #ffffff;
}

.secondary-btn {
  border: 1px solid var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-primary);
}

.secondary-btn:hover {
  background: var(--app-surface-soft);
}

.danger-btn {
  border: 1px solid transparent;
  background: var(--app-error-bg);
  color: var(--app-error);
}

@media (max-width: 760px) {
  .modal-layout {
    grid-template-columns: 1fr;
  }

  .info-list > div,
  .detail-row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
