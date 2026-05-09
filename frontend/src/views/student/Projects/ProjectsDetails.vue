<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { getStudentProjectById } from '@/services/studentProjectsApis'
import { mockProjects } from '@/mockData/projects'

import '@/assets/styles/student-project-details.css'

const route = useRoute()

const project = ref(null)
const isLoading = ref(false)

const statusLabels = {
  DRAFT: 'Brouillon',
  PENDING: 'En attente',
  APPROVED: 'Validé',
  REJECTED: 'Refusé',
  CHANGES_REQUESTED: 'Corrections demandées',
}

const canEditProject = computed(() => {
  return ['DRAFT', 'CHANGES_REQUESTED'].includes(
    project.value?.validationStatus,
  )
})

const canSubmitProject = computed(() => {
  return project.value?.validationStatus === 'DRAFT'
})

const sortedValidationHistory = computed(() => {
  return [...(project.value?.validationHistory || [])].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt)
  })
})

const fetchProject = async () => {
  isLoading.value = true

  try {
    const response = await getStudentProjectById(route.params.id)
    project.value = response.data
  } catch (error) {
    console.warn('API project detail indisponible.')

    project.value = mockProjects.find(
      (item) => String(item.id) === String(route.params.id),
    )
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '—'

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

onMounted(fetchProject)
</script>

<template>
  <section class="project-details-page">
    <div
      v-if="isLoading"
      class="details-state"
    >
      Chargement du projet...
    </div>

    <template v-else-if="project">
      <div class="project-details-header">
        <div class="project-header-left">
          <RouterLink
            to="/student/projects"
            class="back-link"
          >
            <span class="material-icons-round">
              arrow_back
            </span>

            Retour aux projets
          </RouterLink>

          <h1>
            {{ project.title }}
          </h1>

          <p class="project-short-description">
            {{ project.description }}
          </p>
        </div>

        <div class="project-header-actions">
          <RouterLink
            v-if="canEditProject"
            :to="`/student/projects/${project.id}/edit`"
            class="secondary-action"
          >
            <span class="material-icons-round">
              edit
            </span>

            Modifier
          </RouterLink>

          <button
            v-if="canSubmitProject"
            class="primary-action"
          >
            <span class="material-icons-round">
              send
            </span>

            Soumettre
          </button>
        </div>
      </div>

      <div class="project-details-layout">
        <div class="project-main-column">
            <section
  v-if="project.screenshots?.length"
  class="details-card"
>
  <div class="section-title">
    <span class="material-icons-round">
      image
    </span>

    Captures d'écran
  </div>

  <div class="screenshots-grid">
    <div
    v-for="(screenshot, index) in project.screenshots" :key="screenshot.id" class="screenshot-card"
    >
      <img
        v-if="screenshot.imageUrl" :src="screenshot.imageUrl" :alt="screenshot.title"
      />

      <div
        v-else class="screenshot-placeholder" :class="`variant-${(index % 3) + 1}`" >
        {{ screenshot.title }}
      </div>
    </div>

    <button
      v-if="canEditProject"
      type="button"
      class="screenshot-add-card"
    >
      <span class="material-icons-round">
        add
      </span>

      Ajouter
    </button>
  </div>
</section>

          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                description
              </span>

              Description complète
            </div>

            <p class="project-full-description">
              {{ project.description }}
            </p>
          </section>

          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                code
              </span>

              Technologies utilisées
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
          </section>

          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                link
              </span>

              Liens du projet
            </div>

            <div class="project-links-list">
              <a
                v-if="project.githubUrl"
                :href="project.githubUrl"
                target="_blank"
                class="project-link-item"
              >
                <span class="material-icons-round">
                  terminal
                </span>

                GitHub Repository
              </a>

              <a
                v-if="project.demoUrl"
                :href="project.demoUrl"
                target="_blank"
                class="project-link-item"
              >
                <span class="material-icons-round">
                  language
                </span>

                Demo du projet
              </a>

              <a
                v-if="project.documentationUrl"
                :href="
                  project.documentationUrl
                "
                target="_blank"
                class="project-link-item"
              >
                <span class="material-icons-round">
                  article
                </span>

                Documentation
              </a>
            </div>
          </section>

          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                attach_file
              </span>

              Pièces jointes
            </div>

            <div class="attachments-list">
              <div
                v-for="attachment in project.attachments"
                :key="attachment.id"
                class="attachment-card"
              >
                <div class="attachment-left">
                  <span class="material-icons-round">
                    description
                  </span>

                  <div>
                    <strong>
                      {{ attachment.name }}
                    </strong>

                    <p>
                      {{ attachment.type }}
                    </p>
                  </div>
                </div>

                <button
                  class="secondary-action"
                >
                  Télécharger
                </button>
              </div>
            </div>
          </section>

          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                timeline
              </span>

              Historique de validation
            </div>

            <div class="timeline-list">
              <div
                v-for="item in sortedValidationHistory"
                :key="item.id"
                class="timeline-item"
              >
                <div class="timeline-dot"></div>

                <div class="timeline-content">
                    <div class="timeline-header">
                      <strong>{{ item.title }}</strong>

                      <span class="timeline-date">
                        {{ formatDate(item.createdAt) }}
                      </span>
                    </div>

                    <p>{{ item.comment }}</p>

                    <small>
                     {{ item.actorName }} — {{ item.actorRole }}
                    </small>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside class="project-sidebar">
          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                verified
              </span>

              Validation
            </div>

            <div class="validator-card">
              <div class="validator-avatar">
                {{ project.validatorName?.charAt(0)}}
              </div>

              <div>
                <strong>
                  {{project.validatorName ||'Non assigné'  }}
                </strong>

                <p>
                  Validateur académique
                </p>
              </div>
            </div>

            <div
              v-if=" project.validationComment"
              class="validation-comment"
            >
              “{{ project.validationComment }}”
            </div>
          </section>

          <section class="details-card">
            <div class="section-title">
              <span class="material-icons-round">
                info
              </span>

              Informations
            </div>

            <div class="details-info-list">
              <div class="details-info-row">
                <span>Type</span>
                <strong>
                  {{ project.type }}
                </strong>
              </div>

              <div class="details-info-row">
                <span>Créé le</span>
                <strong>
                  {{ formatDate(  project.createdAt,   )  }}
                </strong>
              </div>

              <div class="details-info-row">
                <span>Statut</span>

                <strong>
                  {{ statusLabels[project.validationStatus  ]}}
                </strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </template>
  </section>
</template>