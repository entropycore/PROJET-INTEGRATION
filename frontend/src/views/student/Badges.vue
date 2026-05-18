<script setup>
import { computed, ref } from "vue";

const selectedFilter = ref("ALL");

const badges = ref([
  {
    id: 1,
    name: "Web Developer",
    description: "Badge pour les étudiants actifs en développement web.",
    rule: "3 projets web validés",
    iconUrl: "",
    iconFallback: "🌐",
    tone: "blue",
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
    iconFallback: "☁️",
    tone: "cyan",
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
    iconFallback: "👥",
    tone: "purple",
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
    iconFallback: "💠",
    tone: "green",
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
    iconFallback: "🛡️",
    tone: "red",
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
    iconFallback: "📊",
    tone: "orange",
    isObtained: false,
    obtainedAt: null,
    progress: { current: 0, target: 1 },
  },
]);

const obtainedBadges = computed(() => {
  return badges.value.filter((badge) => badge.isObtained);
});

const lockedBadges = computed(() => {
  return badges.value.filter((badge) => !badge.isObtained);
});

const filteredBadges = computed(() => {
  if (selectedFilter.value === "OBTAINED") return obtainedBadges.value;
  if (selectedFilter.value === "LOCKED") return lockedBadges.value;
  return badges.value;
});

const completionRate = computed(() => {
  return Math.round((obtainedBadges.value.length / badges.value.length) * 100);
});

const progressPercent = (badge) => {
  if (!badge.progress) return 0;

  return Math.min(
    Math.round((badge.progress.current / badge.progress.target) * 100),
    100,
  );
};
</script>

<template>
  <section class="badges-page">
    <header class="page-header">
      <span class="page-label">BADGES</span>

      <h1>Mes badges</h1>

      <p>
        Suivez vos distinctions académiques et débloquez de nouveaux badges.
      </p>
    </header>

    <div class="summary-grid">
      <article class="summary-card">
        <span>Badges obtenus</span>
        <strong>{{ obtainedBadges.length }}</strong>
        <p>sur {{ badges.length }} badges disponibles</p>
      </article>

      <article class="summary-card">
        <span>Progression globale</span>
        <strong>{{ completionRate }}%</strong>
        <p>Continuez à valider vos projets et stages</p>
      </article>

      <article class="summary-card">
        <span>À débloquer</span>
        <strong>{{ lockedBadges.length }}</strong>
        <p>badges encore disponibles</p>
      </article>
    </div>

    <div class="filters">
      <button
        :class="{ active: selectedFilter === 'ALL' }"
        @click="selectedFilter = 'ALL'"
      >
        Tous
      </button>

      <button
        :class="{ active: selectedFilter === 'OBTAINED' }"
        @click="selectedFilter = 'OBTAINED'"
      >
        Obtenus
      </button>

      <button
        :class="{ active: selectedFilter === 'LOCKED' }"
        @click="selectedFilter = 'LOCKED'"
      >
        À débloquer
      </button>
    </div>

    <div class="badges-grid">
      <article
        v-for="badge in filteredBadges"
        :key="badge.id"
        class="badge-card"
        :class="{ locked: !badge.isObtained }"
      >
        <div class="badge-top">
          <div class="badge-title-group">
            <div class="badge-icon" :class="`tone-${badge.tone}`">
              <img
                v-if="badge.iconUrl"
                :src="badge.iconUrl"
                :alt="badge.name"
                class="badge-image"
              />

              <span v-else class="badge-fallback">
                {{ badge.iconFallback }}
              </span>
            </div>

            <h2>{{ badge.name }}</h2>
          </div>

          <span
            class="badge-status"
            :class="badge.isObtained ? 'obtained' : 'locked'"
          >
            {{ badge.isObtained ? "Obtenu" : "À débloquer" }}
          </span>
        </div>
        <p class="description">
          {{ badge.description }}
        </p>

        <div class="rule-box">
          <span>Règle d’obtention</span>
          <p>{{ badge.rule }}</p>
        </div>

        <div class="progress-block">
          <div class="progress-header">
            <span>Progression</span>
            <strong>
              {{ badge.progress.current }}/{{ badge.progress.target }}
            </strong>
          </div>

          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: `${progressPercent(badge)}%` }"
            ></div>
          </div>
        </div>

        <p v-if="badge.isObtained" class="obtained-date">
          Obtenu en {{ badge.obtainedAt }}
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.badges-page {
  padding: 0;
}

.page-header {
  margin-bottom: 1.4rem;
}

.page-label {
  display: inline-block;
  color: #8f9f9c;
  font-size: 0.82rem;
  font-style: italic;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.page-header h1 {
  color: #28363d;
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.35rem;
}

.page-header p {
  color: #6d9197;
  font-size: 1rem;
  margin: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.9rem;
  padding: 1.25rem 1.4rem;
}

.summary-card span {
  color: #99aead;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07rem;
}

.summary-card strong {
  display: block;
  color: #102a33;
  font-size: 2rem;
  font-weight: 800;
  margin: 0.55rem 0 0.35rem;
}

.summary-card p {
  color: #6d9197;
  font-size: 0.9rem;
  margin: 0;
}

.filters {
  display: flex;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.filters button {
  border: 1px solid #c4cdc1;
  background: #ffffff;
  color: #2f575d;
  border-radius: 999px;
  padding: 0.55rem 1rem;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

.filters button.active {
  background: #2f575d;
  color: #ffffff;
  border-color: #2f575d;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.badge-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.95rem;
  padding: 1.25rem;
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  min-height: 22rem;
  text-align: left;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.badge-card:hover {
  transform: translateY(-0.15rem);
  border-color: #c4cdc1;
  box-shadow: 0 0.625rem 1.5rem rgba(47, 87, 93, 0.08);
}

.badge-card.locked {
  opacity: 0.82;
}

.badge-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.badge-title-group {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.badge-icon {
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon.tone-blue {
  background: #e8f1fd;
  color: #2f6fb5;
}

.badge-icon.tone-cyan {
  background: #e7f6f6;
  color: #0f8b8d;
}

.badge-icon.tone-purple {
  background: #f1ecfa;
  color: #7b4dbb;
}

.badge-icon.tone-green {
  background: #edf7ed;
  color: #2e7d32;
}

.badge-icon.tone-red {
  background: #fdecec;
  color: #c62828;
}

.badge-icon.tone-orange {
  background: #fff4e4;
  color: #e67e22;
}

.badge-image {
  width: 1.6rem;
  height: 1.6rem;
  object-fit: contain;
}

.badge-fallback {
  font-size: 1.35rem;
  line-height: 1;
}

.badge-status {
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 800;
}

.badge-status.obtained {
  background: #e8f5ec;
  color: #2e7d32;
}

.badge-status.locked {
  background: #edf0ef;
  color: #6f7f82;
}

.badge-card h2 {
  color: #102a33;
  font-size: 1.15rem;
  font-weight: 800;
  margin: 0 0 0.55rem;
}

.description {
  color: #6d9197;
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0 0 1rem;
}

.rule-box {
  background: #f8f9f8;
  border: 1px solid #edf0ee;
  border-radius: 0.75rem;
  padding: 0.9rem;
  margin-bottom: 1rem;
}

.rule-box span {
  display: block;
  color: #2f575d;
  font-size: 0.78rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.rule-box p {
  color: #435b60;
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0;
  width: 100%;
}

.progress-block {
  margin-top: auto;
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
  background: #dfe6e3;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #2f575d;
  border-radius: 999px;
}

.obtained-date {
  color: #2f775f;
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0.8rem 0 0;
}

@media (max-width: 1100px) {
  .badges-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .badges-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-wrap: wrap;
  }
}
</style>
