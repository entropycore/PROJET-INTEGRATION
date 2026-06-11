<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { getProfessionalDashboard } from "@/services/professionalApi";

const dashboard = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

const formatDate = (date) => {
  if (!date) return "Non renseigne";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const stateLabels = {
  APPROVED: "Compte valide",
  PENDING: "En attente",
  REJECTED: "Refuse",
  SUSPENDED: "Suspendu",
};

const stateIcons = {
  APPROVED: "verified",
  PENDING: "hourglass_top",
  REJECTED: "block",
  SUSPENDED: "pause_circle",
};

const getStateLabel = (state) => stateLabels[state] || "Statut inconnu";
const getStateClass = (state) => String(state || "PENDING").toLowerCase();

const summaryCards = computed(() => {
  const cards = dashboard.value?.summaryCards || {};

  return [
    {
      label: "Profil complet",
      value: `${cards.profileCompletion?.value || 0}%`,
      icon: "fact_check",
      className: "completion",
    },
    {
      label: "Email verifie",
      value: cards.emailVerified?.value ? "Oui" : "Non",
      icon: "mark_email_read",
      className: cards.emailVerified?.value ? "ok" : "warning",
    },
    {
      label: "Validation admin",
      value: cards.adminVerified?.value ? "Oui" : "Non",
      icon: "admin_panel_settings",
      className: cards.adminVerified?.value ? "ok" : "warning",
    },
    {
      label: "Compte suspendu",
      value: cards.accountSuspended?.value ? "Oui" : "Non",
      icon: "gpp_bad",
      className: cards.accountSuspended?.value ? "danger" : "ok",
    },
  ];
});

const profile = computed(() => dashboard.value?.profileSnapshot || {});
const overview = computed(() => dashboard.value?.accountOverview || {});

const accountMessage = computed(() => {
  if (overview.value.suspensionReason) return overview.value.suspensionReason;
  if (overview.value.rejectionReason) return overview.value.rejectionReason;
  if (!overview.value.isEmailVerified) {
    return "Verifiez votre email pour continuer le processus d'acces.";
  }
  if (!overview.value.isVerified) {
    return "Votre demande est en cours de verification par l'administration.";
  }

  return "Votre compte est actif. Vous pouvez consulter les portfolios publics.";
});

onMounted(async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    dashboard.value = await getProfessionalDashboard();
  } catch (error) {
    console.error("Erreur dashboard professionnel :", error);
    errorMessage.value = "Impossible de charger l'espace professionnel.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="professional-dashboard-page">
    <div v-if="isLoading" class="state-card">Chargement du dashboard...</div>

    <div v-else-if="errorMessage" class="state-card error">
      {{ errorMessage }}
    </div>

    <template v-else>
      <header class="page-header">
        <div>
          <span>ESPACE PROFESSIONNEL</span>
          <h1>Bonjour {{ profile.fullName }}</h1>
          <p>
            Suivez votre acces recruteur et explorez les portfolios valides des
            etudiants.
          </p>
        </div>

        <RouterLink to="/professional/profiles" class="primary-link">
          <span class="material-icons-round">manage_search</span>
          Explorer les profils
        </RouterLink>
      </header>

      <section class="account-banner" :class="getStateClass(overview.currentState)">
        <span class="material-icons-round">
          {{ stateIcons[overview.currentState] || "info" }}
        </span>

        <div>
          <strong>{{ getStateLabel(overview.currentState) }}</strong>
          <p>{{ accountMessage }}</p>
        </div>
      </section>

      <div class="summary-grid">
        <article
          v-for="card in summaryCards"
          :key="card.label"
          class="summary-card"
          :class="card.className"
        >
          <span class="material-icons-round">{{ card.icon }}</span>
          <strong>{{ card.value }}</strong>
          <p>{{ card.label }}</p>
        </article>
      </div>

      <div class="dashboard-grid">
        <section class="dashboard-panel">
          <div class="panel-header">
            <h2>Identite professionnelle</h2>
            <RouterLink to="/professional/profile">Modifier</RouterLink>
          </div>

          <div class="info-list">
            <div>
              <span>Entreprise</span>
              <strong>{{ profile.company || "Non renseigne" }}</strong>
            </div>
            <div>
              <span>Poste</span>
              <strong>{{ profile.jobTitle || "Non renseigne" }}</strong>
            </div>
            <div>
              <span>Secteur</span>
              <strong>{{ profile.sector || "Non renseigne" }}</strong>
            </div>
            <div>
              <span>Derniere connexion</span>
              <strong>{{ formatDate(profile.lastLoginAt) }}</strong>
            </div>
          </div>
        </section>

        <section class="dashboard-panel">
          <div class="panel-header">
            <h2>Actions rapides</h2>
          </div>

          <div class="quick-actions">
            <RouterLink to="/professional/profiles">
              <span class="material-icons-round">search</span>
              Rechercher un profil
            </RouterLink>
            <RouterLink to="/professional/profile">
              <span class="material-icons-round">badge</span>
              Completer mon profil
            </RouterLink>
            <RouterLink to="/professional/notifications">
              <span class="material-icons-round">notifications</span>
              Voir les notifications
            </RouterLink>
          </div>
        </section>

        <section class="dashboard-panel wide">
          <div class="panel-header">
            <h2>Historique du compte</h2>
          </div>

          <div v-if="dashboard.timeline?.length" class="timeline-list">
            <article
              v-for="item in dashboard.timeline"
              :key="`${item.type}-${item.date}`"
              class="timeline-row"
            >
              <span class="timeline-dot"></span>

              <div>
                <strong>{{ item.label }}</strong>
                <p v-if="item.actor">
                  Par {{ item.actor.fullName }} - {{ item.actor.email }}
                </p>
                <p v-if="item.details">{{ item.details }}</p>
              </div>

              <small>{{ formatDate(item.date) }}</small>
            </article>
          </div>

          <p v-else class="empty-text">Aucun historique disponible.</p>
        </section>
      </div>
    </template>
  </section>
</template>

<style scoped>
.professional-dashboard-page {
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

.primary-link,
.quick-actions a {
  min-height: 2.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--app-radius-md);
  font-weight: 800;
  text-decoration: none;
}

.primary-link {
  padding: 0 1rem;
  background: var(--app-primary);
  color: #ffffff;
}

.primary-link .material-icons-round {
  color: #ffffff;
}

.account-banner,
.summary-card,
.dashboard-panel,
.state-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.account-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1rem;
}

.account-banner > .material-icons-round {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--app-active-bg);
  color: var(--app-primary);
}

.account-banner strong {
  color: var(--app-heading);
}

.account-banner p {
  margin: 0.25rem 0 0;
  color: var(--app-muted);
}

.account-banner.pending > .material-icons-round {
  background: var(--app-warning-bg);
  color: var(--app-warning);
}

.account-banner.rejected > .material-icons-round,
.account-banner.suspended > .material-icons-round {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
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

.summary-card.warning .material-icons-round {
  background: var(--app-warning-bg);
  color: var(--app-warning);
}

.summary-card.danger .material-icons-round {
  background: var(--app-error-bg);
  color: var(--app-error);
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

.info-list {
  display: grid;
  gap: 0.75rem;
}

.info-list div {
  min-height: 3.1rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.info-list span {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
}

.info-list strong {
  color: var(--app-heading);
  overflow-wrap: anywhere;
}

.quick-actions {
  display: grid;
  gap: 0.7rem;
}

.quick-actions a {
  justify-content: flex-start;
  padding: 0 0.85rem;
  border: 1px solid var(--app-border);
  background: var(--app-surface-soft);
  color: var(--app-primary);
}

.timeline-list {
  display: grid;
  gap: 0.65rem;
}

.timeline-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: 0.85rem;
  padding: 0.85rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.timeline-dot {
  width: 0.75rem;
  height: 0.75rem;
  margin-top: 0.3rem;
  border-radius: 50%;
  background: var(--app-primary);
}

.timeline-row strong {
  color: var(--app-heading);
}

.timeline-row p,
.timeline-row small,
.empty-text,
.state-card {
  color: var(--app-muted);
}

.timeline-row p {
  margin: 0.25rem 0 0;
  font-size: var(--app-text-sm);
}

.empty-text {
  margin: 0;
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

@media (max-width: 1050px) {
  .summary-grid,
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .page-header,
  .account-banner,
  .timeline-row {
    align-items: flex-start;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .summary-grid,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
