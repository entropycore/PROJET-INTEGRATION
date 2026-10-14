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
    default: "PENDING",
  },
});

const emit = defineEmits([
  "update:search",
  "update:selectedType",
  "update:selectedStatus",
]);
</script>

<template>
  <div class="professor-validation-toolbar">
    <div class="search-box">
      <span class="material-icons-round">search</span>
      <input
        :value="search"
        type="text"
        placeholder="Rechercher par titre, étudiant ou email..."
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
    </select>

    <select
      :value="selectedStatus"
      @change="emit('update:selectedStatus', $event.target.value)"
    >
      <option value="ALL">Tous les statuts</option>
      <option value="PENDING">En attente</option>
      <option value="APPROVED">Approuvé</option>
      <option value="REJECTED">Refusé</option>
      <option value="CHANGES_REQUESTED">Correction demandée</option>
    </select>
  </div>
</template>

<style scoped>
.professor-validation-toolbar {
  display: grid;
  grid-template-columns: 1fr 13rem 13rem;
  gap: 0.8rem;
  padding: 1rem;
  border-bottom: 1px solid var(--app-border);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  height: 2.55rem;
  padding: 0 0.85rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
}

.search-box span {
  color: var(--app-muted);
  font-size: 1rem;
}

input,
select {
  width: 100%;
  height: 2.55rem;
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-md);
  background: var(--app-surface);
  color: var(--app-text);
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  outline: none;
}

input {
  height: auto;
  border: none;
  background: transparent;
}

select {
  padding: 0 0.75rem;
}

.search-box:focus-within,
select:focus {
  border-color: var(--app-primary);
  box-shadow: 0 0 0 0.18rem rgba(47, 87, 93, 0.1);
}

@media (max-width: 900px) {
  .professor-validation-toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
