<script setup>
import { computed, onMounted, ref } from "vue";

import StatCard from "@/components/ui/StatCard.vue";
import { DASHBOARD_ICONS } from "@/constants/dashboardIcons";
import { getDashboard } from "@/services/dashboardService";

const dashboard = ref(null);
const isLoading = ref(true);
const errorMessage = ref("");

const summaryCards = computed(() => {
  const cards = dashboard.value?.summaryCards || {};

  return [
    {
      title: "Profil complété",
      value: `${cards.profileCompletion?.value ?? 0}%`,
      subtitle: "Informations professionnelles renseignées",
      icon: DASHBOARD_ICONS.profileCompletion,
    },
    {
      title: "Email vérifié",
      value: cards.emailVerified?.value ?? 0,
      subtitle: "Statut de vérification de votre email",
      icon: DASHBOARD_ICONS.emailVerified,
    },
    {
      title: "Validation administrateur",
      value: cards.adminVerified?.value ?? 0,
      subtitle: "Statut de validation de votre compte",
      icon: DASHBOARD_ICONS.adminVerified,
    },
    {
      title: "Compte suspendu",
      value: cards.accountSuspended?.value ?? 0,
      subtitle: "Indicateur de suspension du compte",
      icon: DASHBOARD_ICONS.suspendedAccount,
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

onMounted(async () => {
  try {
    const response = await getDashboard("professional");
    dashboard.value = response.data;
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || "Impossible de charger votre espace.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="professional-dashboard">
    <header class="page-header">
      <span>ESPACE PROFESSIONNEL</span>
      <h1>
        Bonjour {{ dashboard?.profileSnapshot?.fullName || "Professionnel" }}
      </h1>
      <p>
        Suivez l'état de votre compte et complétez votre profil professionnel.
      </p>
    </header>

    <p v-if="errorMessage" class="state-card error">{{ errorMessage }}</p>

    <div v-else class="stats-grid">
      <template v-if="isLoading">
        <StatCard v-for="index in 4" :key="index" loading />
      </template>

      <StatCard
        v-for="card in summaryCards"
        v-else
        :key="card.title"
        :value="card.value"
        :title="card.title"
        :subtitle="card.subtitle"
        :icon="card.icon"
      />
    </div>

    <section
      v-if="!isLoading && dashboard?.timeline?.length"
      class="timeline-card"
    >
      <h2>Historique du compte</h2>
      <div class="timeline-list">
        <div
          v-for="item in dashboard.timeline"
          :key="`${item.type}-${item.date}`"
        >
          <span class="timeline-dot"></span>
          <div>
            <strong>{{ item.label }}</strong>
            <p>{{ item.details || formatDate(item.date) }}</p>
          </div>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.professional-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  color: var(--app-text);
}

.page-header > span {
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

.page-header p,
.timeline-list p {
  margin: 0.45rem 0 0;
  color: var(--app-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.timeline-card,
.state-card {
  padding: 1.4rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
}

.timeline-card h2 {
  margin: 0 0 1rem;
  color: var(--app-heading);
  font-size: var(--app-text-xl);
}

.timeline-list {
  display: grid;
  gap: 0.8rem;
}

.timeline-list > div {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.8rem;
  align-items: start;
  padding: 0.8rem;
  border-radius: var(--app-radius-md);
  background: var(--app-surface-soft);
}

.timeline-dot {
  width: 0.65rem;
  height: 0.65rem;
  margin-top: 0.3rem;
  border-radius: 50%;
  background: var(--app-accent);
}

.timeline-list strong {
  color: var(--app-heading);
}

.timeline-list p {
  font-size: var(--app-text-sm);
}

.state-card.error {
  color: var(--app-error);
}

@media (max-width: 1050px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
