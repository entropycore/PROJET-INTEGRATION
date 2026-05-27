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
</script>

<template>
  <div class="modal-overlay">
    <section class="professor-validation-modal">
      <header class="modal-header">
        <div>
          <span>{{
            validation.targetType === "PROJECT" ? "Projet" : "Stage"
          }}</span>
          <h2>{{ validation.title }}</h2>
        </div>

        <button type="button" class="close-btn" @click="emit('close')">
          <span class="material-icons-round">close</span>
        </button>
      </header>

      <div class="modal-layout">
        <aside class="student-panel">
          <h3>Etudiant</h3>

          <div class="student-line">
            <img
              v-if="validation.student?.profilePicture"
              :src="buildBackendUrl(validation.student.profilePicture)"
              alt="Photo etudiant"
            />
            <div v-else class="student-avatar">
              {{ getInitials(validation.student?.fullName) }}
            </div>

            <div>
              <strong>{{ validation.student?.fullName }}</strong>
              <p>{{ validation.student?.email || "Email non renseigne" }}</p>
            </div>
          </div>

          <div class="info-list">
            <div>
              <span>Filiere</span>
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
          <h3>Details</h3>

          <div class="detail-row">
            <span>Description</span>
            <p>
              {{ validation.content?.description || validation.description }}
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
              <span>Role</span>
              <strong>{{ validation.targetDetails?.teamRole || "-" }}</strong>
            </div>
            <div class="detail-row">
              <span>Equipe</span>
              <strong>{{ validation.targetDetails?.teamSize || "-" }}</strong>
            </div>
          </template>

          <template v-if="validation.targetType === 'INTERNSHIP'">
            <div class="detail-row">
              <span>Entreprise</span>
              <strong>{{ validation.targetDetails?.company || "-" }}</strong>
            </div>
            <div class="detail-row">
              <span>Periode</span>
              <strong>
                {{ formatDate(validation.targetDetails?.startDate) }} -
                {{ formatDate(validation.targetDetails?.endDate) }}
              </strong>
            </div>
            <div class="detail-row">
              <span>Duree</span>
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
        <h3>Fichiers joints</h3>

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
          Demander correction
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
  border-radius: var(--app-radius-panel);
  padding: 1.4rem;
  box-shadow: var(--app-shadow-popover);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.modal-header span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  text-transform: uppercase;
}

.modal-header h2 {
  margin: 0.25rem 0 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: 1.65rem;
  font-weight: 600;
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
  cursor: pointer;
}

.modal-layout {
  display: grid;
  grid-template-columns: 18rem 1fr;
  gap: 1rem;
}

.student-panel,
.details-panel,
.files-panel {
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  padding: 1rem;
}

h3 {
  margin: 0 0 1rem;
  color: var(--app-heading);
  font-size: var(--app-text-md);
  font-weight: 800;
}

.student-line {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.student-line img,
.student-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
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
  gap: 0.8rem;
}

.info-list span,
.detail-row span {
  display: block;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.info-list strong,
.detail-row strong,
.detail-row p {
  margin: 0;
  color: var(--app-text);
  font-size: var(--app-text-sm);
  line-height: 1.55;
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
}

.files-panel {
  margin-top: 1rem;
}

.files-list {
  display: grid;
  gap: 0.55rem;
}

.file-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.6rem;
  align-items: center;
  min-height: 2.8rem;
  padding: 0 0.75rem;
  background: var(--app-surface-soft);
  border-radius: var(--app-radius-md);
  color: var(--app-text);
  text-decoration: none;
}

.file-row .material-icons-round {
  color: var(--app-primary);
  font-size: 1.1rem;
}

.file-row small {
  color: var(--app-muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  margin-top: 1.2rem;
  padding-top: 1rem;
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

.danger-btn {
  border: 1px solid transparent;
  background: var(--app-error-bg);
  color: var(--app-error);
}

@media (max-width: 760px) {
  .modal-layout {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
