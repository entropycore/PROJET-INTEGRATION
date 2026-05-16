<script setup>
defineProps({
  search: String,
  status: String,
  visibility: String,
})

const emit = defineEmits([
  'update:search',
  'update:status',
  'update:visibility',
])
</script>

<template>
  <div class="filters-card">
    <div class="search-wrapper">
      <span class="search-icon">⌕</span>

      <input
        :value="search"
        type="text"
        placeholder="Rechercher un stage, une entreprise, une technologie..."
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
      <option value="APPROVED">Validé</option>
      <option value="CORRECTION_REQUIRED">Correction demandée</option>
      <option value="REJECTED">Refusé</option>
    </select>

    <select
      :value="visibility"
      @change="emit('update:visibility', $event.target.value)"
    >
      <option value="ALL">Toutes les visibilités</option>
      <option value="PUBLIC">Publique</option>
      <option value="PRIVATE">Privée</option>
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
  font-size: 23px;
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