
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getStudentDashboardData } from '@/services/studentDashboardService'
import '@/assets/styles/studentDashboard.css'
const router = useRouter()

const dashboard = ref(null)
const isLoading = ref(true)

const animatedStats = ref([])

const displayScore = ref(0)
const scoreProgress = ref(0)

const ringRadius = 54
const ringTotal = 2 * Math.PI * ringRadius

const ringDash = computed(() => {
  return (scoreProgress.value / 100) * ringTotal
})

const studentName = computed(() => {
  return dashboard.value?.user?.firstName || 'Étudiant'
})

const recentNotifications = computed(() => {
  return dashboard.value?.notifications?.slice(0, 4) || []
})

const recentProjects = computed(() => {
  return dashboard.value?.recentProjects?.slice(0, 4) || []
})

const recentBadges = computed(() => {
  return dashboard.value?.badges?.slice(0, 5) || []
})

const credibilityDetails = computed(() => {
  return dashboard.value?.credibility?.details || []
})

const animateValue = (from, to, duration, onUpdate) => {
  const start = performance.now()

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)

    onUpdate(Math.round(from + ease * (to - from)))

    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }

  requestAnimationFrame(tick)
}

const initAnimatedStats = () => {
  animatedStats.value = [
    {
      id: 1,
      label: 'Projets validés',
      value: 0,
      target: dashboard.value.stats.validatedProjects,
      icon: 'folder_check',
      subtitle: 'Expériences académiques validées',
    },
    {
      id: 2,
      label: 'Score crédibilité',
      value: 0,
      target: dashboard.value.stats.credibilityScore,
      icon: 'verified',
      subtitle: dashboard.value.credibility.label,
    },
    {
      id: 3,
      label: 'Badges obtenus',
      value: 0,
      target: dashboard.value.stats.badgesCount,
      icon: 'workspace_premium',
      subtitle: 'Badges académiques gagnés',
    },
    {
      id: 4,
      label: 'Recommandations',
      value: 0,
      target: dashboard.value.stats.recommendationsCount,
      icon: 'thumb_up',
      subtitle: `${dashboard.value.stats.pendingRecommendations} en attente`,
    },
  ]

  animatedStats.value.forEach((stat, index) => {
    setTimeout(() => {
      animateValue(0, stat.target, 850, (value) => {
        stat.value = value
      })
    }, index * 120)
  })

  setTimeout(() => {
    animateValue(0, dashboard.value.credibility.score, 1100, (value) => {
      displayScore.value = value
      scoreProgress.value = value
    })
  }, 300)
}

const getStatusLabel = (status) => {
  const labels = {
    APPROVED: 'Validé',
    PENDING: 'En attente',
    DRAFT: 'Brouillon',
    CORRECTION_REQUIRED: 'Correction',
    REJECTED: 'Refusé',
  }

  return labels[status] || status
}

const getNotificationIconClass = (type) => {
  const classes = {
    SUCCESS: 'success',
    INFO: 'info',
    VALIDATION: 'warning',
    BADGE: 'badge',
    ALERT: 'alert',
  }

  return classes[type] || 'info'
}

const goToNotifications = () => {
  router.push('/student/notifications')
}

const goToProjects = () => {
  router.push('/student/projects')
}

const goToBadges = () => {
  router.push('/student/badges')
}

onMounted(async () => {
  dashboard.value = await getStudentDashboardData()
  initAnimatedStats()
  isLoading.value = false
})
</script>

<template>
  <section class="student-dashboard">
    <div v-if="isLoading" class="loading-card">
      Chargement du dashboard...
    </div>

    <template v-else>
      <header class="dashboard-header">
        <span class="page-label">Vue d’ensemble</span>

        <h1>Bonjour {{ studentName }}</h1>

        <p>
          Voici un résumé de votre activité académique.
        </p>
      </header>

      <div class="stats-grid">
        <article
        v-for="(stat, index) in animatedStats"
        :key="stat.id"
        class="stat-card"
        :style="{ animationDelay: `${index * 0.08}s` }"
      >
        <p class="stat-label">
          {{ stat.label }}
        </p>

        <h2>
          {{ stat.value }}
        </h2>

        <p class="stat-subtitle">
          {{ stat.subtitle }}
        </p>
      </article>
      </div>

      <div class="dashboard-grid">
        <div class="left-column">
          <article class="dashboard-card">
            <div class="card-header">
              <h2>Projets récents</h2>

              <button class="ghost-btn" @click="goToProjects">
                Voir tout
              </button>
            </div>

            <div class="project-list">
              <div
                v-for="project in recentProjects"
                :key="project.id"
                class="project-row"
              >
                <div>
                  <h3>{{ project.title }}</h3>

                  <p>
                    {{ project.technologies.join(' · ') }}
                  </p>
                </div>

                <span
                  class="status-chip"
                  :class="project.validationStatus"
                >
                  <span></span>
                  {{ getStatusLabel(project.validationStatus) }}
                </span>
              </div>
            </div>
          </article>

          <article class="dashboard-card">
            <div class="card-header">
              <h2>Badges obtenus</h2>

              <button class="ghost-btn" @click="goToBadges">
                Voir tout
              </button>
            </div>

            <div class="badges-grid">
              <div
                v-for="badge in recentBadges"
                :key="badge.id"
                class="badge-card"
              >
                <div
                  class="badge-icon"
                  :class="`tone-${badge.tone}`"
                >
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

                <strong>{{ badge.name }}</strong>
                <small>{{ badge.date }}</small>
              </div>
            </div>
          </article>
        </div>

        <div class="right-column">
          <article class="dashboard-card">
            <h2>Score de crédibilité</h2>

            <div class="score-ring-wrap">
              <svg class="score-ring-svg" viewBox="0 0 140 140">
                <circle
                  class="ring-track"
                  cx="70"
                  cy="70"
                  r="54"
                />

                <circle
                  class="ring-fill"
                  cx="70"
                  cy="70"
                  r="54"
                  :stroke-dasharray="`${ringDash} ${ringTotal}`"
                  transform="rotate(-90 70 70)"
                />
              </svg>

              <div class="ring-center">
                <strong>{{ displayScore }}</strong>
                <span>{{ dashboard.credibility.label }}</span>
              </div>
            </div>

            <div class="score-bars">
              <div
                v-for="item in credibilityDetails"
                :key="item.label"
                class="score-bar"
              >
                <span class="score-label">{{ item.label }}</span>

                <div class="score-track">
                  <div
                    class="score-fill"
                    :style="{ width: `${(item.value / 20) * 100}%` }"
                  ></div>
                </div>

                <strong>{{ item.value }}</strong>
              </div>
            </div>
          </article>

          <article class="dashboard-card">
            <div class="card-header">
              <h2>Notifications récentes</h2>

              <button class="ghost-btn" @click="goToNotifications">
                Voir tout
              </button>
            </div>

            <div class="notifications-list">
              <div
                v-for="notification in recentNotifications"
                :key="notification.id"
                class="notification-row"
              >
                <div
                  class="notification-icon"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <span class="material-icons-round">
                    {{
                      notification.type === 'SUCCESS'
                        ? 'check_circle'
                        : notification.type === 'BADGE'
                          ? 'workspace_premium'
                          : notification.type === 'VALIDATION'
                            ? 'edit'
                            : 'notifications'
                    }}
                  </span>
                </div>

                <div>
                  <h3>{{ notification.title }}</h3>
                  <p>{{ notification.message }}</p>
                  <small>{{ notification.createdAt }}</small>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </template>
  </section>
</template>