<script setup>
const props = defineProps({
  validations: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["view", "approve", "reject", "request-changes"]);

const typeLabels = {
  PROJECT: "Projet",
  INTERNSHIP: "Stage",
};

const statusLabels = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Refusé",
  CHANGES_REQUESTED: "Correction demandée",
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const canAct = (validation) => validation.status === "PENDING";
</script>

<template>
  <div class="professor-validations-table">
    <div class="table-head">
      <span>Titre</span>
      <span>Étudiant</span>
      <span>Type</span>
      <span>Statut</span>
      <span>Date</span>
      <span>Actions</span>
    </div>

    <div
      v-for="validation in props.validations"
      :key="`${validation.targetType}-${validation.targetId}`"
      class="table-row"
    >
      <div class="title-cell">
        <strong>{{ validation.title }}</strong>
        <p>{{ validation.description }}</p>
      </div>

      <div class="student-cell">
        <strong>{{ validation.student?.fullName }}</strong>
        <p>{{ validation.student?.email || "Email non renseigné" }}</p>
      </div>

      <span class="type-cell">
        {{ typeLabels[validation.targetType] || validation.targetType }}
      </span>

      <span class="status-badge" :class="validation.status.toLowerCase()">
        {{ statusLabels[validation.status] || validation.status }}
      </span>

      <span class="date-cell">
        {{ formatDate(validation.submittedAt) }}
      </span>

      <div class="actions-cell">
        <button
          type="button"
          class="icon-btn"
          title="Voir"
          aria-label="Voir le détail"
          @click="emit('view', validation)"
        >
          <span class="material-icons-round">visibility</span>
        </button>

        <button
          v-if="canAct(validation)"
          type="button"
          class="icon-btn approve"
          title="Approuver"
          aria-label="Approuver"
          @click="emit('approve', validation)"
        >
          <span class="material-icons-round">check</span>
        </button>

        <button
          v-if="canAct(validation)"
          type="button"
          class="icon-btn"
          title="Demander une correction"
          aria-label="Demander une correction"
          @click="emit('request-changes', validation)"
        >
          <span class="material-icons-round">rate_review</span>
        </button>

        <button
          v-if="canAct(validation)"
          type="button"
          class="icon-btn reject"
          title="Refuser"
          aria-label="Refuser"
          @click="emit('reject', validation)"
        >
          <span class="material-icons-round">close</span>
        </button>
      </div>
    </div>

    <div v-if="!props.validations.length" class="empty-state">
      Aucune validation trouvée.
    </div>
  </div>
</template>

<style scoped>
.professor-validations-table {
  display: flex;
  flex-direction: column;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns:
    minmax(0, 32%)
    minmax(0, 24%)
    minmax(5rem, 9%)
    minmax(7rem, 12%)
    minmax(6rem, 9%)
    minmax(9rem, 14%);
  gap: 0.75rem;
  align-items: center;
  padding: 0.9rem 1rem;
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

.table-row {
  border-bottom: 1px solid var(--app-border);
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
.student-cell p,
.date-cell,
.type-cell {
  margin: 0.2rem 0 0;
  color: var(--app-muted);
  font-size: var(--app-text-xs);
}

.title-cell p {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.status-badge {
  width: fit-content;
  min-height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.65rem;
  border-radius: var(--app-radius-pill);
  background: var(--app-warning-bg);
  color: var(--app-warning);
  font-size: var(--app-text-xs);
  font-weight: 800;
  white-space: nowrap;
}

.status-badge.approved {
  background: var(--app-active-bg);
  color: var(--app-active);
}

.status-badge.rejected {
  background: var(--app-error-bg);
  color: var(--app-error);
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: 0.35rem;
}

.icon-btn {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-sm);
  background: var(--app-surface);
  color: var(--app-primary);
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--app-surface-soft);
}

.icon-btn.approve {
  color: var(--app-active);
}

.icon-btn.reject {
  color: var(--app-error);
}

.icon-btn .material-icons-round {
  font-size: 1.1rem;
}

.empty-state {
  padding: 2rem;
  color: var(--app-muted);
  text-align: center;
}

@media (max-width: 1100px) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .actions-cell {
    justify-content: flex-start;
  }
}
</style>
