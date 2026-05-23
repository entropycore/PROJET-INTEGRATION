<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ActivityForm from '@/components/student/stages/activities/ActivityForm.vue'
import {
  addActivity,
  getActivityById,
  updateActivity,
} from '@/mockData/studentActivities.store'

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => Boolean(route.params.id))
const currentActivity = computed(() =>
  isEditMode.value ? getActivityById(route.params.id) : null,
)

const goBack = () => {
  router.push('/student/activities')
}

const handleSaveActivity = (payload) => {
  if (isEditMode.value && currentActivity.value) {
    updateActivity({
      ...currentActivity.value,
      ...payload,
    })
  } else {
    addActivity({
      id: Date.now(),
      ...payload,
      validationStatus: 'DRAFT',
      createdAt: new Date().toISOString().split('T')[0],
    })
  }

  goBack()
}
</script>

<template>
  <section class="activity-form-page">
    <div class="page-header">
      <div>
        <span class="page-label">PARASCOLAIRE</span>
        <h1>
          {{ isEditMode ? 'Modifier une activite' : 'Nouvelle activite' }}
        </h1>
        <p>
          Renseignez les informations et ajoutez une attestation de participation.
        </p>
      </div>

      <button type="button" class="back-btn" @click="goBack">
        <span class="material-icons-round">arrow_back</span>
        Retour
      </button>
    </div>

    <div v-if="isEditMode && !currentActivity" class="empty-state">
      <span class="material-icons-round">event_busy</span>
      <h3>Activite introuvable</h3>
      <p>Retournez a la liste et choisissez une activite existante.</p>
    </div>

    <ActivityForm
      v-else
      :initial-activity="currentActivity"
      :submit-label="isEditMode ? 'Enregistrer les modifications' : 'Creer l activite'"
      @save-activity="handleSaveActivity"
      @cancel="goBack"
    />
  </section>
</template>

<style scoped>
.activity-form-page {
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

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ffffff;
  color: #2f575d;
  border: 1px solid #c4cdc1;
  border-radius: 0.5625rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.back-btn:hover {
  background: #f8f9f8;
}

.back-btn .material-icons-round {
  color: #2f575d;
  font-size: 1.25rem;
}

.empty-state {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.875rem;
  padding: 3rem 1.5rem;
  text-align: center;
  color: #6d9197;
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

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
