<script setup>
defineProps({
  unreadCount: Number,
  selectedType: String,
});

const emit = defineEmits(["read-all", "update:selectedType"]);
</script>

<template>
  <div class="toolbar">
    <div class="unread-count">
      <span>Non lues</span>
      <strong>{{ unreadCount }}</strong>
    </div>

    <div class="toolbar-actions">
      <div class="filter-group">
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

      <button type="button" @click="emit('read-all')">
        Tout marquer comme lu
      </button>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-card);
  font-family: var(--app-font-body);
  box-shadow: 0 0.65rem 1.6rem rgba(47, 87, 93, 0.04);
}

.unread-count {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--app-muted);
  font-size: var(--app-text-sm);
  font-weight: 800;
}

.unread-count strong {
  min-width: 1.45rem;
  min-height: 1.45rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--app-radius-pill);
  background: var(--app-active-bg);
  color: var(--app-active);
  font-size: var(--app-text-xs);
  font-weight: 900;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.filter-group {
  display: flex;
}

select {
  height: 2.5rem;
  min-width: 12rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  padding: 0 0.75rem;
  background: var(--app-surface);
  color: var(--app-text);
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  font-weight: 650;
  outline: none;
  cursor: pointer;
}

select:focus {
  border-color: var(--app-primary);
  box-shadow: 0 0 0 0.18rem rgba(47, 87, 93, 0.1);
}

button {
  height: 2.5rem;
  border: 1px solid var(--app-primary);
  border-radius: var(--app-radius-md);
  padding: 0 0.85rem;
  background: var(--app-primary);
  color: var(--app-surface);
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

button:hover {
  border-color: var(--app-primary-hover);
  background: var(--app-primary-hover);
}

@media (max-width: 43.75rem) {
  .toolbar,
  .toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  select,
  button {
    width: 100%;
  }
}
</style>
