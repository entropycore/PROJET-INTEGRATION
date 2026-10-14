<script setup>
defineProps({
  status: {
    type: String,
    default: "PENDING",
  },
});

const labels = {
  DRAFT: "Brouillon",
  PENDING: "En attente",
  APPROVED: "Validée",
  REJECTED: "Refusée",
  CHANGES_REQUESTED: "Correction demandée",
};
</script>

<template>
  <span class="status-badge" :class="status.toLowerCase()">
    {{ labels[status] || "En attente" }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.approved {
  border-color: #c8e6c9;
  background: #edf7ed;
  color: #2e7d32;
}

.pending {
  border-color: #f4e8d1;
  background: #fffaf0;
  color: #b87518;
}

.draft {
  border-color: #dfe1e5;
  background: #f3f4f6;
  color: #5f6368;
}

.rejected {
  border-color: #f5c6cb;
  background: #fdecea;
  color: #c62828;
}

.changes_requested {
  border-color: #f4e8d1;
  background: #fffaf0;
  color: #b87518;
}
</style>
