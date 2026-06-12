<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import {
  getStudentProjects,
  submitStudentProject,
} from "@/services/studentProjectsApis";

import "@/assets/styles/student-project.css";

const projects = ref([]);
const isLoading = ref(false);

const searchQuery = ref("");
const selectedType = ref("");
const selectedStatus = ref("");

const projectTypes = [
  { value: "Module", label: "Module" },
  { value: "Integration", label: "Intégration" },
  { value: "Hackathon", label: "Hackathon" },
  { value: "Personnel", label: "Personnel" },
  { value: "Stage", label: "Stage" },
];

const projectStatuses = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
];

const statusLabels = {
  DRAFT: "Brouillon",
  PENDING: "En attente",
  APPROVED: "Validé",
  REJECTED: "Refusé",
  CHANGES_REQUESTED: "Corrections demandées",
};

const fetchProjects = async () => {
  isLoading.value = true;

  try {
    const response = await getStudentProjects();
    projects.value = response.data.data;
  } catch (error) {
    console.warn(
      "API projects indisponible, utilisation des mock data.",
      error,
    );
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProjects);

const normalizeProjectType = (type) => {
  return String(type || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const getProjectTypeLabel = (type) => {
  const projectType = projectTypes.find((item) => {
    return normalizeProjectType(item.value) === normalizeProjectType(type);
  });

  return projectType?.label || type;
};

const getProjectValidatorName = (project) => {
  return project.validatorName || project.validator?.fullName || "";
};

const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const query = searchQuery.value.toLowerCase().trim();

    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(query));

    const matchesType =
      !selectedType.value ||
      normalizeProjectType(project.type) ===
        normalizeProjectType(selectedType.value);

    const matchesStatus =
      !selectedStatus.value ||
      project.validationStatus === selectedStatus.value;

    return matchesSearch && matchesType && matchesStatus;
  });
});

const canEditProject = (status) => {
  return ["DRAFT", "CHANGES_REQUESTED"].includes(status);
};

const canSubmitProject = (project) => {
  return (
    project.validationStatus === "DRAFT" &&
    project.title?.trim() &&
    project.description?.trim() &&
    getProjectValidatorName(project)
  );
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const submitProject = async (projectId) => {
  try {
    await submitStudentProject(projectId);
    await fetchProjects();
  } catch (error) {
    console.error("Erreur soumission projet :", error);
  }
};
</script>

<template>
  <section class="student-projects-page">
    <div class="page-header">
      <div>
        <span class="page-label">PROJETS</span>
        <h1>Mes projets</h1>
        <p>
          Gérez vos projets académiques, personnels et professionnels.
        </p>
      </div>
    </div>

    <section class="projects-card">
      <div class="projects-toolbar">
        <div class="projects-search">
          <span class="material-icons-round projects-search-icon">search</span>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un projet..."
          />
        </div>

        <select v-model="selectedType">
          <option value="">Tous les types</option>

          <option
            v-for="type in projectTypes"
            :key="type.value"
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>

        <select v-model="selectedStatus">
          <option value="">Tous les statuts</option>

          <option
            v-for="status in projectStatuses"
            :key="status"
            :value="status"
          >
            {{ statusLabels[status] }}
          </option>
        </select>

        <RouterLink
          to="/student/projects/create"
          class="primary-action projects-create-btn"
        >
          <span class="material-icons-round">add</span>
          Nouveau projet
        </RouterLink>
      </div>

      <div v-if="isLoading" class="projects-state">
        Chargement des projets...
      </div>

      <div v-else-if="filteredProjects.length" class="projects-grid">
        <article
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
        >
          <div class="project-card-top">
            <h2>{{ project.title }}</h2>

            <span
              class="project-status-pill"
              :class="project.validationStatus.toLowerCase().replace('_', '-')"
            >
              {{ statusLabels[project.validationStatus] }}
            </span>
          </div>

          <div class="project-kind">
            <span class="material-icons-round">category</span>
            <strong>{{ getProjectTypeLabel(project.type) }}</strong>
          </div>

          <div class="project-card-content">
            <p class="project-description">
              {{ project.description }}
            </p>
          </div>

          <div class="separator"></div>

          <div class="project-info-grid">
            <div class="project-info-item">
              <span>Date de création</span>
              <strong>
                <span class="material-icons-round small-icon">
                  calendar_month
                </span>
                {{ formatDate(project.createdAt) }}
              </strong>
            </div>

            <div class="project-info-item">
              <span>Type</span>
              <strong>
                <span class="material-icons-round small-icon">inventory_2</span>
                {{ getProjectTypeLabel(project.type) }}
              </strong>
            </div>

            <div class="project-info-item">
              <span>Validateur</span>
              <strong>
                <span class="material-icons-round small-icon">person</span>
                {{ getProjectValidatorName(project) || "Non assigné" }}
              </strong>
            </div>

            <div class="project-info-item">
              <span>Rôle</span>
              <strong>
                <span class="material-icons-round small-icon">badge</span>
                {{ project.role || "Non renseigné" }}
              </strong>
            </div>
          </div>

          <div
            v-if="project.technologies?.length"
            class="project-technologies-box"
          >
            <div class="project-tech-title">
              <span class="material-icons-round">code</span>
              Technologies
            </div>

            <div class="project-tech-list">
              <span
                v-for="tech in project.technologies"
                :key="tech"
                class="project-tech-pill"
              >
                {{ tech }}
              </span>
            </div>
          </div>

          <div class="project-actions">
            <RouterLink
              :to="`/student/projects/${project.id}`"
              class="project-action-btn"
            >
              <span class="material-icons-round">visibility</span>
              Voir détails
            </RouterLink>

            <RouterLink
              v-if="canEditProject(project.validationStatus)"
              :to="`/student/projects/${project.id}/edit`"
              class="project-action-btn"
            >
              <span class="material-icons-round">edit</span>
              Modifier
            </RouterLink>

            <button
              v-if="canSubmitProject(project)"
              type="button"
              class="project-submit-btn"
              @click="submitProject(project.id)"
            >
              <span class="material-icons-round">send</span>
            </button>
          </div>
        </article>
      </div>

      <div v-else class="projects-state">Aucun projet trouvé.</div>
    </section>

    <div class="count-line">
      <span></span>
      <p>{{ filteredProjects.length }} projets</p>
      <span></span>
    </div>
  </section>
</template>
