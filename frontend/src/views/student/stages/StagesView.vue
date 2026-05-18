<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import {
  stages,
  deleteStage,
  submitStageValidation,
} from "@/mockData/studentStages.store";

import StageCard from "@/components/student/stages/StageCard.vue";
import StageFilters from "@/components/student/stages/StageFilters.vue";

const router = useRouter();

const search = ref("");
const selectedStatus = ref("ALL");
const selectedVisibility = ref("ALL");

const filteredStages = computed(() => {
  return stages.value.filter((stage) => {
    const value = search.value.toLowerCase();

    const matchesSearch =
      stage.title.toLowerCase().includes(value) ||
      stage.company.toLowerCase().includes(value) ||
      stage.technologies.some((tech) => tech.toLowerCase().includes(value));

    const matchesStatus =
      selectedStatus.value === "ALL" ||
      stage.validationStatus === selectedStatus.value;

    const matchesVisibility =
      selectedVisibility.value === "ALL" ||
      stage.visibility === selectedVisibility.value;

    return matchesSearch && matchesStatus && matchesVisibility;
  });
});

const goToCreate = () => {
  router.push("/student/stages/create");
};

const handleDeleteStage = (stageId) => {
  const confirmDelete = window.confirm(
    "Voulez-vous vraiment supprimer ce stage ?",
  );

  if (!confirmDelete) return;

  /*
  BACKEND PLUS TARD :
  await deleteStudentStage(stageId)
  await fetchStages()

  À SUPPRIMER :
  deleteStage(stageId)
  */

  deleteStage(stageId);
};

const handleSubmitValidation = (stageId) => {
  /*
  BACKEND PLUS TARD :
  await submitStudentStageValidation(stageId)
  await fetchStages()

  À SUPPRIMER :
  submitStageValidation(stageId)
  */

  submitStageValidation(stageId);
};
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

    <div v-if="filteredStages.length" class="stages-grid">
      <StageCard
        v-for="stage in filteredStages"
        :key="stage.id"
        :stage="stage"
        @delete-stage="handleDeleteStage"
        @submit-validation="handleSubmitValidation"
      />
    </div>

    <div v-else class="empty-state">
      <span class="material-icons-round">work_off</span>
      <h3>Aucun stage trouvé</h3>
      <p>Essayez de modifier les filtres ou ajoutez un nouveau stage.</p>
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
  gap: 1.25rem;
  margin-bottom: 1.125rem;
}

.page-label {
  display: inline-block;
  margin: 0 0 0.4rem;
  color: #a8aca8;
  font-size: clamp(0.7rem, 0.8vw, 0.85rem);
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

  box-shadow: 0 0.375rem 0.875rem rgba(47, 87, 93, 0.16);
}

.add-btn .material-icons-round {
  font-size: 1.25rem;
  color: #ffffff;
}

.add-btn:hover {
  background: #26494d;
}

.stages-grid {
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
  font-size: 1.1rem;
  margin: 0 0 0.35rem;
}

.empty-state p {
  font-size: 0.9rem;
  margin: 0;
}

.count-line {
  display: flex;
  align-items: center;
  gap: 1.125rem;
  margin-top: 1.75rem;
  color: #6d9197;
}

.count-line span {
  height: 1px;
  flex: 1;
  background: #dee1dd;
}

.count-line p {
  color: #6d9197;
  font-size: 0.875rem;
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

  .page-header h1 {
    font-size: 2rem;
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
