<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";

import { buildBackendUrl } from "@/services/backendUrl";
import { getProfessionalProfiles } from "@/services/professionalApi";

const profiles = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");
const search = ref("");
const selectedDomain = ref("");
const searchTimer = ref(null);

const formatDate = (date) => {
  if (!date) return "Non renseigne";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const domains = computed(() => {
  const values = profiles.value
    .map((profile) => profile.targetDomain)
    .filter(Boolean);

  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
});

const filteredProfiles = computed(() => {
  if (!selectedDomain.value) return profiles.value;

  return profiles.value.filter(
    (profile) => profile.targetDomain === selectedDomain.value,
  );
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

const getPictureUrl = (profile) => {
  const picture = profile.student?.profilePicture;
  return picture ? buildBackendUrl(picture) : "";
};

const loadProfiles = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const data = await getProfessionalProfiles({
      q: search.value || undefined,
      limit: 30,
    });
    profiles.value = data.items || [];
  } catch (error) {
    console.error("Erreur profils professionnels :", error);
    errorMessage.value = "Impossible de charger les profils publics.";
  } finally {
    isLoading.value = false;
  }
};

watch(search, () => {
  window.clearTimeout(searchTimer.value);
  searchTimer.value = window.setTimeout(loadProfiles, 350);
});

onMounted(loadProfiles);
</script>

<template>
  <section class="professional-profiles-page">
    <header class="page-header">
      <div>
        <span>RECHERCHE TALENTS</span>
        <h1>Profils etudiants</h1>
        <p>Explorez les portfolios publics generes et valides par les etudiants.</p>
      </div>
    </header>

    <section class="toolbar-panel">
      <label class="search-field">
        <span class="material-icons-round">search</span>
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher par nom, filiere, objectif..."
        />
      </label>

      <select v-model="selectedDomain">
        <option value="">Tous les objectifs</option>
        <option v-for="domain in domains" :key="domain" :value="domain">
          {{ domain }}
        </option>
      </select>
    </section>

    <div v-if="isLoading" class="state-card">Chargement des profils...</div>

    <div v-else-if="errorMessage" class="state-card error">
      {{ errorMessage }}
    </div>

    <div v-else-if="filteredProfiles.length" class="profiles-grid">
      <article
        v-for="profile in filteredProfiles"
        :key="profile.id"
        class="profile-card"
      >
        <div class="profile-top">
          <img
            v-if="getPictureUrl(profile)"
            :src="getPictureUrl(profile)"
            alt="Photo etudiant"
          />
          <div v-else class="profile-avatar">
            {{ getInitials(profile.student.fullName) }}
          </div>

          <div>
            <h2>{{ profile.student.fullName }}</h2>
            <p>{{ profile.student.major }} - {{ profile.student.level }}</p>
          </div>
        </div>

        <p class="profile-description">
          {{ profile.description || profile.student.bio || "Portfolio public etudiant." }}
        </p>

        <div class="skill-list">
          <span v-for="skill in profile.skills.slice(0, 5)" :key="skill">
            {{ skill }}
          </span>
          <span v-if="!profile.skills.length">Competences a consulter</span>
        </div>

        <div class="metric-row">
          <div>
            <strong>{{ profile.highlights.projectsCount }}</strong>
            <span>Projets</span>
          </div>
          <div>
            <strong>{{ profile.highlights.internshipsCount }}</strong>
            <span>Stages</span>
          </div>
          <div>
            <strong>{{ profile.highlights.recommendationsCount }}</strong>
            <span>Reco.</span>
          </div>
        </div>

        <div class="profile-meta">
          <span>
            <span class="material-icons-round">flag</span>
            {{ profile.targetDomain || "Objectif non renseigne" }}
          </span>
          <span>
            <span class="material-icons-round">update</span>
            {{ formatDate(profile.updatedAt || profile.generatedAt) }}
          </span>
        </div>

        <div class="card-actions">
          <RouterLink :to="`/portfolio/${profile.publicSlug}`">
            <span class="material-icons-round">open_in_new</span>
            Ouvrir portfolio
          </RouterLink>
        </div>
      </article>
    </div>

    <p v-else class="empty-text">Aucun profil public ne correspond a la recherche.</p>
  </section>
</template>

<style scoped>
.professional-profiles-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--app-text);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.page-header span {
  color: var(--app-subtle);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.06em;
}

.page-header h1 {
  margin: 0.35rem 0 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.8rem, 2.4vw, 2.4rem);
  font-weight: 500;
}

.page-header p {
  margin: 0.45rem 0 0;
  color: var(--app-muted);
}

.toolbar-panel,
.profile-card,
.state-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.toolbar-panel {
  display: grid;
  grid-template-columns: 1fr minmax(13rem, 18rem);
  gap: 1rem;
  padding: 1rem;
}

.search-field {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.9rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  padding: 0 0.8rem;
  background: var(--app-surface-soft);
}

.search-field .material-icons-round {
  color: var(--app-muted);
}

.search-field input,
select {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--app-text);
  font: inherit;
  font-weight: 700;
}

select {
  min-height: 2.9rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  padding: 0 0.8rem;
  background: var(--app-surface-soft);
}

.profiles-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.profile-card {
  min-width: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.profile-top img,
.profile-avatar {
  width: 3.6rem;
  height: 3.6rem;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 2px solid var(--app-active-border);
}

.profile-top img {
  object-fit: cover;
}

.profile-avatar {
  display: grid;
  place-items: center;
  background: var(--app-primary);
  color: #ffffff;
  font-weight: 800;
}

.profile-top div {
  min-width: 0;
}

.profile-top h2 {
  margin: 0;
  color: var(--app-heading);
  font-size: 1.05rem;
  overflow-wrap: anywhere;
}

.profile-top p,
.profile-description {
  margin: 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
}

.profile-description {
  min-height: 3rem;
  line-height: 1.45;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.skill-list span {
  min-height: 1.8rem;
  display: inline-flex;
  align-items: center;
  border-radius: var(--app-radius-pill);
  padding: 0 0.65rem;
  background: var(--app-active-bg);
  color: var(--app-primary);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.metric-row div {
  min-height: 3.4rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.metric-row strong {
  color: var(--app-heading);
  font-size: 1.35rem;
  line-height: 1;
}

.metric-row span {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.profile-meta {
  display: grid;
  gap: 0.35rem;
}

.profile-meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.profile-meta .material-icons-round {
  color: var(--app-primary);
  font-size: 1rem;
}

.card-actions {
  margin-top: auto;
}

.card-actions a {
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  border-radius: var(--app-radius-md);
  background: var(--app-primary);
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
}

.card-actions .material-icons-round {
  color: #ffffff;
}

.empty-text,
.state-card {
  margin: 0;
  color: var(--app-muted);
}

.empty-text {
  padding: 1rem;
  border: 1px dashed var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.state-card {
  padding: 1.4rem;
}

.state-card.error {
  color: var(--app-error);
}

@media (max-width: 1100px) {
  .profiles-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .toolbar-panel,
  .profiles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
