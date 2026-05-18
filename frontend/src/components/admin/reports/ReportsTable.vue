<script setup>
defineProps({
  reports: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["view", "resolve", "reject", "delete-target"]);

const typeLabels = {
  PROJECT: "Projet",
  PORTFOLIO: "Portfolio",
  COMMENT: "Commentaire",
  USER: "Utilisateur",
};

const statusLabels = {
  PENDING: "En attente",
  RESOLVED: "Traité",
  REJECTED: "Rejeté",
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
      <span>Signalé par</span>
      <span>Statut</span>
      <span>Date</span>
      <span>Actions</span>
    </div>

    <div v-for="report in reports" :key="report.id" class="table-row">
      <div class="reason-cell">
        <strong>{{ report.reason }}</strong>
        <p>{{ report.description }}</p>
      </div>

      <span class="type-badge" :class="report.targetType.toLowerCase()">
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

      <div class="actions">
        <button title="Voir" @click="emit('view', report)">👁</button>

        <button
          v-if="report.status === 'PENDING'"
          title="Marquer traité"
          class="resolve"
          @click="emit('resolve', report)"
        >
          ✓
        </button>

        <button
          v-if="report.status === 'PENDING'"
          title="Rejeter"
          class="reject"
          @click="emit('reject', report)"
        >
          ×
        </button>

        <button
          v-if="report.status === 'PENDING'"
          title="Supprimer contenu"
          class="delete"
          @click="emit('delete-target', report)"
        >
          🗑
        </button>
      </div>
    </div>

    <div v-if="reports.length === 0" class="empty">
      Aucun signalement trouvé.
    </div>
  </div>
</template>

<style scoped>
.reports-table {
  display: flex;
  flex-direction: column;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1.4fr 0.9fr 1fr 1.1fr;
  gap: 16px;
  align-items: center;
  padding: 16px 8px;
}

.table-head {
  color: #5f6f70;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e0d8;
}

.table-row {
  border-bottom: 1px solid #edf0ec;
}

.reason-cell strong,
.user-cell strong {
  color: #0f2f3a;
  font-weight: 800;
}

.reason-cell p,
.user-cell p {
  margin: 5px 0 0;
  color: #7f9699;
  font-size: 0.88rem;
}

.type-badge,
.status-badge {
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.type-badge.project,
.type-badge.portfolio {
  background: #e8f5f1;
  color: #2f5d62;
}

.type-badge.comment,
.type-badge.user {
  background: #fff4e6;
  color: #ea580c;
}

.status-badge.pending {
  background: #fff7ed;
  color: #ea580c;
}

.status-badge.resolved {
  background: #e8f5f1;
  color: #2f5d62;
}

.status-badge.rejected {
  background: #fef2f2;
  color: #dc2626;
}

.date-cell {
  color: #5f6f70;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  width: 36px;
  height: 36px;
  border: 1px solid #dfe3dd;
  border-radius: 10px;
  background: #ffffff;
  color: #2f5d62;
  font-weight: 800;
  cursor: pointer;
}

.actions .resolve {
  background: #e8f5f1;
  color: #2f5d62;
}

.actions .reject,
.actions .delete {
  background: #fef2f2;
  color: #dc2626;
}

.empty {
  padding: 22px;
  border-radius: 16px;
  background: #fbfaf7;
  border: 1px solid #dfe3dd;
  color: #6b7280;
  text-align: center;
  margin-top: 16px;
}

@media (max-width: 1100px) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 18px 0;
  }
}
</style>
