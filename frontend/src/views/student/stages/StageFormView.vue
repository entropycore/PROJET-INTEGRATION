<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { studentStages } from '@/mockData/studentStages.mock'
import StageForm from '@/components/student/stages/StageForm.vue'

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => Boolean(route.params.id))

const currentStage = computed(() => {
  if (!isEditMode.value) return null

  return studentStages.find((stage) => stage.id === route.params.id)
})

const goBack = () => {
  router.push('/student/stages')
}

const handleSaveDraft = (payload) => {
  // BACKEND PLUS TARD :
  // En mode create : POST /api/student/stages
  // En mode edit : PUT /api/student/stages/:id
  console.log('Sauvegarde brouillon :', payload)

  router.push('/student/stages')
}

const handleSubmitValidation = (payload) => {
  // BACKEND PLUS TARD :
  // Créer ou modifier le stage puis soumettre validation.
  console.log('Soumission validation :', payload)

  router.push('/student/stages')
}
</script>

<template>
  <section class="form-page">
    <button class="back-btn" @click="goBack">
      ← Retour aux stages
    </button>

    <div class="page-header">
      <div>
        <h1>
          {{ isEditMode ? 'Modifier le stage' : 'Ajouter un stage' }}
        </h1>

        <p>
          {{
            isEditMode
              ? 'Mettez à jour les informations de votre stage.'
              : 'Ajoutez une nouvelle expérience de stage à votre espace étudiant.'
          }}
        </p>
      </div>
    </div>

    <StageForm
      :initial-stage="currentStage"
      @save-draft="handleSaveDraft"
      @submit-validation="handleSubmitValidation"
    />
  </section>
</template>

<style scoped>
.form-page {
  padding: 4px;
}

.back-btn {
  border: none;
  background: transparent;
  color: #2f575d;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 18px;
}

.page-header {
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
</style>