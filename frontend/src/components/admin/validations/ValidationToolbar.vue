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
      <span class="search-icon">⌕</span>

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
      <option value="CERTIFICATE">Certificats</option>
      <option value="ACTIVITY">Activités</option>
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
.toolbar {
  display: grid;
  grid-template-columns: 1fr 220px 220px;
  gap: 14px;
  margin-bottom: 22px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 16px;
  background: #ffffff;
  border: 1px solid #dfe3dd;
  border-radius: 12px;
}

.search-icon {
  color: #8aa0a3;
  font-size: 1.1rem;
}

.search-box input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: #0f2f3a;
  font-weight: 600;
}

.search-box input::placeholder {
  color: #8aa0a3;
}

select {
  height: 48px;
  border: 1px solid #dfe3dd;
  border-radius: 12px;
  padding: 0 14px;
  background: #ffffff;
  color: #0f2f3a;
  font-weight: 100;
  outline: none;
  cursor: pointer;
}

.search-box:focus-within,
select:focus {
  border-color: #2f5d62;
  box-shadow: 0 0 0 3px rgba(47, 93, 98, 0.08);
}

@media (max-width: 900px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>