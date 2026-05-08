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
        <h1>Stages</h1>
        <p>
          Gérez vos expériences de stage, vos rapports et vos demandes de validation.
        </p>
      </div>

      <button class="add-btn" @click="goToCreate">
        <span>+</span>
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
  padding: 8px 0 32px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 30px;
}

h1 {
  font-size: 44px;
  line-height: 1;
  color: #28363d;
  margin-bottom: 12px;
}

p {
  color: #6d9197;
  font-size: 17px;
  font-style: italic;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #2f575d;
  color: white;
  border: none;
  padding: 15px 24px;
  border-radius: 9px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(47, 87, 93, 0.14);
}

.add-btn span {
  width: 21px;
  height: 21px;
  border: 2px solid white;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 17px;
  line-height: 1;
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