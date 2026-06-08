<script setup>
import { computed, onMounted, ref } from "vue";

import { buildBackendUrl } from "@/services/backendUrl";
import {
  getProfessorProfile,
  uploadProfessorProfilePicture,
} from "@/services/professorApi";
import { useAuthStore } from "@/stores/auth";

const profile = ref(null);
const isLoading = ref(true);
const isUploadingPicture = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const pictureInput = ref(null);
const profilePictureFailed = ref(false);
const profilePictureVersion = ref(Date.now());
const authStore = useAuthStore();

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
  if (!date) return "Non renseigné";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const displayValue = (value) => value || "Non renseigné";

const getStatusClass = (status) => String(status || "").toLowerCase();

const accountStatusLabels = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  PENDING: "En attente",
  SUSPENDED: "Suspendu",
  BLOCKED: "Bloqué",
};

const getAccountStatusLabel = (status) =>
  accountStatusLabels[status] || status || "Non renseigné";

const hasProfilePicture = computed(
  () =>
    Boolean(profile.value?.user?.profilePicture) && !profilePictureFailed.value,
);

const profilePictureUrl = computed(() => {
  if (!hasProfilePicture.value) return "";

  const url = buildBackendUrl(profile.value.user.profilePicture);
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}v=${profilePictureVersion.value}`;
});

const profileBadges = computed(() => {
  if (!profile.value) return [];

  return [
    {
      icon: "badge",
      label: profile.value.profile?.employeeId || "Matricule non renseigné",
    },
    {
      icon: "school",
      label: profile.value.profile?.department || "Département non renseigné",
    },
  ];
});

const valueClass = (value) => ({ "is-empty": !value });

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
    profilePictureFailed.value = false;
    syncAuthUser(profile.value.user);
  } catch (error) {
    console.error("Erreur profil professeur :", error);
    errorMessage.value = "Impossible de charger le profil professeur.";
  } finally {
    isLoading.value = false;
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
    errorMessage.value =
      "Format image non autorisé. Utilisez JPG, PNG ou WebP.";
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
    profilePictureFailed.value = false;
    profilePictureVersion.value = Date.now();
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
            v-if="hasProfilePicture"
            :key="`${profile.user.profilePicture}-${profilePictureVersion}`"
            :src="profilePictureUrl"
            alt="Photo professeur"
            @error="profilePictureFailed = true"
          />
          <div v-else class="profile-avatar">
            {{ getInitials(profile.user.fullName) }}
          </div>
        </div>

        <div class="profile-identity">
          <span>PROFIL PROFESSEUR</span>
          <h1>{{ profile.user.fullName }}</h1>
          <p>{{ profile.user.email }}</p>

          <div class="profile-badges">
            <span v-for="badge in profileBadges" :key="badge.icon">
              <span class="material-icons-round">{{ badge.icon }}</span>
              {{ badge.label }}
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
        <section class="profile-panel">
          <h2>Informations académiques</h2>

          <div class="info-list">
            <div>
              <span>Matricule</span>
              <strong :class="valueClass(profile.profile?.employeeId)">
                {{ displayValue(profile.profile?.employeeId) }}
              </strong>
            </div>
            <div>
              <span>Grade</span>
              <strong :class="valueClass(profile.profile?.grade)">
                {{ displayValue(profile.profile?.grade) }}
              </strong>
            </div>
            <div>
              <span>Spécialité</span>
              <strong :class="valueClass(profile.profile?.specialty)">
                {{ displayValue(profile.profile?.specialty) }}
              </strong>
            </div>
            <div>
              <span>Département</span>
              <strong :class="valueClass(profile.profile?.department)">
                {{ displayValue(profile.profile?.department) }}
              </strong>
            </div>
          </div>
        </section>

        <section class="profile-panel">
          <h2>Compte</h2>

          <div class="info-list">
            <div>
              <span>Téléphone</span>
              <strong :class="valueClass(profile.user.phone)">
                {{ displayValue(profile.user.phone) }}
              </strong>
            </div>
            <div>
              <span>Statut</span>
              <strong
                class="account-status-pill"
                :class="getStatusClass(profile.user.accountStatus)"
              >
                {{ getAccountStatusLabel(profile.user.accountStatus) }}
              </strong>
            </div>
            <div>
              <span>Dernière connexion</span>
              <strong>{{ formatDate(profile.user.lastLoginAt) }}</strong>
            </div>
            <div>
              <span>Création</span>
              <strong>{{ formatDate(profile.user.createdAt) }}</strong>
            </div>
          </div>
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
  gap: 1.1rem;
  padding: 1.35rem;
}

.avatar-block {
  position: relative;
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
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent),
    var(--app-primary);
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
  padding: 1.3rem;
  min-width: 0;
}

.profile-panel h2 {
  margin: 0 0 1.15rem;
  color: var(--app-primary);
  font-family: var(--app-font-body);
  font-size: 1rem;
  font-weight: 900;
}

.profile-panel h2::after {
  content: "";
  display: block;
  width: 2.7rem;
  height: 3px;
  margin-top: 0.45rem;
  border-radius: var(--app-radius-pill);
  background: linear-gradient(90deg, var(--app-primary), var(--app-accent));
}

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

.secondary-btn {
  border: 1px solid var(--app-border-strong);
  background: var(--app-surface);
  color: var(--app-primary);
}

.secondary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.secondary-btn .material-icons-round {
  font-size: 1.1rem;
}

.info-list {
  display: grid;
  gap: 0;
}

.info-list > div {
  min-height: 3rem;
  display: grid;
  grid-template-columns: minmax(8.5rem, 40%) minmax(0, 1fr);
  align-items: center;
  gap: 1.25rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--app-neutral-bg);
}

.info-list > div:last-child {
  border-bottom: 0;
}

.info-list span {
  margin: 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  font-weight: 600;
}

.info-list strong {
  color: var(--app-heading);
  font-size: var(--app-text-md);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.info-list strong.is-empty {
  color: var(--app-muted);
  font-weight: 600;
  font-style: italic;
}

.account-status-pill {
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

.account-status-pill.active {
  background: var(--app-success-bg);
  color: var(--app-success);
}

.account-status-pill.inactive,
.account-status-pill.suspended,
.account-status-pill.blocked {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.account-status-pill.pending {
  background: var(--app-warning-bg);
  color: var(--app-warning);
}

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
  .profile-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .info-list > div {
    grid-template-columns: 1fr;
    gap: 0.2rem;
    padding: 0.55rem 0;
  }
}
</style>
