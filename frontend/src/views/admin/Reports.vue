<script setup>
import { computed, ref } from "vue";
// import { onMounted } from "vue";

import ReportsStats from "@/components/admin/reports/ReportsStats.vue";
import ReportsToolbar from "@/components/admin/reports/ReportsToolbar.vue";
import ReportsTable from "@/components/admin/reports/ReportsTable.vue";
import ReportDetailsModal from "@/components/admin/reports/ReportDetailsModal.vue";

/*
  BACKEND À ACTIVER QUAND L’API SERA PRÊTE

import {
  getReports,
  getPendingReportsCount,
  getReportDetails,
  resolveReport,
  rejectReport,
  deleteReportedTarget,
} from "@/services/adminReportsApi";
*/

const loading = ref(false);
const error = ref(null);

const search = ref("");
const selectedType = ref("ALL");
const selectedStatus = ref("ALL");

const showDetailsModal = ref(false);
const selectedReport = ref(null);

const reports = ref([
  {
    id: 1,
    targetType: "PROJECT",
    targetId: 12,
    reason: "Contenu inapproprié",
    description:
      "Le contenu signalé semble non conforme aux règles de la plateforme.",
    status: "PENDING",
    reportedBy: {
      id: 30,
      fullName: "Sara Bensaid",
      email: "sara.bensaid@accenture.com",
    },
    createdAt: "2026-05-02T13:00:00.000Z",
  },
  {
    id: 2,
    targetType: "COMMENT",
    targetId: 44,
    reason: "Commentaire offensant",
    description: "Un commentaire contient un langage non respectueux.",
    status: "RESOLVED",
    reportedBy: {
      id: 18,
      fullName: "Yassine K.",
      email: "yassine.k@ensa.ma",
    },
    createdAt: "2026-05-01T10:40:00.000Z",
  },
  {
    id: 3,
    targetType: "PORTFOLIO",
    targetId: 8,
    reason: "Informations incorrectes",
    description: "Le portfolio contient des informations douteuses.",
    status: "REJECTED",
    reportedBy: {
      id: 22,
      fullName: "Meryem A.",
      email: "meryem.a@ensa.ma",
    },
    createdAt: "2026-04-30T16:15:00.000Z",
  },
]);

/*
const fetchReports = async () => {
  loading.value = true;
  error.value = null;

  try {
    const data = await getReports({
      search: search.value,
      type: selectedType.value,
      status: selectedStatus.value,
    });

    reports.value = data.items || [];
  } catch (e) {
    console.error("Erreur signalements:", e);
    error.value = "Impossible de charger les signalements.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReports);
*/

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

const filteredReports = computed(() => {
  return reports.value.filter((report) => {
    const keyword = search.value.toLowerCase();

    const matchSearch =
      report.reason.toLowerCase().includes(keyword) ||
      report.reportedBy.fullName.toLowerCase().includes(keyword) ||
      report.reportedBy.email.toLowerCase().includes(keyword);

    const matchType =
      selectedType.value === "ALL" || report.targetType === selectedType.value;

    const matchStatus =
      selectedStatus.value === "ALL" || report.status === selectedStatus.value;

    return matchSearch && matchType && matchStatus;
  });
});

const updateReportStatus = (id, status) => {
  reports.value = reports.value.map((report) =>
    report.id === id ? { ...report, status } : report,
  );

  if (selectedReport.value?.id === id) {
    selectedReport.value = {
      ...selectedReport.value,
      status,
    };
  }
};

const handleView = async (report) => {
  /*
    BACKEND PLUS TARD :
    selectedReport.value = await getReportDetails(report.id);
  */

  selectedReport.value = report;
  showDetailsModal.value = true;
};

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedReport.value = null;
};

const handleResolve = async (report) => {
  if (!confirm("Voulez-vous marquer ce signalement comme traité ?")) return;

  /*
    BACKEND PLUS TARD :
    await resolveReport(report.id);
    await fetchReports();
    closeDetailsModal();
    return;
  */

  updateReportStatus(report.id, "RESOLVED");
};

const handleReject = async (report) => {
  const comment = prompt("Motif du rejet du signalement :");

  if (!comment) return;

  /*
    BACKEND PLUS TARD :
    await rejectReport(report.id, { comment });
    await fetchReports();
    closeDetailsModal();
    return;
  */

  updateReportStatus(report.id, "REJECTED");
};

const handleDeleteTarget = async (report) => {
  if (!confirm("Voulez-vous vraiment supprimer le contenu signalé ?")) return;

  /*
    BACKEND PLUS TARD :
    await deleteReportedTarget(report.id);
    await fetchReports();
    closeDetailsModal();
    return;
  */

  updateReportStatus(report.id, "RESOLVED");
};
</script>

<template>
  <section class="reports-page">
    <header class="page-header">
      <div>
        <span>ADMINISTRATION</span>
        <h1>Signalements</h1>
        <p>Modérez les contenus signalés par les utilisateurs</p>
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
