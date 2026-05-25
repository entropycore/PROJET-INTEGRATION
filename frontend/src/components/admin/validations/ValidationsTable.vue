<script setup>
import { ref } from "vue";

defineProps({
  validations: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["view", "approve", "reject", "request-changes"]);

const openMenuId = ref(null);

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const closeMenu = () => {
  openMenuId.value = null;
};

const typeLabels = {
  PROJECT: "Projet",
  INTERNSHIP: "Stage",
  CERTIFICATE: "Certificat",
  ACTIVITY: "Activité",
};

const statusLabels = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
  CHANGES_REQUESTED: "Correction demandée",
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const handleAction = (eventName, validation) => {
  emit(eventName, validation);
  closeMenu();
};
</script>

<template>
  <div class="validations-table">
    <div class="table-head">
      <span>Titre</span>
      <span>Étudiant</span>
      <span>Type</span>
      <span>Statut</span>
      <span>Soumis le</span>
      <span>Actions</span>
    </div>

    <div
      v-for="validation in validations"
      :key="validation.id"
      class="table-row"
    >
      <div class="title-cell">
        <strong>{{ validation.title }}</strong>
        <p>{{ validation.description }}</p>
      </div>

      <div class="student-cell">
        <strong>{{ validation.student.fullName }}</strong>
        <p>{{ validation.student.email }}</p>
      </div>

      <span class="validation-type">
        {{ typeLabels[validation.targetType] || validation.targetType }}
      </span>

      <span class="status-badge" :class="validation.status.toLowerCase()">
        {{ statusLabels[validation.status] || validation.status }}
      </span>

      <span class="date-cell">
        {{ formatDate(validation.submittedAt) }}
      </span>

      <div class="actions-cell">
        <div class="actions-dropdown">
          <button
            type="button"
            class="actions-trigger"
            title="Actions"
            @click="toggleMenu(validation.id)"
          >
            <span class="material-icons-round">more_horiz</span>
          </button>

          <div
            v-show="openMenuId === validation.id"
            class="actions-dropdown-menu"
          >
            <button type="button" @click="handleAction('view', validation)">
              Voir détails
            </button>

            <button
              type="button"
              class="success approve"
              @click="handleAction('approve', validation)"
            >
              Valider
            </button>

            <button
              type="button"
              @click="handleAction('request-changes', validation)"
            >
              Demander correction
            </button>

            <button
              type="button"
              class="danger reject"
              @click="handleAction('reject', validation)"
            >
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="validations.length === 0" class="empty">
      Aucune validation trouvée.
    </div>
  </div>
</template>

<style scoped>
.validations-table {
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
    minmax(0, 26%)
    minmax(5rem, 9%)
    minmax(6rem, 10%)
    minmax(7rem, 11%)
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
  border-bottom: 1px solid var(--app-border);
  min-height: 4.5rem;
}

.table-row:hover {
  background: var(--app-surface-soft);
}

.title-cell strong,
.student-cell strong {
  color: var(--app-text);
  font-size: var(--app-text-sm);
  font-weight: 700;
}

.title-cell p,
.student-cell p {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
  line-height: var(--app-leading-normal);
}

.validation-type {
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

.status-badge,
.status-badge.pending,
.status-badge.changes_requested {
  background: var(--app-warning-bg);
  color: var(--app-warning);
}

.status-badge.approved {
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
  min-width: 11rem;
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

@media (max-width: 1100px) {
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
