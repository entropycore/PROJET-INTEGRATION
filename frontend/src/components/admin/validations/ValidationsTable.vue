<script setup>
defineProps({
  validations: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["view", "approve", "reject", "request-changes"]);

const typeLabels = {
  PROJECT: "Projet",
  INTERNSHIP: "Stage",
  CERTIFICATE: "Certificat",
  ACTIVITY: "Activité",
};

const formatDate = (date) => {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
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

      <span class="type-badge" :class="validation.targetType.toLowerCase()">
        {{ typeLabels[validation.targetType] }}
      </span>

      <span class="status-badge">
        En attente
      </span>

      <span class="date-cell">
        {{ formatDate(validation.submittedAt) }}
      </span>

      <div class="actions">
        <button title="Voir" @click="emit('view', validation)">👁</button>

        <button
          title="Approuver"
          class="approve"
          @click="emit('approve', validation)"
        >
          ✓
        </button>

        <button
          title="Refuser"
          class="reject"
          @click="emit('reject', validation)"
        >
          ×
        </button>

        <button
          title="Demander correction"
          @click="emit('request-changes', validation)"
        >
          …
        </button>
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
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1.4fr 0.9fr 0.9fr 1fr 1.1fr;
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

.title-cell strong,
.student-cell strong {
  color: #0f2f3a;
  font-weight: 800;
}

.title-cell p,
.student-cell p {
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

.type-badge.project {
  background: #eef6ff;
  color: #2563eb;
}

.type-badge.internship {
  background: #eef8ef;
  color: #15803d;
}

.type-badge.certificate {
  background: #f3eafa;
  color: #7e22ce;
}

.type-badge.activity {
  background: #fff0e6;
  color: #ea580c;
}

.status-badge {
  background: #fff7ed;
  color: #ea580c;
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

.actions .approve {
  background: #ecfdf5;
  color: #059669;
}

.actions .reject {
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