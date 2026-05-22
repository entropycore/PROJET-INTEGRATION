<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  getStudentStageById,
  createStudentStage,
  updateStudentStage,
  submitStudentStageValidation,
} from "@/services/studentstageService";

import StageForm from "@/components/student/stages/StageForm.vue";

const route = useRoute();
const router = useRouter();

const currentStage = ref(null);
const isEditMode = computed(() => Boolean(route.params.id));
const isLoading = ref(isEditMode.value);

const extractData = (response) => {
  return response.data?.data || response.data;
};

const fetchStage = async () => {
  if (!isEditMode.value) return;

  isLoading.value = true;

  try {
    const response = await getStudentStageById(route.params.id);
    currentStage.value = extractData(response);
  } catch (error) {
    console.error("Erreur chargement stage :", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStage();
});

const goBack = () => {
  router.push("/student/stages");
};

const buildStagePayload = (payload) => {
  return {
    title: payload.title,
    company: payload.company,
    duration: payload.duration,
    startDate: payload.startDate,
    endDate: payload.endDate,
    description: payload.description,
    missions: payload.missions,
    supervisor: payload.supervisor,
    technologies: payload.technologies,

    // RÈGLE MÉTIER :
    // À la création/modification du formulaire, le stage reste privé.
    // La visibilité PUBLIC sera gérée seulement après validation APPROVED
    // depuis la page détails.
    visibility: currentStage.value?.visibility || "PRIVATE",
  };
};

const handleSaveDraft = async (payload) => {
  try {
    const stagePayload = buildStagePayload(payload);

    if (isEditMode.value) {
      await updateStudentStage(route.params.id, stagePayload);
    } else {
      await createStudentStage(stagePayload);
    }

    router.push("/student/stages");
  } catch (error) {
    console.error("Erreur sauvegarde brouillon :", error);
  }
};

const handleSubmitValidation = async (payload) => {
  try {
    const stagePayload = buildStagePayload(payload);

    let stageId = route.params.id;

    if (isEditMode.value) {
      await updateStudentStage(stageId, stagePayload);
    } else {
      const response = await createStudentStage(stagePayload);
      const createdStage = extractData(response);
      stageId = createdStage.id;
    }

    /*
    BACKEND PDF PLUS TARD :
    Quand le backend supportera réellement l’upload PDF :

    const reportFormData = new FormData()
    reportFormData.append("report", payload.report)
    await uploadStudentStageReport(stageId, reportFormData)

    Pour les images :
    attendre une API backend dédiée, par exemple :
    POST /student/stages/:id/images

    Actuellement :
    - create/update attend du JSON
    - report/images ne sont pas envoyés ici
    */

    await submitStudentStageValidation(stageId);

    router.push("/student/stages");
  } catch (error) {
    console.error("Erreur soumission validation :", error);
  }
};
</script>

<template>
  <section class="form-page">
    <button class="back-btn" @click="goBack">
      <span class="material-icons-round">arrow_back</span>
      Retour aux stages
    </button>

    <div class="page-header">
      <h1>
        {{ isEditMode ? "Modifier le stage" : "Ajouter un stage" }}
      </h1>

      <p>
        {{
          isEditMode
            ? "Mettez à jour les informations de votre stage."
            : "Enregistrez les informations de votre stage. Il sera soumis à votre enseignant encadrant pour validation."
        }}
      </p>
    </div>

    <div v-if="isLoading" class="loading-state">Chargement du stage...</div>

    <StageForm
      v-else
      :initial-stage="currentStage"
      @save-draft="handleSaveDraft"
      @submit-validation="handleSubmitValidation"
    />
  </section>
</template>

<style scoped>
.form-page {
  padding: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: none;
  background: transparent;
  color: #2f575d;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 1.15rem;
}

.back-btn .material-icons-round {
  font-size: 1.1rem;
}

.page-header {
  margin-bottom: 5rem;
}

h1 {
  color: #28363d;
  font-size: 1.7rem;
  line-height: 1.2;
  font-weight: 800;
  margin: 0.2rem 0 0.45rem;
}

p {
  color: #6d9197;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  max-width: 46rem;
}

.loading-state {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.875rem;
  padding: 1.5rem;
  color: #6d9197;
  font-size: 0.95rem;
  font-weight: 700;
}

@media (max-width: 700px) {
  h1 {
    font-size: 1.65rem;
  }

  p {
    font-size: 0.95rem;
  }
}
</style>
