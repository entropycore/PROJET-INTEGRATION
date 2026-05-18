<script setup>
defineProps({
  status: {
    type: String,
    default: 'PENDING',
  },
})

const statusConfig = {
  DRAFT: {
    label: 'Brouillon',
    class: 'draft',
  },

  PENDING: {
    label: 'En attente',
    class: 'pending',
  },

  APPROVED: {
    label: 'Validé',
    class: 'approved',
  },

  REJECTED: {
    label: 'Refusé',
    class: 'rejected',
  },

  CORRECTION_REQUIRED: {
    label: 'Correction demandée',
    class: 'correction',
  },
}
</script>

<template>
  <span
    class="validation-badge"
    :class="statusConfig[status]?.class"
  >
    {{ statusConfig[status]?.label }}
  </span>
</template>

<style scoped>
.validation-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  border: 1px solid transparent;
  white-space: nowrap;
}

.approved {
  background: #edf7ed;
  color: #2e7d32;
  border-color: #c8e6c9;
}

.pending {
  background: #fff8e1;
  color: #ef6c00;
  border-color: #ffe0b2;
}

.rejected {
  background: #fdecea;
  color: #c62828;
  border-color: #f5c6cb;
}

.draft {
  background: #f3f4f6;
  color: #5f6368;
  border-color: #dfe1e5;
}

.correction {
  background: #fff3e0;
  color: #e65100;
  border-color: #ffcc80;
}
</style>