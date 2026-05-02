<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAdminDashboard } from '../../services/adminService'
import '../../assets/styles/admin-dashboard.css'

const loading = ref(false)
const error = ref(null)

const dashboardData = ref({
  summaryCards: {},
  urgentActions: {},
  recentRequests: []
})

/* ======================
   FETCH DATA
====================== */
onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const res = await getAdminDashboard()
    dashboardData.value = res.data.data
  } catch (err) {
    error.value = 'Erreur lors du chargement du dashboard'
  } finally {
    loading.value = false
  }
})

/* ======================
   STATS CARDS
====================== */
const stats = computed(() => {
  const cards = dashboardData.value.summaryCards || {}

  return [
    {
      value: cards.totalUsers?.value ?? 0,
      label: 'UTILISATEURS',
      detail: cards.totalUsers?.variation,
      icon: '👥'
    },
    {
      value: cards.totalStudents?.value ?? 0,
      label: 'ÉTUDIANTS',
      detail: cards.totalStudents?.variation,
      icon: '🎓'
    },
    {
      value: cards.totalProfessors?.value ?? 0,
      label: 'PROFESSEURS',
      detail: cards.totalProfessors?.variation,
      icon: '👤'
    },
    {
      value: cards.pendingRequests?.value ?? 0,
      label: 'Demandes En Attente',
      detail: cards.pendingRequests?.variation,
      icon: '⏱',
      warning: true
    }
  ]
})

/* ======================
   RECENT REQUESTS
====================== */
const requests = computed(() => {
  return (dashboardData.value.recentRequests || []).map((req) => ({
    id: req.id,
    initial: req.requesterName?.charAt(0)?.toUpperCase() || '?',
    name: req.requesterName,
    email: req.email,
    organization: req.organization,
    type: req.label,
    createdAt: req.createdAt,
    tone: req.type === 'ACCESS_REQUEST' ? 'orange' : 'green'
  }))
})

/* ======================
   ACTIONS URGENTES
====================== */
const actions = computed(() => {
  const urgent = dashboardData.value.urgentActions || {}

  return [
    {
      title: `${urgent.pendingAccessRequests ?? 0} demandes en attente`,
      text: 'pour rejoindre la plateforme',
      path: '/admin/users',
      tone: 'orange'
    },
    {
      title: `${urgent.pendingValidations ?? 0} validations en attente`,
      text: 'Certifications et activités',
      path: '/admin/validations',
      tone: 'blue'
    },
    {
      title: `${urgent.reports ?? 0} signalements`,
      text: 'signalement de contenu',
      path: '/admin/reports',
      tone: 'red'
    }
  ]
})
</script>

<template>
  <section class="admin-dashboard">
    <!-- HEADER -->
    <p class="admin-kicker">ADMINISTRATION</p>
    <h1>Administration de platform</h1>
    <p class="admin-subtitle">
      Surveillez, gérez et contrôlez votre plateforme
    </p>

    <!-- STATES -->
    <p v-if="loading">Chargement...</p>
    <p v-else-if="error">{{ error }}</p>

    <template v-else>
      <!-- ======================
           CARDS
      ====================== -->
      <div class="stats-grid">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="stat-card"
          :class="{ warning: stat.warning }"
        >
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div v-if="stat.detail" class="stat-detail">
            {{ stat.detail }}
          </div>
        </div>
      </div>

      <!-- ======================
           MAIN GRID
      ====================== -->
      <div class="dashboard-grid">
        <!-- LEFT -->
        <div class="recent-requests">
          <div class="card-header">
            <h3>Recent Requests :</h3>
          </div>

          <div class="request-list">
            <div
              v-for="req in requests"
              :key="req.id"
              class="request-item"
            >
              <div class="avatar">{{ req.initial }}</div>

              <div class="request-info">
                <p class="name">{{ req.name }}</p>
                <p class="email">{{ req.email }}</p>
                <p class="org">{{ req.organization }}</p>
              </div>

              <div class="request-actions">
                <button class="btn-light">Voir tout</button>
                <button :class="['btn-badge', req.tone]">
                  {{ req.type }}
                </button>
              </div>
            </div>
          </div>

          <button class="view-all">
            voir tous les notifications
          </button>
        </div>

        <!-- RIGHT -->
        <div class="urgent-actions">
          <h3>Actions urgentes</h3>

          <div
            v-for="(action, i) in actions"
            :key="i"
            class="urgent-item"
            :class="action.tone"
          >
            <div>
              <p class="title">{{ action.title }}</p>
              <p class="desc">{{ action.text }}</p>
            </div>

            <RouterLink :to="action.path" class="btn-light">
              consulter
            </RouterLink>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>