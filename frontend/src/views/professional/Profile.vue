<script setup>
import { computed, onMounted, ref } from "vue";

import { buildBackendUrl } from "@/services/backendUrl";
import { getProfessionalProfile } from "@/services/professionalApi";
import { useAuthStore } from "@/stores/auth";

const profile = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");
const profilePictureFailed = ref(false);
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
const valueClass = (value) => ({ "is-empty": !value });

const stateLabels = {
  APPROVED: "Validé",
  PENDING: "En attente",
  REJECTED: "Refusé",
  SUSPENDED: "Suspendu",
};

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

const stateLabel = computed(
  () => stateLabels[currentState.value] || currentState.value,
);

const stateClass = computed(() => currentState.value.toLowerCase());

const hasProfilePicture = computed(
  () =>
    Boolean(profile.value?.user?.profilePicture) && !profilePictureFailed.value,
);

const profilePictureUrl = computed(() =>
  hasProfilePicture.value
    ? buildBackendUrl(profile.value.user.profilePicture)
    : "",
);

const profileBadges = computed(() => {
  if (!profile.value) return [];

  return [
    {
      icon: "business_center",
      label: profile.value.profile?.company || "Entreprise non renseignée",
    },
    {
      icon: "work",
      label: profile.value.profile?.jobTitle || "Poste non renseigné",
    },
  ];
});

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
    syncAuthUser(profile.value.user);
  } catch (error) {
    console.error("Erreur profil professionnel :", error);
    errorMessage.value = "Impossible de charger le profil professionnel.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <section class="professional-profile-page">
    <div v-if="isLoading" class="state-card">Chargement du profil...</div>

    <div v-else-if="errorMessage" class="state-card error">
      {{ errorMessage }}
    </div>

    <template v-else-if="profile">
      <header class="profile-header">
        <div class="avatar-block">
          <img
            v-if="hasProfilePicture"
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
            <span v-for="badge in profileBadges" :key="badge.icon">
              <span class="material-icons-round">{{ badge.icon }}</span>
              {{ badge.label }}
            </span>
          </div>
        </div>

        <span class="status-pill" :class="stateClass">
          <span class="material-icons-round">verified_user</span>
          {{ stateLabel }}
        </span>
      </header>

      <div class="profile-grid">
        <section class="profile-panel">
          <h2>Informations professionnelles</h2>

          <div class="info-list">
            <div>
              <span>Entreprise</span>
              <strong :class="valueClass(profile.profile.company)">
                {{ displayValue(profile.profile.company) }}
              </strong>
            </div>
            <div>
              <span>Poste</span>
              <strong :class="valueClass(profile.profile.jobTitle)">
                {{ displayValue(profile.profile.jobTitle) }}
              </strong>
            </div>
            <div>
              <span>Secteur</span>
              <strong :class="valueClass(profile.profile.sector)">
                {{ displayValue(profile.profile.sector) }}
              </strong>
            </div>
            <div>
              <span>Téléphone</span>
              <strong :class="valueClass(profile.user.phone)">
                {{ displayValue(profile.user.phone) }}
              </strong>
            </div>
          </div>
        </section>

        <section class="profile-panel">
          <h2>Compte</h2>

          <div class="info-list">
            <div>
              <span>Statut</span>
              <strong class="status-pill compact" :class="stateClass">
                {{ stateLabel }}
              </strong>
            </div>
            <div>
              <span>Email vérifié</span>
              <strong>{{ profile.profile.isEmailVerified ? "Oui" : "Non" }}</strong>
            </div>
            <div>
              <span>Validation administrateur</span>
              <strong>{{ profile.profile.isVerified ? "Oui" : "Non" }}</strong>
            </div>
            <div>
              <span>Dernière connexion</span>
              <strong>{{ formatDate(profile.user.lastLoginAt) }}</strong>
            </div>
          </div>
        </section>

        <section class="profile-panel wide">
          <h2>Présentation professionnelle</h2>
          <p class="bio-text" :class="valueClass(profile.profile.bio)">
            {{
              profile.profile.bio ||
              "Aucune présentation professionnelle renseignée."
            }}
          </p>
        </section>

        <section class="profile-panel">
          <h2>Validation</h2>

          <div class="info-list">
            <div>
              <span>Approuvé le</span>
              <strong>{{ formatDate(profile.profile.approvedAt) }}</strong>
            </div>
            <div>
              <span>Approuvé par</span>
              <strong>
                {{
                  profile.profile.approvedByAdministrator?.fullName ||
                  "Non renseigné"
                }}
              </strong>
            </div>
          </div>
        </section>

        <section class="profile-panel">
          <h2>Activité du compte</h2>

          <div class="info-list">
            <div>
              <span>Création</span>
              <strong>{{ formatDate(profile.user.createdAt) }}</strong>
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

.profile-header > .status-pill {
  margin-left: auto;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.profile-panel {
  min-width: 0;
  padding: 1.3rem;
}

.profile-panel.wide {
  grid-column: 1 / -1;
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

.bio-text {
  min-height: 3rem;
  margin: 0;
  padding: 0.65rem 0;
  color: var(--app-heading);
  font-size: var(--app-text-md);
  font-weight: 700;
  line-height: 1.65;
  white-space: pre-line;
}

.info-list strong.is-empty,
.bio-text.is-empty {
  color: var(--app-muted);
  font-style: italic;
  font-weight: 600;
}

.status-pill {
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: var(--app-radius-pill);
  padding: 0 0.75rem;
  background: var(--app-warning-bg);
  color: var(--app-warning);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.status-pill.compact {
  min-height: 1.75rem;
  padding: 0 0.65rem;
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
  .profile-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-header > .status-pill {
    margin-left: 0;
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
