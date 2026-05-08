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
    const value = search.value.toLowerCase()

    const matchesSearch =
      stage.title.toLowerCase().includes(value) ||
      stage.company.toLowerCase().includes(value) ||
      stage.technologies.some((tech) => tech.toLowerCase().includes(value))

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
    <span class="page-label">STAGE</span>
    <h1>Mes stages</h1>
    <p>Faites valider vos expériences de stage</p>
  </div>

  <button class="add-btn" @click="goToCreate">
    <span class="material-icons-round">add</span>
    Ajouter un stage
  </button>
</div>

    <StageFilters
      v-model:search="search"
      v-model:status="selectedStatus"
      v-model:visibility="selectedVisibility"
    />

    <div class="stages-grid">
      <StageCard
        v-for="stage in filteredStages"
        :key="stage.id"
        :stage="stage"
      />
    </div>

    <div class="count-line">
      <span></span>
      <p>{{ filteredStages.length }} stages</p>
      <span></span>
    </div>
  </section>
</template>

<style scoped>
.stages-page {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.page-label {
  display: inline-block;
      margin: 0 0 0.4rem;
    color: #a8aca8;
    font-size: clamp(0.7rem, 0.8vw, 0.85rem);
    font-style: italic;
}


.page-header h1 {
  font-size: 32px;
  line-height: 1.15;
  color: #28363d;
  margin: 0 0 4px;
  font-weight: 700;
}

.page-header p {
  color: #6d9197;
  font-size: 14px;
  font-style: italic;
  margin: 0;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2f575d;
  color: #ffffff;
  border: none;
  border-radius: 9px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(47, 87, 93, 0.16);
}

.add-btn .material-icons-round {
  font-size: 20px;
  color: #ffffff;
}

.add-btn:hover {
  background: #26494d;
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 24px;
}

@media (max-width: 1200px) {
  .stages-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .stages-grid {
    grid-template-columns: 1fr;
  }
}

.count-line {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 28px;
  color: #6d9197;
}

.count-line span {
  height: 1px;
  flex: 1;
  background: #dee1dd;
}

.count-line p {
  font-size: 14px;
  color: #6d9197;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .stages-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  h1 {
    font-size: 36px;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .stages-grid {
    grid-template-columns: 1fr;
  }
}
</style>