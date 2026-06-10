<script setup>
import { computed, onMounted, ref } from "vue";

import { getStudentBadges } from "@/services/studentDashboardService";
import { getBadgeIcon } from "@/utils/badges";

const selectedFilter = ref("ALL");
const isLoading = ref(false);

const mockBadges = [
  {
    id: 1,
    name: "Web Developer",
    description: "Badge pour les étudiants actifs en développement web.",
    rule: "3 projets web validés",
    iconUrl: "",
    icon: "terminal",
    isObtained: true,
    obtainedAt: "Mars 2025",
    progress: { current: 3, target: 3 },
  },
  {
    id: 2,
    name: "DevOps Explorer",
    description: "Badge lié aux outils DevOps.",
    rule: "Projet avec Docker + pipeline CI/CD + dépôt GitHub",
    iconUrl: "",
    icon: "cloud_sync",
    isObtained: true,
    obtainedAt: "Avr 2025",
    progress: { current: 3, target: 3 },
  },
  {
    id: 3,
    name: "Hackathon Participant",
    description: "Badge pour participation aux événements.",
    rule: "Participation à un hackathon avec attestation vérifiée",
    iconUrl: "",
    icon: "groups",
    isObtained: true,
    obtainedAt: "Fév 2025",
    progress: { current: 1, target: 1 },
  },
  {
    id: 4,
    name: "Full Stack Developer",
    description: "Badge lié aux compétences frontend et backend.",
    rule: "Projets frontend ET backend validés",
    iconUrl: "",
    icon: "developer_mode",
    isObtained: false,
    obtainedAt: null,
    progress: { current: 1, target: 2 },
  },
  {
    id: 5,
    name: "Security Aware",
    description: "Badge lié aux bonnes pratiques de cybersécurité.",
    rule: "Projet avec bonnes pratiques OWASP documentées",
    iconUrl: "",
    icon: "security",
    isObtained: false,
    obtainedAt: null,
    progress: { current: 0, target: 1 },
  },
  {
    id: 6,
    name: "AI / Data",
    description: "Badge lié aux projets IA ou Data Science.",
    rule: "Projet en IA ou Data Science validé",
    iconUrl: "",
    icon: "analytics",
    isObtained: false,
    obtainedAt: null,
    progress: { current: 0, target: 1 },
  },
];

const badges = ref([]);

const extractData = (response) => {
  return response.data?.data || response.data || [];
};

const mergeFallbackBadges = (items) => {
  const existingNames = new Set(items.map((badge) => badge.name));
  const fallbackBadges = mockBadges.filter(
    (badge) => !existingNames.has(badge.name),
  );

  return [...items, ...fallbackBadges];
};

const fetchBadges = async () => {
  isLoading.value = true;

  try {
    const response = await getStudentBadges();
    badges.value = mergeFallbackBadges(extractData(response));
  } catch (error) {
    console.warn("API badges indisponible, utilisation des mock data.");
    badges.value = mockBadges;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchBadges);

const obtainedBadges = computed(() => {
  return badges.value.filter((badge) => badge.isObtained);
});

const inProgressBadges = computed(() => {
  return badges.value.filter(
    (badge) => !badge.isObtained && Number(badge.progress?.current || 0) > 0,
  );
});

const lockedBadges = computed(() => {
  return badges.value.filter(
    (badge) => !badge.isObtained && Number(badge.progress?.current || 0) === 0,
  );
});

const filteredBadges = computed(() => {
  if (selectedFilter.value === "OBTAINED") return obtainedBadges.value;
  if (selectedFilter.value === "IN_PROGRESS") return inProgressBadges.value;
  if (selectedFilter.value === "LOCKED") return lockedBadges.value;
  return badges.value;
});

const progressPercent = (badge) => {
  if (badge.isObtained) return 100;

  const current = Number(badge.progress?.current || 0);
  const target = Number(badge.progress?.target || 0);

  if (!target) return 0;

  return Math.min(Math.max(Math.round((current / target) * 100), 0), 100);
};

const getBadgeStatus = (badge) => {
  if (badge.isObtained) return "obtained";
  return Number(badge.progress?.current || 0) > 0 ? "in-progress" : "locked";
};

const getBadgeMessage = (badge) => {
  if (badge.isObtained) {
    return "Félicitations ! Vous avez obtenu ce badge.";
  }

  if (Number(badge.progress?.current || 0) > 0) {
    return "Continuez, vous êtes sur la bonne voie.";
  }

  return "Validez les éléments requis pour débloquer ce badge.";
};
</script>

<template>
  <section class="badges-page">
    <header class="page-header">
      <div>
        <span class="page-label">BADGES</span>
        <h1>Mes badges</h1>
        <p>
          Progressez, relevez des défis et obtenez des badges pour valoriser
          vos compétences.
        </p>
      </div>

      <article class="obtained-summary">
        <span class="material-icons-round">emoji_events</span>
        <div>
          <small>Badges obtenus</small>
          <strong>{{ obtainedBadges.length }} / {{ badges.length }}</strong>
        </div>
      </article>
    </header>

    <div class="filters">
      <button
        :class="{ active: selectedFilter === 'ALL' }"
        @click="selectedFilter = 'ALL'"
      >
        Tous
      </button>

      <button
        :class="{ active: selectedFilter === 'LOCKED' }"
        @click="selectedFilter = 'LOCKED'"
      >
        À débloquer
      </button>

      <button
        :class="{ active: selectedFilter === 'IN_PROGRESS' }"
        @click="selectedFilter = 'IN_PROGRESS'"
      >
        En cours
      </button>

      <button
        :class="{ active: selectedFilter === 'OBTAINED' }"
        @click="selectedFilter = 'OBTAINED'"
      >
        Obtenus
      </button>
    </div>

    <div v-if="isLoading" class="empty-state">
      <span class="material-icons-round">hourglass_top</span>
      <h3>Chargement des badges...</h3>
      <p>Nous récupérons vos distinctions académiques.</p>
    </div>

    <div v-else-if="!filteredBadges.length" class="empty-state">
      <span class="material-icons-round">
        {{ selectedFilter === "OBTAINED" ? "emoji_events" : "lock_open" }}
      </span>

      <h3>
        {{
          selectedFilter === "OBTAINED"
            ? "Aucun badge obtenu pour le moment"
            : "Aucun badge dans cette catégorie"
        }}
      </h3>

      <p>
        {{
          selectedFilter === "OBTAINED"
            ? "Continuez à valider vos projets, stages et activités pour débloquer vos premiers badges."
            : "Explorez les badges disponibles et suivez les règles d’obtention pour progresser."
        }}
      </p>
    </div>

    <div v-else class="badges-grid">
      <article
        v-for="badge in filteredBadges"
        :key="badge.id"
        class="badge-card"
        :class="getBadgeStatus(badge)"
      >
        <div class="badge-main">
          <div class="badge-icon">
            <img
              v-if="badge.iconUrl"
              :src="badge.iconUrl"
              :alt="badge.name"
              class="badge-image"
            />

            <span v-else class="material-icons-round">
              {{ getBadgeIcon(badge) }}
            </span>
          </div>

          <div class="badge-copy">
            <h2>{{ badge.name }}</h2>
            <p class="description">{{ badge.description }}</p>
          </div>
        </div>

        <div class="rule">
          <span class="material-icons-round">verified_user</span>
          <p><strong>Règle :</strong> {{ badge.rule }}</p>
        </div>

        <div class="badge-card-footer">
          <div class="progress-block">
            <div class="progress-header">
              <span>{{ badge.isObtained ? "Obtenu le" : "Progression" }}</span>
              <strong>
                {{
                  badge.isObtained
                    ? badge.obtainedAt || "Date non renseignée"
                    : `${badge.progress?.current || 0}/${badge.progress?.target || 0}`
                }}
              </strong>
            </div>

            <div class="progress-track">
              <div
                class="progress-fill"
                :style="{ width: `${progressPercent(badge)}%` }"
              ></div>
            </div>
          </div>

          <div class="badge-message" :class="{ obtained: badge.isObtained }">
            <span class="material-icons-round">
              {{ badge.isObtained ? "verified" : "info" }}
            </span>
            <p>{{ getBadgeMessage(badge) }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.badges-page {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 0;
}

.page-label {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #a8aca8;
  font-family: serif;
  font-size: clamp(0.7rem, 0.8vw, 0.85rem);
  font-style: italic;
}

.page-header h1 {
  font-family: serif;
  color: #28363d;
  font-size: 2rem;
  line-height: 1.15;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.page-header p {
  font-family: serif;
  color: #6d9197;
  font-size: 0.875rem;
  font-style: italic;
  margin: 0;
}

.obtained-summary {
  min-width: 11rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-card);
  background: var(--app-surface);
  box-shadow: var(--app-shadow-card);
}

.obtained-summary > .material-icons-round {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--app-active-bg);
  color: var(--app-primary);
}

.obtained-summary small,
.obtained-summary strong {
  display: block;
}

.obtained-summary small {
  color: var(--app-muted);
  font-family: var(--app-font-body);
  font-size: var(--app-text-xs);
  font-weight: 700;
}

.obtained-summary strong {
  margin-top: 0.15rem;
  color: var(--app-heading);
  font-family: var(--app-font-body);
  font-size: var(--app-text-lg);
  font-weight: 900;
}

.filters {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem;
  margin-bottom: 0;
  border: 1px solid var(--app-border);
  border-radius: 0.9rem;
  background: var(--app-surface);
}

.filters button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.7rem;
  padding: 0.65rem 1rem;
  background: transparent;
  color: var(--app-muted);
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.filters button:hover {
  background: var(--app-surface-soft);
  color: var(--app-primary);
}

.filters button.active {
  background: var(--app-primary);
  color: #ffffff;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(15rem, 1fr));
  gap: 1.25rem;
  margin-top: 0.35rem;
}

.badge-card {
  position: relative;
  min-height: 20rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.5rem;
  background: var(--app-surface);
  border: 1px solid #e1e7e5;
  border-radius: 1.25rem;
  box-shadow: 0 0.75rem 2rem rgba(47, 87, 93, 0.06);
  text-align: left;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.badge-card:hover {
  transform: translateY(-0.12rem);
  border-color: var(--app-border-strong);
  box-shadow: var(--app-shadow-card-hover);
}

.badge-main {
  display: grid;
  grid-template-columns: 4.8rem minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
}

.badge-icon {
  width: 4.8rem;
  height: 4.8rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #f8faf9;
  color: var(--app-primary);
  box-shadow:
    inset 0 0 0 1px #dbe4e1,
    0 0.65rem 1.5rem rgba(47, 87, 93, 0.07);
}

.badge-image {
  width: 2.2rem;
  height: 2.2rem;
  object-fit: contain;
}

.badge-icon .material-icons-round {
  font-size: 2rem;
}

.badge-copy {
  min-width: 0;
  padding-top: 0.15rem;
}

.badge-card h2 {
  margin: 0;
  color: var(--app-heading);
  font-size: 1.08rem;
  font-weight: 900;
  line-height: 1.25;
  min-height: 2.7rem;
  display: flex;
  align-items: center;
}

.description {
  margin: 0.65rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  line-height: 1.55;
}

.rule {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.55rem;
  align-items: start;
  margin-top: 0;
  padding: 1rem 1.1rem;
  border-left: 0.18rem solid var(--app-primary);
  border-radius: var(--app-radius-md);
  background: linear-gradient(
    90deg,
    rgba(47, 87, 93, 0.075),
    rgba(47, 87, 93, 0.018)
  );
}

.rule .material-icons-round {
  margin-top: 0.1rem;
  color: var(--app-primary);
  font-size: 1.05rem;
}

.rule p {
  line-height: 1.5;
  margin: 0;
  color: var(--app-text);
  font-size: var(--app-text-sm);
}

.rule strong {
  color: var(--app-primary);
  font-weight: 900;
}

.badge-card-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid transparent;
  background:
    linear-gradient(var(--app-surface), var(--app-surface)) padding-box,
    linear-gradient(90deg, transparent, rgba(47, 87, 93, 0.22), transparent)
      border-box;
}

.progress-block {
  width: 100%;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 0.45rem;
}

.progress-header span {
  color: #6d9197;
  font-size: 0.82rem;
  font-weight: 700;
}

.progress-header strong {
  color: #28363d;
  font-size: 0.85rem;
  font-weight: 800;
}

.progress-track {
  width: 100%;
  height: 0.45rem;
  background: #e3ebe8;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2f575d;
  border-radius: 999px;
}

.badge-message {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin-top: 0.85rem;
  color: var(--app-muted);
}

.badge-message .material-icons-round {
  font-size: 1rem;
  margin-top: 0.1rem;
}

.badge-message p {
  margin: 0;
  font-size: var(--app-text-xs);
  line-height: 1.45;
}

.badge-message.obtained {
  color: #2f7d5f;
}

.empty-state {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.95rem;
  padding: 3rem 1.5rem;

  text-align: center;
  color: #6d9197;
}

.empty-state .material-icons-round {
  width: 3.5rem;
  height: 3.5rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #edf2f0;
  color: #2f575d;

  font-size: 1.8rem;

  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #28363d;
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0 0 0.45rem;
}

.empty-state p {
  max-width: 32rem;
  margin: 0 auto;
  color: #6d9197;
  font-size: 0.95rem;
  line-height: 1.6;
}

@media (max-width: 1100px) {
  .badges-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
  }

  .obtained-summary {
    width: 100%;
    box-sizing: border-box;
  }

  .badges-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    width: 100%;
    flex-wrap: wrap;
  }

  .filters button {
    flex: 1;
  }
}
</style>
