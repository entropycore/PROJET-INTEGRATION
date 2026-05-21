<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { stages, addStage, updateStage } from "@/mockData/studentStages.store";

import StageForm from "@/components/student/stages/StageForm.vue";

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => Boolean(route.params.id));

const currentStage = computed(() => {
  if (!isEditMode.value) return null;

  return stages.value.find((stage) => stage.id === route.params.id);
});

const goBack = () => {
  router.push("/student/stages");
};

const createLocalStage = (payload, validationStatus = "DRAFT") => {
  const today = new Date().toISOString().split("T")[0];

  return {
    id: isEditMode.value ? route.params.id : Date.now().toString(),

    title: payload.title,
    company: payload.company,
    duration: payload.duration,
    startDate: payload.startDate,
    endDate: payload.endDate,
    description: payload.description,
    missions: payload.missions,
    supervisor: payload.supervisor,
    technologies: payload.technologies,
    visibility: payload.visibility,
    validationStatus,

    reportUrl: payload.report
      ? URL.createObjectURL(payload.report)
      : currentStage.value?.reportUrl || "",

    images: payload.images?.length
      ? payload.images.map((image, index) => ({
          id: index + 1,
          title: image.name,
          url: URL.createObjectURL(image),
        }))
      : currentStage.value?.images || [],

    validationHistory: [
      {
        status: validationStatus,
        comment:
          validationStatus === "PENDING"
            ? "Stage soumis pour validation."
            : "Stage enregistré comme brouillon.",
        createdAt: today,
      },
      ...(currentStage.value?.validationHistory || []),
    ],

    createdAt: currentStage.value?.createdAt || today,
    updatedAt: today,
  };
};

const handleSaveDraft = (payload) => {
  /*
  BACKEND PLUS TARD :

  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('company', payload.company)
  formData.append('duration', payload.duration)
  formData.append('startDate', payload.startDate)
  formData.append('endDate', payload.endDate)
  formData.append('description', payload.description)
  formData.append('missions', JSON.stringify(payload.missions))
  formData.append('supervisor', JSON.stringify(payload.supervisor))
  formData.append('technologies', JSON.stringify(payload.technologies))
  formData.append('visibility', payload.visibility)

  if (payload.report) {
    formData.append('report', payload.report)
  }

  payload.images.forEach((image) => {
    formData.append('images', image)
  })

  if (isEditMode.value) {
    await updateStudentStage(route.params.id, formData)
  } else {
    await createStudentStage(formData)
  }

  await fetchStages()
  router.push('/student/stages')

  À SUPPRIMER quand backend prêt :
  - createLocalStage(...)
  - addStage(...)
  - updateStage(...)
  */

  const localStage = createLocalStage(payload, "DRAFT");

  if (isEditMode.value) {
    updateStage(localStage);
  } else {
    addStage(localStage);
  }

  router.push("/student/stages");
};

const handleSubmitValidation = (payload) => {
  /*
  BACKEND PLUS TARD :

  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('company', payload.company)
  formData.append('duration', payload.duration)
  formData.append('startDate', payload.startDate)
  formData.append('endDate', payload.endDate)
  formData.append('description', payload.description)
  formData.append('missions', JSON.stringify(payload.missions))
  formData.append('supervisor', JSON.stringify(payload.supervisor))
  formData.append('technologies', JSON.stringify(payload.technologies))
  formData.append('visibility', payload.visibility)

  if (payload.report) {
    formData.append('report', payload.report)
  }

  payload.images.forEach((image) => {
    formData.append('images', image)
  })

  let stageId = route.params.id

  if (isEditMode.value) {
    await updateStudentStage(stageId, formData)
  } else {
    const response = await createStudentStage(formData)
    stageId = response.data.id
  }

  await submitStudentStageValidation(stageId)
  await fetchStages()
  router.push('/student/stages')

  À SUPPRIMER quand backend prêt :
  - createLocalStage(...)
  - addStage(...)
  - updateStage(...)
  */

  const localStage = createLocalStage(payload, "PENDING");

  if (isEditMode.value) {
    updateStage(localStage);
  } else {
    addStage(localStage);
  }

  router.push("/student/stages");
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

    <StageForm
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

@media (max-width: 700px) {
  h1 {
    font-size: 1.65rem;
  }

  p {
    font-size: 0.95rem;
  }
}
</style>
