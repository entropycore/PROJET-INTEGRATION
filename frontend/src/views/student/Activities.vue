<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  activities,
  deleteActivity,
  submitActivityValidation,
} from '@/mockData/studentActivities.store'

import ActivityCard from '@/components/student/stages/activities/ActivityCard.vue'
import ActivityFilters from '@/components/student/stages/activities/ActivityFilters.vue'

const router = useRouter()

const search = ref('')
const selectedStatus = ref('ALL')
const selectedType = ref('ALL')


const filteredActivities = computed(() => {
  return activities.value.filter((activity) => {
    const value = search.value.toLowerCase()

    const matchesSearch =
      activity.title.toLowerCase().includes(value) ||
      activity.organization.toLowerCase().includes(value) ||
      activity.description.toLowerCase().includes(value)

    const matchesStatus =
      selectedStatus.value === 'ALL' ||
      activity.validationStatus === selectedStatus.value

    const matchesType =
      selectedType.value === 'ALL' ||
      activity.type === selectedType.value

    return matchesSearch && matchesStatus && matchesType
  })
})

const goToCreate = () => {
  router.push('/student/activities/create')
}

const handleDeleteActivity = (activityId) => {
  const confirmDelete = window.confirm(
    'Voulez-vous vraiment supprimer cette activité ?',
  )

  if (!confirmDelete) return

  deleteActivity(activityId)
}

const handleSubmitValidation = (activityId) => {
  submitActivityValidation(activityId)
}
</script>

<template>
  <section class="activities-page">
    <div class="page-header">
      <div>
        <span class="page-label">PARASCOLAIRE</span>
        <h1>Mes activités parascolaires</h1>
        <p>Ajoutez vos engagements avec une attestation de participation.</p>
      </div>

      <button class="add-btn" @click="goToCreate">
        <span class="material-icons-round">add</span>
           Ajouter une activité
      </button>
    </div>

    <ActivityFilters
      v-model:search="search"
      v-model:status="selectedStatus"
      v-model:type="selectedType"
    />

    <div v-if="filteredActivities.length" class="activities-grid">
      <ActivityCard
        v-for="activity in filteredActivities"
        :key="activity.id"
        :activity="activity"
        @delete-activity="handleDeleteActivity"
        @submit-validation="handleSubmitValidation"
      />
    </div>

    <div v-else class="empty-state">
      <span class="material-icons-round">event_busy</span>
      <h3>Aucune activité trouvée</h3>
      <p>Essayez de modifier les filtres ou ajoutez une nouvelle activité.</p>
    </div>
  </section>
</template>

<style scoped>
.activities-page {
  padding: 0;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.25rem;
  margin-bottom: 1.125rem;
}

.page-label {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #a8aca8;
  font-size: 0.8rem;
  font-style: italic;
}

.page-header h1 {
  color: #28363d;
  font-size: 2rem;
  line-height: 1.15;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.page-header p {
  color: #6d9197;
  font-size: 0.875rem;
  font-style: italic;
  margin: 0;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #2f575d;
  color: #ffffff;
  border: none;
  border-radius: 0.5625rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.add-btn:hover {
  background: #26494d;
}

.add-btn .material-icons-round {
  color: #ffffff;
  font-size: 1.25rem;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.empty-state {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.875rem;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #6d9197;
  margin-top: 1.5rem;
}

.empty-state .material-icons-round {
  font-size: 2.4rem;
  color: #99aead;
  margin-bottom: 0.75rem;
}

.empty-state h3 {
  color: #28363d;
  margin: 0 0 0.35rem;
}

.empty-state p {
  margin: 0;
}

@media (max-width: 1200px) {
  .activities-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
