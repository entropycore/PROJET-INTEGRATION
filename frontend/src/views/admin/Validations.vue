<script setup>
import { computed, onMounted, ref } from "vue";

import ValidationStats from "@/components/admin/validations/ValidationStats.vue";
import ValidationToolbar from "@/components/admin/validations/ValidationToolbar.vue";
import ValidationsTable from "@/components/admin/validations/ValidationsTable.vue";
import ValidationDetailsModal from "@/components/admin/validations/ValidationDetailsModal.vue";
import {
  approveValidation,
  getPendingValidations,
  getPendingValidationsCount,
  getValidationDetails,
  rejectValidation,
  requestValidationChanges,
} from "@/services/adminValidationsApi";

const loading = ref(false);
const error = ref(null);
const search = ref("");
const selectedType = ref("ALL");
const selectedStatus = ref("ALL");
const showDetailsModal = ref(false);
const selectedValidation = ref(null);

const stats = ref({
  count: 0,
  projects: 0,
  internships: 0,
  certificates: 0,
  activities: 0,
});

const validations = ref([]);

const fetchValidations = async () => {
  loading.value = true;
  error.value = null;

  try {
    const [validationsData, statsData] = await Promise.all([
      getPendingValidations(),
      getPendingValidationsCount(),
    ]);

    validations.value = validationsData.items || [];
    stats.value = statsData;
  } catch (err) {
    console.error("Erreur validations:", err);
    validations.value = [];
    error.value = "Impossible de charger les validations.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchValidations);

const filteredValidations = computed(() => {
  return validations.value.filter((validation) => {
    const keyword = search.value.trim().toLowerCase();
    const title = validation.title || "";
    const studentName = validation.student?.fullName || "";
    const studentEmail = validation.student?.email || "";

    const matchSearch =
      !keyword ||
      title.toLowerCase().includes(keyword) ||
      studentName.toLowerCase().includes(keyword) ||
      studentEmail.toLowerCase().includes(keyword);

    const matchType =
      selectedType.value === "ALL" ||
      validation.targetType === selectedType.value;

    const matchStatus =
      selectedStatus.value === "ALL" ||
      validation.status === selectedStatus.value;

    return matchSearch && matchType && matchStatus;
  });
});

const handleView = async (validation) => {
  try {
    selectedValidation.value = await getValidationDetails(validation.id);
  } catch (err) {
    console.error("Erreur detail validation:", err);
    selectedValidation.value = validation;
  }

  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedValidation.value = null;
};

const refreshAfterAction = async () => {
  closeDetailsModal();
  await fetchValidations();
};

const handleApprove = async (validation) => {
  if (!confirm("Voulez-vous approuver cette validation ?")) return;

  try {
    await approveValidation(validation.id);
    await refreshAfterAction();
  } catch (err) {
    console.error("Erreur approbation validation:", err);
    alert("Impossible d'approuver cette validation.");
  }
};

const handleReject = async (validation) => {
  const comment = prompt("Motif du refus :");
  if (!comment) return;

  try {
    await rejectValidation(validation.id, { comment });
    await refreshAfterAction();
  } catch (err) {
    console.error("Erreur rejet validation:", err);
    alert("Impossible de refuser cette validation.");
  }
};

const handleRequestChanges = async (validation) => {
  const comment = prompt("Quelle correction demander a l'etudiant ?");
  if (!comment) return;

  try {
    await requestValidationChanges(validation.id, { comment });
    await refreshAfterAction();
  } catch (err) {
    console.error("Erreur demande correction:", err);
    alert("Impossible d'envoyer la demande de correction.");
  }
};
</script>

<template>
  <section class="validations-page">
    <header class="page-header">
      <div>
        <span>ADMINISTRATION</span>
        <h1>Centre de validations</h1>
        <p>Examinez et validez les soumissions des etudiants</p>
      </div>
    </header>

    <ValidationStats :stats="stats" />

    <section class="table-card">
      <ValidationToolbar
        v-model:search="search"
        v-model:selected-type="selectedType"
        v-model:selected-status="selectedStatus"
      />

      <div v-if="loading" class="state-box">Chargement des validations...</div>

      <div v-else-if="error" class="state-box error">
        {{ error }}
      </div>

      <ValidationsTable
        v-else
        :validations="filteredValidations"
        @view="handleView"
        @approve="handleApprove"
        @reject="handleReject"
        @request-changes="handleRequestChanges"
      />
    </section>

    <ValidationDetailsModal
      v-if="showDetailsModal"
      :validation="selectedValidation"
      @close="closeDetailsModal"
      @approve="handleApprove"
      @reject="handleReject"
      @request-changes="handleRequestChanges"
    />
  </section>
</template>

<style scoped>
.validations-page {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1vw, 1rem);
  color: var(--app-text);
  font-family: var(--app-font-body);
}

.page-header,
.table-card {
  width: 100%;
  margin: 0;
}

.page-header span {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--app-subtle);
  font-size: 0.8rem;
  font-style: italic;
}

.page-header h1 {
  margin: 0;
  color: var(--app-heading);
  font-family: var(--app-font-display);
  font-size: clamp(1.6rem, 2.2vw, 2.1rem);
  font-weight: 300;
  line-height: var(--app-leading-tight);
}

.page-header p {
  margin: 0.5rem 0 0;
  color: var(--app-muted);
  font-size: clamp(0.85rem, 1vw, 1rem);
}

.table-card {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-card);
  overflow: hidden;
  font-family: var(--app-font-body);
}

.state-box {
  padding: 2rem;
  color: var(--app-muted);
  font-family: var(--app-font-body);
  font-size: var(--app-text-md);
  text-align: center;
}

.error {
  color: var(--app-error);
}
</style>
