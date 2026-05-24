<script setup>
import { ref } from "vue";

defineProps({
  reports: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["view", "resolve", "reject", "delete-target"]);

const openMenuId = ref(null);

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const closeMenu = () => {
  openMenuId.value = null;
};

const handleAction = (eventName, report) => {
  emit(eventName, report);
  closeMenu();
};

const typeLabels = {
  PROJECT: "Projet",
  PORTFOLIO: "Portfolio",
  COMMENT: "Commentaire",
  USER: "Utilisateur",
};

const statusLabels = {
  PENDING: "En attente",
  RESOLVED: "Traite",
  REJECTED: "Rejete",
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
</script>

<template>
  <div class="reports-table">
    <div class="table-head">
      <span>Signalement</span>
      <span>Type</span>
      <span>Signale par</span>
      <span>Statut</span>
      <span>Date</span>
      <span>Actions</span>
    </div>

    <div v-for="report in reports" :key="report.id" class="table-row">
      <div class="reason-cell">
        <strong>{{ report.reason }}</strong>
        <p>{{ report.description }}</p>
      </div>

      <span class="report-type">
        {{ typeLabels[report.targetType] || report.targetType }}
      </span>

      <div class="user-cell">
        <strong>{{ report.reportedBy.fullName }}</strong>
        <p>{{ report.reportedBy.email }}</p>
      </div>

      <span class="status-badge" :class="report.status.toLowerCase()">
        {{ statusLabels[report.status] || report.status }}
      </span>

      <span class="date-cell">
        {{ formatDate(report.createdAt) }}
      </span>

      <div class="actions-cell">
        <div class="actions-dropdown">
          <button
            type="button"
            class="actions-trigger"
            title="Actions"
            @click="toggleMenu(report.id)"
          >
            <span class="material-icons-round">more_horiz</span>
          </button>

          <div v-if="openMenuId === report.id" class="actions-dropdown-menu">
            <button type="button" @click="handleAction('view', report)">
              Voir details
            </button>

            <template v-if="report.status === 'PENDING'">
              <button
                type="button"
                class="success"
                @click="handleAction('resolve', report)"
              >
                Marquer traite
              </button>

              <button
                type="button"
                class="danger"
                @click="handleAction('reject', report)"
              >
                Rejeter
              </button>

              <button
                type="button"
                class="danger"
                @click="handleAction('delete-target', report)"
              >
                Supprimer contenu
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="reports.length === 0" class="empty">
      Aucun signalement trouve.
    </div>
  </div>
</template>

<style scoped>
.reports-table {
  display: flex;
  flex-direction: column;
  font-family: var(--app-font-body);
  overflow: visible;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns:
    minmax(0, 34%)
    minmax(5rem, 10%)
    minmax(0, 24%)
    minmax(6rem, 10%)
    minmax(7rem, 12%)
    minmax(3rem, 4%);
  gap: 0.55rem;
  align-items: center;
  padding: 0.9rem 1rem;
}

.table-head span:last-child,
.actions-cell {
  justify-self: end;
}

.table-head {
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--app-surface-soft);
  border-bottom: 1px solid var(--app-border);
}

.table-head span:nth-child(6) {
  text-align: right;
}

.table-row {
  position: relative;
  min-height: 4.5rem;
  border-bottom: 1px solid var(--app-border);
}

.table-row:hover {
  background: var(--app-surface-soft);
}

.reason-cell strong,
.user-cell strong {
  color: var(--app-text);
  font-size: var(--app-text-sm);
  font-weight: 700;
}

.reason-cell p,
.user-cell p {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  line-height: var(--app-leading-normal);
}

.report-type {
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  font-weight: 600;
  white-space: nowrap;
}

.status-badge {
  width: fit-content;
  min-height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.65rem;
  border-radius: var(--app-radius-pill);
  font-size: var(--app-text-xs);
  font-weight: 800;
  white-space: nowrap;
}

.status-badge.pending {
  background: var(--app-warning-bg);
  color: var(--app-warning);
}

.status-badge.resolved {
  background: var(--app-active-bg);
  color: var(--app-active);
}

.status-badge.rejected {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.date-cell {
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  white-space: nowrap;
}

.actions-cell {
  position: relative;
  display: flex;
  justify-content: flex-end;
  overflow: visible;
}

.actions-dropdown {
  position: relative;
  display: inline-flex;
}

.actions-trigger {
  width: 2rem;
  height: 2rem;
  border: 1px solid transparent;
  border-radius: var(--app-radius-sm);
  background: transparent;
  color: var(--app-muted);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.actions-trigger:hover {
  border-color: var(--app-border);
  background: var(--app-surface-soft);
  color: var(--app-primary);
}

.actions-trigger .material-icons-round {
  font-size: 1.25rem;
}

.actions-dropdown-menu {
  position: absolute;
  right: 0;
  top: 2.35rem;
  min-width: 11.5rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  box-shadow: var(--app-shadow-popover);
  padding: 0.35rem;
  z-index: 9999;
}

.actions-dropdown-menu button {
  width: 100%;
  min-height: 2.1rem;
  border: none;
  background: transparent;
  color: var(--app-text);
  border-radius: var(--app-radius-sm);
  padding: 0 0.75rem;
  text-align: left;
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  font-weight: 600;
  cursor: pointer;
}

.actions-dropdown-menu button:hover {
  background: var(--app-surface-soft);
}

.actions-dropdown-menu button.success {
  color: var(--app-primary);
}

.actions-dropdown-menu button.danger {
  color: var(--app-error);
}

.actions-dropdown-menu button.danger:hover {
  background: var(--app-error-bg);
}

.empty {
  padding: 2rem;
  color: var(--app-muted);
  text-align: center;
  font-size: var(--app-text-md);
}

@media (max-width: 68.75rem) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 0.65rem;
    padding: 1.1rem;
  }

  .actions-cell {
    justify-content: flex-start;
  }
}
</style>
