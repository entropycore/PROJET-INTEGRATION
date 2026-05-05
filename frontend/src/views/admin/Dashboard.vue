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
const formatLastActive = (date) => {
  if (!date) return 'Jamais'

  const now = new Date()
  const past = new Date(date)

  const diff = Math.floor((now - past) / 1000) // en secondes

  if (diff < 60) return 'à l\'instant'

  const minutes = Math.floor(diff / 60)
  if (minutes < 60) return `il y a ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days} j`

  // fallback si c’est trop ancien
  return past.toLocaleDateString('fr-FR')
}
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
      icon: 'usersg.svg'
    },
    {
      value: cards.totalStudents?.value ?? 0,
      label: 'ÉTUDIANTS',
      detail: cards.totalStudents?.variation,
      icon: 'student.svg'
    },
    {
      value: cards.totalProfessors?.value ?? 0,
      label: 'PROFESSEURS',
      detail: cards.totalProfessors?.variation,
      icon: 'profile.svg'
    },
    {
      value: cards.pendingRequests?.value ?? 0,
      label: 'Demandes En Attente',
      detail: cards.pendingRequests?.variation,
      icon: 'attente.svg',
      warning: true
    }
  ]
})
const getIcon = (icon) => {
  return new URL(`../../assets/icons/${icon}`, import.meta.url).href
}

/* RECENT REQUESTS*/
/*const requests = computed(() => {
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
}) */
const requests = computed(() => [
  {
    id: 1,
    initial: 'S',
    name: 'Sara Bensaid',
    email: 'sara.bensaid@accenture.com',
    organization: 'Accenture Maroc',
    type: "Demande d'accès",
    createdAt: '2026-05-02T13:50:00.000Z',
    tone: 'orange',
    raw: {
      phone: '0600000000',
      company: 'Accenture Maroc',
      position: 'Recruiter',
      sector: 'IT',
      status: 'PENDING',
      bio: 'Responsable recrutement.'
    }
  },
  {
    id: 2,
    initial: 'T',
    name: 'Tazi Imane',
    email: 'i.tazi@ensa.tanger.ma',
    organization: null,
    type: 'Certificate validation',
    createdAt: '2026-05-02T13:36:00.000Z',
    tone: 'green',
    raw: {
      targetType: 'CERTIFICATE',
      status: 'PENDING'
    }
  }
])


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

/* ======================
   ACTIONS *====================== */
const selectedRequest = ref(null)

const openRequestModal = (request) => {
  selectedRequest.value = request
}

const closeRequestModal = () => {
  selectedRequest.value = null
}

const approveRequest = (request) => {
  console.log('Demande acceptée:', request)
  alert(`Demande acceptée pour ${request.name}`)
}
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
          <div class="stat-icon">
          <img :src="getIcon(stat.icon)" />
          </div>
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
      <div class="avatar">
        {{ req.initial }}
      </div>

      <div class="request-info">
        <div class="request-top-row">
          <span class="request-name">{{ req.name }}</span>
          <span v-if="req.organization" class="request-org">
            {{ req.organization }}
          </span>
        </div>

        <p class="request-email">{{ req.email }}</p>
        <small class="request-time">{{  formatLastActive(req.createdAt) }}</small>
      </div>

      <div class="request-actions">
          <button class="btn-light" @click="openRequestModal(req)">
            Voir
          </button>
<!-- je doit ajouter la connexion avec backend pour voir les boites modales et accepeter l´user ou valider la cerficat-->
          <!-- ==
           <button
            v-if="req.tone === 'orange'"
            class="btn-accept"
            @click="approveRequest(req)">Accepter
          </button>== -->
          
          

          <span :class="['request-type', req.tone]">
        {{ req.type }}
          </span>
      </div>
    </div>
  </div>

  <RouterLink to="/admin/notifications" class="view-all">
    voir tous les notifications
  </RouterLink>
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