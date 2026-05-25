<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import {
  getStudentStageById,
  getStudentValidators,
  createStudentStage,
  deleteStudentStageImage,
  updateStudentStage,
  submitStudentStageValidation,
  uploadStudentStageImages,
  uploadStudentStageReport,
} from "@/services/studentstageService";

import StageForm from "@/components/student/stages/StageForm.vue";

const route = useRoute();
const router = useRouter();

const currentStage = ref(null);
const validators = ref([]);
const isEditMode = computed(() => Boolean(route.params.id));
const isLoading = ref(true);

const extractData = (response) => {
  return response.data?.data || response.data;
};

const fetchStage = async () => {
  if (!isEditMode.value) return;

  try {
    const response = await getStudentStageById(route.params.id);
    currentStage.value = extractData(response);
  } catch (error) {
    console.error("Erreur chargement stage :", error);
  }
};

const fetchValidators = async () => {
  try {
    const response = await getStudentValidators();
    validators.value = extractData(response);
  } catch (error) {
    console.error("Erreur chargement encadrants :", error);
    validators.value = [];
  }
};

onMounted(async () => {
  isLoading.value = true;

  await Promise.all([fetchStage(), fetchValidators()]);

  isLoading.value = false;
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
    let stageId = route.params.id;

    if (isEditMode.value) {
      await updateStudentStage(stageId, stagePayload);
    } else {
      const response = await createStudentStage(stagePayload);
      const createdStage = extractData(response);
      stageId = createdStage.id;
    }

    if (payload.report) {
      await uploadStudentStageReport(stageId, payload.report);
    }

    if (payload.images?.length) {
      await uploadStudentStageImages(stageId, payload.images);
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

    if (payload.report) {
      await uploadStudentStageReport(stageId, payload.report);
    }

    if (payload.images?.length) {
      await uploadStudentStageImages(stageId, payload.images);
    }

    await submitStudentStageValidation(stageId);

    router.push("/student/stages");
  } catch (error) {
    console.error("Erreur soumission validation :", error);
  }
};

const handleDeleteImage = async (imageId) => {
  if (!route.params.id || !imageId) return;

  const confirmDelete = window.confirm(
    "Voulez-vous vraiment supprimer cette capture ?",
  );

  if (!confirmDelete) return;

  try {
    await deleteStudentStageImage(route.params.id, imageId);
    await fetchStage();
  } catch (error) {
    console.error("Erreur suppression capture de stage :", error);
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
      :validators="validators"
      @save-draft="handleSaveDraft"
      @submit-validation="handleSubmitValidation"
      @delete-image="handleDeleteImage"
    />
  </section>
</template>

<style scoped>
.form-page {
  width: 100%;
  padding: 0;
  color: var(--app-text);
  font-family: var(--app-font-body);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
  border: none;
  background: transparent;
  color: var(--app-muted);
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  font-weight: 700;
  cursor: pointer;
}

.back-btn:hover {
  color: var(--app-primary);
}

.back-btn .material-icons-round {
  font-size: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.7rem, 2.4vw, var(--app-text-page));
  font-weight: 400;
  line-height: var(--app-leading-tight);
}

.page-header p {
  max-width: 46rem;
  margin: 0.45rem 0 0;
  color: var(--app-muted);
  font-family: var(--app-font-body);
  font-size: var(--app-text-md);
  line-height: var(--app-leading-normal);
}

.loading-state {
  padding: 1.5rem;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  color: var(--app-muted);
  font-family: var(--app-font-body);
  font-size: var(--app-text-sm);
  font-weight: 700;
  box-shadow: var(--app-shadow-card);
}

@media (max-width: 44rem) {
  .page-header {
    margin-bottom: 1rem;
  }

  .page-header h1 {
    font-size: 1.65rem;
  }
}
</style>
