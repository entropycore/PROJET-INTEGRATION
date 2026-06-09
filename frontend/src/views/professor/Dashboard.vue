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
      label: "Projets à valider",
      value: cards.pendingProjects?.value || 0,
      icon: "folder_open",
    },
    {
      label: "Stages à valider",
      value: cards.pendingInternships?.value || 0,
      icon: "business_center",
    },
    {
      label: "Stages supervisés",
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
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
  CHANGES_REQUESTED: "Correction demandée",
};

const getStatusLabel = (status) => statusLabels[status] || "Statut inconnu";

const getStatusClass = (status) => String(status || "").toLowerCase();

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
            Suivez les validations qui vous sont assignées et vos stages
            encadrés.
          </p>
        </div>

       
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
            <div class="panel-title-group">
              <div class="panel-title-row">
                <span class="material-icons-round">pending_actions</span>
                <h2>Validations en attente</h2>
              </div>
              <p>Les projets et stages qui nécessitent votre avis.</p>
            </div>
            <RouterLink to="/professor/validations">
              Tout voir
              <span class="material-icons-round">arrow_forward</span>
            </RouterLink>
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
                <span class="material-icons-round">
                  {{
                    validation.targetType === "PROJECT"
                      ? "folder_open"
                      : "business_center"
                  }}
                </span>
                {{ validation.targetType === "PROJECT" ? "Projet" : "Stage" }}
              </span>
            </article>
          </div>

          <p v-else class="empty-text">Aucune validation en attente.</p>
        </section>

        <section class="dashboard-panel">
          <div class="panel-header">
            <div class="panel-title-group">
              <div class="panel-title-row">
                <span class="material-icons-round">school</span>
                <h2>Stages supervisés</h2>
              </div>
              <p>Les stages actuellement suivis sous votre supervision.</p>
            </div>
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
                  {{ internship.studentName || "Étudiant non renseigné" }}
                  - {{ formatDate(internship.startDate) }}
                </p>
              </div>

              <span
                class="status-pill"
                :class="getStatusClass(internship.validationStatus)"
              >
                {{ getStatusLabel(internship.validationStatus) }}
              </span>
            </article>
          </div>

          <p v-else class="empty-text">Aucun stage supervisé pour le moment.</p>
        </section>

        <section class="dashboard-panel wide">
          <div class="panel-header">
            <div class="panel-title-group">
              <div class="panel-title-row">
                <span class="material-icons-round">history</span>
                <h2>Derniers avis</h2>
              </div>
              <p>Vos décisions de validation les plus récentes.</p>
            </div>
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
                <p>{{ activity.studentName || "Étudiant non renseigné" }}</p>
              </div>

              <small>{{ formatDate(activity.decisionDate) }}</small>
            </article>
          </div>

          <p v-else class="empty-text">Aucun avis rendu récemment.</p>
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
  width: 2.45rem;
  height: 2.45rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--app-active-bg);
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
  padding: 1.5rem;
}

.dashboard-panel.wide {
  grid-column: 1 / -1;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.panel-title-group {
  min-width: 0;
}

.panel-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.panel-title-row > .material-icons-round {
  color: var(--app-primary);
  font-size: 1.15rem;
}

.panel-header h2 {
  margin: 0;
  color: var(--app-primary);
  font-family: var(--app-font-body);
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.25;
}

.panel-title-group p {
  margin: 0.35rem 0 0 1.65rem;
  color: var(--app-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}

.panel-header a {
  min-height: 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid var(--app-border);
  border-radius: 0.7rem;
  background: var(--app-surface-soft);
  color: var(--app-primary);
  padding: 0 0.9rem;
  font-size: 0.78rem;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.panel-header a:hover {
  background: var(--app-active-bg);
  border-color: var(--app-active-border);
}

.panel-header a .material-icons-round {
  font-size: 1rem;
}

.item-list,
.activity-list {
  display: flex;
  flex-direction: column;
}

.list-row,
.activity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 4.5rem;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid var(--app-neutral-bg);
  border-radius: 0.75rem;
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.list-row:last-child,
.activity-row:last-child {
  border-bottom: 0;
}

.list-row:hover,
.activity-row:hover {
  background: var(--app-surface-soft);
  box-shadow: inset 0 0 0 1px var(--app-border);
}

.list-row > div,
.activity-row > div {
  min-width: 0;
}

.list-row strong,
.activity-row strong {
  color: var(--app-heading);
  font-family: var(--app-font-body);
  font-size: 1rem;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.list-row p,
.activity-row p {
  margin: 0.18rem 0 0;
  color: var(--app-muted);
  font-size: 0.84rem;
  font-weight: 600;
}

.activity-row {
  justify-content: flex-start;
}

.activity-row .material-icons-round {
  width: 2.7rem;
  height: 2.7rem;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--app-active-bg);
  color: var(--app-primary);
  font-size: 1.15rem;
}

.activity-row small {
  margin-left: auto;
  color: var(--app-muted);
  font-size: 0.76rem;
  white-space: nowrap;
}

.type-pill,
.status-pill {
  min-height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: var(--app-radius-pill);
  padding: 0 0.8rem;
  background: var(--app-active-bg);
  color: var(--app-primary);
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
}

.type-pill .material-icons-round {
  font-size: 0.95rem;
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

.empty-text {
  padding: 1.4rem 0;
  text-align: center;
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
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .panel-header {
    flex-direction: column;
  }

  .panel-header a {
    width: 100%;
  }

  .summary-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .list-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .activity-row {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .activity-row small {
    grid-column: 2;
    margin-left: 0;
  }
}
</style>
