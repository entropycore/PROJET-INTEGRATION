<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ActivityForm from '@/components/student/activities/ActivityForm.vue'
import { canEditActivity as canEditActivityRule } from '@/components/student/activities/activityRules'
import {
  getActivityById,
  updateActivity,
} from '@/mockData/studentActivities.store'

const route = useRoute()
const router = useRouter()

const currentActivity = computed(() => getActivityById(route.params.id))
const canEditActivity = computed(() =>
  canEditActivityRule(currentActivity.value),
)

const goBack = () => {
  router.push('/student/activities')
}

const handleSaveActivity = (payload) => {
  if (!currentActivity.value || !canEditActivity.value) return

  updateActivity({
    ...currentActivity.value,
    ...payload,
  })

  router.push(`/student/activities/${currentActivity.value.id}`)
}
</script>

<template>
  <section class="activity-form-page">
    <div class="page-header">
      <div>
        <span class="page-label">PARASCOLAIRE</span>
        <h1>Modifier une activité</h1>
        <p>
          Ajustez les informations demandées avant une nouvelle validation.
        </p>
      </div>

      <button type="button" class="back-btn" @click="goBack">
        <span class="material-icons-round">arrow_back</span>
        Retour
      </button>
    </div>

    <div v-if="!currentActivity" class="empty-state">
      <span class="material-icons-round">event_busy</span>
      <h3>Activité introuvable</h3>
      <p>Retournez à la liste et choisissez une activité existante.</p>
    </div>

    <div v-else-if="!canEditActivity" class="empty-state">
      <span class="material-icons-round">lock</span>
      <h3>Modification indisponible</h3>
      <p>Cette activité ne peut plus être modifiée à ce statut.</p>
    </div>

    <ActivityForm
      v-else
      :initial-activity="currentActivity"
      submit-label="Enregistrer les modifications"
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
