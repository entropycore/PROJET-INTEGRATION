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
    <div class="search-wrapper">
      <span class="material-icons-round search-icon">search</span>

      <input
        :value="search"
        type="text"
        placeholder="Rechercher une activité, un organisme..."
        @input="emit('update:search', $event.target.value)"
      />
    </div>

    <select
      :value="status"
      @change="emit('update:status', $event.target.value)"
    >
      <option value="ALL">Tous les statuts</option>
      <option value="DRAFT">Brouillon</option>
      <option value="PENDING">En attente</option>
      <option value="APPROVED">Validée</option>
      <option value="CORRECTION_REQUIRED">Correction demandée</option>
      <option value="REJECTED">Refusée</option>
    </select>

    <select :value="type" @change="emit('update:type', $event.target.value)">
      <option value="ALL">Tous les types</option>
      <option value="CLUB">Club</option>
      <option value="EVENT">Événement</option>
      <option value="VOLUNTEERING">Bénévolat</option>
      <option value="COMPETITION">Compétition</option>
      <option value="TRAINING">Formation</option>
      <option value="OTHER">Autre</option>
    </select>
  </div>
</template>

<style scoped>
.filters-card {
  display: grid;
  grid-template-columns: 1fr 290px 290px;
  gap: 16px;
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 12px;
  padding: 16px;
  margin-top: 1rem;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #6d9197;
  font-size: 1.25rem;
}

input,
select {
  width: 100%;
  height: 48px;
  border: 1px solid #c4cdc1;
  border-radius: 9px;
  background: #ffffff;
  color: #28363d;
  font-size: 14px;
  outline: none;
}

input {
  padding: 0 14px 0 46px;
}

select {
  padding: 0 14px;
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
