<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { getProfessorDashboard } from "@/services/professorApi";

const dashboard = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

const summaryCards = computed(() => {
  const cards = dashboard.value?.summaryCards || {};

  return [
    {
      label: "Projets a valider",
      value: cards.pendingProjects?.value || 0,
      icon: "folder_open",
    },
    {
      label: "Stages a valider",
      value: cards.pendingInternships?.value || 0,
      icon: "business_center",
    },
    {
      label: "Stages supervises",
      value: cards.supervisedInternships?.value || 0,
      icon: "school",
    },
    {
      label: "Avis rendus",
      value:
        (cards.completedProjectReviews?.value || 0) +
        (cards.completedInternshipReviews?.value || 0),
      icon: "fact_check",
    },
  ];
});

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusLabels = {
  PENDING: "En attente",
  APPROVED: "Approuve",
  REJECTED: "Refuse",
  CHANGES_REQUESTED: "Correction demandee",
};

onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    dashboard.value = await getProfessorDashboard();
  } catch (error) {
    console.error("Erreur dashboard professeur :", error);
    errorMessage.value = "Impossible de charger l'espace professeur.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="professor-dashboard-page">
    <div v-if="isLoading" class="state-card">Chargement du dashboard...</div>

    <div v-else-if="errorMessage" class="state-card error">
      {{ errorMessage }}
    </div>

    <template v-else>
      <header class="page-header">
        <div>
          <span>ESPACE PROFESSEUR</span>
          <h1>Bonjour {{ dashboard.profileSnapshot?.fullName }}</h1>
          <p>
            Suivez les validations qui vous sont assignees et vos stages
            encadres.
          </p>
        </div>

        <RouterLink to="/professor/validations" class="primary-link">
          <span class="material-icons-round">fact_check</span>
          Voir validations
        </RouterLink>
      </header>

      <div class="summary-grid">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="summary-card"
        >
          <span class="material-icons-round">{{ card.icon }}</span>
          <strong>{{ card.value }}</strong>
          <p>{{ card.label }}</p>
        </article>
      </div>

      <div class="dashboard-grid">
        <section class="dashboard-panel">
          <div class="panel-header">
            <h2>Validations en attente</h2>
            <RouterLink to="/professor/validations">Tout voir</RouterLink>
          </div>

          <div v-if="dashboard.pendingValidations?.length" class="item-list">
            <article
              v-for="validation in dashboard.pendingValidations"
              :key="`${validation.targetType}-${validation.targetId}`"
              class="list-row"
            >
              <div>
                <strong>{{ validation.title }}</strong>
                <p>{{ validation.student?.fullName }}</p>
              </div>

              <span class="type-pill">
                {{ validation.targetType === "PROJECT" ? "Projet" : "Stage" }}
              </span>
            </article>
          </div>

          <p v-else class="empty-text">Aucune validation en attente.</p>
        </section>

        <section class="dashboard-panel">
          <div class="panel-header">
            <h2>Stages supervises</h2>
          </div>

          <div v-if="dashboard.supervisedInternships?.length" class="item-list">
            <article
              v-for="internship in dashboard.supervisedInternships"
              :key="internship.id"
              class="list-row"
            >
              <div>
                <strong>{{ internship.hostOrganization }}</strong>
                <p>
                  {{ internship.studentName || "Etudiant non renseigne" }}
                  - {{ formatDate(internship.startDate) }}
                </p>
              </div>

              <span
                class="status-pill"
                :class="internship.validationStatus.toLowerCase()"
              >
                {{ statusLabels[internship.validationStatus] }}
              </span>
            </article>
          </div>

          <p v-else class="empty-text">Aucun stage supervise pour le moment.</p>
        </section>

        <section class="dashboard-panel wide">
          <div class="panel-header">
            <h2>Derniers avis</h2>
          </div>

          <div
            v-if="dashboard.recentReviewActivity?.length"
            class="activity-list"
          >
            <article
              v-for="activity in dashboard.recentReviewActivity"
              :key="`${activity.reviewType}-${activity.id}`"
              class="activity-row"
            >
              <span class="material-icons-round">
                {{
                  activity.reviewType === "PROJECT"
                    ? "folder_open"
                    : "business_center"
                }}
              </span>

              <div>
                <strong>{{ activity.label }}</strong>
                <p>{{ activity.studentName || "Etudiant non renseigne" }}</p>
              </div>

              <small>{{ formatDate(activity.decisionDate) }}</small>
            </article>
          </div>

          <p v-else class="empty-text">Aucun avis rendu recemment.</p>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.professor-dashboard-page {
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

.primary-link {
  min-height: 2.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  border-radius: var(--app-radius-md);
  background: var(--app-primary);
  color: #ffffff;
  font-weight: 800;
  text-decoration: none;
}

.primary-link .material-icons-round {
  color: #ffffff;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.summary-card,
.dashboard-panel,
.state-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.summary-card {
  min-height: 8rem;
  padding: 1.2rem;
}

.summary-card .material-icons-round {
  color: var(--app-primary);
  font-size: 1.45rem;
}

.summary-card strong {
  display: block;
  margin-top: 0.9rem;
  color: var(--app-heading);
  font-size: 2rem;
  line-height: 1;
}

.summary-card p {
  margin: 0.45rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  font-weight: 700;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.dashboard-panel {
  min-width: 0;
  padding: 1.1rem;
}

.dashboard-panel.wide {
  grid-column: 1 / -1;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-header h2 {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-text-lg);
}

.panel-header a {
  color: var(--app-primary);
  font-weight: 800;
  text-decoration: none;
}

.item-list,
.activity-list {
  display: grid;
  gap: 0.65rem;
}

.list-row,
.activity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4rem;
  padding: 0.75rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
}

.list-row strong,
.activity-row strong {
  color: var(--app-heading);
}

.list-row p,
.activity-row p {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
}

.activity-row {
  justify-content: flex-start;
}

.activity-row .material-icons-round {
  color: var(--app-primary);
}

.activity-row small {
  margin-left: auto;
  color: var(--app-muted);
}

.type-pill,
.status-pill {
  border-radius: var(--app-radius-pill);
  padding: 0.35rem 0.65rem;
  background: var(--app-active-bg);
  color: var(--app-primary);
  font-size: var(--app-text-xs);
  font-weight: 800;
  white-space: nowrap;
}

.status-pill.rejected {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.status-pill.pending,
.status-pill.changes_requested {
  background: var(--app-warning-bg);
  color: var(--app-warning);
}

.empty-text,
.state-card {
  margin: 0;
  color: var(--app-muted);
}

.state-card {
  padding: 1.4rem;
}

.state-card.error {
  color: var(--app-error);
}

@media (max-width: 1050px) {
  .summary-grid,
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .page-header,
  .list-row,
  .activity-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .activity-row small {
    margin-left: 0;
  }
}
</style>
