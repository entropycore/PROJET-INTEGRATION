<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { studentStages } from '@/mockData/studentStages.mock'
import StageCard from '@/components/student/stages/StageCard.vue'
import StageFilters from '@/components/student/stages/StageFilters.vue'

const router = useRouter()

const search = ref('')
const selectedStatus = ref('ALL')
const selectedVisibility = ref('ALL')

const filteredStages = computed(() => {
  return studentStages.filter((stage) => {
    const searchValue = search.value.toLowerCase()

    const matchesSearch =
      stage.title.toLowerCase().includes(searchValue) ||
      stage.company.toLowerCase().includes(searchValue) ||
      stage.technologies.some((tech) => tech.toLowerCase().includes(searchValue))

    const matchesStatus =
      selectedStatus.value === 'ALL' ||
      stage.validationStatus === selectedStatus.value

    const matchesVisibility =
      selectedVisibility.value === 'ALL' ||
      stage.visibility === selectedVisibility.value

    return matchesSearch && matchesStatus && matchesVisibility
  })
})

const goToCreate = () => {
  router.push('/student/stages/create')
}
</script>

<template>
  <section class="stages-page">
    <div class="page-header">
      <div>
        <h1>Stages</h1>
        <p>
          Gérez vos expériences de stage, vos rapports et vos demandes de validation.
        </p>
      </div>

      <button class="btn-primary" @click="goToCreate">
        Ajouter un stage
      </button>
    </div>

    <StageFilters
      v-model:search="search"
      v-model:status="selectedStatus"
      v-model:visibility="selectedVisibility"
    />

    <div v-if="filteredStages.length" class="stages-grid">
      <StageCard
        v-for="stage in filteredStages"
        :key="stage.id"
        :stage="stage"
      />
    </div>

    <div v-else class="empty-state">
      <h3>Aucun stage trouvé</h3>
      <p>Essayez de modifier les filtres ou ajoutez un nouveau stage.</p>
    </div>
  </section>
</template>

<style scoped>
.stages-page {
  padding: 4px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

h1 {
  color: #28363d;
  font-size: 28px;
  margin-bottom: 4px;
}

p {
  color: #99aead;
  font-size: 14px;
}

.btn-primary {
  background: #2f575d;
  color: white;
  border: 1px solid #2f575d;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background: #254b50;
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 18px;
}

.empty-state {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 14px;
  padding: 50px 20px;
  text-align: center;
  color: #99aead;
}

.empty-state h3 {
  color: #6d9197;
  margin-bottom: 6px;
}

@media (max-width: 700px) {
  .page-header {
    flex-direction: column;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>