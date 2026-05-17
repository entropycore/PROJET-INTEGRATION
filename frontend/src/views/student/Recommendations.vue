<script setup>
import { computed, onMounted, ref } from 'vue'

import {
  getStudentRecommendationsData,
} from '@/services/studentRecommendationsService'

const loading = ref(false)

const recommendationsData = ref({
  stats: {
    received: 0,
    pending: 0,
    rejected: 0,
  },

  recommendations: [],
})

const selectedFilter = ref('ALL')

const loadRecommendations = async () => {
  loading.value = true

  try {
    recommendationsData.value =
      await getStudentRecommendationsData()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecommendations()
})

const filteredRecommendations = computed(() => {
  if (selectedFilter.value === 'ALL') {
    return recommendationsData.value.recommendations
  }

  return recommendationsData.value.recommendations.filter(
    (recommendation) =>
      recommendation.status === selectedFilter.value,
  )
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<template>
  <section class="recommendations-page">
    <header class="page-header">
      <div>
        <span class="page-label">
          RECOMMANDATIONS
        </span>

        <h1>Mes recommandations</h1>

        <p>
          Consultez les recommandations reçues
          sur votre portfolio académique.
        </p>
      </div>
    </header>

    

    <div class="filters">
      <button
        :class="{ active: selectedFilter === 'ALL' }"
        @click="selectedFilter = 'ALL'"
      >
        Toutes
      </button>

      <button
        :class="{ active: selectedFilter === 'RECEIVED' }"
        @click="selectedFilter = 'RECEIVED'"
      >
        Reçues
      </button>

      <button
        :class="{ active: selectedFilter === 'PENDING' }"
        @click="selectedFilter = 'PENDING'"
      >
        En attente
      </button>

      <button
        :class="{ active: selectedFilter === 'REJECTED' }"
        @click="selectedFilter = 'REJECTED'"
      >
        Refusées
      </button>
    </div>

    <div
      v-if="loading"
      class="loading-state"
    >
      Chargement des recommandations...
    </div>

    <div
      v-else
      class="recommendations-list"
    >
      <article
        v-for="recommendation in filteredRecommendations"
        :key="recommendation.id"
        class="recommendation-card"
      >
        <div class="recommendation-top">
          <div class="author-block">
            <div
              v-if="recommendation.author.profilePicture"
              class="author-avatar"
            >
              <img
                :src="recommendation.author.profilePicture"
                :alt="recommendation.author.name"
              />
            </div>

            <div
              v-else
              class="author-avatar fallback"
            >
              {{ recommendation.author.initials }}
            </div>

            <div class="author-info">
              <strong>
                {{ recommendation.author.name }}
              </strong>

              <span>
                {{ recommendation.author.role }}
                ·
                {{
                  recommendation.author.organization
                }}
              </span>
            </div>
          </div>

          <span
            class="status-badge"
            :class="recommendation.status.toLowerCase()"
          >
            {{
              recommendation.status === 'RECEIVED'
                ? 'Reçue'
                : recommendation.status === 'PENDING'
                  ? 'En attente'
                  : 'Refusée'
            }}
          </span>
        </div>

        <p class="recommendation-content">
          {{ recommendation.content }}
        </p>

        <div class="recommendation-footer">
          <span class="recommendation-date">
            {{ formatDate(recommendation.createdAt) }}
          </span>

          <div class="recommendation-actions">
            <button class="secondary-btn">
              Voir profil
            </button>

            <button
              v-if="recommendation.status === 'PENDING'"
              class="primary-btn"
            >
              Accepter
            </button>

            <button
              v-if="recommendation.status === 'PENDING'"
              class="danger-btn"
            >
              Refuser
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
<style scoped>
.recommendations-page {
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
  font-weight: 700;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stat-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.9rem;
  padding: 1.2rem 1.4rem;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 0.18rem;
  background: #2f575d;
}

.stat-card span {
  color: #99aead;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08rem;
}

.stat-card strong {
  display: block;
  color: #102a33;
  font-size: 2.15rem;
  font-weight: 800;
  margin-top: 0.65rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
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
  transition: 0.2s ease;
}

.filters button:hover,
.filters button.active {
  background: #2f575d;
  color: #ffffff;
  border-color: #2f575d;
}

.loading-state {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.9rem;
  padding: 1.4rem;
  color: #6d9197;
  font-weight: 600;
}

.recommendations-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.recommendation-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.95rem;
  padding: 1.25rem;
  animation: fade-up 0.4s ease both;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.recommendation-card:hover {
  transform: translateY(-0.12rem);
  border-color: #c4cdc1;
  box-shadow: 0 0.625rem 1.5rem rgba(47, 87, 93, 0.08);
}

.recommendation-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.author-block {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  min-width: 0;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #edf2f0;
  color: #2f575d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.95rem;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.author-info strong {
  color: #102a33;
  font-size: 1rem;
  font-weight: 800;
}

.author-info span {
  color: #6d9197;
  font-size: 0.88rem;
}

.status-badge {
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.status-badge.received {
  background: #e8f5ec;
  color: #2e7d32;
}

.status-badge.pending {
  background: #fff4e4;
  color: #e67e22;
}

.status-badge.rejected {
  background: #fdecea;
  color: #c62828;
}

.recommendation-content {
  color: #435b60;
  font-size: 0.96rem;
  line-height: 1.65;
  margin: 0 0 1.05rem;
}

.recommendation-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  padding-top: 1rem;
  border-top: 1px solid #edf0ee;
}

.recommendation-date {
  color: #8a9fa3;
  font-size: 0.85rem;
  font-weight: 600;
}

.recommendation-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.secondary-btn,
.primary-btn,
.danger-btn {
  height: 2.45rem;
  border-radius: 0.65rem;
  padding: 0 0.95rem;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.secondary-btn {
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
}

.primary-btn {
  background: #2f575d;
  color: #ffffff;
  border: 1px solid #2f575d;
}

.danger-btn {
  background: #ffffff;
  color: #c62828;
  border: 1px solid #efc9c9;
}

.secondary-btn:hover {
  background: #f8f9f8;
}

.primary-btn:hover {
  background: #26494d;
}

.danger-btn:hover {
  background: #fdecea;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(0.6rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 850px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .recommendation-top,
  .recommendation-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .recommendation-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .secondary-btn,
  .primary-btn,
  .danger-btn {
    flex: 1;
  }
}
</style>