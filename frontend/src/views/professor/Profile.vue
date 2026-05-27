<script setup>
import { onMounted, ref } from "vue";

import { buildBackendUrl } from "@/services/backendUrl";
import {
  getProfessorProfile,
  updateProfessorProfile,
  uploadProfessorProfilePicture,
} from "@/services/professorApi";
import { useAuthStore } from "@/stores/auth";

const profile = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isEditing = ref(false);
const isUploadingPicture = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const pictureInput = ref(null);
const authStore = useAuthStore();

const editForm = ref({
  firstName: "",
  lastName: "",
  phone: "",
  grade: "",
  specialty: "",
  department: "",
});

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

const fillEditForm = () => {
  if (!profile.value) return;

  editForm.value = {
    firstName: profile.value.user.firstName || "",
    lastName: profile.value.user.lastName || "",
    phone: profile.value.user.phone || "",
    grade: profile.value.profile?.grade || "",
    specialty: profile.value.profile?.specialty || "",
    department: profile.value.profile?.department || "",
  };
};

const syncAuthUser = (user) => {
  if (!authStore.user || !user) return;

  authStore.setAuthSession({
    ...authStore.user,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    profilePicture: user.profilePicture,
  });
};

const loadProfile = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    profile.value = await getProfessorProfile();
    fillEditForm();
  } catch (error) {
    console.error("Erreur profil professeur :", error);
    errorMessage.value = "Impossible de charger le profil professeur.";
  } finally {
    isLoading.value = false;
  }
};

const startEdit = () => {
  fillEditForm();
  successMessage.value = "";
  errorMessage.value = "";
  isEditing.value = true;
};

const cancelEdit = () => {
  fillEditForm();
  isEditing.value = false;
};

const saveProfile = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (!editForm.value.firstName.trim() || !editForm.value.lastName.trim()) {
    errorMessage.value = "Le prénom et le nom sont obligatoires.";
    return;
  }

  isSaving.value = true;

  try {
    profile.value = await updateProfessorProfile(editForm.value);
    syncAuthUser(profile.value.user);
    isEditing.value = false;
    successMessage.value = "Profil professeur mis à jour.";
  } catch (error) {
    console.error("Erreur modification profil professeur :", error);
    errorMessage.value =
      error?.response?.data?.message || "Impossible de mettre à jour le profil.";
  } finally {
    isSaving.value = false;
  }
};

const openPicturePicker = () => {
  pictureInput.value?.click();
};

const handleProfilePictureChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file || !profile.value) return;

  errorMessage.value = "";
  successMessage.value = "";

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    errorMessage.value = "Format image non autorisé. Utilisez JPG, PNG ou WebP.";
    event.target.value = "";
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    errorMessage.value = "La photo doit faire moins de 3 Mo.";
    event.target.value = "";
    return;
  }

  isUploadingPicture.value = true;

  try {
    const data = await uploadProfessorProfilePicture(file);
    profile.value = {
      ...profile.value,
      user: {
        ...profile.value.user,
        profilePicture: data.profilePicture,
      },
    };
    syncAuthUser(profile.value.user);
    successMessage.value = "Photo de profil mise à jour.";
  } catch (error) {
    console.error("Erreur upload photo professeur :", error);
    errorMessage.value =
      error?.response?.data?.message || "Impossible de changer la photo.";
  } finally {
    isUploadingPicture.value = false;
    event.target.value = "";
  }
};

onMounted(loadProfile);
</script>

<template>
  <section class="professor-profile-page">
    <div v-if="isLoading" class="state-card">Chargement du profil...</div>

    <div v-else-if="errorMessage" class="state-card error">
      {{ errorMessage }}
    </div>

    <template v-else-if="profile">
      <header class="profile-header">
        <div class="avatar-block">
          <img
            v-if="profile.user.profilePicture"
            :src="buildBackendUrl(profile.user.profilePicture)"
            alt="Photo professeur"
          />
          <div v-else class="profile-avatar">
            {{ getInitials(profile.user.fullName) }}
          </div>
        </div>

        <div>
          <span>PROFIL PROFESSEUR</span>
          <h1>{{ profile.user.fullName }}</h1>
          <p>{{ profile.user.email }}</p>
        </div>

        <div class="header-actions">
          <input
            ref="pictureInput"
            class="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="handleProfilePictureChange"
          />
          <button
            type="button"
            class="secondary-btn"
            :disabled="isUploadingPicture"
            @click="openPicturePicker"
          >
            <span class="material-icons-round">photo_camera</span>
            {{ isUploadingPicture ? "Upload..." : "Changer photo" }}
          </button>
          <button
            v-if="!isEditing"
            type="button"
            class="primary-btn"
            @click="startEdit"
          >
            <span class="material-icons-round">edit</span>
            Modifier
          </button>
        </div>
      </header>

      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <div class="profile-grid">
        <section v-if="isEditing" class="profile-panel wide edit-panel">
          <h2>Modifier les informations</h2>

          <div class="form-grid">
            <label>
              <span>Prénom</span>
              <input v-model="editForm.firstName" type="text" />
            </label>
            <label>
              <span>Nom</span>
              <input v-model="editForm.lastName" type="text" />
            </label>
            <label>
              <span>Téléphone</span>
              <input v-model="editForm.phone" type="tel" />
            </label>
            <label>
              <span>Grade</span>
              <input v-model="editForm.grade" type="text" />
            </label>
            <label>
              <span>Spécialité</span>
              <input v-model="editForm.specialty" type="text" />
            </label>
            <label>
              <span>Département</span>
              <input v-model="editForm.department" type="text" />
            </label>
          </div>

          <footer class="edit-actions">
            <button type="button" class="secondary-btn" @click="cancelEdit">
              Annuler
            </button>
            <button
              type="button"
              class="primary-btn"
              :disabled="isSaving"
              @click="saveProfile"
            >
              {{ isSaving ? "Enregistrement..." : "Enregistrer" }}
            </button>
          </footer>
        </section>

        <section v-else class="profile-panel">
          <h2>Informations academiques</h2>

          <div class="info-list">
            <div>
              <span>Matricule</span>
              <strong>{{ profile.profile.employeeId || "-" }}</strong>
            </div>
            <div>
              <span>Grade</span>
              <strong>{{ profile.profile.grade || "-" }}</strong>
            </div>
            <div>
              <span>Specialite</span>
              <strong>{{ profile.profile.specialty || "-" }}</strong>
            </div>
            <div>
              <span>Departement</span>
              <strong>{{ profile.profile.department || "-" }}</strong>
            </div>
          </div>
        </section>

        <section v-if="!isEditing" class="profile-panel">
          <h2>Compte</h2>

          <div class="info-list">
            <div>
              <span>Telephone</span>
              <strong>{{ profile.user.phone || "-" }}</strong>
            </div>
            <div>
              <span>Statut</span>
              <strong>{{ profile.user.accountStatus }}</strong>
            </div>
            <div>
              <span>Derniere connexion</span>
              <strong>{{ formatDate(profile.user.lastLoginAt) }}</strong>
            </div>
            <div>
              <span>Creation</span>
              <strong>{{ formatDate(profile.user.createdAt) }}</strong>
            </div>
          </div>
        </section>

        <section class="profile-panel wide">
          <h2>Stages supervises</h2>

          <div v-if="profile.supervisedInternships.length" class="table-list">
            <article
              v-for="internship in profile.supervisedInternships"
              :key="internship.id"
              class="table-row"
            >
              <div>
                <strong>{{ internship.hostOrganization }}</strong>
                <p>
                  {{ internship.student?.fullName || "Etudiant non renseigne" }}
                </p>
              </div>
              <span>{{ internship.validationStatus }}</span>
              <small>
                {{ formatDate(internship.startDate) }} -
                {{ formatDate(internship.endDate) }}
              </small>
            </article>
          </div>

          <p v-else class="empty-text">Aucun stage supervise.</p>
        </section>

        <section class="profile-panel wide">
          <h2>Dernieres validations</h2>

          <div
            v-if="
              profile.recentProjectValidations.length ||
              profile.recentInternshipValidations.length
            "
            class="table-list"
          >
            <article
              v-for="validation in profile.recentProjectValidations"
              :key="`project-${validation.id}`"
              class="table-row"
            >
              <div>
                <strong>{{ validation.project?.title || "Projet" }}</strong>
                <p>
                  {{
                    validation.project?.studentName || "Etudiant non renseigne"
                  }}
                </p>
              </div>
              <span>{{ validation.decision }}</span>
              <small>{{ formatDate(validation.decisionDate) }}</small>
            </article>

            <article
              v-for="validation in profile.recentInternshipValidations"
              :key="`internship-${validation.id}`"
              class="table-row"
            >
              <div>
                <strong>{{
                  validation.internship?.hostOrganization || "Stage"
                }}</strong>
                <p>
                  {{
                    validation.internship?.studentName ||
                    "Etudiant non renseigne"
                  }}
                </p>
              </div>
              <span>{{ validation.decision }}</span>
              <small>{{ formatDate(validation.decisionDate) }}</small>
            </article>
          </div>

          <p v-else class="empty-text">Aucune validation recente.</p>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.professor-profile-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-header,
.profile-panel,
.state-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.avatar-block {
  flex: 0 0 auto;
}

.profile-header img,
.profile-avatar {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
}

.profile-header img {
  object-fit: cover;
}

.profile-avatar {
  display: grid;
  place-items: center;
  background: var(--app-primary);
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 800;
}

.profile-header span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
}

.profile-header h1 {
  margin: 0.25rem 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.7rem, 2.4vw, 2.3rem);
  font-weight: 500;
}

.profile-header p {
  margin: 0;
  color: var(--app-muted);
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.success-text,
.error-text {
  margin: 0;
  border-radius: var(--app-radius-md);
  padding: 0.85rem 1rem;
  font-size: var(--app-text-sm);
}

.success-text {
  background: #ecfdf3;
  color: #26734d;
}

.error-text {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.profile-panel {
  padding: 1.1rem;
}

.profile-panel.wide {
  grid-column: 1 / -1;
}

.profile-panel h2 {
  margin: 0 0 1rem;
  color: var(--app-heading);
  font-size: var(--app-text-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.form-grid label {
  display: grid;
  gap: 0.35rem;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.form-grid input {
  min-height: 2.75rem;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-text);
  font: inherit;
  padding: 0 0.85rem;
  outline: none;
}

.form-grid input:focus {
  border-color: var(--app-primary);
  box-shadow: 0 0 0 3px var(--app-active-bg);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  margin-top: 1.15rem;
}

.primary-btn,
.secondary-btn {
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
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

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.primary-btn .material-icons-round,
.secondary-btn .material-icons-round {
  font-size: 1.1rem;
}

.info-list {
  display: grid;
  gap: 0.85rem;
}

.info-list span {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.info-list strong {
  color: var(--app-text);
}

.table-list {
  display: grid;
  gap: 0.65rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.8rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
}

.table-row strong {
  color: var(--app-heading);
}

.table-row p {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
}

.table-row span {
  color: var(--app-primary);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.table-row small,
.empty-text,
.state-card {
  color: var(--app-muted);
}

.state-card {
  padding: 1.4rem;
}

.state-card.error {
  color: var(--app-error);
}

@media (max-width: 760px) {
  .profile-header,
  .table-row {
    align-items: flex-start;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .header-actions,
  .edit-actions {
    width: 100%;
  }

  .header-actions button,
  .edit-actions button {
    flex: 1;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
