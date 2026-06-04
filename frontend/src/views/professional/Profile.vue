<script setup>
import { computed, onMounted, ref } from "vue";
import { getProfile } from "@/services/dashboardService";
import { buildBackendUrl } from "@/services/backendUrl";

const profile = ref(null);
const loading = ref(false);
const error = ref("");

const user = computed(() => profile.value?.user || {});
const professional = computed(() => profile.value?.profile || {});

const statusLabel = computed(() => {
  if (professional.value.suspendedAt) return "Suspendu";
  if (professional.value.rejectedAt) return "Refuse";
  if (professional.value.isVerified) return "Valide";
  return "En attente";
});

const loadProfile = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await getProfile("professional");
    profile.value = response.data;
  } catch {
    error.value = "Impossible de charger le profil professionnel.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <section class="professional-profile-page">
    <h1>Profil professionnel</h1>

    <p v-if="loading" class="state">Chargement...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>

    <div v-else-if="profile" class="profile-layout">
      <div class="profile-header">
        <img
          v-if="user.profilePicture"
          :src="buildBackendUrl(user.profilePicture)"
          alt=""
          class="avatar"
        />
        <div v-else class="avatar fallback">
          {{ user.fullName?.charAt(0).toUpperCase() || "P" }}
        </div>

        <div>
          <h2>{{ user.fullName || "Professionnel" }}</h2>
          <p>{{ user.email }}</p>
        </div>
      </div>

      <dl class="info-list">
        <div>
          <dt>Entreprise</dt>
          <dd>{{ professional.company || "Non renseignee" }}</dd>
        </div>
        <div>
          <dt>Poste</dt>
          <dd>{{ professional.jobTitle || "Non renseigne" }}</dd>
        </div>
        <div>
          <dt>Secteur</dt>
          <dd>{{ professional.sector || "Non renseigne" }}</dd>
        </div>
        <div>
          <dt>Telephone</dt>
          <dd>{{ user.phone || "Non renseigne" }}</dd>
        </div>
        <div>
          <dt>Statut</dt>
          <dd>{{ statusLabel }}</dd>
        </div>
      </dl>

      <p v-if="professional.bio" class="bio">{{ professional.bio }}</p>
    </div>
  </section>
</template>

<style scoped>
.professional-profile-page {
  padding: 32px;
}

.professional-profile-page h1 {
  margin: 0 0 24px;
  color: #122033;
  font-size: 28px;
}

.profile-layout {
  display: grid;
  gap: 22px;
  max-width: 760px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar.fallback {
  display: grid;
  place-items: center;
  color: #ffffff;
  background: #2563eb;
  font-weight: 700;
  font-size: 24px;
}

.profile-header h2 {
  margin: 0 0 4px;
  color: #1e293b;
}

.profile-header p,
.state,
.bio {
  margin: 0;
  color: #64748b;
}

.info-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
}

.info-list div {
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.info-list dt {
  color: #64748b;
  font-size: 13px;
}

.info-list dd {
  margin: 4px 0 0;
  color: #1e293b;
  font-weight: 600;
}

.error {
  color: #dc2626;
}

@media (max-width: 640px) {
  .professional-profile-page {
    padding: 20px;
  }

  .info-list {
    grid-template-columns: 1fr;
  }
}
</style>
