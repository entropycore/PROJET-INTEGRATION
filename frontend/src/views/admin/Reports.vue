<script setup>
import { computed, onMounted, ref, watch } from "vue";

import ReportsStats from "@/components/admin/reports/ReportsStats.vue";
import ReportsToolbar from "@/components/admin/reports/ReportsToolbar.vue";
import ReportsTable from "@/components/admin/reports/ReportsTable.vue";
import ReportDetailsModal from "@/components/admin/reports/ReportDetailsModal.vue";
import {
  deleteReportedTarget,
  getReportDetails,
  getReports,
  rejectReport,
  resolveReport,
} from "@/services/adminReportsApi";

const loading = ref(false);
const error = ref(null);

const search = ref("");
const selectedType = ref("ALL");
const selectedStatus = ref("ALL");

const showDetailsModal = ref(false);
const selectedReport = ref(null);

const reports = ref([]);

const fetchReports = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params = {
      status: selectedStatus.value,
      limit: 100,
    };

    if (search.value.trim()) {
      params.search = search.value.trim();
    }

    if (selectedType.value !== "ALL") {
      params.type = selectedType.value;
    }

    const data = await getReports(params);

    reports.value = data.items || [];
  } catch (e) {
    console.error("Erreur signalements:", e);
    error.value = "Impossible de charger les signalements.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReports);

watch([search, selectedType, selectedStatus], fetchReports);

const stats = computed(() => {
  return {
    total: reports.value.length,
    pending: reports.value.filter((report) => report.status === "PENDING")
      .length,
    resolved: reports.value.filter((report) => report.status === "RESOLVED")
      .length,
    rejected: reports.value.filter((report) => report.status === "REJECTED")
      .length,
  };
});

const filteredReports = computed(() => reports.value);

const handleView = async (report) => {
  try {
    selectedReport.value = await getReportDetails(report.id);
    showDetailsModal.value = true;
  } catch (e) {
    console.error("Erreur detail signalement:", e);
    alert("Impossible de charger le detail du signalement.");
  }
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedReport.value = null;
};

const handleResolve = async (report) => {
  if (!confirm("Voulez-vous marquer ce signalement comme traite ?")) return;

  try {
    await resolveReport(report.id);
    await fetchReports();
    closeDetailsModal();
  } catch (e) {
    console.error("Erreur traitement signalement:", e);
    alert("Impossible de traiter ce signalement.");
  }
};

const handleReject = async (report) => {
  const comment = prompt("Motif du rejet du signalement :");

  if (!comment) return;

  try {
    await rejectReport(report.id, { comment });
    await fetchReports();
    closeDetailsModal();
  } catch (e) {
    console.error("Erreur rejet signalement:", e);
    alert("Impossible de rejeter ce signalement.");
  }
};

const handleDeleteTarget = async (report) => {
  if (!confirm("Voulez-vous vraiment supprimer le contenu signale ?")) return;

  try {
    await deleteReportedTarget(report.id);
    await fetchReports();
    closeDetailsModal();
  } catch (e) {
    console.error("Erreur suppression contenu signale:", e);
    alert("Impossible de supprimer le contenu signale.");
  }
};
</script>

<template>
  <section class="reports-page">
    <header class="page-header">
      <div>
        <span>ADMINISTRATION</span>
        <h1>Signalements</h1>
        <p>Moderez les contenus signales par les utilisateurs</p>
      </div>
    </header>

    <ReportsStats :stats="stats" />

    <section class="table-card">
      <ReportsToolbar
        v-model:search="search"
        v-model:selected-type="selectedType"
        v-model:selected-status="selectedStatus"
      />

      <div v-if="loading" class="state-box">Chargement des signalements...</div>

      <div v-else-if="error" class="state-box error">
        {{ error }}
      </div>

      <ReportsTable
        v-else
        :reports="filteredReports"
        @view="handleView"
        @resolve="handleResolve"
        @reject="handleReject"
        @delete-target="handleDeleteTarget"
      />
    </section>

    <ReportDetailsModal
      v-if="showDetailsModal"
      :report="selectedReport"
      @close="closeDetailsModal"
      @resolve="handleResolve"
      @reject="handleReject"
      @delete-target="handleDeleteTarget"
    />
  </section>
</template>

<style scoped>
.reports-page {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 1.6vw, 1.4rem);
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
  overflow: visible;
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
