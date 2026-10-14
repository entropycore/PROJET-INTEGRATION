<script setup>
import { computed, onMounted, reactive, ref } from "vue";

import { buildBackendUrl } from "@/services/backendUrl";
import {
  getProfessionalProfile,
  updateProfessionalProfile,
  uploadProfessionalProfilePicture,
} from "@/services/professionalApi";
import { useAuthStore } from "@/stores/auth";

const profile = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const isUploadingPicture = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const pictureInput = ref(null);
const profilePictureFailed = ref(false);
const profilePictureVersion = ref(Date.now());
const authStore = useAuthStore();

const form = reactive({
  firstName: "",
  lastName: "",
  phone: "",
  company: "",
  jobTitle: "",
  sector: "",
  bio: "",
});

const formatDate = (date) => {
  if (!date) return "Non renseigne";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

const displayValue = (value) => value || "Non renseigne";

const stateLabels = {
  APPROVED: "Valide",
  PENDING: "En attente",
  REJECTED: "Refuse",
  SUSPENDED: "Suspendu",
};

const getStateLabel = (state) => stateLabels[state] || state || "Non renseigne";
const getStateClass = (state) => String(state || "PENDING").toLowerCase();

const currentState = computed(() => {
  const data = profile.value?.profile;
  const status = profile.value?.user?.accountStatus;

  if (status === "SUSPENDED" || data?.suspendedAt) return "SUSPENDED";
  if (data?.rejectedAt || status === "INACTIVE") return "REJECTED";
  if (data?.isVerified || data?.approvedAt || status === "ACTIVE") {
    return "APPROVED";
  }

  return "PENDING";
});

const hasProfilePicture = computed(
  () => Boolean(profile.value?.user?.profilePicture) && !profilePictureFailed.value,
);

const profilePictureUrl = computed(() => {
  if (!hasProfilePicture.value) return "";

  const url = buildBackendUrl(profile.value.user.profilePicture);
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${profilePictureVersion.value}`;
});

const syncForm = (data) => {
  form.firstName = data?.user?.firstName || "";
  form.lastName = data?.user?.lastName || "";
  form.phone = data?.user?.phone || "";
  form.company = data?.profile?.company || "";
  form.jobTitle = data?.profile?.jobTitle || "";
  form.sector = data?.profile?.sector || "";
  form.bio = data?.profile?.bio || "";
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
    profile.value = await getProfessionalProfile();
    profilePictureFailed.value = false;
    syncForm(profile.value);
    syncAuthUser(profile.value.user);
  } catch (error) {
    console.error("Erreur profil professionnel :", error);
    errorMessage.value = "Impossible de charger le profil professionnel.";
  } finally {
    isLoading.value = false;
  }
};

const saveProfile = async () => {
  isSaving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    profile.value = await updateProfessionalProfile({ ...form });
    syncForm(profile.value);
    syncAuthUser(profile.value.user);
    successMessage.value = "Profil professionnel mis a jour.";
  } catch (error) {
    console.error("Erreur sauvegarde profil professionnel :", error);
    errorMessage.value =
      error?.response?.data?.message || "Impossible de sauvegarder le profil.";
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
    errorMessage.value = "Format image non autorise. Utilisez JPG, PNG ou WebP.";
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
    const data = await uploadProfessionalProfilePicture(file);
    profile.value = {
      ...profile.value,
      user: {
        ...profile.value.user,
        profilePicture: data.profilePicture,
      },
    };
    profilePictureFailed.value = false;
    profilePictureVersion.value = Date.now();
    syncAuthUser(profile.value.user);
    successMessage.value = "Photo de profil mise a jour.";
  } catch (error) {
    console.error("Erreur upload photo professionnel :", error);
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
  <section class="professional-profile-page">
    <div v-if="isLoading" class="state-card">Chargement du profil...</div>

    <div v-else-if="errorMessage && !profile" class="state-card error">
      {{ errorMessage }}
    </div>

    <template v-else-if="profile">
      <header class="profile-header">
        <div class="avatar-block">
          <img
            v-if="hasProfilePicture"
            :key="`${profile.user.profilePicture}-${profilePictureVersion}`"
            :src="profilePictureUrl"
            alt="Photo professionnel"
            @error="profilePictureFailed = true"
          />
          <div v-else class="profile-avatar">
            {{ getInitials(profile.user.fullName) }}
          </div>
        </div>

        <div class="profile-identity">
          <span>PROFIL PROFESSIONNEL</span>
          <h1>{{ profile.user.fullName }}</h1>
          <p>{{ profile.user.email }}</p>

          <div class="profile-badges">
            <span>
              <span class="material-icons-round">business_center</span>
              {{ displayValue(profile.profile.company) }}
            </span>
            <span>
              <span class="material-icons-round">verified</span>
              {{ getStateLabel(currentState) }}
            </span>
          </div>
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
            {{ isUploadingPicture ? "Chargement..." : "Changer la photo" }}
          </button>
        </div>
      </header>

      <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <div class="profile-grid">
        <section class="profile-panel wide">
          <div class="panel-header">
            <h2>Informations professionnelles</h2>
            <button type="button" class="primary-btn" :disabled="isSaving" @click="saveProfile">
              <span class="material-icons-round">save</span>
              {{ isSaving ? "Sauvegarde..." : "Sauvegarder" }}
            </button>
          </div>

          <div class="form-grid">
            <label>
              Prenom
              <input v-model="form.firstName" type="text" />
            </label>

            <label>
              Nom
              <input v-model="form.lastName" type="text" />
            </label>

            <label>
              Telephone
              <input v-model="form.phone" type="tel" />
            </label>

            <label>
              Entreprise
              <input v-model="form.company" type="text" />
            </label>

            <label>
              Poste
              <input v-model="form.jobTitle" type="text" />
            </label>

            <label>
              Secteur
              <input v-model="form.sector" type="text" />
            </label>
          </div>

          <label class="bio-field">
            Bio
            <textarea
              v-model="form.bio"
              rows="5"
              placeholder="Presentez votre entreprise, vos besoins de recrutement ou vos domaines d'interet."
            ></textarea>
          </label>
        </section>

        <section class="profile-panel">
          <h2>Etat du compte</h2>

          <div class="info-list">
            <div>
              <span>Statut</span>
              <strong class="status-pill" :class="getStateClass(currentState)">
                {{ getStateLabel(currentState) }}
              </strong>
            </div>
            <div>
              <span>Email verifie</span>
              <strong>{{ profile.profile.isEmailVerified ? "Oui" : "Non" }}</strong>
            </div>
            <div>
              <span>Validation admin</span>
              <strong>{{ profile.profile.isVerified ? "Oui" : "Non" }}</strong>
            </div>
            <div>
              <span>Creation</span>
              <strong>{{ formatDate(profile.user.createdAt) }}</strong>
            </div>
          </div>
        </section>

        <section class="profile-panel">
          <h2>Validation</h2>

          <div class="info-list">
            <div>
              <span>Approuve le</span>
              <strong>{{ formatDate(profile.profile.approvedAt) }}</strong>
            </div>
            <div>
              <span>Approuve par</span>
              <strong>
                {{
                  profile.profile.approvedByAdministrator?.fullName ||
                  "Non renseigne"
                }}
              </strong>
            </div>
            <div v-if="profile.profile.rejectionReason">
              <span>Motif de refus</span>
              <strong>{{ profile.profile.rejectionReason }}</strong>
            </div>
            <div v-if="profile.profile.suspensionReason">
              <span>Motif de suspension</span>
              <strong>{{ profile.profile.suspensionReason }}</strong>
            </div>
          </div>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.professional-profile-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--app-text);
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
  gap: 1.1rem;
  padding: 1.35rem;
}

.avatar-block {
  flex: 0 0 auto;
}

.profile-header img,
.profile-avatar {
  width: 5.2rem;
  height: 5.2rem;
  border-radius: 50%;
  border: 2px solid var(--app-active-border);
  box-shadow: 0 0.75rem 1.5rem rgba(15, 23, 42, 0.08);
}

.profile-header img {
  object-fit: cover;
}

.profile-avatar {
  display: grid;
  place-items: center;
  background: var(--app-primary);
  color: #ffffff;
  font-size: 1.55rem;
  font-weight: 800;
}

.profile-identity {
  min-width: 0;
}

.profile-identity > span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
}

.profile-identity h1 {
  margin: 0.25rem 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.7rem, 2.4vw, 2.3rem);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.profile-identity p {
  margin: 0;
  color: var(--app-muted);
}

.profile-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.75rem;
}

.profile-badges span {
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-pill);
  background: var(--app-surface-soft);
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  padding: 0 0.7rem;
}

.profile-badges .material-icons-round {
  color: var(--app-primary);
  font-size: 1rem;
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
  min-width: 0;
}

.profile-panel.wide {
  grid-column: 1 / -1;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.profile-panel h2,
.panel-header h2 {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-text-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

label {
  display: grid;
  gap: 0.4rem;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  font-weight: 800;
}

input,
textarea {
  width: 100%;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
  color: var(--app-text);
  font: inherit;
  font-weight: 600;
}

input {
  min-height: 2.75rem;
  padding: 0 0.85rem;
}

textarea {
  min-height: 8rem;
  padding: 0.85rem;
  resize: vertical;
}

.bio-field {
  margin-top: 0.85rem;
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
  border: none;
  background: var(--app-primary);
  color: #ffffff;
}

.primary-btn .material-icons-round {
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

.info-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 1rem;
}

.info-list > div {
  min-height: 3.25rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
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
  overflow-wrap: anywhere;
}

.status-pill {
  width: fit-content;
  min-height: 1.75rem;
  display: inline-flex;
  align-items: center;
  border-radius: var(--app-radius-pill);
  padding: 0 0.7rem;
  background: var(--app-warning-bg);
  color: var(--app-warning);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.status-pill.approved {
  background: var(--app-success-bg);
  color: var(--app-success);
}

.status-pill.rejected,
.status-pill.suspended {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.state-card {
  padding: 1.4rem;
  color: var(--app-muted);
}

.state-card.error {
  color: var(--app-error);
}

@media (max-width: 760px) {
  .profile-header,
  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions,
  .header-actions button {
    width: 100%;
  }

  .profile-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
