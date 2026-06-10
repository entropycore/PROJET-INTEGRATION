<script setup>
defineProps({
  search: String,
  status: String,
  type: String,
});

const emit = defineEmits(["update:search", "update:status", "update:type"]);
</script>

<template>
  <div class="filters-card">
    <label class="search-wrapper">
      <span class="material-icons-round">search</span>
      <input
        :value="search"
        type="search"
        placeholder="Rechercher par auteur ou objet..."
        @input="emit('update:search', $event.target.value)"
      />
    </label>

    <select :value="status" @change="emit('update:status', $event.target.value)">
      <option value="ALL">Tous les statuts</option>
      <option value="PENDING">En attente</option>
      <option value="DRAFT">Brouillon enseignant</option>
      <option value="APPROVED">Validée</option>
      <option value="CHANGES_REQUESTED">Correction demandée</option>
      <option value="REJECTED">Refusée</option>
    </select>

    <select :value="type" @change="emit('update:type', $event.target.value)">
      <option value="ALL">Tous les types</option>
      <option value="DOUBLE_DEGREE">Double diplôme</option>
      <option value="MASTER">Master</option>
      <option value="DOCTORATE">Doctorat</option>
      <option value="INTERNSHIP">Stage</option>
      <option value="EMPLOYMENT">Emploi</option>
      <option value="INTERNATIONAL_PROGRAM">Programme international</option>
    </select>
  </div>
</template>

<style scoped>
.filters-card {
  display: grid;
  grid-template-columns: 1fr 15rem 15rem;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #dee1dd;
  border-radius: 0.75rem;
  background: #ffffff;
}

.search-wrapper {
  position: relative;
}

.search-wrapper span {
  position: absolute;
  top: 50%;
  left: 0.9rem;
  transform: translateY(-50%);
  color: #6d9197;
}

input,
select {
  width: 100%;
  height: 3rem;
  border: 1px solid #c4cdc1;
  border-radius: 0.5625rem;
  background: #ffffff;
  color: #28363d;
  font: inherit;
  outline: none;
}

input {
  padding: 0 0.9rem 0 2.8rem;
}

select {
  padding: 0 0.8rem;
}

input:focus,
select:focus {
  border-color: #2f575d;
}

@media (max-width: 950px) {
  .filters-card {
    grid-template-columns: 1fr;
  }
}
</style>
