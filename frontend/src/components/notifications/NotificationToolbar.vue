<script setup>
defineProps({
  unreadCount: Number,
  selectedType: String,
});

const emit = defineEmits(["read-all", "update:selectedType"]);
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-actions">
      <div class="filter-group">
        <span>Filtrer par catégorie :</span>

        <select
          :value="selectedType"
          @change="emit('update:selectedType', $event.target.value)"
        >
          <option value="ALL">Tous les types</option>
          <option value="INFO">Inscription</option>
          <option value="VALIDATION">Validation</option>
          <option value="ALERT">Alerte</option>
        </select>
      </div>

      <button @click="emit('read-all')">
        ✓ Tout marquer comme lu
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group span {
  color: #5f6f70;
  font-size: 0.95rem;
  font-weight: 600;
}

select {
  min-width: 175px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 14px;
  background: #f9fafb;
  color: #0f2f3a;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}

select:focus {
  border-color: #2f5d62;
}

button {
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  background: #2f5d62;
  color: #ffffff;
  font-weight: 800;
  cursor: pointer;
}

button:hover {
  background: #274f53;
}

@media (max-width: 700px) {
  .toolbar,
  .toolbar-actions,
  .filter-group {
    width: 100%;
  }

  .toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  select,
  button {
    width: 100%;
  }
}
</style>