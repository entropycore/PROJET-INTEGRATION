<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";

import { buildBackendUrl } from "@/services/backendUrl";
import {
  createProfessionalRecommendation,
  getProfessionalProfiles,
} from "@/services/professionalApi";

const profiles = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");
const search = ref("");
const selectedDomain = ref("");
const searchTimer = ref(null);
const selectedProfile = ref(null);
const recommendationMessage = ref("");
const recommendationFeedback = ref("");
const recommendationError = ref("");
const isSendingRecommendation = ref(false);

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

const formatProof = (count, singular, plural) =>
  `${count || 0} ${count === 1 ? singular : plural}`;

const getTechnicalSkills = (profile) =>
  (profile.technicalSkills || profile.skills || []).slice(0, 4);

const getSoftSkills = (profile) =>
  (profile.softSkills || []).slice(0, 3);

const getTechnicalSkillsCount = (profile) =>
  (profile.technicalSkills || profile.skills || []).length;

const getSoftSkillsCount = (profile) =>
  (profile.softSkills || []).length;

const getCredibilityLabel = (profile) => {
  const score = profile.credibilityScore?.score ?? profile.credibilityScore;

  if (Number.isFinite(Number(score))) {
    return `${Number(score)}/100`;
  }

  return "";
};

const openRecommendationModal = (profile) => {
  selectedProfile.value = profile;
  recommendationMessage.value = "";
  recommendationFeedback.value = "";
  recommendationError.value = "";
};

const closeRecommendationModal = () => {
  if (isSendingRecommendation.value) return;
  selectedProfile.value = null;
};

const submitRecommendation = async () => {
  const content = recommendationMessage.value.trim();
  if (!selectedProfile.value || !content) return;

  isSendingRecommendation.value = true;
  recommendationFeedback.value = "";
  recommendationError.value = "";

  try {
    await createProfessionalRecommendation({
      portfolioId: selectedProfile.value.id,
      content,
    });
    recommendationFeedback.value =
      "Recommandation envoyée. Elle apparaît maintenant dans l’espace étudiant.";
    recommendationMessage.value = "";
  } catch (error) {
    recommendationError.value =
      error.response?.data?.message || "Impossible d’envoyer la recommandation.";
  } finally {
    isSendingRecommendation.value = false;
  }
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
          <div class="student-identity">
            <img
              v-if="getPictureUrl(profile)"
              :src="getPictureUrl(profile)"
              alt="Photo étudiant"
            />
            <div v-else class="profile-avatar">
              {{ getInitials(profile.student.fullName) }}
            </div>

            <div>
              <h2>{{ profile.student.fullName }}</h2>
              <p>
                {{ profile.student.major || "Filière non renseignée" }}
                <span aria-hidden="true">·</span>
                {{ profile.student.level || "Niveau non renseigné" }}
              </p>
            </div>
          </div>

          <span class="certified-badge">
            <span class="material-icons-round">verified</span>
            Portfolio certifié
          </span>
        </div>

        <p class="profile-description">
          {{
            profile.description ||
            profile.student.bio ||
            "Portfolio étudiant certifié par Credencia."
          }}
        </p>

        <div class="profile-overview">
          <div v-if="getTechnicalSkills(profile).length" class="overview-row">
            <strong>Compétences techniques :</strong>
            <div class="skill-list">
              <span
                v-for="skill in getTechnicalSkills(profile)"
                :key="`technical-${skill}`"
              >
                {{ skill }}
              </span>
              <span v-if="getTechnicalSkillsCount(profile) > 4" class="more-skills">
                +{{ getTechnicalSkillsCount(profile) - 4 }}
              </span>
            </div>
          </div>

          <div v-if="getSoftSkills(profile).length" class="overview-row">
            <strong>Soft Skills :</strong>
            <div class="skill-list">
              <span
                v-for="skill in getSoftSkills(profile)"
                :key="`soft-${skill}`"
              >
                {{ skill }}
              </span>
              <span v-if="getSoftSkillsCount(profile) > 3" class="more-skills">
                +{{ getSoftSkillsCount(profile) - 3 }}
              </span>
            </div>
          </div>

          <div v-if="getCredibilityLabel(profile)" class="overview-row">
            <strong>Score crédibilité :</strong>
            <p>{{ getCredibilityLabel(profile) }}</p>
          </div>

          <div class="overview-row">
            <strong>Réalisations certifiées :</strong>
            <p>
            {{
              formatProof(
                profile.highlights.projectsCount,
                "projet validé",
                "projets validés",
              )
            }}
            <span aria-hidden="true">·</span>
            {{
              formatProof(
                profile.highlights.internshipsCount,
                "stage validé",
                "stages validés",
              )
            }}
            <span aria-hidden="true">·</span>
            <template v-if="Number.isFinite(Number(profile.highlights.badgesCount))">
              {{
                formatProof(
                  profile.highlights.badgesCount,
                  "badge",
                  "badges",
                )
              }}
              <span aria-hidden="true">·</span>
            </template>
            {{
              formatProof(
                profile.highlights.recommendationsCount,
                "recommandation",
                "recommandations",
              )
            }}
            </p>
          </div>
        </div>

        <div class="card-actions">
          <RouterLink :to="`/portfolio/${profile.publicSlug}`">
            <span class="material-icons-round">visibility</span>
            Ouvrir portfolio
          </RouterLink>
          <button
            type="button"
            @click="openRecommendationModal(profile)"
          >
            <span class="material-icons-round">recommend</span>
            Recommander
          </button>
        </div>
      </article>
    </div>

    <p v-else class="empty-text">Aucun profil public ne correspond a la recherche.</p>

    <div
      v-if="selectedProfile"
      class="recommendation-overlay"
      @click.self="closeRecommendationModal"
    >
      <section class="recommendation-modal" role="dialog" aria-modal="true">
        <header class="recommendation-modal-header">
          <span class="recommendation-modal-icon" aria-hidden="true">
            <span class="material-icons-round">recommend</span>
          </span>
          <div class="recommendation-modal-title">
            <h2>Recommander ce profil</h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            :disabled="isSendingRecommendation"
            @click="closeRecommendationModal"
          >
            <span class="material-icons-round">close</span>
          </button>
        </header>

        <p class="recommendation-description">
          Partagez une recommandation professionnelle qui valorise les qualités
          et compétences de cet étudiant.
        </p>

        <div class="recommendation-student">
          <div class="profile-avatar">
            {{ getInitials(selectedProfile.student.fullName) }}
          </div>
          <div>
            <strong>{{ selectedProfile.student.fullName }}</strong>
            <p>
              {{ selectedProfile.student.major || "Filière non renseignée" }}
              <span aria-hidden="true">·</span>
              {{ getCredibilityLabel(selectedProfile) }}
            </p>
          </div>
        </div>

        <label class="recommendation-field">
          <span class="recommendation-label-row">
            <strong>Message de recommandation</strong>
            <small>{{ recommendationMessage.length }}/2000</small>
          </span>
          <textarea
            v-model="recommendationMessage"
            maxlength="2000"
            rows="6"
            placeholder="Décrivez les qualités et compétences qui motivent votre recommandation..."
          ></textarea>
        </label>

        <p v-if="recommendationFeedback" class="recommendation-success">
          {{ recommendationFeedback }}
        </p>
        <p v-if="recommendationError" class="recommendation-error">
          {{ recommendationError }}
        </p>

        <footer class="recommendation-actions">
          <button
            type="button"
            :disabled="isSendingRecommendation"
            @click="closeRecommendationModal"
          >
            <span class="material-icons-round">close</span>
            Annuler
          </button>
          <button
            type="button"
            :disabled="!recommendationMessage.trim() || isSendingRecommendation"
            @click="submitRecommendation"
          >
            <span class="material-icons-round">
              {{ isSendingRecommendation ? "hourglass_top" : "send" }}
            </span>
            {{
              isSendingRecommendation
                ? "Envoi en cours..."
                : "Envoyer la recommandation"
            }}
          </button>
        </footer>
      </section>
    </div>
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
}

.profile-card {
  min-width: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  font-size: 1rem;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.profile-card:hover {
  transform: translateY(-0.18rem);
  border-color: var(--app-active-border);
  box-shadow: var(--app-shadow-popover);
}

.profile-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.student-identity {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.student-identity img,
.profile-avatar {
  width: 3.75rem;
  height: 3.75rem;
  flex: 0 0 auto;
  border-radius: 50%;
  border: 2px solid var(--app-active-border);
}

.student-identity img {
  object-fit: cover;
}

.profile-avatar {
  display: grid;
  place-items: center;
  background: var(--app-primary);
  color: #ffffff;
  font-weight: 800;
}

.student-identity div {
  min-width: 0;
}

.student-identity h2 {
  margin: 0;
  color: var(--app-heading);
  font-size: 1.2rem;
  overflow-wrap: anywhere;
}

.student-identity p,
.profile-description {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.95rem;
}

.student-identity p {
  margin-top: 0.22rem;
}

.certified-badge {
  min-height: 1.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  flex: 0 0 auto;
  border-radius: var(--app-radius-pill);
  padding: 0 0.6rem;
  background: var(--app-success-bg);
  color: var(--app-success);
  font-size: var(--app-text-xs);
  font-weight: 800;
  white-space: nowrap;
}

.certified-badge .material-icons-round {
  font-size: 1rem;
}

.profile-description {
  min-height: 2.9rem;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.45;
}

.profile-overview {
  display: grid;
  gap: 0.62rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--app-border);
}

.overview-row {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.38rem 0.5rem;
}

.overview-row > strong {
  flex: 0 0 auto;
  color: #2f575d;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.8rem;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.32rem;
}

.skill-list span {
  min-height: 1.65rem;
  display: inline-flex;
  align-items: center;
  border-radius: var(--app-radius-pill);
  padding: 0 0.55rem;
  border: 1px solid var(--app-active-border);
  background: var(--app-surface-soft);
  color: var(--app-primary);
  font-size: 0.9rem;
  font-weight: 800;
}

.skill-list .more-skills,
.skill-list .empty-skill {
  border-color: var(--app-border);
  color: var(--app-muted);
  font-weight: 700;
}

.overview-row p {
  margin: 0;
  color: var(--app-muted);
  font-size: 0.95rem;
  line-height: 1.8rem;
}

.card-actions {
  margin-top: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
}

.card-actions a,
.card-actions button {
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  border-radius: var(--app-radius-md);
  border: 1px solid var(--app-primary);
  background: var(--app-surface);
  color: var(--app-primary);
  font: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.card-actions .material-icons-round {
  color: inherit;
  font-size: 1.05rem;
}

.card-actions a {
  background: var(--app-primary);
  color: #ffffff;
}

.card-actions a:hover {
  background: var(--app-heading);
  color: #ffffff;
}

.card-actions button {
  border-color: var(--app-primary);
  color: var(--app-primary);
}

.card-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.78;
}

.recommendation-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(0.12rem);
}

.recommendation-modal {
  width: min(100%, 39rem);
  padding: 1.35rem;
  display: grid;
  gap: 1rem;
  border: 1px solid var(--app-border);
  border-top: 0.28rem solid var(--app-primary);
  border-radius: var(--app-radius-panel);
  background:
    linear-gradient(180deg, var(--app-active-bg) 0, var(--app-surface) 5rem),
    var(--app-surface);
  box-shadow: var(--app-shadow-popover);
}

.recommendation-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.recommendation-modal-icon {
  width: 2.8rem;
  height: 2.8rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--app-active-bg);
  color: var(--app-primary);
}

.recommendation-modal-icon .material-icons-round {
  font-size: 1.35rem;
}

.recommendation-modal-title {
  min-width: 0;
  flex: 1;
}

.recommendation-modal-header h2 {
  margin: 0.25rem 0 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.45rem, 2vw, 1.75rem);
  font-weight: 600;
  line-height: 1.15;
}

.recommendation-modal-header button {
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-muted);
  cursor: pointer;
}

.recommendation-description {
  margin: 0;
  color: var(--app-muted);
  line-height: 1.55;
}

.recommendation-student {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.recommendation-student .profile-avatar {
  width: 2.8rem;
  height: 2.8rem;
}

.recommendation-student strong {
  color: var(--app-heading);
}

.recommendation-student p {
  margin: 0.18rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
}

.recommendation-field {
  display: grid;
  gap: 0.4rem;
}

.recommendation-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.recommendation-label-row strong {
  color: var(--app-heading);
  font-size: var(--app-text-sm);
  font-weight: 800;
}

.recommendation-label-row small {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
}

.recommendation-field textarea {
  width: 100%;
  resize: vertical;
  min-height: 9rem;
  max-height: 16rem;
  border: 1px solid var(--app-border-strong);
  border-radius: var(--app-radius-md);
  padding: 0.75rem;
  background: var(--app-surface);
  color: var(--app-text);
  font: inherit;
  line-height: 1.5;
  outline: none;
}

.recommendation-field textarea:focus {
  border-color: var(--app-primary);
  box-shadow: 0 0 0 3px var(--app-active-bg);
}

.recommendation-success,
.recommendation-error {
  margin: 0;
  padding: 0.7rem 0.8rem;
  border-radius: var(--app-radius-md);
  font-size: var(--app-text-sm);
  font-weight: 700;
}

.recommendation-success {
  background: var(--app-success-bg);
  color: var(--app-success);
}

.recommendation-error {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.recommendation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--app-border);
}

.recommendation-actions button {
  min-height: 2.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid var(--app-primary);
  border-radius: var(--app-radius-md);
  padding: 0 1rem;
  background: var(--app-surface);
  color: var(--app-primary);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.recommendation-actions .material-icons-round {
  font-size: 1.05rem;
}

.recommendation-actions button:last-child {
  background: var(--app-primary);
  color: #ffffff;
}

.recommendation-actions button:disabled,
.recommendation-modal-header button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

@media (max-width: 760px) {
  .toolbar-panel,
  .profiles-grid {
    grid-template-columns: 1fr;
  }

  .profile-top {
    flex-direction: column;
  }

  .card-actions {
    grid-template-columns: 1fr;
  }

  .recommendation-actions {
    display: grid;
  }
}

@media (max-width: 1100px) {
  .profiles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
