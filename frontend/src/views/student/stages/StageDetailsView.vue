<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import StageImagesModal from "@/components/student/stages/StageImagesModal.vue";

import {
  downloadStudentStageReport,
  getStudentStageById,
  getStudentStageImageContent,
} from "@/services/studentstageService";
import { buildBackendUrl } from "@/services/backendUrl";

const route = useRoute();
const router = useRouter();

const stage = ref(null);
const isLoading = ref(false);
const imagePreviewUrls = ref({});
const reportPreviewUrl = ref("");
const isReportLoading = ref(false);

const extractData = (response) => {
  return response.data?.data || response.data;
};

const fetchStage = async () => {
  isLoading.value = true;

  try {
    const response = await getStudentStageById(route.params.id);
    const loadedStage = extractData(response);
    stage.value = loadedStage;
    await hydrateStageMedia(loadedStage);
  } catch (error) {
    console.error("Erreur chargement détail stage :", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchStage();
});

onBeforeUnmount(() => {
  revokeStageMediaUrls();
});

const revokeStageMediaUrls = () => {
  Object.values(imagePreviewUrls.value).forEach((url) => {
    URL.revokeObjectURL(url);
  });

  if (reportPreviewUrl.value) {
    URL.revokeObjectURL(reportPreviewUrl.value);
  }

  imagePreviewUrls.value = {};
  reportPreviewUrl.value = "";
};

const hydrateStageMedia = async (loadedStage) => {
  revokeStageMediaUrls();

  const images = loadedStage?.images || [];

  const loadedImageUrls = await Promise.all(
    images.map(async (image) => {
      if (!image.id) return null;

      try {
        const response = await getStudentStageImageContent(
          loadedStage.id,
          image.id,
        );
        return [image.id, URL.createObjectURL(response.data)];
      } catch (error) {
        console.error("Erreur chargement image de stage :", error);
        return null;
      }
    }),
  );

  imagePreviewUrls.value = Object.fromEntries(loadedImageUrls.filter(Boolean));

  if (!loadedStage?.reportUrl) return;

  isReportLoading.value = true;

  try {
    const response = await downloadStudentStageReport(loadedStage.id);
    reportPreviewUrl.value = URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Erreur chargement rapport de stage :", error);
  } finally {
    isReportLoading.value = false;
  }
};

const normalizeStageStatus = (status) => {
  const value = String(status || "PENDING")
    .trim()
    .toUpperCase();

  return value === "CORRECTION_REQUIRED" ? "CHANGES_REQUESTED" : value;
};

const canEditStage = computed(() => {
  return ["DRAFT", "CHANGES_REQUESTED"].includes(stageStatus.value);
});

const stageStatus = computed(() => {
  return normalizeStageStatus(stage.value?.validationStatus);
});

const statusText = computed(() => {
  if (!stage.value) return "";

  if (stageStatus.value === "APPROVED") {
    return `Validé par ${stage.value.supervisor?.fullName || "l’encadrant"}`;
  }

  if (stageStatus.value === "PENDING") {
    return "En attente de validation";
  }

  if (stageStatus.value === "DRAFT") {
    return "Brouillon";
  }

  if (stageStatus.value === "REJECTED") {
    return "Refusé";
  }

  return "Correction demandée";
});

const statusClass = computed(() => {
  return stageStatus.value;
});

const formatDate = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const getTimelineTitle = (status) => {
  const titles = {
    DRAFT: "Stage créé",
    PENDING: "Stage soumis",
    APPROVED: "Stage validé",
    REJECTED: "Stage refusé",
    CORRECTION_REQUIRED: "Correction demandée",
    CHANGES_REQUESTED: "Correction demandée",
  };

  return titles[status] || "Mise à jour";
};

const getTimelineAuthor = (item) => {
  return item.actorName || item.actorRole || "Étudiant";
};

const getTimelineIcon = (status) => {
  const icons = {
    DRAFT: "edit",
    PENDING: "schedule",
    APPROVED: "check_circle",
    REJECTED: "cancel",
    CORRECTION_REQUIRED: "priority_high",
    CHANGES_REQUESTED: "priority_high",
  };

  return icons[status] || "history";
};

const showImagesModal = ref(false);

const normalizedImages = computed(() => {
  return (stage.value?.images || []).map((image) => ({
    ...image,
    url:
      imagePreviewUrls.value[image.id] ||
      buildBackendUrl(image.url || image.imageUrl || ""),
  }));
});

const visibleImages = computed(() => {
  return normalizedImages.value.slice(0, 4);
});

const hasMoreImages = computed(() => {
  return stage.value?.images?.length > 4;
});

const openImagesModal = () => {
  showImagesModal.value = true;
};

const closeImagesModal = () => {
  showImagesModal.value = false;
};

const goBack = () => {
  router.push("/student/stages");
};

const goToEdit = () => {
  router.push(`/student/stages/${route.params.id}/edit`);
};
</script>

<template>
  <section class="stage-details-page">
    <div v-if="isLoading" class="content-card">Chargement du stage...</div>

    <div v-else-if="!stage" class="content-card">Stage introuvable.</div>

    <template v-else>
      <button class="back-btn" @click="goBack">
        <span class="material-icons-round">arrow_back</span>
        Retour aux stages
      </button>

      <div class="hero-card">
        <div>
          <h1>{{ stage.title }}</h1>

          <div class="company-line">
            <span class="material-icons-round">business_center</span>
            <strong>{{ stage.company }}</strong>
          </div>
        </div>

        <button v-if="canEditStage" class="edit-btn" @click="goToEdit">
          <span class="material-icons-round">edit</span>
          Modifier
        </button>
      </div>

      <div class="details-layout">
        <main class="main-column">
          <div class="content-card">
            <h2>
              <span class="material-icons-round">description</span>
              Description complète
            </h2>

            <p class="description-text">
              {{ stage.description }}
            </p>

            <div class="divider"></div>

            <h3>
              <span class="material-icons-round">code</span>
              Technologies
            </h3>

            <div class="tech-list">
              <span
                v-for="tech in stage.technologies || []"
                :key="tech"
                class="tech-tag"
              >
                {{ tech }}
              </span>
            </div>
          </div>

          <div class="content-card">
            <div class="section-header">
              <h2>
                <span class="material-icons-round">image</span>
                Captures d’écran
              </h2>

              <button
                v-if="hasMoreImages"
                class="view-all-btn"
                @click="openImagesModal"
              >
                Voir toutes les images
              </button>
            </div>

            <div v-if="stage.images?.length" class="screens-grid">
              <div
                v-for="image in visibleImages"
                :key="image.id"
                class="screen-card"
              >
                <img :src="image.url" :alt="image.title" />
                <span>{{ image.title }}</span>
              </div>
            </div>

            <div v-else class="empty-screens">
              <span class="material-icons-round">image_not_supported</span>
              <p>Aucune capture d’écran ajoutée pour ce stage.</p>
            </div>
          </div>

          <div class="content-card">
            <h2>
              <span class="material-icons-round">task_alt</span>
              Missions réalisées
            </h2>

            <ul class="missions-list">
              <li v-for="mission in stage.missions || []" :key="mission">
                {{ mission }}
              </li>
            </ul>
          </div>

          <div class="content-card">
            <h2>
              <span class="material-icons-round">timeline</span>
              Historique de validation
            </h2>

            <div class="timeline">
              <div
                v-for="item in stage.validationHistory || []"
                :key="item.id || item.createdAt"
                class="timeline-item"
              >
                <div class="timeline-icon" :class="item.status">
                  <span class="material-icons-round">
                    {{ getTimelineIcon(item.status) }}
                  </span>
                </div>

                <div class="timeline-card">
                  <div class="timeline-header">
                    <div>
                      <h4>
                        {{ item.title || getTimelineTitle(item.status) }}
                      </h4>

                      <span>
                        {{ getTimelineAuthor(item) }}
                      </span>
                    </div>

                    <time>
                      {{ formatDate(item.createdAt) }}
                    </time>
                  </div>

                  <p>
                    {{ item.comment }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside class="side-column">
          <div class="side-card">
            <h3>
              <span class="material-icons-round">info</span>
              Informations générales
            </h3>

            <div class="info-row">
              <span>Statut</span>

              <strong class="status-info" :class="statusClass">
                <span class="status-dot"></span>
                {{ statusText }}
              </strong>
            </div>

            <div class="info-row">
              <span>Durée</span>
              <strong>{{ stage.duration }}</strong>
            </div>

            <div class="info-row">
              <span>Date début</span>
              <strong>{{ formatDate(stage.startDate) }}</strong>
            </div>

            <div class="info-row">
              <span>Date fin</span>
              <strong>{{ formatDate(stage.endDate) }}</strong>
            </div>

            <div class="info-row">
              <span>Visibilité</span>

              <strong>
                <span class="material-icons-round small-icon">
                  {{ stage.visibility === "PUBLIC" ? "public" : "lock" }}
                </span>

                {{ stage.visibility === "PUBLIC" ? "Publique" : "Privée" }}
              </strong>
            </div>
          </div>

          <div class="side-card">
            <h3>
              <span class="material-icons-round">person</span>
              Encadrant
            </h3>

            <div class="info-row">
              <span>Nom complet</span>
              <strong>{{ stage.supervisor?.fullName }}</strong>
            </div>

            <div class="info-row">
              <span>Département</span>
              <strong>{{ stage.supervisor?.department }}</strong>
            </div>
          </div>

          <div class="side-card">
            <h3>
              <span class="material-icons-round"> picture_as_pdf </span>
              Rapport PDF
            </h3>

            <a
              v-if="stage.reportUrl"
              :href="reportPreviewUrl || undefined"
              target="_blank"
              class="report-btn"
              :class="{ disabled: !reportPreviewUrl }"
            >
              <span class="material-icons-round"> open_in_new </span>
              {{
                isReportLoading ? "Chargement du rapport..." : "Voir le rapport"
              }}
            </a>

            <p v-else class="muted">Aucun rapport ajouté.</p>
          </div>
        </aside>
      </div>

      <StageImagesModal
        v-if="showImagesModal"
        :images="normalizedImages"
        @close="closeImagesModal"
      />
    </template>
  </section>
</template>

<style scoped>
.stage-details-page {
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

  margin-bottom: 1rem;
}

.back-btn .material-icons-round {
  font-size: 1.1rem;
}

/* HERO */

.hero-card {
  background: #ffffff;
  border: 1px solid #dee1dd;
  border-radius: 0.875rem;

  padding: 1.5rem 1.75rem;

  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  margin-bottom: 1.25rem;
}

.page-label {
  display: inline-block;

  color: #6d9197;

  font-size: 0.82rem;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.08rem;

  margin-bottom: 0.4rem;
}

h1 {
  color: #28363d;

  font-size: 2.3rem;
  font-weight: 800;
  line-height: 1.15;

  margin: 0 0 0.8rem;
}

.company-line {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.company-line .material-icons-round {
  color: #2f575d;
  font-size: 1.3rem;
}

.company-line strong {
  color: #24464b;

  font-size: 1.25rem;
  font-weight: 800;
}

.edit-btn,
.report-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;

  height: 2.7rem;

  padding: 0 1rem;

  border-radius: 0.65rem;
  border: 1px solid #c4cdc1;

  background: #ffffff;

  color: #2f575d;

  font-size: 0.9rem;
  font-weight: 700;

  text-decoration: none;

  cursor: pointer;
}

.edit-btn:hover,
.report-btn:hover {
  background: #f8f9f8;
}

.report-btn.disabled {
  pointer-events: none;
  opacity: 0.65;
}

/* LAYOUT */

.details-layout {
  display: grid;
  grid-template-columns: 1fr 22rem;
  gap: 1rem;
}

.content-card,
.side-card {
  background: #ffffff;

  border: 1px solid #dee1dd;
  border-radius: 0.875rem;

  padding: 1.4rem;

  margin-bottom: 1rem;
}

/* TITLES */

h2,
h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  color: #28363d;

  margin: 0 0 1rem;

  font-weight: 800;
}

h2 {
  font-size: 1.35rem;
}

h3 {
  font-size: 1.1rem;
}

h2 .material-icons-round,
h3 .material-icons-round {
  color: #2f575d;
  font-size: 1.2rem;
}

/* TEXT */

.description-text,
.missions-list li {
  color: #435b60;

  font-size: 1rem;
  line-height: 1.8;
}

.divider {
  height: 1px;
  background: #dee1dd;

  margin: 1.5rem 0;
}

/* TECH */

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tech-tag {
  background: #edf2f0;

  color: #2f575d;

  padding: 0.45rem 0.9rem;

  border-radius: 999px;

  font-size: 0.875rem;
  font-weight: 700;
}

/* IMAGES */

.screens-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.screen-card {
  overflow: hidden;

  border: 1px solid #dee1dd;
  border-radius: 0.8rem;

  background: #f8f9f8;
}

.screen-card img {
  width: 100%;
  height: 12rem;

  object-fit: cover;

  display: block;
}

.screen-card span {
  display: block;

  padding: 0.8rem;

  color: #28363d;

  font-size: 0.9rem;
  font-weight: 700;
}

.empty-screens {
  border: 2px dashed #c4cdc1;
  border-radius: 0.8rem;

  padding: 2rem;

  text-align: center;
}

.empty-screens .material-icons-round {
  color: #99aead;
  font-size: 2rem;

  margin-bottom: 0.6rem;
}

.empty-screens p {
  color: #6d9197;

  font-size: 0.95rem;
}

/* MISSIONS */

.missions-list {
  margin: 0;
  padding-left: 1.3rem;
}

.missions-list li {
  margin-bottom: 0.5rem;
}

/* SIDEBAR */

.info-row {
  padding: 0.9rem 0;

  border-bottom: 1px solid #edf0ee;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span {
  display: block;

  color: #6f8488;

  font-size: 0.9rem;
  font-weight: 600;

  margin-bottom: 0.35rem;
}

.info-row strong {
  display: flex;
  align-items: center;
  gap: 0.45rem;

  color: #23343b;

  font-size: 1rem;
  font-weight: 700;
}

.small-icon {
  font-size: 1rem;
  color: #2f575d;
}

/* STATUS */

.status-info {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.status-dot {
  width: 0.45rem;
  height: 0.45rem;

  border-radius: 50%;

  background: currentColor;
}

.status-info.APPROVED {
  color: #2e7d32;
}

.status-info.PENDING {
  color: #b87518;
}

.status-info.DRAFT {
  color: #616161;
}

.status-info.REJECTED {
  color: #c62828;
}

.status-info.CORRECTION_REQUIRED,
.status-info.CHANGES_REQUESTED {
  color: #b87518;
}

/* TIMELINE */

.timeline {
  position: relative;

  padding-left: 3.5rem;
}

.timeline::before {
  content: "";

  position: absolute;

  left: 1.35rem;
  top: 0.75rem;
  bottom: 0.75rem;

  width: 0.12rem;

  background: #dee1dd;
}

.timeline-item {
  position: relative;

  margin-bottom: 1rem;
}

.timeline-icon {
  position: absolute;

  left: -3.5rem;
  top: 0.7rem;

  width: 2.3rem;
  height: 2.3rem;

  border-radius: 50%;

  background: #ffffff;

  border: 0.18rem solid #dee1dd;

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 2;
}

.timeline-icon .material-icons-round {
  font-size: 1rem;
}

.timeline-icon.APPROVED {
  color: #2e7d32;
}

.timeline-icon.PENDING {
  color: #b87518;
}

.timeline-icon.DRAFT {
  color: #616161;
}

.timeline-icon.REJECTED {
  color: #c62828;
}

.timeline-icon.CORRECTION_REQUIRED,
.timeline-icon.CHANGES_REQUESTED {
  color: #b87518;
}

.timeline-card {
  background: #ffffff;

  border: 1px solid #edf0ee;
  border-radius: 0.85rem;

  padding: 1rem 1.15rem;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  margin-bottom: 0.8rem;
}

.timeline-header h4 {
  color: #28363d;

  font-size: 1rem;
  font-weight: 700;

  margin: 0 0 0.25rem;
}

.timeline-header span,
.timeline-header time {
  color: #7d8f91;

  font-size: 0.82rem;
  font-weight: 600;
}

.timeline-card p {
  color: #526f75;

  font-size: 0.95rem;
  line-height: 1.6;

  margin: 0;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin-bottom: 0;
}
.view-all-btn {
  border: 1px solid #c4cdc1;
  background: #ffffff;
  color: #2f575d;
  border-radius: 0.625rem;
  padding: 0.55rem 0.9rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.view-all-btn:hover {
  background: #f8f9f8;
}

@media (max-width: 1000px) {
  .details-layout {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
  }
}

@media (max-width: 700px) {
  h1 {
    font-size: 1.8rem;
  }

  .screens-grid {
    grid-template-columns: 1fr;
  }
}
</style>
