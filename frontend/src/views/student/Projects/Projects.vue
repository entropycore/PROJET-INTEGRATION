<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { getStudentProjects } from '@/services/studentProjectsApis'
import { mockProjects } from '@/mockData/projects'

import '@/assets/styles/student-project.css'

const projects = ref([])
const isLoading = ref(false)

const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')

const projectTypes = ['Module', 'Intégration', 'Hackathon', 'Personnel', 'Stage']

const projectStatuses = [
  'DRAFT',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CHANGES_REQUESTED',
]

const statusLabels = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  APPROVED: 'Validé',
  REJECTED: 'Refusé',
  CHANGES_REQUESTED: 'Corrections demandées',
}

const fetchProjects = async () => {
  isLoading.value = true

  try {
    const response = await getStudentProjects()
    projects.value = response.data
  } catch (error) {
    console.warn('API projects indisponible, utilisation des mock data.')
    projects.value = mockProjects
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchProjects)

const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const query = searchQuery.value.toLowerCase().trim()

    const matchesSearch =
      !query ||
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(query))

    const matchesType = !selectedType.value || project.type === selectedType.value

    const matchesStatus =
      !selectedStatus.value || project.validationStatus === selectedStatus.value

    return matchesSearch && matchesType && matchesStatus
  })
})

const canEditProject = (status) => {
  return ['DRAFT', 'CHANGES_REQUESTED'].includes(status)
}

const canSubmitProject = (status) => {
  return status === 'DRAFT'
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

const submitProject = (projectId) => {
  console.log('Submit project:', projectId)
}
</script>

<template>
  <section class="student-projects-page">
    <div class="projects-page-header">
      <div>
        <p class="admin-kicker">PROJECTS</p>
        <h1>Mes projets</h1>
        <p class="admin-subtitle">
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
            :key="type"
            :value="type"
          >
            {{ type }}
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

      <div
        v-if="isLoading"
        class="projects-state"
      >
        Chargement des projets...
      </div>

      <div
        v-else-if="filteredProjects.length"
        class="projects-grid"
      >
        <article
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
        >
          <div class="project-card-top">
            <span class="project-type-pill">
              {{ project.type }}
            </span>

            <span
              class="project-status-pill"
              :class="project.validationStatus.toLowerCase().replace('_', '-')"
            >
              {{ statusLabels[project.validationStatus] }}
            </span>
          </div>

          <div class="project-card-content">
            <h2>{{ project.title }}</h2>

            <p class="project-description">
              {{ project.description }}
            </p>

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

          <div class="project-meta">
            Créé le {{ formatDate(project.createdAt) }}
          </div>

          <div class="project-actions">
            <RouterLink
              :to="`/student/projects/${project.id}`"
              class="secondary-action"
            >
              <span class="material-icons-round">visibility</span>
              Voir détails
            </RouterLink>

            <RouterLink
              v-if="canEditProject(project.validationStatus)"
              :to="`/student/projects/${project.id}/edit`"
              class="secondary-action"
            >
              <span class="material-icons-round">edit</span>
              Modifier
            </RouterLink>

            <button
              v-if="canSubmitProject(project.validationStatus)"
              type="button"
              class="primary-action"
              @click="submitProject(project.id)"
            >
              <span class="material-icons-round">send</span>
              Soumettre
            </button>
          </div>
        </article>
      </div>

      <div
        v-else
        class="projects-state"
      >
        Aucun projet trouvé.
      </div>
    </section>
  </section>
</template>