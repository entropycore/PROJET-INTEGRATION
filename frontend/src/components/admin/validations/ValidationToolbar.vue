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
});

const emit = defineEmits(["update:search", "update:selectedType"]);
</script>

<template>
  <div class="toolbar">
    <input
      :value="search"
      type="text"
      placeholder="Rechercher par titre, étudiant ou email..."
      @input="emit('update:search', $event.target.value)"
    />

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
  </div>
</template>

<style scoped>
.toolbar {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 14px;
  margin-bottom: 20px;
}

input,
select {
  border: 1px solid #dfe3dd;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fbfaf7;
  color: #0f2f3a;
  font-weight: 600;
  outline: none;
}

input:focus,
select:focus {
  border-color: #2f5d62;
}

@media (max-width: 700px) {
  .toolbar {
    grid-template-columns: 1fr;
  }
}
</style>