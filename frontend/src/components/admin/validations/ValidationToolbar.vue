<script setup>
defineProps({
  search: {
    type: String,
    default: "",
  },
  selectedType: {
    type: String,
    default: "ALL",
  },
  selectedStatus: {
    type: String,
    default: "ALL",
  },
});

const emit = defineEmits([
  "update:search",
  "update:selectedType",
  "update:selectedStatus",
]);
</script>

<template>
  <div class="toolbar">
    <div class="search-box">
      <span class="material-icons-round search-icon">search</span>

      <input
        :value="search"
        type="text"
        placeholder="Rechercher par titre, etudiant ou email..."
        @input="emit('update:search', $event.target.value)"
      />
    </div>

    <select
      :value="selectedType"
      @change="emit('update:selectedType', $event.target.value)"
    >
      <option value="ALL">Tous les types</option>
      <option value="PROJECT">Projets</option>
      <option value="INTERNSHIP">Stages</option>
      <option value="CERTIFICATE">Certificats</option>
      <option value="ACTIVITY">Activites</option>
    </select>

    <select
      :value="selectedStatus"
      @change="emit('update:selectedStatus', $event.target.value)"
    >
      <option value="ALL">Tous les statuts</option>
      <option value="PENDING">En attente</option>
      <option value="APPROVED">Approuve</option>
      <option value="REJECTED">Refuse</option>
      <option value="CHANGES_REQUESTED">Correction demandee</option>
    </select>
  </div>
</template>

<style scoped>
.toolbar {
  display: grid;
  grid-template-columns: 1fr 13.75rem 13.75rem;
  gap: 0.8rem;
  align-items: center;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid var(--app-border);
  font-family: var(--app-font-body);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  height: 2.5rem;
  padding: 0 0.8rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
}

.search-icon {
  color: var(--app-muted);
  font-size: 1rem;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--app-text);
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  font-weight: 500;
}

.search-box input::placeholder {
  color: var(--app-subtle);
}

select {
  height: 2.5rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  padding: 0 0.75rem;
  background: var(--app-surface);
  color: var(--app-text);
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  font-weight: 500;
  outline: none;
  cursor: pointer;
}

.search-box:focus-within,
select:focus {
  border-color: var(--app-primary);
  box-shadow: 0 0 0 0.18rem rgba(47, 87, 93, 0.1);
}

@media (max-width: 900px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
