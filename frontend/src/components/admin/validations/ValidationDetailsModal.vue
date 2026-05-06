<script setup>
const props = defineProps({
  validation: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "approve", "reject", "request-changes"]);

const typeLabels = {
  PROJECT: "Projet",
  INTERNSHIP: "Stage",
  CERTIFICATE: "Certificat",
  ACTIVITY: "Activité",
};

const typeClasses = {
  PROJECT: "project",
  INTERNSHIP: "internship",
  CERTIFICATE: "certificate",
  ACTIVITY: "activity",
};

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
          <h2>Détail de la validation</h2>

          <span
            class="type-badge"
            :class="typeClasses[validation.targetType]"
          >
            {{ typeLabels[validation.targetType] }}
          </span>
        </div>

        <button class="close-btn" @click="emit('close')">
          ×
        </button>
      </div>

      <div class="modal-body">
        <!-- COLONNE GAUCHE : ÉTUDIANT -->
        <aside class="student-panel">
          <h3>Informations étudiant</h3>

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

        <!-- COLONNE DROITE : CONTENU VALIDÉ -->
        <main class="details-panel">
          <h3>
            Détails {{
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

          <!-- PROJECT -->
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

          <!-- INTERNSHIP -->
          <template v-if="validation.targetType === 'INTERNSHIP'">
            <div class="detail-row">
              <span>Entreprise</span>
              <strong>{{ targetDetails.company || "Non renseignée" }}</strong>
            </div>

            <div class="detail-row">
              <span>Période</span>
              <strong>
                {{ targetDetails.startDate || "-" }} → {{ targetDetails.endDate || "-" }}
              </strong>
            </div>
          </template>

          <!-- CERTIFICATE -->
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

          <!-- ACTIVITY -->
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

      <!-- FICHIERS -->
      <section class="files-section">
        <h3>Fichiers joints</h3>

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

        <p v-else class="no-files">
          Aucun fichier joint.
        </p>
      </section>

      <!-- ACTIONS -->
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
  width: min(880px, 94vw);
  max-height: 92vh;
  overflow-y: auto;
  background: #fbfaf7;
  border-radius: 24px;
  padding: 26px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.modal-header h2 {
  margin: 0 0 8px;
  color: #0f2f3a;
  font-size: 1.55rem;
  font-weight: 800;
}

.close-btn {
  width: 44px;
  height: 44px;
  border: 1px solid #cfd8cc;
  border-radius: 12px;
  background: #ffffff;
  color: #6b8a91;
  font-size: 1.8rem;
  cursor: pointer;
}

.type-badge {
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.type-badge.project {
  background: #e8f5f1;
  color: #2f5d62;
}

.type-badge.internship {
  background: #e8f5f1;
  color: #2f5d62;
}

.type-badge.certificate {
  background: #fff4e6;
  color: #ea580c;
}

.type-badge.activity {
  background: #fff4e6;
  color: #ea580c;
}

.modal-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
}

.student-panel,
.details-panel,
.files-section {
  background: #ffffff;
  border: 1px solid #dfe3dd;
  border-radius: 18px;
  padding: 18px;
}

.student-panel h3,
.details-panel h3,
.files-section h3 {
  margin: 0 0 16px;
  color: #0f2f3a;
  font-size: 1rem;
  font-weight: 800;
}

.student-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.initials {
  display: grid;
  place-items: center;
  background: #2f5d62;
  color: white;
  font-weight: 800;
}

.student-header strong {
  color: #0f2f3a;
}

.student-header p {
  margin: 3px 0 0;
  color: #7f9699;
  font-size: 0.85rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-list div,
.detail-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: start;
}

.info-list span,
.detail-row span {
  color: #8aa0a3;
  font-size: 0.83rem;
  font-weight: 700;
}

.info-list strong,
.detail-row strong {
  color: #0f2f3a;
  font-size: 0.9rem;
}

.detail-row {
  margin-bottom: 14px;
}

.description p {
  margin: 0;
  color: #5f6f70;
  line-height: 1.5;
  font-size: 0.9rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 5px 10px;
  border-radius: 999px;
  background: #e8efed;
  color: #2f5d62;
  font-weight: 700;
  font-size: 0.78rem;
}

.detail-row a {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.files-section {
  margin-top: 18px;
}

.files-list {
  display: grid;
  gap: 10px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 12px;
  background: #f7f8f6;
  color: #0f2f3a;
  text-decoration: none;
  font-weight: 700;
}

.file-item small {
  color: #7f9699;
}

.no-files {
  margin: 0;
  color: #8aa0a3;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  margin-top: 22px;
  border-top: 1px solid #dfe3dd;
}

.changes-btn,
.reject-btn,
.approve-btn {
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-weight: 800;
  cursor: pointer;
}

.changes-btn {
  background: #ffffff;
  color: #2f5d62;
  border: 1px solid #cfd8cc;
}

.reject-btn {
  background: #fef2f2;
  color: #dc2626;
}

.approve-btn {
  background: #ecfdf5;
  color: #059669;
}

@media (max-width: 850px) {
  .modal-body {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .info-list div,
  .detail-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>