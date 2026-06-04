<script setup>
import { onMounted, ref } from "vue";
import api from "@/services/api";
import { buildBackendUrl } from "@/services/backendUrl";

const profiles = ref([]);
const loading = ref(false);
const error = ref("");

const loadProfiles = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await api.get("/portfolio");
    profiles.value = response.data?.data || [];
  } catch {
    error.value = "Impossible de charger les profils publics.";
  } finally {
    loading.value = false;
  }
};

const getInitial = (profile) =>
  profile.student?.fullName?.charAt(0).toUpperCase() || "E";

onMounted(loadProfiles);
</script>

<template>
  <section class="profiles-page">
    <div class="profiles-head">
      <h1>Profils publics</h1>
      <p>Portfolios etudiants publies sur la plateforme.</p>
    </div>

    <p v-if="loading" class="profiles-state">Chargement...</p>
    <p v-else-if="error" class="profiles-state error">{{ error }}</p>
    <p v-else-if="!profiles.length" class="profiles-state">
      Aucun portfolio public pour le moment.
    </p>

    <div v-else class="profiles-list">
      <article
        v-for="profile in profiles"
        :key="profile.id"
        class="profile-item"
      >
        <img
          v-if="profile.student?.profilePicture"
          :src="buildBackendUrl(profile.student.profilePicture)"
          alt=""
          class="profile-avatar"
        />
        <div v-else class="profile-avatar fallback">{{ getInitial(profile) }}</div>

        <div class="profile-main">
          <h2>{{ profile.student?.fullName || "Etudiant" }}</h2>
          <p class="profile-meta">
            {{ profile.student?.major || "Formation non renseignee" }}
            <span v-if="profile.student?.level">- {{ profile.student.level }}</span>
          </p>
          <p v-if="profile.description" class="profile-description">
            {{ profile.description }}
          </p>
        </div>

        <RouterLink class="profile-link" :to="`/portfolio/${profile.publicSlug}`">
          Voir
        </RouterLink>
      </article>
    </div>
  </section>
</template>

<style scoped>
.profiles-page {
  padding: 32px;
}

.profiles-head {
  margin-bottom: 24px;
}

.profiles-head h1 {
  margin: 0 0 8px;
  color: #122033;
  font-size: 28px;
}

.profiles-head p,
.profile-meta,
.profile-description,
.profiles-state {
  color: #64748b;
}

.profiles-list {
  display: grid;
  gap: 14px;
}

.profile-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-avatar.fallback {
  display: grid;
  place-items: center;
  color: #ffffff;
  background: #2563eb;
  font-weight: 700;
}

.profile-main h2 {
  margin: 0 0 4px;
  color: #1e293b;
  font-size: 18px;
}

.profile-meta,
.profile-description {
  margin: 0;
}

.profile-description {
  margin-top: 8px;
}

.profile-link {
  padding: 8px 14px;
  border-radius: 6px;
  color: #ffffff;
  background: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.error {
  color: #dc2626;
}

@media (max-width: 640px) {
  .profiles-page {
    padding: 20px;
  }

  .profile-item {
    grid-template-columns: 48px 1fr;
  }

  .profile-link {
    grid-column: 1 / -1;
    text-align: center;
  }
}
</style>
