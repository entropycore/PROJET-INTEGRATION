<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAdminDashboard } from "../../services/adminService";
import "../../assets/styles/admin-dashboard.css";

const loading = ref(false);
const error = ref(null);
const router = useRouter();

const dashboardData = ref({
  summaryCards: {},
  urgentActions: {},
  recentRequests: [],
});
const formatLastActive = (date) => {
  if (!date) return "Jamais";

  const now = new Date();
  const past = new Date(date);

  const diff = Math.floor((now - past) / 1000); // en secondes

  if (diff < 60) return "à l'instant";

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;

  // fallback si c’est trop ancien
  return past.toLocaleDateString("fr-FR");
};
/* ======================
   FETCH DATA
====================== */
onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await getAdminDashboard();
    dashboardData.value = res.data.data;
  } catch (err) {
    error.value = "Erreur lors du chargement du dashboard";
  } finally {
    loading.value = false;
  }
});

/* ======================
   STATS CARDS
====================== */
const stats = computed(() => {
  const cards = dashboardData.value.summaryCards || {};

  return [
    {
      value: cards.totalUsers?.value ?? 0,
      label: "UTILISATEURS",
      detail: cards.totalUsers?.variation,
      icon: "groups",
    },
    {
      value: cards.totalStudents?.value ?? 0,
      label: "ÉTUDIANTS",
      detail: cards.totalStudents?.variation,
      icon: "school",
    },
    {
      value: cards.totalProfessors?.value ?? 0,
      label: "PROFESSEURS",
      detail: cards.totalProfessors?.variation,
      icon: "person",
    },
    {
      value: cards.pendingRequests?.value ?? 0,
      label: "Demandes En Attente",
      detail: cards.pendingRequests?.variation,
      icon: "schedule",
      warning: true,
    },
  ];
});
/* ======================
   RECENT ACTIVITY
====================== */
const activityRouteByType = {
  ACCESS_REQUEST: "/admin/users?role=PROFESSIONAL&status=PENDING",
  CERTIFICATE_VALIDATION: "/admin/validations",
  PROJECT: "/admin/validations",
  INTERNSHIP: "/admin/validations",
  ACTIVITY: "/admin/validations",
  RECOMMENDATION_LETTER_VALIDATION: "/admin/validations",
  COMMENT_VALIDATION: "/admin/validations",
  RECOMMENDATION_VALIDATION: "/admin/validations",
  REPORT: "/admin/reports",
};

const activityTypeAliases = {
  CERTIFICATE: "CERTIFICATE_VALIDATION",
  PROJECT_VALIDATION: "PROJECT",
  INTERNSHIP_VALIDATION: "INTERNSHIP",
  ACTIVITY_VALIDATION: "ACTIVITY",
  "CERTIFICATE VALIDATION": "CERTIFICATE_VALIDATION",
  "PROJECT VALIDATION": "PROJECT",
  "INTERNSHIP VALIDATION": "INTERNSHIP",
  REPORT: "REPORT",
  SIGNALEMENT: "REPORT",
};

const activityLabelByType = {
  ACCESS_REQUEST: "Demande d'accès",
  CERTIFICATE_VALIDATION: "Validation certificat",
  PROJECT: "Validation projet",
  INTERNSHIP: "Validation stage",
  ACTIVITY: "Validation activité",
  RECOMMENDATION_LETTER_VALIDATION: "Validation lettre",
  COMMENT_VALIDATION: "Validation commentaire",
  RECOMMENDATION_VALIDATION: "Validation recommandation",
  REPORT: "Signalement",
};

const activityIconByType = {
  ACCESS_REQUEST: "person_add",
  CERTIFICATE_VALIDATION: "workspace_premium",
  PROJECT: "folder_open",
  INTERNSHIP: "business_center",
  ACTIVITY: "verified",
  RECOMMENDATION_LETTER_VALIDATION: "history_edu",
  COMMENT_VALIDATION: "forum",
  RECOMMENDATION_VALIDATION: "recommend",
  REPORT: "report",
};

const activityToneByType = {
  ACCESS_REQUEST: "orange",
  CERTIFICATE_VALIDATION: "green",
  PROJECT: "green",
  INTERNSHIP: "green",
  ACTIVITY: "green",
  RECOMMENDATION_LETTER_VALIDATION: "green",
  COMMENT_VALIDATION: "green",
  RECOMMENDATION_VALIDATION: "green",
  REPORT: "red",
};

const normalizeActivityType = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();

const getActivityType = (activity = {}) => {
  const normalizedType = normalizeActivityType(activity.type);

  if (activityRouteByType[normalizedType]) return normalizedType;
  if (activityTypeAliases[normalizedType]) return activityTypeAliases[normalizedType];

  const normalizedRelatedType = normalizeActivityType(
    activity.relatedType || activity.raw?.relatedType || activity.raw?.type,
  );

  if (activityRouteByType[normalizedRelatedType]) return normalizedRelatedType;
  if (activityTypeAliases[normalizedRelatedType]) {
    return activityTypeAliases[normalizedRelatedType];
  }

  const normalizedTargetType = normalizeActivityType(
    activity.targetType || activity.raw?.targetType,
  );

  if (activityRouteByType[normalizedTargetType]) return normalizedTargetType;
  if (activityTypeAliases[normalizedTargetType]) {
    return activityTypeAliases[normalizedTargetType];
  }

  return normalizedType || normalizedRelatedType || normalizedTargetType || "SYSTEM";
};

const getActivityLabel = (activity) => {
  const type = getActivityType(activity);

  return activityLabelByType[type] || activity.label || "Activité";
};

const getActivityIcon = (activity) => {
  return activityIconByType[getActivityType(activity)] || "notifications";
};

const getActivityTone = (activity) => {
  return activityToneByType[getActivityType(activity)] || activity.tone || "blue";
};

const getActivityRoute = (activity) => {
  return activityRouteByType[getActivityType(activity)] || "/admin/notifications";
};

const mapRecentActivity = (activity) => {
  const name = activity.requesterName || activity.name || "Utilisateur inconnu";
  const organization =
    activity.organization ||
    activity.company ||
    activity.raw?.company ||
    activity.raw?.professional?.company ||
    null;

  return {
    ...activity,
    initial: name.charAt(0).toUpperCase() || "?",
    name,
    email: activity.email || "Email non disponible",
    organization,
    label: getActivityLabel(activity),
    icon: getActivityIcon(activity),
    tone: activity.tone || getActivityTone(activity),
    createdAt: activity.createdAt,
    raw: activity.raw || {},
  };
};

const requests = computed(() => {
  return (dashboardData.value.recentRequests || []).map(mapRecentActivity);
});

const openActivity = (activity) => {
  router.push(getActivityRoute(activity));
};

/* ======================
   ACTIONS URGENTES
====================== */
const actions = computed(() => {
  const urgent = dashboardData.value.urgentActions || {};

  return [
    {
      title: `${urgent.pendingAccessRequests ?? 0} demandes en attente`,
      text: "pour rejoindre la plateforme",
      path: "/admin/users?role=PROFESSIONAL&status=PENDING",
      tone: "orange",
      icon: "person_add",
    },
    {
      title: `${urgent.pendingValidations ?? 0} validations en attente`,
      text: "Certifications et activités",
      path: "/admin/validations",
      tone: "green",
      icon: "verified",
    },
    {
      title: `${urgent.reports ?? 0} signalements`,
      text: "signalement de contenu",
      path: "/admin/reports",
      tone: "red",
      icon: "report",
    },
  ];
});

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
          <span class="stat-icon material-icons-round">{{ stat.icon }}</span>
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
            <div class="card-title-group">
              <div class="card-title-row">
                <span class="section-title-icon material-icons-round">history</span>
                <h3>Activit&eacute; r&eacute;cente</h3>
              </div>
              <p>Les derni&egrave;res demandes, validations et signalements sur la plateforme.</p>
            </div>

            <RouterLink to="/admin/notifications" class="card-header-link">
              Voir toute l'activit&eacute;
              <span class="material-icons-round">arrow_forward</span>
            </RouterLink>
          </div>

          <div v-if="requests.length" class="request-list">
            <div v-for="req in requests" :key="req.id" class="request-item">
              <div class="avatar">
                {{ req.initial }}
              </div>

              <div class="request-info">
                <span class="request-name">{{ req.name }}</span>
                <span v-if="req.organization" class="request-org">
                  {{ req.organization }}
                </span>

                <p class="request-email">{{ req.email }}</p>
              </div>

              <small class="request-time">{{
                formatLastActive(req.createdAt)
              }}</small>

              <div class="request-actions">
                <span :class="['request-type', req.tone]">
                  <span class="material-icons-round">
                    {{ req.icon }}
                  </span>
                  {{ req.label }}
                </span>

                <button class="btn-light" @click="openActivity(req)">
                  <span class="material-icons-round">visibility</span>
                  Voir
                </button>
              </div>
            </div>
          </div>

          <p v-else class="request-empty">
            Aucune activit&eacute; r&eacute;cente pour le moment.
          </p>
        </div>

        <!-- RIGHT -->
        <div class="urgent-actions">
          <div class="card-header urgent-header">
            <div class="card-title-group">
              <div class="card-title-row">
                <span class="section-title-icon material-icons-round">warning_amber</span>
                <h3>Actions urgentes</h3>
              </div>
              <p>Les &eacute;l&eacute;ments n&eacute;cessitant votre attention.</p>
            </div>
          </div>

          <div class="urgent-list">
            <div
              v-for="(action, i) in actions"
              :key="i"
              class="urgent-item"
              :class="action.tone"
            >
              <div class="urgent-icon">
                <span class="material-icons-round">{{ action.icon }}</span>
              </div>

              <div class="urgent-content">
                <p class="title">{{ action.title }}</p>
                <p class="desc">{{ action.text }}</p>
              </div>

              <RouterLink :to="action.path" class="urgent-link">
                Consulter
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
